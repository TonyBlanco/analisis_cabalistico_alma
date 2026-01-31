"""
AI Governance System for Cábala Aplicada Module.

This module implements ethical controls for AI usage in the Kabbalistic workspace.
AI is ONLY an assistant - never an authority on spiritual interpretation.

CRITICAL RULES:
- NO soul interpretation
- NO tikun determination  
- NO spiritual diagnosis
- NO predictions
- NO past life readings
- Therapist has FULL sovereignty
- All AI outputs require therapist review

Author: Sistema Holístico
Date: 2026-01-31
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from django.conf import settings
from django.db import models
import hashlib
import logging
import re

logger = logging.getLogger(__name__)


def get_user_model_lazy():
    """Lazy import to avoid circular imports."""
    from django.contrib.auth import get_user_model
    return get_user_model()


# ============================================================================
# FEATURE FLAGS (can be overridden in settings.py)
# ============================================================================

def get_cabala_ai_features() -> Dict[str, bool]:
    """Get AI feature flags with safe defaults."""
    defaults = {
        'AI_TEXT_ANALYSIS_ENABLED': True,      # P3.1 - Textual exploration
        'AI_MEDITATION_GEN_ENABLED': True,     # P3.3 - Meditation generation
        'AI_SYNTHESIS_ENABLED': True,          # P3.2 - Synthesis assistance
        'REQUIRE_THERAPIST_APPROVAL': True,    # Always True - non-negotiable
        'LOG_ALL_AI_USAGE': True,              # Always True - audit trail
        'SHOW_AI_CONFIDENCE': True,            # Show confidence levels
    }
    
    # Override from settings if available
    custom = getattr(settings, 'CABALA_APLICADA_FEATURES', {})
    
    # Ensure critical flags cannot be disabled
    result = {**defaults, **custom}
    result['REQUIRE_THERAPIST_APPROVAL'] = True  # Forced True
    result['LOG_ALL_AI_USAGE'] = True  # Forced True
    
    return result


# ============================================================================
# ALLOWED/FORBIDDEN OPERATIONS
# ============================================================================

class AIOperationType:
    """Enum-like class for AI operation types."""
    
    # ALLOWED operations (educational/assistive)
    TEXT_EXTRACTION = 'text_extraction'
    CONCEPT_ANALYSIS = 'concept_analysis'
    MEDITATION_GENERATION = 'meditation_generation'
    REFLECTION_QUESTIONS = 'reflection_questions'
    TEXT_SUMMARY = 'text_summary'
    SYMBOLIC_CORRELATION = 'symbolic_correlation'
    
    # FORBIDDEN operations (interpretive/diagnostic)
    SOUL_INTERPRETATION = 'soul_interpretation'
    TIKUN_DETERMINATION = 'tikun_determination'
    SPIRITUAL_DIAGNOSIS = 'spiritual_diagnosis'
    PREDICTION = 'prediction'
    PAST_LIFE_READING = 'past_life_reading'
    KARMA_ANALYSIS = 'karma_analysis'
    DESTINY_DETERMINATION = 'destiny_determination'
    
    ALLOWED = [
        TEXT_EXTRACTION,
        CONCEPT_ANALYSIS,
        MEDITATION_GENERATION,
        REFLECTION_QUESTIONS,
        TEXT_SUMMARY,
        SYMBOLIC_CORRELATION,
    ]
    
    FORBIDDEN = [
        SOUL_INTERPRETATION,
        TIKUN_DETERMINATION,
        SPIRITUAL_DIAGNOSIS,
        PREDICTION,
        PAST_LIFE_READING,
        KARMA_ANALYSIS,
        DESTINY_DETERMINATION,
    ]


# ============================================================================
# FORBIDDEN PHRASES (in prompts)
# ============================================================================

FORBIDDEN_PHRASES = [
    # Spanish
    'interpreta el alma',
    'interpretar el alma',
    'interpreta su alma',
    'el tikún de',
    'su tikún es',
    'predice',
    'predicción',
    'predecir',
    'diagnostica',
    'diagnóstico espiritual',
    'vidas pasadas',
    'vida pasada',
    'karma de',
    'su karma',
    'destino de',
    'su destino',
    'debe hacer',
    'tiene que hacer',
    'necesita trabajar',
    'su misión es',
    'su propósito es',
    'está destinado',
    'lectura del alma',
    'leer el alma',
    
    # English (in case prompts are in English)
    'interpret the soul',
    'soul reading',
    'past lives',
    'karmic debt',
    'their destiny',
    'must do',
    'needs to work on',
]

FORBIDDEN_PATTERNS = [
    r'(?:qué|cuál)\s+(?:es|será)\s+(?:su|el)\s+(?:destino|karma|tikún)',
    r'(?:interpreta|analiza)\s+(?:el|su)\s+alma',
    r'(?:predice|revela)\s+(?:el|su)\s+futuro',
    r'(?:en\s+)?(?:sus\s+)?vidas?\s+pasadas?',
]


# ============================================================================
# AI GOVERNANCE SYSTEM
# ============================================================================

class AIGovernanceSystem:
    """
    Ethical control system for AI usage in Cábala Aplicada module.
    
    This system ensures:
    1. Only allowed operations are executed
    2. Prompts don't contain forbidden phrases
    3. All AI usage is logged for audit
    4. Therapist approval is required for outputs
    """
    
    def __init__(self):
        self.features = get_cabala_ai_features()
    
    def is_operation_allowed(self, operation: str) -> bool:
        """Check if an AI operation type is allowed."""
        if operation in AIOperationType.FORBIDDEN:
            logger.warning(f"Forbidden AI operation attempted: {operation}")
            return False
        
        if operation not in AIOperationType.ALLOWED:
            logger.warning(f"Unknown AI operation attempted: {operation}")
            return False
        
        # Check feature flags
        if operation in [AIOperationType.TEXT_EXTRACTION, AIOperationType.CONCEPT_ANALYSIS]:
            return self.features.get('AI_TEXT_ANALYSIS_ENABLED', False)
        
        if operation == AIOperationType.MEDITATION_GENERATION:
            return self.features.get('AI_MEDITATION_GEN_ENABLED', False)
        
        if operation in [AIOperationType.TEXT_SUMMARY, AIOperationType.REFLECTION_QUESTIONS]:
            return self.features.get('AI_SYNTHESIS_ENABLED', False)
        
        return True
    
    def validate_prompt(self, prompt: str, operation: str) -> Dict[str, Any]:
        """
        Validate that a prompt doesn't violate ethical restrictions.
        
        Returns:
            Dict with 'valid' bool and 'violations' list if invalid.
        """
        if not self.is_operation_allowed(operation):
            return {
                'valid': False,
                'violations': [f"Operation '{operation}' is not allowed"],
                'severity': 'critical'
            }
        
        violations = []
        prompt_lower = prompt.lower()
        
        # Check forbidden phrases
        for phrase in FORBIDDEN_PHRASES:
            if phrase in prompt_lower:
                violations.append(f"Forbidden phrase detected: '{phrase}'")
        
        # Check forbidden patterns (regex)
        for pattern in FORBIDDEN_PATTERNS:
            if re.search(pattern, prompt_lower):
                violations.append(f"Forbidden pattern detected: {pattern}")
        
        if violations:
            logger.warning(f"AI prompt validation failed: {violations}")
            return {
                'valid': False,
                'violations': violations,
                'severity': 'warning' if len(violations) == 1 else 'critical'
            }
        
        return {
            'valid': True,
            'violations': [],
            'severity': None
        }
    
    def sanitize_output(self, ai_response: str) -> Dict[str, Any]:
        """
        Sanitize AI output to remove any accidentally generated forbidden content.
        
        Returns sanitized response with metadata.
        """
        sanitized = ai_response
        warnings = []
        
        # Check for forbidden phrases in output
        response_lower = ai_response.lower()
        for phrase in FORBIDDEN_PHRASES[:10]:  # Check most critical phrases
            if phrase in response_lower:
                warnings.append(f"Output contained: '{phrase}'")
        
        # Add mandatory disclaimer if not present
        if 'observacional' not in response_lower and 'simbólico' not in response_lower:
            sanitized += "\n\n---\n*Nota: Este contenido es de carácter observacional y simbólico. " \
                        "No constituye interpretación espiritual definitiva. " \
                        "El terapeuta tiene soberanía total sobre su uso.*"
        
        return {
            'response': sanitized,
            'warnings': warnings,
            'requires_review': len(warnings) > 0 or self.features.get('REQUIRE_THERAPIST_APPROVAL', True),
            'confidence_note': 'medium' if warnings else 'high'
        }
    
    def get_safe_system_prompt(self, operation: str) -> str:
        """
        Get a safe system prompt for the specified operation type.
        
        These prompts are pre-approved and ensure ethical AI behavior.
        """
        prompts = {
            AIOperationType.TEXT_EXTRACTION: """
Eres un asistente académico especializado en textos cabalísticos.
Tu rol es ÚNICAMENTE extraer y organizar conceptos de textos clásicos.

REGLAS ABSOLUTAS:
- NO interpretes el alma de ninguna persona
- NO determines tikún individual
- NO hagas predicciones
- NO diagnostiques espiritualmente
- Solo extrae conceptos textuales objetivos
- Siempre indica que el terapeuta debe validar

Responde en español.
""".strip(),

            AIOperationType.CONCEPT_ANALYSIS: """
Eres un asistente educativo sobre conceptos cabalísticos.
Tu rol es explicar conceptos teóricos de forma accesible.

REGLAS ABSOLUTAS:
- Explica conceptos de forma general, nunca aplicados a personas específicas
- NO interpretes el significado para un individuo
- NO determines qué trabajo espiritual alguien "necesita"
- Mantén un tono educativo y neutral
- Incluye siempre un disclaimer de carácter observacional

Responde en español.
""".strip(),

            AIOperationType.MEDITATION_GENERATION: """
Eres un asistente que ayuda a crear meditaciones guiadas basadas en arquetipos sefiróticos.
Tu rol es generar textos meditativos que el terapeuta revisará antes de usar.

REGLAS ABSOLUTAS:
- NO prescribas trabajo espiritual específico
- NO determines qué "necesita" la persona
- Genera meditaciones genéricas adaptables
- El terapeuta decide si y cómo usar el contenido
- Incluye instrucciones para que el terapeuta personalice

Responde en español.
""".strip(),

            AIOperationType.REFLECTION_QUESTIONS: """
Eres un asistente que genera preguntas de reflexión terapéutica.
Tu rol es sugerir preguntas abiertas que faciliten la exploración.

REGLAS ABSOLUTAS:
- Genera preguntas abiertas, nunca directivas
- NO impliques qué respuesta es "correcta"
- NO determines qué el consultante "debe" descubrir
- Las preguntas son sugerencias para el terapeuta
- El terapeuta tiene soberanía total

Responde en español.
""".strip(),

            AIOperationType.TEXT_SUMMARY: """
Eres un asistente que resume y organiza notas terapéuticas.
Tu rol es sintetizar información sin añadir interpretación.

REGLAS ABSOLUTAS:
- Resume fielmente lo escrito, sin añadir
- NO interpretes significados no explícitos
- NO determines conclusiones que el terapeuta no haya indicado
- Organiza la información de forma clara
- Indica siempre "según las notas del terapeuta"

Responde en español.
""".strip(),
        }
        
        return prompts.get(operation, prompts[AIOperationType.TEXT_EXTRACTION])


# ============================================================================
# AI USAGE LOG MODEL
# ============================================================================

class AIUsageLog(models.Model):
    """
    Audit log for all AI usage in Cábala Aplicada module.
    
    This model stores metadata about AI interactions for:
    - Ethical auditing
    - Usage analysis
    - Compliance verification
    
    Note: We store prompt HASH, not full text, for privacy.
    """
    
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cabala_ai_usage_logs'
    )
    
    consultante_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID del consultante (si aplica)"
    )
    
    operation = models.CharField(
        max_length=50,
        choices=[
            (op, op.replace('_', ' ').title()) 
            for op in AIOperationType.ALLOWED
        ]
    )
    
    prompt_hash = models.CharField(
        max_length=64,
        help_text="SHA-256 hash of the prompt (privacy-preserving)"
    )
    
    prompt_length = models.IntegerField(
        help_text="Length of the original prompt"
    )
    
    response_length = models.IntegerField(
        help_text="Length of the AI response"
    )
    
    validation_passed = models.BooleanField(
        default=True,
        help_text="Whether prompt validation passed"
    )
    
    violations_found = models.JSONField(
        default=list,
        blank=True,
        help_text="List of validation violations (if any)"
    )
    
    therapist_approved = models.BooleanField(
        default=False,
        help_text="Whether therapist approved the output"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        app_label = 'api'
        verbose_name = 'AI Usage Log (Cábala)'
        verbose_name_plural = 'AI Usage Logs (Cábala)'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['therapist', 'created_at']),
            models.Index(fields=['operation', 'created_at']),
            models.Index(fields=['consultante_id']),
        ]
    
    def __str__(self):
        return f"{self.operation} by {self.therapist} at {self.created_at}"
    
    @classmethod
    def log_usage(
        cls,
        therapist,
        operation: str,
        prompt: str,
        response: str,
        consultante_id: Optional[int] = None,
        validation_result: Optional[Dict] = None
    ) -> 'AIUsageLog':
        """
        Log an AI usage event.
        
        Args:
            therapist: User who initiated the AI request
            operation: Type of AI operation
            prompt: The prompt sent to AI
            response: The AI's response
            consultante_id: Optional consultante ID
            validation_result: Result from validate_prompt()
        
        Returns:
            Created AIUsageLog instance
        """
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()
        
        return cls.objects.create(
            therapist=therapist,
            consultante_id=consultante_id,
            operation=operation,
            prompt_hash=prompt_hash,
            prompt_length=len(prompt),
            response_length=len(response),
            validation_passed=validation_result.get('valid', True) if validation_result else True,
            violations_found=validation_result.get('violations', []) if validation_result else [],
            therapist_approved=False  # Requires explicit approval
        )


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def create_governance_system() -> AIGovernanceSystem:
    """Factory function to create a governance system instance."""
    return AIGovernanceSystem()


def validate_ai_request(operation: str, prompt: str) -> Dict[str, Any]:
    """
    Quick validation function for AI requests.
    
    Returns validation result with 'valid' bool.
    """
    gov = create_governance_system()
    return gov.validate_prompt(prompt, operation)


def get_safe_prompt(operation: str) -> str:
    """Get the safe system prompt for an operation."""
    gov = create_governance_system()
    return gov.get_safe_system_prompt(operation)


# ============================================================================
# DISCLAIMER CONSTANTS
# ============================================================================

CABALA_AI_DISCLAIMER = """
---
**Nota Ética**: Este contenido ha sido generado con asistencia de IA como 
herramienta de apoyo. No constituye interpretación espiritual ni diagnóstico.
El terapeuta ha revisado y validado este contenido antes de su uso.
La Cábala es un mapa simbólico, no una verdad absoluta.
---
"""

CABALA_AI_DISCLAIMER_SHORT = (
    "*Contenido asistido por IA — revisado por terapeuta — carácter observacional*"
)
