"""
Tarot Holístico - Endpoints API para interpretaciones simbólicas educativas

IMPORTANTE: Este módulo es 100% HOLÍSTICO, NO CLÍNICO.
- Terminología: "consultante" (NO "paciente"), "lectura simbólica" (NO "diagnóstico")
- Las interpretaciones son educativas y exploratorias, NUNCA terapéuticas
- Multi-provider AI: Groq (prioritario) → Ollama → Gemini

Uso:
    POST /api/ai/tarot/interpretCard
    POST /api/ai/tarot/interpretSpread
    GET  /api/ai/tarot/schema
    GET  /api/ai/tarot/provider-status
"""

import logging
import json
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime

from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .astrology_ai_service import AstrologyAIService

logger = logging.getLogger(__name__)

# =============================================================================
# CONSTANTES Y CONFIGURACIÓN HOLÍSTICA
# =============================================================================

HOLISTIC_DISCLAIMER = (
    "Esta interpretación es simbólica y educativa. "
    "No constituye consejo profesional de salud mental, médico o legal. "
    "Para acompañamiento profesional, consulte a un especialista certificado."
)

# Lista negra de términos clínicos (NO deben aparecer en respuestas)
CLINICAL_TERMS_BLACKLIST = [
    "diagnóstico", "paciente", "terapia", "tratamiento", "síntoma",
    "patología", "clínico", "enfermedad", "trastorno", "medicamento",
    "diagnosis", "patient", "therapy", "treatment", "symptom",
]

# Sistemas de Tarot soportados
TAROT_SYSTEMS = [
    {"id": "thoth", "name": "Tarot de Thoth (Crowley)", "major_arcana": 22, "minor_arcana": 56},
    {"id": "golden-dawn", "name": "Golden Dawn", "major_arcana": 22, "minor_arcana": 56},
    {"id": "rider-waite", "name": "Rider-Waite-Smith", "major_arcana": 22, "minor_arcana": 56},
    {"id": "marseille", "name": "Tarot de Marsella", "major_arcana": 22, "minor_arcana": 56},
    {"id": "bota", "name": "B.O.T.A.", "major_arcana": 22, "minor_arcana": 56},
    {"id": "sephiroth", "name": "Sephiroth (Árbol de la Vida)", "major_arcana": 22, "minor_arcana": 0},
]

# Tipos de tirada soportados
SPREAD_TYPES = [
    {"id": "single_card", "name": "Carta Única", "positions": 1},
    {"id": "three_card", "name": "Tres Cartas (Pasado/Presente/Futuro)", "positions": 3},
    {"id": "celtic_cross", "name": "Cruz Celta (Simplificada)", "positions": 6},
    {"id": "tree_of_life", "name": "Árbol de la Vida", "positions": 10},
    {"id": "free", "name": "Tirada Libre", "positions": -1},
]


# =============================================================================
# PROMPTS HOLÍSTICOS
# =============================================================================

TAROT_SYSTEM_PROMPT = """Eres un experto en simbolismo del Tarot y tradiciones herméticas.
Tu rol es proporcionar interpretaciones EDUCATIVAS y EXPLORATORIAS, NUNCA clínicas o terapéuticas.

REGLAS ESTRICTAS:
1. USA "consultante" en lugar de "paciente"
2. USA "lectura simbólica" en lugar de "diagnóstico"
3. USA "reflexiones" en lugar de "tratamiento" o "prescripción"
4. NUNCA des consejos médicos o psicológicos
5. SIEMPRE incluye que esto es educativo y simbólico
6. Enfócate en arquetipos, símbolos y correspondencias cabalísticas

Tu respuesta debe ser en español, rica en simbolismo, pero accesible.
Incluye referencias al Árbol de la Vida cuando sea relevante.
"""

INTERPRET_CARD_PROMPT = """Interpreta simbólicamente la siguiente carta de Tarot:

**Carta**: {arcana_name} ({arcana_id})
**Posición en la tirada**: {position}
**Invertida**: {reversed}
**Sistema de Tarot**: {tarot_system}

**Contexto del consultante** (si se proporciona):
{context}

Proporciona:
1. **Simbolismo central**: Qué representa este arcano en la tradición hermética
2. **Correspondencias cabalísticas**: Sendero, letra hebrea, Sephiroth relacionados
3. **Mensaje simbólico**: Qué reflexión ofrece esta carta en esta posición
4. **Temas principales**: Lista de 3-5 temas arquetípicos

Recuerda: Esto es una exploración simbólica educativa, no un diagnóstico ni consejo profesional.
"""

INTERPRET_SPREAD_PROMPT = """Interpreta simbólicamente la siguiente tirada de Tarot:

**Tipo de tirada**: {spread_type}
**Sistema de Tarot**: {tarot_system}

**Cartas en la tirada**:
{cards_description}

**Contexto del consultante** (si se proporciona):
{context}

Proporciona:
1. **Visión general**: Síntesis simbólica de la tirada completa
2. **Interpretación por carta**: Breve reflexión de cada carta en su posición
3. **Patrones y conexiones**: Relaciones entre las cartas (elementos, números, senderos)
4. **Mensaje integrador**: Una reflexión holística final
5. **Temas emergentes**: Lista de 3-5 temas simbólicos principales

Recuerda: Esto es una exploración simbólica educativa, no un diagnóstico ni consejo profesional.
"""


# =============================================================================
# UTILIDADES
# =============================================================================

def filter_clinical_terms(text: str) -> str:
    """Filtra términos clínicos de la respuesta AI (capa de seguridad)."""
    result = text
    for term in CLINICAL_TERMS_BLACKLIST:
        # Reemplazar términos clínicos con alternativas holísticas
        if term.lower() in result.lower():
            logger.warning(f"[Tarot Holístico] Término clínico detectado y filtrado: {term}")
            # Mapeo de reemplazos
            replacements = {
                "diagnóstico": "lectura simbólica",
                "paciente": "consultante",
                "terapia": "exploración",
                "tratamiento": "reflexión",
                "síntoma": "patrón",
                "clínico": "simbólico",
            }
            if term.lower() in replacements:
                import re
                result = re.sub(rf'\b{term}\b', replacements.get(term.lower(), ""), result, flags=re.IGNORECASE)
    return result


def get_ai_service():
    """Obtiene la instancia del servicio AI multi-provider."""
    return AstrologyAIService()


# =============================================================================
# VISTAS API
# =============================================================================

class TarotHolisticSchemaView(APIView):
    """
    GET /api/ai/tarot/schema
    
    Retorna el esquema completo del sistema de Tarot Holístico:
    - Sistemas de Tarot disponibles
    - Tipos de tirada soportados
    - Providers AI activos
    - Versión y modo
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        ai_service = get_ai_service()
        ai_service._ensure_initialized()
        
        # Construir lista de providers con estado
        providers = []
        
        # Groq
        groq_available = bool(getattr(settings, 'GROQ_API_KEY', None))
        providers.append({
            "id": "groq",
            "name": "Groq AI",
            "model": getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile'),
            "available": groq_available,
            "priority": 1,
            "rate_limit": "30 req/min"
        })
        
        # Ollama
        ollama_available = ai_service.provider == 'ollama' if ai_service.enabled else False
        providers.append({
            "id": "ollama",
            "name": "Ollama (Local/Vercel)",
            "model": getattr(settings, 'OLLAMA_MODEL', 'llama3.2'),
            "available": ollama_available,
            "priority": 2,
            "rate_limit": "unlimited"
        })
        
        # Gemini
        gemini_available = bool(getattr(settings, 'GEMINI_API_KEY', None))
        providers.append({
            "id": "gemini",
            "name": "Gemini (Fallback)",
            "model": getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash'),
            "available": gemini_available,
            "priority": 3,
            "rate_limit": "15 req/min"
        })
        
        # Feature flag
        ai_tarot_enabled = getattr(settings, 'AI_TAROT_ENABLED', False)
        
        return Response({
            "decks": TAROT_SYSTEMS,
            "spreadTypes": SPREAD_TYPES,
            "providers": providers,
            "current_provider": ai_service.provider if ai_service.enabled else None,
            "current_model": ai_service.model_name if ai_service.enabled else None,
            "version": "1.0.0",
            "mode": "holistic",
            "ai_enabled": ai_tarot_enabled,
            "disclaimer": HOLISTIC_DISCLAIMER,
        })


class TarotHolisticProviderStatusView(APIView):
    """
    GET /api/ai/tarot/provider-status
    
    Retorna el estado actual de los providers AI.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        ai_service = get_ai_service()
        ai_service._ensure_initialized()
        
        return Response({
            "enabled": ai_service.enabled,
            "provider": ai_service.provider,
            "model": ai_service.model_name,
            "error": ai_service.error_message,
            "ai_tarot_enabled": getattr(settings, 'AI_TAROT_ENABLED', False),
        })


class TarotInterpretCardView(APIView):
    """
    POST /api/ai/tarot/interpretCard
    
    Interpreta una carta de Tarot de forma holística y simbólica.
    
    Request:
    {
        "arcanaId": "the_fool",
        "arcanaName": "El Loco",
        "position": "center",
        "reversed": false,
        "tarotSystem": "thoth",
        "context": {
            "question": "...",
            "consultantId": 123
        },
        "options": {
            "temperature": 0.7,
            "provider": "auto"
        }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verificar feature flag
        if not getattr(settings, 'AI_TAROT_ENABLED', False):
            return Response({
                "error": "La interpretación AI de Tarot no está habilitada. Contacte al administrador.",
                "code": "AI_TAROT_DISABLED"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Extraer datos
        data = request.data
        arcana_id = data.get('arcanaId', 'unknown')
        arcana_name = data.get('arcanaName', arcana_id)
        position = data.get('position', 'general')
        reversed_card = data.get('reversed', False)
        tarot_system = data.get('tarotSystem', 'thoth')
        context = data.get('context', {})
        options = data.get('options', {})
        
        # Preparar contexto (sanitizado)
        context_str = ""
        if context:
            question = context.get('question', '')
            if question:
                context_str = f"Pregunta o tema de exploración: {question}"
        
        # Construir prompt
        user_prompt = INTERPRET_CARD_PROMPT.format(
            arcana_name=arcana_name,
            arcana_id=arcana_id,
            position=position,
            reversed="Sí" if reversed_card else "No",
            tarot_system=tarot_system,
            context=context_str or "No se proporcionó contexto específico."
        )
        
        # Generar interpretación
        ai_service = get_ai_service()
        temperature = options.get('temperature', 0.8)
        
        try:
            interpretation = ai_service._generate_content(
                system_prompt=TAROT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=1024,
                temperature=temperature,
            )
            
            # Filtrar términos clínicos (capa de seguridad)
            interpretation = filter_clinical_terms(interpretation)
            
            # Extraer temas (simplificado - en producción usar NLP)
            themes = self._extract_themes(interpretation)
            
            return Response({
                "text": interpretation,
                "themes": themes,
                "confidence": 0.75,  # Placeholder - en producción calcular
                "provider_used": ai_service.provider,
                "model_used": ai_service.model_name,
                "holistic_disclaimer": HOLISTIC_DISCLAIMER,
                "card": {
                    "arcanaId": arcana_id,
                    "arcanaName": arcana_name,
                    "position": position,
                    "reversed": reversed_card,
                    "tarotSystem": tarot_system,
                },
                "timestamp": datetime.now().isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Error en interpretación de carta: {e}", exc_info=True)
            return Response({
                "error": f"Error al generar interpretación: {str(e)}",
                "code": "AI_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_themes(self, text: str) -> List[str]:
        """Extrae temas principales del texto (versión simplificada)."""
        # En producción, usar NLP o modelo de extracción
        common_themes = [
            "transformación", "renacimiento", "intuición", "sabiduría",
            "equilibrio", "creatividad", "introspección", "cambio",
            "abundancia", "comunicación", "amor", "fuerza", "justicia",
        ]
        found = []
        text_lower = text.lower()
        for theme in common_themes:
            if theme in text_lower and len(found) < 5:
                found.append(theme)
        return found if found else ["exploración simbólica"]


class TarotInterpretSpreadView(APIView):
    """
    POST /api/ai/tarot/interpretSpread
    
    Interpreta una tirada completa de Tarot de forma holística.
    
    Request:
    {
        "spreadType": "three_card",
        "tarotSystem": "thoth",
        "cards": [
            {"arcanaId": "the_fool", "arcanaName": "El Loco", "position": "past", "reversed": false},
            {"arcanaId": "the_magician", "arcanaName": "El Mago", "position": "present", "reversed": false},
            {"arcanaId": "the_high_priestess", "arcanaName": "La Sacerdotisa", "position": "future", "reversed": true}
        ],
        "context": {
            "question": "...",
            "consultantId": 123
        },
        "options": {
            "temperature": 0.8,
            "provider": "auto"
        }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verificar feature flag
        if not getattr(settings, 'AI_TAROT_ENABLED', False):
            return Response({
                "error": "La interpretación AI de Tarot no está habilitada.",
                "code": "AI_TAROT_DISABLED"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Extraer datos
        data = request.data
        spread_type = data.get('spreadType', 'three_card')
        tarot_system = data.get('tarotSystem', 'thoth')
        cards = data.get('cards', [])
        context = data.get('context', {})
        options = data.get('options', {})
        
        if not cards:
            return Response({
                "error": "Se requiere al menos una carta para la interpretación.",
                "code": "NO_CARDS"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Construir descripción de cartas
        cards_description = "\n".join([
            f"- **{card.get('arcanaName', card.get('arcanaId'))}** en posición '{card.get('position', 'general')}' "
            f"({'Invertida' if card.get('reversed', False) else 'Derecha'})"
            for card in cards
        ])
        
        # Preparar contexto
        context_str = ""
        if context:
            question = context.get('question', '')
            if question:
                context_str = f"Pregunta o tema de exploración: {question}"
        
        # Construir prompt
        user_prompt = INTERPRET_SPREAD_PROMPT.format(
            spread_type=spread_type,
            tarot_system=tarot_system,
            cards_description=cards_description,
            context=context_str or "No se proporcionó contexto específico."
        )
        
        # Generar interpretación
        ai_service = get_ai_service()
        temperature = options.get('temperature', 0.8)
        
        try:
            interpretation = ai_service._generate_content(
                system_prompt=TAROT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=2048,  # Más tokens para tiradas completas
                temperature=temperature,
            )
            
            # Filtrar términos clínicos
            interpretation = filter_clinical_terms(interpretation)
            
            # Extraer temas
            themes = self._extract_themes(interpretation)
            
            return Response({
                "summary": interpretation,
                "cardInterpretations": [],  # En v2: interpretaciones individuales
                "symbolic_insights": themes,
                "confidence": 0.80,
                "provider_used": ai_service.provider,
                "model_used": ai_service.model_name,
                "holistic_disclaimer": HOLISTIC_DISCLAIMER,
                "spread": {
                    "type": spread_type,
                    "tarotSystem": tarot_system,
                    "cardCount": len(cards),
                },
                "timestamp": datetime.now().isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Error en interpretación de tirada: {e}", exc_info=True)
            return Response({
                "error": f"Error al generar interpretación: {str(e)}",
                "code": "AI_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_themes(self, text: str) -> List[str]:
        """Extrae temas principales del texto."""
        common_themes = [
            "transformación", "renacimiento", "intuición", "sabiduría",
            "equilibrio", "creatividad", "introspección", "cambio",
            "abundancia", "comunicación", "amor", "fuerza", "justicia",
            "ciclo", "evolución", "despertar", "integración",
        ]
        found = []
        text_lower = text.lower()
        for theme in common_themes:
            if theme in text_lower and len(found) < 5:
                found.append(theme)
        return found if found else ["exploración simbólica"]


class TarotHolisticConsentCheckView(APIView):
    """
    GET /api/ai/tarot/consent-check
    
    Verifica si el usuario ha aceptado el consentimiento holístico.
    En v1, siempre requiere consentimiento por sesión.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # En v1, simplemente retornamos el disclaimer
        # En v2, verificar contra UserProfile.holistic_ai_consent
        return Response({
            "consent_required": True,
            "disclaimer": HOLISTIC_DISCLAIMER,
            "terms_url": "/policies/holistic-ai",
            "ai_tarot_enabled": getattr(settings, 'AI_TAROT_ENABLED', False),
        })
