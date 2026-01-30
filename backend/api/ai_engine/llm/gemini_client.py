"""
AI Client Wrapper - Uses existing multi_ai_service.py
Simplified: No RAG, no embeddings, just direct AI calls with fallback
"""
import logging
from typing import Dict, Any, List, Optional
from api.utils.multi_ai_service import generate_ai_response

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper for multi-provider AI (Gemini -> OpenAI -> Groq -> Ollama)"""
    
    def __init__(self):
        logger.info("[AIEngine] Using existing multi_ai_service with automatic fallback")
    
    def generate_completion(
        self,
        messages: List[Dict[str, str]],
        response_format: Optional[Dict[str, str]] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate completion using multi-provider service.
        
        Returns:
            {
                'content': str,
                'tokens': {'prompt': int, 'completion': int, 'total': int},
                'cost_usd': float,
                'latency_ms': int
            }
        """
        import time
        start_time = time.time()
        
        # Build prompt from messages
        prompt_parts = []
        for msg in messages:
            if msg['role'] == 'system':
                prompt_parts.append(f"Instrucciones: {msg['content']}")
            elif msg['role'] == 'user':
                prompt_parts.append(msg['content'])
        
        prompt = "\n\n".join(prompt_parts)
        
        # Add JSON instruction if needed
        if response_format and response_format.get('type') == 'json_object':
            prompt += "\n\nResponde SOLO con JSON válido, sin markdown."
        
        # Call multi-provider service (handles fallback automatically)
        content = generate_ai_response(
            prompt=prompt,
            temperature=temperature or 0.3,
            max_tokens=8000
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Estimate tokens
        prompt_tokens = len(prompt) // 4
        completion_tokens = len(content) // 4
        
        return {
            'content': content,
            'tokens': {
                'prompt': prompt_tokens,
                'completion': completion_tokens,
                'total': prompt_tokens + completion_tokens
            },
            'cost_usd': 0.0,  # Groq/Gemini free tier
            'latency_ms': latency_ms
        }
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def generate_completion(
        self,
        messages: List[Dict[str, str]],
        response_format: Optional[Dict[str, str]] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate completion from Gemini.
        
        Args:
            messages: List of {"role": "user/system/assistant", "content": "..."}
            response_format: Optional {"type": "json_object"} for JSON mode
            temperature: Override default temperature
        
        Returns:
            {
                "content": "...",
                "tokens": {"prompt": 123, "completion": 456, "total": 579},
                "cost_usd": 0.0001,  # Much cheaper than GPT-4
                "latency_ms": 800
            }
        """
        start_time = time.time()
        
        try:
            # Convert OpenAI-style messages to Gemini format
            system_instruction = None
            contents = []
            
            for msg in messages:
                if msg['role'] == 'system':
                    system_instruction = msg['content']
                elif msg['role'] == 'user':
                    contents.append({
                        'role': 'user',
                        'parts': [{'text': msg['content']}]
                    })
                elif msg['role'] == 'assistant':
                    contents.append({
                        'role': 'model',
                        'parts': [{'text': msg['content']}]
                    })
            
            # Add JSON instruction if needed
            if response_format and response_format.get('type') == 'json_object':
                if system_instruction:
                    system_instruction += "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations."
                else:
                    system_instruction = "Respond ONLY with valid JSON. No markdown, no explanations."
            
            # Prepare generation config
            generation_config = {
                'temperature': temperature if temperature is not None else self.temperature,
                'max_output_tokens': self.max_tokens,
            }
            
            # Call Gemini API
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config={
                    'system_instruction': system_instruction,
                    'generation_config': generation_config
                }
            )
            
            # Calculate metrics
            latency_ms = int((time.time() - start_time) * 1000)
            content = response.text
            
            # Estimate tokens (Gemini uses different tokenization)
            prompt_text = ' '.join([m['content'] for m in messages])
            prompt_tokens = len(prompt_text) // 4  # Rough estimate
            completion_tokens = len(content) // 4
            total_tokens = prompt_tokens + completion_tokens
            
            # Cost calculation (Gemini 2.5 Flash pricing - FREE tier then $0.0001875/1K input, $0.00075/1K output)
            cost_usd = (prompt_tokens / 1000 * 0.0001875) + (completion_tokens / 1000 * 0.00075)
            
            logger.info(f"Gemini completion: {total_tokens} tokens (est), {latency_ms}ms, ${cost_usd:.6f}")
            
            return {
                'content': content,
                'tokens': {
                    'prompt': prompt_tokens,
                    'completion': completion_tokens,
                    'total': total_tokens
                },
                'cost_usd': cost_usd,
                'latency_ms': latency_ms
            }
        
        except Exception as e:
            logger.error(f"Error calling GPT-4: {str(e)}", exc_info=True)
            raise
