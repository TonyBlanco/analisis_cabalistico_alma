"""
AI Client Wrapper - Uses existing multi_ai_service.py
Simplified: No RAG, no embeddings, just direct AI calls with fallback
"""
import logging
import time
from typing import Dict, Any, List, Optional
from api.utils.multi_ai_service import generate_with_fallback

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper for multi-provider AI (Gemini -> Groq -> OpenAI -> Ollama)"""
    
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
        
        Args:
            messages: List of {"role": "user/system/assistant", "content": "..."}
            response_format: Optional {"type": "json_object"} for JSON mode
            temperature: Override default temperature
        
        Returns:
            {
                'content': str,
                'tokens': {'prompt': int, 'completion': int, 'total': int},
                'cost_usd': float,
                'latency_ms': int
            }
        """
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
        try:
            result = generate_with_fallback(
                prompt=prompt,
                temperature=temperature or 0.3,
                max_tokens=8000
            )
            
            if not result.get('success', False):
                error_msg = result.get('error', 'Unknown error from AI service')
                logger.error(f"AI service failed: {error_msg}")
                raise Exception(f"AI generation failed: {error_msg}")
            
            content = result.get('text', '')
            provider = result.get('provider', 'unknown')
            
            logger.info(f"✓ AI response from {provider}: {len(content)} chars")
            
        except Exception as e:
            logger.error(f"Error calling AI service: {str(e)}", exc_info=True)
            raise
        
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

