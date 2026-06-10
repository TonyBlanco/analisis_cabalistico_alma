"""
Servicio AI para Interpretaciones Astrológicas

Este servicio conecta con Gemini API para generar interpretaciones
profesionales de las diferentes capas astrológicas.

CONFIGURACIÓN CRÍTICA:
- Modelo: gemini-2.5-flash
- max_tokens: 8192 (necesario para respuestas completas)
- Temperatura: 0.7 (balance creatividad/precisión)

NOTA: gemini-2.5-flash es un modelo "thinking" que usa tokens internamente
para razonar antes de responder. Por eso necesitamos max_tokens alto.
Ver docs/AI_INTEGRATION_GUIDE.md para detalles completos.

Uso:
    from api.astrology_ai_service import astrology_ai_service
    
    if astrology_ai_service.enabled:
        result = astrology_ai_service.interpret_natal(chart_data)
"""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from django.conf import settings

from .astrology_ai_prompts import (
    SYSTEM_BASE,
    DISCLAIMER,
    get_prompt_for_layer,
    build_natal_prompt,
    build_transits_prompt,
    build_progressions_prompt,
    build_solar_return_prompt,
    build_situation_prompt,
)
from .utils.genai_response import extract_text

logger = logging.getLogger(__name__)


def is_rate_limit_error(message: str) -> bool:
    lower = (message or '').lower()
    return 'rate limit' in lower or 'rate_limit' in lower or '429' in lower


def is_failed_generation_text(text: str) -> bool:
    stripped = (text or '').strip()
    return stripped.startswith('Error:') or stripped.startswith('Error al generar')


@dataclass
class AIInterpretationResult:
    """Resultado de una interpretación AI."""
    success: bool
    interpretation: str
    layer: str
    error: Optional[str] = None
    tokens_used: Optional[int] = None


class AstrologyAIService:
    """
    Servicio de IA para interpretaciones astrológicas profesionales.
    
    Integra con Gemini API para generar lecturas simbólicas de:
    - Carta Natal
    - Tránsitos
    - Progresiones Secundarias
    - Retorno Solar
    - Consultas situacionales
    
    Usa lazy initialization para evitar problemas de orden de importación.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Inicializa el servicio AI (lazy)."""
        if AstrologyAIService._initialized:
            return
            
        self.provider = None  # 'gemini', 'groq', or 'ollama'
        self.model_name = None
        self.enabled = False
        self.client = None
        self.error_message = None
        self._init_attempted = False
        
        # Provider-specific clients
        self._gemini_client = None
        self._groq_client = None
        self._ollama_base_url = None
        
        # Defer actual initialization
        AstrologyAIService._initialized = True
    
    def _is_production(self) -> bool:
        return (
            getattr(settings, 'RENDER', False)
            or getattr(settings, 'RAILWAY', False)
            or not getattr(settings, 'DEBUG', True)
        )

    def _provider_init_order(self) -> list[str]:
        """Resolve provider try-order from AI_PROVIDER (incl. free_first)."""
        from api.utils.multi_ai_service import MultiAIService

        ai_provider = getattr(settings, 'AI_PROVIDER', 'auto')
        is_production = self._is_production()

        if ai_provider == 'auto':
            if is_production:
                return ['groq', 'gemini']
            return ['groq', 'ollama', 'gemini']

        if ai_provider == 'free_first':
            order = list(MultiAIService.provider_order())
            if is_production:
                return [p for p in order if p != 'ollama']
            return order

        if ai_provider in ('gemini', 'groq', 'ollama'):
            return [ai_provider]

        # Modo desconocido: mismo fallback que free_first en prod
        logger.warning("[AI] AI_PROVIDER=%s no reconocido; usando groq → gemini", ai_provider)
        return ['groq', 'gemini'] if is_production else ['groq', 'gemini', 'ollama']

    def _ensure_initialized(self):
        """Lazy initialization - tries providers in order of preference."""
        if self._init_attempted:
            return

        self._init_attempted = True

        init_map = {
            'groq': self._try_init_groq,
            'gemini': self._try_init_gemini,
            'ollama': self._try_init_ollama,
        }

        order = self._provider_init_order()
        logger.info("[AI] Orden de proveedores: %s", order)

        for provider_name in order:
            try_init = init_map.get(provider_name)
            if try_init and try_init():
                return

        if self._is_production():
            self.error_message = (
                "No hay proveedor AI configurado en producción. "
                "Configura GROQ_API_KEY o GEMINI_API_KEY."
            )
        else:
            self.error_message = (
                "No hay proveedor AI configurado. "
                "Configura GROQ_API_KEY, GEMINI_API_KEY, o instala Ollama."
            )
    
    def _try_init_gemini(self) -> bool:
        """Try to initialize Gemini client."""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            return False
        
        try:
            from google import genai
            self._gemini_client = genai.Client(api_key=api_key)
            self.provider = 'gemini'
            self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
            self.enabled = True
            logger.info(f"[AI] Usando Gemini con modelo: {self.model_name}")
            return True
        except Exception as e:
            logger.warning(f"[AI] Gemini no disponible: {e}")
            return False
    
    def _try_init_groq(self) -> bool:
        """Try to initialize Groq client."""
        api_key = getattr(settings, 'GROQ_API_KEY', None)
        if not api_key:
            return False
        
        try:
            from groq import Groq
            self._groq_client = Groq(api_key=api_key)
            self.provider = 'groq'
            self.model_name = getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile')
            self.enabled = True
            logger.info(f"[AI] Usando Groq con modelo: {self.model_name}")
            return True
        except ImportError:
            logger.warning("[AI] Groq SDK no instalado. Instala con: pip install groq")
            return False
        except Exception as e:
            logger.warning(f"[AI] Groq no disponible: {e}")
            return False
    
    def _try_init_ollama(self) -> bool:
        """Try to initialize Ollama (local)."""
        import requests
        
        base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        model = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')
        
        try:
            # Check if Ollama is running
            response = requests.get(f"{base_url}/api/tags", timeout=2)
            if response.status_code == 200:
                self._ollama_base_url = base_url
                self.provider = 'ollama'
                self.model_name = model
                self.enabled = True
                logger.info(f"[AI] Usando Ollama local con modelo: {self.model_name}")
                return True
        except Exception as e:
            logger.warning(f"[AI] Ollama no disponible: {e}")
        return False
    
    def _generate_content(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """
        Genera contenido usando el proveedor AI configurado.
        Soporta: Gemini, Groq, Ollama
        """
        self._ensure_initialized()
        
        if not self.enabled:
            return f"Error: {self.error_message or 'Servicio AI no disponible'}"
        
        print(f"[AI DEBUG] Provider: {self.provider}, Model: {self.model_name}, max_tokens={max_tokens}")
        
        try:
            if self.provider == 'gemini':
                return self._generate_gemini(system_prompt, user_prompt, max_tokens, temperature)
            elif self.provider == 'groq':
                return self._generate_groq(system_prompt, user_prompt, max_tokens, temperature)
            elif self.provider == 'ollama':
                return self._generate_ollama(system_prompt, user_prompt, max_tokens, temperature)
            else:
                return "Error: Proveedor AI no configurado"
        except Exception as e:
            logger.error(f"Error generando contenido AI: {str(e)}", exc_info=True)
            raise

    def _finalize_interpretation(self, interpretation: str, layer: str) -> AIInterpretationResult:
        if is_failed_generation_text(interpretation):
            return AIInterpretationResult(
                success=False,
                interpretation='',
                layer=layer,
                error=interpretation,
            )
        if DISCLAIMER.strip() not in interpretation:
            interpretation += DISCLAIMER
        return AIInterpretationResult(
            success=True,
            interpretation=interpretation,
            layer=layer,
        )
    
    def _generate_gemini(self, system_prompt: str, user_prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate content using Gemini API."""
        from google.genai import types
        
        config = types.GenerateContentConfig(
            temperature=temperature,
            maxOutputTokens=max_tokens,
            systemInstruction=system_prompt,
        )
        
        response = self._gemini_client.models.generate_content(
            model=self.model_name,
            contents=user_prompt,
            config=config,
        )
        
        # Extract text from response
        if hasattr(response, 'text'):
            return response.text
        elif hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                return ''.join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        
        return extract_text(response) if response else "Sin respuesta del modelo"
    
    def _generate_groq(self, system_prompt: str, user_prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate content using Groq API."""
        response = self._groq_client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content
    
    def _generate_ollama(self, system_prompt: str, user_prompt: str, max_tokens: int, temperature: float) -> str:
        """Generate content using local Ollama."""
        import requests
        
        response = requests.post(
            f"{self._ollama_base_url}/api/generate",
            json={
                "model": self.model_name,
                "prompt": user_prompt,
                "system": system_prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                }
            },
            timeout=120,  # Ollama can be slow
        )
        response.raise_for_status()
        return response.json().get('response', '')
    
    def interpret_natal(self, chart_data: Dict[str, Any]) -> AIInterpretationResult:
        """
        Genera interpretación de la carta natal.
        
        Args:
            chart_data: Datos de la carta natal (planetas, casas, aspectos)
            
        Returns:
            AIInterpretationResult con la interpretación
        """
        # Ensure service is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="natal",
                error=self.error_message,
            )
        
        try:
            prompt_config = get_prompt_for_layer('natal')
            user_prompt = build_natal_prompt(chart_data)
            
            interpretation = self._generate_content(
                system_prompt=prompt_config.system_prompt,
                user_prompt=user_prompt,
                max_tokens=prompt_config.max_tokens,
                temperature=prompt_config.temperature,
            )
            return self._finalize_interpretation(interpretation, 'natal')
            
        except Exception as e:
            logger.error(f"Error en interpret_natal: {str(e)}", exc_info=True)
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="natal",
                error=str(e),
            )
    
    def interpret_transits(
        self,
        natal_data: Dict[str, Any],
        transits_data: Dict[str, Any],
        transit_date: str = "actual"
    ) -> AIInterpretationResult:
        """
        Genera interpretación de tránsitos actuales.
        
        Args:
            natal_data: Carta natal base
            transits_data: Posiciones de tránsitos
            transit_date: Fecha de referencia
            
        Returns:
            AIInterpretationResult con la interpretación
        """
        # Ensure service is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="transits",
                error=self.error_message,
            )
        
        try:
            prompt_config = get_prompt_for_layer('transits')
            user_prompt = build_transits_prompt(natal_data, transits_data, transit_date)
            
            interpretation = self._generate_content(
                system_prompt=prompt_config.system_prompt,
                user_prompt=user_prompt,
                max_tokens=prompt_config.max_tokens,
                temperature=prompt_config.temperature,
            )
            
            return self._finalize_interpretation(interpretation, 'transits')
            
        except Exception as e:
            logger.error(f"Error en interpret_transits: {str(e)}", exc_info=True)
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="transits",
                error=str(e),
            )
    
    def interpret_progressions(
        self,
        natal_data: Dict[str, Any],
        progressions_data: Dict[str, Any],
        progression_date: str = "actual"
    ) -> AIInterpretationResult:
        """
        Genera interpretación de progresiones secundarias.
        
        Args:
            natal_data: Carta natal base
            progressions_data: Carta progresada
            progression_date: Fecha de referencia
            
        Returns:
            AIInterpretationResult con la interpretación
        """
        # Ensure service is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="progressions",
                error=self.error_message,
            )
        
        try:
            prompt_config = get_prompt_for_layer('progressions')
            user_prompt = build_progressions_prompt(
                natal_data, progressions_data, progression_date
            )
            
            interpretation = self._generate_content(
                system_prompt=prompt_config.system_prompt,
                user_prompt=user_prompt,
                max_tokens=prompt_config.max_tokens,
                temperature=prompt_config.temperature,
            )
            
            return self._finalize_interpretation(interpretation, 'progressions')
            
        except Exception as e:
            logger.error(f"Error en interpret_progressions: {str(e)}", exc_info=True)
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="progressions",
                error=str(e),
            )
    
    def interpret_solar_return(
        self,
        natal_data: Dict[str, Any],
        solar_return_data: Dict[str, Any],
        year: int = 2026
    ) -> AIInterpretationResult:
        """
        Genera interpretación del retorno solar.
        
        Args:
            natal_data: Carta natal base
            solar_return_data: Carta del retorno solar
            year: Año del retorno
            
        Returns:
            AIInterpretationResult con la interpretación
        """
        # Ensure service is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="solar_return",
                error=self.error_message,
            )
        
        try:
            prompt_config = get_prompt_for_layer('solar_return')
            user_prompt = build_solar_return_prompt(
                natal_data, solar_return_data, year
            )
            
            interpretation = self._generate_content(
                system_prompt=prompt_config.system_prompt,
                user_prompt=user_prompt,
                max_tokens=prompt_config.max_tokens,
                temperature=prompt_config.temperature,
            )
            
            return self._finalize_interpretation(interpretation, 'solar_return')
            
        except Exception as e:
            logger.error(f"Error en interpret_solar_return: {str(e)}", exc_info=True)
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="solar_return",
                error=str(e),
            )
    
    def query_situation(
        self,
        question: str,
        chart_data: Dict[str, Any],
        transits_data: Optional[Dict[str, Any]] = None
    ) -> AIInterpretationResult:
        """
        Responde una pregunta específica sobre la carta.
        
        Args:
            question: Pregunta del terapeuta
            chart_data: Contexto de la carta natal
            transits_data: Tránsitos actuales (opcional)
            
        Returns:
            AIInterpretationResult con la respuesta
        """
        # Ensure service is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="situation",
                error=self.error_message,
            )
        
        # Validar pregunta
        if not question or len(question.strip()) < 10:
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="situation",
                error="La pregunta debe tener al menos 10 caracteres",
            )
        
        try:
            prompt_config = get_prompt_for_layer('situation')
            user_prompt = build_situation_prompt(question, chart_data, transits_data)
            
            interpretation = self._generate_content(
                system_prompt=prompt_config.system_prompt,
                user_prompt=user_prompt,
                max_tokens=prompt_config.max_tokens,
                temperature=prompt_config.temperature,
            )
            
            return self._finalize_interpretation(interpretation, 'situation')
            
        except Exception as e:
            logger.error(f"Error en query_situation: {str(e)}", exc_info=True)
            return AIInterpretationResult(
                success=False,
                interpretation="",
                layer="situation",
                error=str(e),
            )


# Instancia singleton para uso en views
astrology_ai_service = AstrologyAIService()
