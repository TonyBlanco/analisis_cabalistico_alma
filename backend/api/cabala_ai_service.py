"""
AI Service for Cábala Aplicada Module.

This service provides ETHICAL AI assistance for:
- P3.1: Text extraction and concept analysis
- P3.2: Synthesis assistance (notes organization)
- P3.3: Meditation generation

ALL operations go through the AIGovernanceSystem for validation.

Author: Sistema Holístico
Date: 2026-01-31
"""

from typing import Optional, Dict, Any, List
from django.conf import settings
from api.ai_governance import (
    AIGovernanceSystem,
    AIOperationType,
    AIUsageLog,
    CABALA_AI_DISCLAIMER_SHORT,
)
from api.utils.multi_ai_service import generate_with_fallback
import logging
import json

logger = logging.getLogger(__name__)


class CabalaAIService:
    """
    Ethical AI service for Cábala Aplicada workspace.
    
    This service wraps AI calls with governance checks and ensures
    all outputs are properly validated and logged.
    """
    
    def __init__(self, therapist_user):
        """
        Initialize the service for a specific therapist.
        
        Args:
            therapist_user: Django User who is the therapist
        """
        self.therapist = therapist_user
        self.governance = AIGovernanceSystem()
    
    def _call_ai(self, system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> Optional[str]:
        """
        Make an AI API call with the given prompts using multi-provider fallback.
        
        Returns the AI response text or None on failure.
        """
        try:
            # Combine system and user prompts for the multi-AI service
            full_prompt = f"""[SYSTEM]
{system_prompt}

[USER]
{user_prompt}"""
            
            result = generate_with_fallback(
                prompt=full_prompt,
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            if result.get('success') and result.get('text'):
                return result['text']
            
            logger.error(f"AI generation failed: {result.get('error', 'Unknown error')}")
            return None
            
        except Exception as e:
            logger.error(f"AI API call failed: {e}")
            return None
            return None
    
    # =========================================================================
    # P3.1: TEXT EXPLORATION
    # =========================================================================
    
    def extract_concepts(
        self,
        text: str,
        consultante_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Extract Kabbalistic concepts from a text.
        
        This is a SAFE operation that only extracts concepts,
        never interprets them for a specific person.
        
        Args:
            text: The text to analyze
            consultante_id: Optional consultante ID for logging
            
        Returns:
            Dict with 'concepts', 'sefirot_mentioned', 'themes'
        """
        operation = AIOperationType.CONCEPT_ANALYSIS
        
        # Build prompt
        user_prompt = f"""
Analiza el siguiente texto y extrae los conceptos cabalísticos presentes.
NO interpretes qué significa para ninguna persona específica.
Solo identifica los conceptos de forma objetiva.

TEXTO:
{text[:2000]}

Responde en formato JSON con:
- concepts: lista de conceptos cabalísticos encontrados
- sefirot_mentioned: lista de Sefirot mencionadas o relacionadas
- themes: temas principales del texto
- summary: resumen breve del contenido (máximo 100 palabras)
"""
        
        # Validate
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {
                'error': 'Prompt validation failed',
                'violations': validation['violations'],
                'concepts': [],
                'sefirot_mentioned': [],
                'themes': []
            }
        
        # Get system prompt
        system_prompt = self.governance.get_safe_system_prompt(operation)
        
        # Call AI
        response = self._call_ai(system_prompt, user_prompt, max_tokens=800)
        
        if not response:
            return {
                'error': 'AI service unavailable',
                'concepts': [],
                'sefirot_mentioned': [],
                'themes': []
            }
        
        # Log usage
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response,
            consultante_id=consultante_id,
            validation_result=validation
        )
        
        # Parse response
        try:
            # Try to extract JSON from response
            if '```json' in response:
                json_str = response.split('```json')[1].split('```')[0]
            elif '{' in response:
                start = response.index('{')
                end = response.rindex('}') + 1
                json_str = response[start:end]
            else:
                json_str = response
            
            result = json.loads(json_str)
            result['disclaimer'] = CABALA_AI_DISCLAIMER_SHORT
            result['requires_review'] = True
            return result
        except (json.JSONDecodeError, ValueError):
            # Return raw response with structure
            return {
                'concepts': [],
                'sefirot_mentioned': [],
                'themes': [],
                'raw_analysis': response,
                'disclaimer': CABALA_AI_DISCLAIMER_SHORT,
                'requires_review': True
            }
    
    def suggest_readings(
        self,
        topic: str,
        sefira: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Suggest related readings for a Kabbalistic topic.
        
        Args:
            topic: The topic to explore
            sefira: Optional specific Sefira context
            
        Returns:
            Dict with 'suggestions' list
        """
        operation = AIOperationType.TEXT_EXTRACTION
        
        context = f" en el contexto de {sefira}" if sefira else ""
        user_prompt = f"""
Sugiere lecturas y conceptos relacionados con: {topic}{context}

Incluye:
- 3-5 textos clásicos relevantes (Zohar, Sefer Yetzirah, etc.)
- 2-3 conceptos relacionados para explorar
- 1-2 meditaciones tradicionales relacionadas

NO incluyas interpretaciones personalizadas.
Responde en formato estructurado.
"""
        
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {'error': 'Validation failed', 'suggestions': []}
        
        system_prompt = self.governance.get_safe_system_prompt(operation)
        response = self._call_ai(system_prompt, user_prompt, max_tokens=600)
        
        if not response:
            return {'error': 'AI unavailable', 'suggestions': []}
        
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response
        )
        
        return {
            'suggestions': response,
            'topic': topic,
            'sefira': sefira,
            'disclaimer': CABALA_AI_DISCLAIMER_SHORT,
            'requires_review': True
        }
    
    # =========================================================================
    # P3.2: SYNTHESIS ASSISTANCE
    # =========================================================================
    
    def summarize_notes(
        self,
        notes: List[str],
        consultante_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Summarize therapist notes WITHOUT adding interpretation.
        
        Args:
            notes: List of note strings from the therapist
            consultante_id: Optional consultante ID for logging
            
        Returns:
            Dict with 'summary' and 'key_points'
        """
        operation = AIOperationType.TEXT_SUMMARY
        
        notes_text = "\n---\n".join(notes[:10])  # Limit notes
        
        user_prompt = f"""
Resume las siguientes notas del terapeuta de forma objetiva.
NO añadas interpretación ni conclusiones que no estén explícitas.
Solo organiza y sintetiza lo que está escrito.

NOTAS DEL TERAPEUTA:
{notes_text}

Responde con:
- summary: resumen fiel de las notas (máximo 150 palabras)
- key_points: lista de puntos clave mencionados
- themes_noted: temas que el terapeuta ha identificado
- questions_raised: preguntas que el terapeuta ha planteado

Indica siempre "según las notas del terapeuta" cuando corresponda.
"""
        
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {'error': 'Validation failed', 'summary': ''}
        
        system_prompt = self.governance.get_safe_system_prompt(operation)
        response = self._call_ai(system_prompt, user_prompt, max_tokens=700)
        
        if not response:
            return {'error': 'AI unavailable', 'summary': ''}
        
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response,
            consultante_id=consultante_id,
            validation_result=validation
        )
        
        # Sanitize output
        sanitized = self.governance.sanitize_output(response)
        
        return {
            'summary': sanitized['response'],
            'requires_review': True,
            'warnings': sanitized['warnings'],
            'disclaimer': CABALA_AI_DISCLAIMER_SHORT
        }
    
    def generate_reflection_questions(
        self,
        sefira: str,
        context: Optional[str] = None,
        count: int = 5
    ) -> Dict[str, Any]:
        """
        Generate open-ended reflection questions for a Sefira.
        
        Args:
            sefira: The Sefira to focus on
            context: Optional therapeutic context
            count: Number of questions to generate
            
        Returns:
            Dict with 'questions' list
        """
        operation = AIOperationType.REFLECTION_QUESTIONS
        
        context_str = f"\nContexto adicional: {context}" if context else ""
        
        user_prompt = f"""
Genera {count} preguntas de reflexión abiertas relacionadas con la Sefirá de {sefira}.
{context_str}

REGLAS:
- Las preguntas deben ser abiertas, sin respuesta "correcta"
- NO impliques qué debe descubrir la persona
- NO presupongas qué trabajo espiritual necesita
- Las preguntas son sugerencias para el terapeuta, quien decidirá cuáles usar
- Mantén un tono exploratorio y respetuoso

Responde con una lista numerada de preguntas.
"""
        
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {'error': 'Validation failed', 'questions': []}
        
        system_prompt = self.governance.get_safe_system_prompt(operation)
        response = self._call_ai(system_prompt, user_prompt, max_tokens=500)
        
        if not response:
            return {'error': 'AI unavailable', 'questions': []}
        
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response
        )
        
        # Parse questions
        lines = response.strip().split('\n')
        questions = [
            line.strip().lstrip('0123456789.-) ') 
            for line in lines 
            if line.strip() and not line.startswith('*')
        ]
        
        return {
            'questions': questions[:count],
            'sefira': sefira,
            'for_therapist_review': True,
            'disclaimer': CABALA_AI_DISCLAIMER_SHORT
        }
    
    # =========================================================================
    # P3.3: MEDITATION GENERATION
    # =========================================================================
    
    def generate_meditation(
        self,
        sefira: str,
        duration_minutes: int = 10,
        style: str = 'guided'
    ) -> Dict[str, Any]:
        """
        Generate a meditation script based on a Sefira archetype.
        
        This is a DRAFT that MUST be reviewed by the therapist.
        
        Args:
            sefira: The Sefira to base the meditation on
            duration_minutes: Approximate duration
            style: 'guided', 'visualization', or 'contemplative'
            
        Returns:
            Dict with 'meditation_text' and 'instructions'
        """
        operation = AIOperationType.MEDITATION_GENERATION
        
        style_instructions = {
            'guided': "con instrucciones paso a paso",
            'visualization': "con visualizaciones detalladas",
            'contemplative': "con espacio para la contemplación silenciosa"
        }
        
        style_text = style_instructions.get(style, style_instructions['guided'])
        
        user_prompt = f"""
Genera un borrador de meditación guiada basada en el arquetipo de {sefira}.
Duración aproximada: {duration_minutes} minutos
Estilo: {style_text}

REGLAS CRÍTICAS:
- Esta es una meditación GENÉRICA sobre el arquetipo, no para una persona específica
- NO prescribas trabajo espiritual específico
- NO determines qué "necesita" quien la practique
- El terapeuta revisará y adaptará este borrador antes de usarlo
- Incluye [NOTA PARA TERAPEUTA] donde el terapeuta debería personalizar

Estructura:
1. Introducción y respiración (1-2 min)
2. Conexión con el arquetipo de {sefira} (3-4 min)
3. Desarrollo meditativo (4-5 min)
4. Integración y cierre (1-2 min)
"""
        
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {'error': 'Validation failed', 'meditation_text': ''}
        
        system_prompt = self.governance.get_safe_system_prompt(operation)
        response = self._call_ai(system_prompt, user_prompt, max_tokens=1200)
        
        if not response:
            return {'error': 'AI unavailable', 'meditation_text': ''}
        
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response
        )
        
        # Sanitize
        sanitized = self.governance.sanitize_output(response)
        
        return {
            'meditation_text': sanitized['response'],
            'sefira': sefira,
            'duration_minutes': duration_minutes,
            'style': style,
            'status': 'draft',
            'requires_therapist_review': True,
            'therapist_instructions': (
                "Este es un BORRADOR generado por IA. "
                "Por favor revise y adapte el contenido antes de usar. "
                "Personalice las secciones marcadas con [NOTA PARA TERAPEUTA]. "
                "Usted tiene soberanía total sobre el contenido final."
            ),
            'warnings': sanitized['warnings'],
            'disclaimer': CABALA_AI_DISCLAIMER_SHORT
        }
    
    def get_sefira_attributes(self, sefira: str) -> Dict[str, Any]:
        """
        Get educational attributes of a Sefira (not personalized).
        
        This is pure educational content, not interpretation.
        """
        operation = AIOperationType.CONCEPT_ANALYSIS
        
        user_prompt = f"""
Proporciona información educativa sobre la Sefirá de {sefira}.

Incluye:
- Significado del nombre hebreo
- Atributos tradicionales
- Posición en el Árbol de la Vida
- Correspondencias clásicas (color, planeta, día, etc.)
- Virtudes y desafíos asociados (en términos generales)

Esta información es educativa y general.
NO la apliques a ninguna persona específica.
"""
        
        validation = self.governance.validate_prompt(user_prompt, operation)
        if not validation['valid']:
            return {'error': 'Validation failed'}
        
        system_prompt = self.governance.get_safe_system_prompt(operation)
        response = self._call_ai(system_prompt, user_prompt, max_tokens=600)
        
        if not response:
            return {'error': 'AI unavailable'}
        
        AIUsageLog.log_usage(
            therapist=self.therapist,
            operation=operation,
            prompt=user_prompt,
            response=response
        )
        
        return {
            'sefira': sefira,
            'attributes': response,
            'type': 'educational',
            'disclaimer': CABALA_AI_DISCLAIMER_SHORT
        }


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_cabala_ai_service(therapist_user) -> CabalaAIService:
    """Create a CabalaAIService instance for a therapist."""
    return CabalaAIService(therapist_user)
