"""
Servicio AI para Interpretaciones Astrológicas

Este servicio conecta con Gemini API para generar interpretaciones
profesionales de las diferentes capas astrológicas.

Uso:
    from api.astrology_ai_service import AstrologyAIService
    
    service = AstrologyAIService()
    if service.enabled:
        result = service.interpret_natal(chart_data)
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
        """Inicializa el cliente de Gemini (lazy)."""
        if AstrologyAIService._initialized:
            return
            
        self.api_key = None
        self.model_name = 'gemini-1.5-flash'
        self.enabled = False
        self.client = None
        self.error_message = None
        self._genai = None
        
        # Defer actual initialization
        AstrologyAIService._initialized = True
    
    def _ensure_initialized(self):
        """Lazy initialization of Gemini client."""
        if self.client is not None or self.error_message:
            return  # Already initialized
            
        # Import genai lazily
        try:
            from google import genai
            self._genai = genai
        except ImportError:
            self.error_message = "Módulo google.genai no instalado"
            logger.warning(f"AstrologyAIService: {self.error_message}")
            return
        
        # Get settings
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        if not self.api_key:
            self.error_message = "GEMINI_API_KEY no configurada"
            logger.warning(f"AstrologyAIService: {self.error_message}")
            return
        
        try:
            self.client = self._genai.Client(api_key=self.api_key)
            self.enabled = True
            logger.info(f"AstrologyAIService configurado con modelo: {self.model_name}")
        except Exception as e:
            self.error_message = f"Error configurando Gemini: {str(e)}"
            logger.error(f"AstrologyAIService: {self.error_message}")
            self.enabled = False
    
    def _generate_content(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """
        Genera contenido usando Gemini API.
        
        Args:
            system_prompt: Instrucciones del sistema
            user_prompt: Prompt del usuario
            max_tokens: Límite de tokens de salida
            temperature: Creatividad (0.0-1.0)
            
        Returns:
            Texto generado o mensaje de error
        """
        # Ensure client is initialized
        self._ensure_initialized()
        
        if not self.enabled:
            return f"Error: {self.error_message or 'Servicio AI no disponible'}"
        
        try:
            # Combinar prompts para Gemini
            full_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}"
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config={
                    'temperature': temperature,
                    'max_output_tokens': max_tokens,
                }
            )
            
            # Extraer texto de la respuesta
            if hasattr(response, 'text'):
                return response.text
            elif hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    return ''.join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
            
            return extract_text(response) if response else "Sin respuesta del modelo"
            
        except Exception as e:
            logger.error(f"Error generando contenido AI: {str(e)}", exc_info=True)
            return f"Error al generar interpretación: {str(e)}"
    
    def interpret_natal(self, chart_data: Dict[str, Any]) -> AIInterpretationResult:
        """
        Genera interpretación de la carta natal.
        
        Args:
            chart_data: Datos de la carta natal (planetas, casas, aspectos)
            
        Returns:
            AIInterpretationResult con la interpretación
        """
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
            
            # Asegurar disclaimer
            if DISCLAIMER.strip() not in interpretation:
                interpretation += DISCLAIMER
            
            return AIInterpretationResult(
                success=True,
                interpretation=interpretation,
                layer="natal",
            )
            
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
            
            if DISCLAIMER.strip() not in interpretation:
                interpretation += DISCLAIMER
            
            return AIInterpretationResult(
                success=True,
                interpretation=interpretation,
                layer="transits",
            )
            
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
            
            if DISCLAIMER.strip() not in interpretation:
                interpretation += DISCLAIMER
            
            return AIInterpretationResult(
                success=True,
                interpretation=interpretation,
                layer="progressions",
            )
            
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
            
            if DISCLAIMER.strip() not in interpretation:
                interpretation += DISCLAIMER
            
            return AIInterpretationResult(
                success=True,
                interpretation=interpretation,
                layer="solar_return",
            )
            
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
            
            if DISCLAIMER.strip() not in interpretation:
                interpretation += DISCLAIMER
            
            return AIInterpretationResult(
                success=True,
                interpretation=interpretation,
                layer="situation",
            )
            
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
