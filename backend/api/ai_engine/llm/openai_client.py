"""
OpenAI GPT-4 Client
Handles LLM requests with retry logic and token management.
"""
import logging
import time
from typing import Dict, Any, List, Optional
from django.conf import settings
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class GPT4Client:
    """Wrapper for OpenAI GPT-4 API with retry logic."""
    
    def __init__(self):
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        except ImportError:
            logger.error("OpenAI package not installed. Run: pip install openai")
            raise
        except AttributeError:
            logger.error("OPENAI_API_KEY not set in settings")
            raise
        
        self.model = getattr(settings, 'OPENAI_MODEL', 'gpt-4-turbo-preview')
        self.max_tokens = getattr(settings, 'AI_MAX_TOKENS', 4000)
        self.temperature = getattr(settings, 'AI_TEMPERATURE', 0.3)
    
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
        Generate completion from GPT-4.
        
        Args:
            messages: List of {"role": "user/system/assistant", "content": "..."}
            response_format: Optional {"type": "json_object"} for JSON mode
            temperature: Override default temperature
        
        Returns:
            {
                "content": "...",
                "tokens": {"prompt": 123, "completion": 456, "total": 579},
                "cost_usd": 0.0123,
                "latency_ms": 1234
            }
        """
        start_time = time.time()
        
        # Prepare request
        kwargs = {
            'model': self.model,
            'messages': messages,
            'max_tokens': self.max_tokens,
            'temperature': temperature if temperature is not None else self.temperature
        }
        
        if response_format:
            kwargs['response_format'] = response_format
        
        # Call OpenAI
        try:
            response = self.client.chat.completions.create(**kwargs)
            
            # Calculate metrics
            latency_ms = int((time.time() - start_time) * 1000)
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens
            
            # Cost calculation (GPT-4-turbo pricing as of Jan 2026)
            # Prompt: $0.01 per 1K tokens, Completion: $0.03 per 1K tokens
            cost_usd = (prompt_tokens / 1000 * 0.01) + (completion_tokens / 1000 * 0.03)
            
            logger.info(f"GPT-4 completion: {total_tokens} tokens, {latency_ms}ms, ${cost_usd:.4f}")
            
            return {
                'content': response.choices[0].message.content,
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
