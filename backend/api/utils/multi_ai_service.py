"""
Multi-Provider AI Service with Automatic Fallback

Provides reliable AI text generation with automatic failover between:
1. Gemini (Google) - Primary
2. OpenAI (GPT-4o-mini) - Secondary  
3. Groq (Llama) - Tertiary
4. Ollama (Local) - Final fallback

If one provider fails (503, rate limit, etc.), automatically tries the next.
"""
import logging
from typing import Optional, Dict, Any, List
from django.conf import settings

logger = logging.getLogger(__name__)

# Provider clients (lazy loaded)
_gemini_client = None
_openai_client = None
_groq_client = None


def _get_gemini_client():
    """Lazy load Gemini client"""
    global _gemini_client
    if _gemini_client is None:
        api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if api_key:
            try:
                from google import genai
                _gemini_client = genai.Client(api_key=api_key)
                logger.info("[MultiAI] Gemini client initialized")
            except ImportError:
                logger.warning("[MultiAI] google.genai not installed")
            except Exception as e:
                logger.error(f"[MultiAI] Gemini init error: {e}")
    return _gemini_client


def _get_openai_client():
    """Lazy load OpenAI client"""
    global _openai_client
    if _openai_client is None:
        api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if api_key:
            try:
                from openai import OpenAI
                _openai_client = OpenAI(api_key=api_key)
                logger.info("[MultiAI] OpenAI client initialized")
            except ImportError:
                logger.warning("[MultiAI] openai package not installed")
            except Exception as e:
                logger.error(f"[MultiAI] OpenAI init error: {e}")
    return _openai_client


def _get_groq_client():
    """Lazy load Groq client"""
    global _groq_client
    if _groq_client is None:
        api_key = getattr(settings, 'GROQ_API_KEY', '')
        if api_key:
            try:
                from groq import Groq
                _groq_client = Groq(api_key=api_key)
                logger.info("[MultiAI] Groq client initialized")
            except ImportError:
                logger.warning("[MultiAI] groq package not installed")
            except Exception as e:
                logger.error(f"[MultiAI] Groq init error: {e}")
    return _groq_client


def _call_gemini(prompt: str, config: Dict[str, Any]) -> Optional[str]:
    """Call Gemini API"""
    client = _get_gemini_client()
    if not client:
        return None
    
    model = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config={
                'temperature': config.get('temperature', 0.7),
                'top_p': config.get('top_p', 0.8),
                'max_output_tokens': config.get('max_tokens', 1024),
            }
        )
        # Extract text from response
        if hasattr(response, 'text'):
            return response.text
        elif hasattr(response, 'candidates') and response.candidates:
            return response.candidates[0].content.parts[0].text
        return str(response)
    except Exception as e:
        error_str = str(e)
        if '503' in error_str or 'overloaded' in error_str.lower():
            logger.warning(f"[MultiAI] Gemini 503 - trying fallback")
        else:
            logger.error(f"[MultiAI] Gemini error: {e}")
        return None


def _call_openai(prompt: str, config: Dict[str, Any]) -> Optional[str]:
    """Call OpenAI API"""
    client = _get_openai_client()
    if not client:
        return None
    
    model = getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini')
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Eres un experto en simbolismo del Tarot y Cábala Hermética. Responde siempre en español."},
                {"role": "user", "content": prompt}
            ],
            temperature=config.get('temperature', 0.7),
            max_tokens=config.get('max_tokens', 1024),
        )
        return response.choices[0].message.content
    except Exception as e:
        error_str = str(e)
        if '429' in error_str or 'rate' in error_str.lower():
            logger.warning(f"[MultiAI] OpenAI rate limited - trying fallback")
        else:
            logger.error(f"[MultiAI] OpenAI error: {e}")
        return None


def _call_groq(prompt: str, config: Dict[str, Any]) -> Optional[str]:
    """Call Groq API"""
    client = _get_groq_client()
    if not client:
        return None
    
    model = getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile')
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Eres un experto en simbolismo del Tarot y Cábala Hermética. Responde siempre en español."},
                {"role": "user", "content": prompt}
            ],
            temperature=config.get('temperature', 0.7),
            max_tokens=config.get('max_tokens', 1024),
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"[MultiAI] Groq error: {e}")
        return None


def _call_ollama(prompt: str, config: Dict[str, Any]) -> Optional[str]:
    """Call local Ollama API"""
    import requests
    
    base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
    model = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')
    
    try:
        response = requests.post(
            f"{base_url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": config.get('temperature', 0.7),
                    "num_predict": config.get('max_tokens', 1024),
                }
            },
            timeout=30
        )
        if response.status_code == 200:
            return response.json().get('response', '')
    except Exception as e:
        logger.warning(f"[MultiAI] Ollama not available: {e}")
    return None


class MultiAIService:
    """
    Multi-provider AI service with automatic fallback.
    
    Usage:
        ai = MultiAIService()
        response = ai.generate("Your prompt here")
    """
    
    # Provider order for fallback - Groq first (better rate limits), then Gemini, then OpenAI
    PROVIDERS = ['groq', 'gemini', 'openai', 'ollama']
    
    def __init__(self, preferred_provider: Optional[str] = None):
        """
        Initialize with optional preferred provider.
        
        Args:
            preferred_provider: Force a specific provider ('gemini', 'openai', 'groq', 'ollama')
        """
        self.preferred = preferred_provider
        self._check_available_providers()
    
    def _check_available_providers(self) -> List[str]:
        """Check which providers are available"""
        available = []
        
        if getattr(settings, 'GEMINI_API_KEY', ''):
            available.append('gemini')
        if getattr(settings, 'OPENAI_API_KEY', ''):
            available.append('openai')
        if getattr(settings, 'GROQ_API_KEY', ''):
            available.append('groq')
        # Ollama is always potentially available (local)
        available.append('ollama')
        
        self.available_providers = available
        logger.info(f"[MultiAI] Available providers: {available}")
        return available
    
    def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 0.8,
    ) -> Dict[str, Any]:
        """
        Generate AI response with automatic fallback.
        
        Returns:
            {
                "success": bool,
                "text": str,
                "provider": str,
                "error": str | None
            }
        """
        config = {
            'temperature': temperature,
            'max_tokens': max_tokens,
            'top_p': top_p,
        }
        
        # Build provider order
        providers = list(self.PROVIDERS)
        if self.preferred and self.preferred in providers:
            providers.remove(self.preferred)
            providers.insert(0, self.preferred)
        
        # Try each provider in order
        errors = []
        for provider in providers:
            if provider not in self.available_providers:
                continue
            
            logger.info(f"[MultiAI] Trying provider: {provider}")
            
            result = None
            if provider == 'gemini':
                result = _call_gemini(prompt, config)
            elif provider == 'openai':
                result = _call_openai(prompt, config)
            elif provider == 'groq':
                result = _call_groq(prompt, config)
            elif provider == 'ollama':
                result = _call_ollama(prompt, config)
            
            if result:
                logger.info(f"[MultiAI] Success with provider: {provider}")
                return {
                    "success": True,
                    "text": result,
                    "provider": provider,
                    "error": None,
                }
            else:
                errors.append(f"{provider} failed")
        
        # All providers failed
        error_msg = f"All AI providers failed: {', '.join(errors)}"
        logger.error(f"[MultiAI] {error_msg}")
        return {
            "success": False,
            "text": "",
            "provider": None,
            "error": error_msg,
        }


# Global instance
multi_ai = MultiAIService()


def generate_with_fallback(prompt: str, **kwargs) -> Dict[str, Any]:
    """
    Convenience function for generating AI text with fallback.
    
    Args:
        prompt: The prompt to send to the AI
        **kwargs: Optional config (temperature, max_tokens, top_p)
    
    Returns:
        Dict with success, text, provider, and error fields
    """
    return multi_ai.generate(prompt, **kwargs)
