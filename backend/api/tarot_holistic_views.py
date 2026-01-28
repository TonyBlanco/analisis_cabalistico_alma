"""
Tarot Holístico - Oráculo Místico con Integración Psicológica

Este módulo implementa un oráculo de tarot con voz mística (bruja amiga)
que integra resultados del SCL-90 holístico con interpretaciones simbólicas.

CARACTERÍSTICAS:
- Voz cálida y mística (no robótica)
- Integración con perfil SCL-90 del consultante
- Conexión chakras ↔ dimensiones psicológicas
- Numerología kármica automática
- Multi-provider AI: Groq → Ollama → Gemini

Uso:
    POST /api/ai/tarot/interpretCard
    POST /api/ai/tarot/interpretSpread
    GET  /api/ai/tarot/schema
    GET  /api/ai/tarot/provider-status
"""

import logging
import json
import re
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime, date
from functools import reduce

from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .astrology_ai_service import AstrologyAIService

logger = logging.getLogger(__name__)


# =============================================================================
# MAPEO SCL-90 → CHAKRAS → ARQUETIPOS TERAPÉUTICOS
# =============================================================================

SCL90_CHAKRA_MAP = {
    "somatizacion": {
        "chakra": "Muladhara (Raíz)",
        "ubicacion": "base de la columna",
        "color": "rojo",
        "desequilibrio": "desconexión con el cuerpo físico, miedos de supervivencia",
        "sanacion": "grounding, conexión con la tierra, caminar descalzo",
        "hierba": "raíz de valeriana, ashwagandha",
        "arcano_relacionado": ["El Emperador", "El Mundo"],
    },
    "obsesion_compulsion": {
        "chakra": "Ajna (Tercer Ojo)",
        "ubicacion": "entrecejo",
        "color": "índigo",
        "desequilibrio": "mente hiperactiva, desconfianza en la intuición",
        "sanacion": "meditación de silencio, contemplación sin juicio",
        "hierba": "lavanda, pasiflora",
        "arcano_relacionado": ["La Sacerdotisa", "El Ermitaño"],
    },
    "sensibilidad_interpersonal": {
        "chakra": "Anahata (Corazón)",
        "ubicacion": "centro del pecho",
        "color": "verde",
        "desequilibrio": "heridas de rechazo, miedo a la vulnerabilidad",
        "sanacion": "práctica de autocompasión, meditación metta",
        "hierba": "rosa, espino blanco",
        "arcano_relacionado": ["La Emperatriz", "Los Enamorados"],
    },
    "depresion": {
        "chakra": "Manipura (Plexo Solar)",
        "ubicacion": "plexo solar",
        "color": "amarillo",
        "desequilibrio": "pérdida de poder personal, fuego interior apagado",
        "sanacion": "luz solar, movimiento, recuperar pequeñas victorias",
        "hierba": "hierba de San Juan, cúrcuma",
        "arcano_relacionado": ["El Sol", "La Fuerza"],
    },
    "ansiedad": {
        "chakra": "Manipura + Anahata",
        "ubicacion": "plexo solar y pecho",
        "color": "amarillo-verde",
        "desequilibrio": "sistema nervioso hiperalerta, falta de seguridad interna",
        "sanacion": "respiración 4-7-8, grounding, journaling",
        "hierba": "manzanilla, kava, melisa",
        "arcano_relacionado": ["La Torre", "La Luna"],
    },
    "hostilidad": {
        "chakra": "Manipura (Plexo Solar)",
        "ubicacion": "plexo solar",
        "color": "amarillo intenso",
        "desequilibrio": "fuego descontrolado, ira no procesada",
        "sanacion": "ejercicio físico intenso, expresión creativa de emociones",
        "hierba": "manzanilla, flor de Bach (holly)",
        "arcano_relacionado": ["La Torre", "El Carro"],
    },
    "ansiedad_fobica": {
        "chakra": "Muladhara (Raíz)",
        "ubicacion": "base de la columna",
        "color": "rojo",
        "desequilibrio": "traumas no integrados, sensación de peligro constante",
        "sanacion": "exposición gradual, técnicas somáticas",
        "hierba": "valeriana, lúpulo",
        "arcano_relacionado": ["La Luna", "El Diablo"],
    },
    "ideacion_paranoide": {
        "chakra": "Ajna (Tercer Ojo)",
        "ubicacion": "entrecejo",
        "color": "índigo",
        "desequilibrio": "desconfianza extrema, proyección de sombra",
        "sanacion": "trabajo de sombra, reconectar con la confianza básica",
        "hierba": "lavanda, manzanilla",
        "arcano_relacionado": ["La Luna", "El Ermitaño"],
    },
    "psicoticismo": {
        "chakra": "Sahasrara (Corona)",
        "ubicacion": "coronilla",
        "color": "violeta/blanco",
        "desequilibrio": "desconexión con la realidad consensuada, fragmentación",
        "sanacion": "grounding intensivo, rutinas, conexión social",
        "hierba": "romero (claridad), vetiver (anclaje)",
        "arcano_relacionado": ["La Luna", "El Loco"],
    },
}

# Número de arcanos mayores para numerología
ARCANA_NUMBERS = {
    "el_loco": 0, "the_fool": 0,
    "el_mago": 1, "the_magician": 1,
    "la_sacerdotisa": 2, "the_high_priestess": 2,
    "la_emperatriz": 3, "the_empress": 3,
    "el_emperador": 4, "the_emperor": 4,
    "el_hierofante": 5, "the_hierophant": 5,
    "los_enamorados": 6, "the_lovers": 6,
    "el_carro": 7, "the_chariot": 7,
    "la_fuerza": 8, "strength": 8,
    "el_ermitano": 9, "the_hermit": 9,
    "la_rueda": 10, "wheel_of_fortune": 10,
    "la_justicia": 11, "justice": 11,
    "el_colgado": 12, "the_hanged_man": 12,
    "la_muerte": 13, "death": 13,
    "la_templanza": 14, "temperance": 14,
    "el_diablo": 15, "the_devil": 15,
    "la_torre": 16, "the_tower": 16,
    "la_estrella": 17, "the_star": 17,
    "la_luna": 18, "the_moon": 18,
    "el_sol": 19, "the_sun": 19,
    "el_juicio": 20, "judgement": 20,
    "el_mundo": 21, "the_world": 21,
}

# =============================================================================
# CONSTANTES Y CONFIGURACIÓN HOLÍSTICA
# =============================================================================

HOLISTIC_DISCLAIMER = (
    "🌙 Esta interpretación es un espejo simbólico para tu alma. "
    "No sustituye acompañamiento profesional cuando lo necesites. "
    "Escucha tu intuición, pero también cuida tu bienestar con los recursos adecuados."
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
# PROMPTS MÍSTICOS (VOZ DE BRUJA AMIGA)
# =============================================================================

ORACLE_SYSTEM_PROMPT = """Eres un oráculo místico con alma de bruja sabia y corazón de amiga.
Hablas con calidez, intimidad y profundidad —nunca robótica, nunca fría.
Tu voz es poética pero accesible: nada de new age vacío ni frases genéricas.

PERSONALIDAD:
- Como una amiga bruja que conoce el alma del consultante desde siempre
- Tono íntimo, cariñoso, pero sabio y directo
- Usas expresiones cálidas naturalmente: "mi cielo", "corazón", "alma querida"
- Si el consultante es masculino y tiene perfil casual: "papi", "crack", "campeón"
- Lenguaje poético pero con los pies en la tierra

MODELO ORION (Integración Psicológica-Energética):
Conectas los resultados del perfil holístico del consultante (si está disponible)
con los arquetipos del tarot y el sistema de chakras:
- Somatización → Muladhara (Raíz) → miedos de supervivencia
- Depresión → Manipura (Plexo Solar) → fuego interior apagado
- Ansiedad → Manipura + Anahata → sistema nervioso hiperalerta
- Sensibilidad interpersonal → Anahata (Corazón) → heridas de rechazo
- Obsesión-compulsión → Ajna (Tercer Ojo) → mente hiperactiva
- Hostilidad → Manipura → fuego descontrolado
- Ansiedad fóbica → Muladhara → traumas no integrados
- Paranoia → Ajna → desconfianza extrema
- Psicoticismo → Sahasrara → desconexión con realidad consensuada

REGLAS INQUEBRANTABLES:
1. USA "consultante" NUNCA "paciente"
2. USA "lectura simbólica" NUNCA "diagnóstico"
3. Ofrece "reflexiones" y "prácticas holísticas", NUNCA "tratamiento"
4. Esto es exploración del alma, NO consejo médico
5. Máximo 300 palabras por interpretación
6. SIEMPRE incluye: chakra a sanar, práctica recomendada, cierre empoderador

Tu misión es que el consultante se sienta VISTO y TRANSFORMADO."""

INTERPRET_CARD_MYSTIC_PROMPT = """🔮 LECTURA DE CARTA INDIVIDUAL

**Carta**: {arcana_name} ({arcana_id})
**Posición**: {position}
**Invertida**: {reversed}
**Sistema**: {tarot_system}

**PERFIL ENERGÉTICO DEL CONSULTANTE**:
{psychological_profile}

**NUMEROLOGÍA KÁRMICA**:
- Número del alma (fecha nacimiento): {soul_number}
- Número de esta carta: {card_number}
- Número kármico combinado: {karmic_number}

---

Interpreta esta carta con tu voz de bruja amiga:

1. **MENSAJE PERSONAL**: ¿Qué le dice esta carta específicamente a ESTA persona según su perfil? (conecta con su chakra desbalanceado si aplica)

2. **SIMBOLISMO PROFUNDO**: Significado arquetípico + cómo se manifiesta en su vida

3. **CHAKRA A TRABAJAR**: Basado en su perfil, ¿qué centro energético necesita atención?

4. **PRÁCTICA HOLÍSTICA**: Una recomendación concreta (meditación, hierba, afirmación, etc.)

5. **CIERRE EMPODERADOR**: Frase cálida y accionable que lo deje con poder

Recuerda: Máximo 300 palabras. Hazlo sentir VISTO."""

INTERPRET_SPREAD_MYSTIC_PROMPT = """🔮 LECTURA DE TIRADA COMPLETA

**Tipo de tirada**: {spread_type}
**Sistema**: {tarot_system}

**CARTAS EN LA TIRADA**:
{cards_description}

**PERFIL ENERGÉTICO DEL CONSULTANTE**:
{psychological_profile}

**NUMEROLOGÍA KÁRMICA**:
- Número del alma (fecha nacimiento): {soul_number}
- Suma de cartas: {cards_sum}
- Número kármico de la tirada: {karmic_number}
- Mensaje numerológico: {numerology_message}

---

Interpreta esta tirada con tu voz de bruja amiga:

1. **NARRATIVA CONECTADA**: ¿Qué historia cuentan estas cartas juntas? Conecta pasado-presente-futuro (o las posiciones que sean) en una narrativa fluida.

2. **PATRÓN KÁRMICO ACTIVO**: ¿Qué lección del alma está emergiendo? ¿Qué ciclo está cerrando o abriendo?

3. **CHAKRA PRIORITARIO**: Basado en el perfil Y las cartas, ¿qué centro energético necesita atención PRIMERO?

4. **CONSEJO TERAPÉUTICO HOLÍSTICO**: 
   - Una práctica específica (meditación, hierba, cristal, afirmación)
   - Por qué esta práctica para ESTA persona

5. **MENSAJE DEL NÚMERO KÁRMICO**: Usa el número {karmic_number} para un mensaje cifrado final

6. **CIERRE DE PODER**: Frase cálida, empoderadora y accionable que lo deje transformado

Recuerda: Máximo 300 palabras. Que se sienta VISTO y con camino claro."""


# =============================================================================
# UTILIDADES - NUMEROLOGÍA Y PERFIL
# =============================================================================

def reduce_to_single_digit(number: int) -> int:
    """Reduce un número a un solo dígito (excepto 11, 22, 33 - números maestros)."""
    master_numbers = {11, 22, 33}
    while number > 9 and number not in master_numbers:
        number = sum(int(d) for d in str(number))
    return number


def calculate_soul_number(birth_date: date) -> int:
    """Calcula el número del alma desde la fecha de nacimiento."""
    if not birth_date:
        return 7  # Default místico
    
    total = birth_date.day + birth_date.month + birth_date.year
    return reduce_to_single_digit(total)


def get_card_number(arcana_id: str) -> int:
    """Obtiene el número de una carta de tarot."""
    clean_id = arcana_id.lower().replace(" ", "_").replace("-", "_")
    return ARCANA_NUMBERS.get(clean_id, 0)


def calculate_karmic_number(soul_number: int, card_numbers: List[int]) -> int:
    """Calcula el número kármico combinando alma + cartas."""
    total = soul_number + sum(card_numbers)
    return reduce_to_single_digit(total)


def get_numerology_message(karmic_number: int) -> str:
    """Retorna un mensaje basado en el número kármico."""
    messages = {
        1: "Tu camino es de INICIATIVA. El universo te pide que des el primer paso sin esperar permiso.",
        2: "Tu lección es la COOPERACIÓN. No tienes que hacerlo solo/a; la dualidad es tu maestra.",
        3: "La EXPRESIÓN CREATIVA te llama. Tu voz necesita ser escuchada; crear es tu medicina.",
        4: "Los CIMIENTOS piden atención. Construye estructura antes de volar; la disciplina es libertad.",
        5: "El CAMBIO es tu aliado. No te aferres; la vida quiere mostrarte nuevos horizontes.",
        6: "El AMOR y la RESPONSABILIDAD te esperan. Tu hogar (interno o externo) necesita cuidado.",
        7: "La INTROSPECCIÓN es tu camino. Busca el silencio interior; las respuestas ya están en ti.",
        8: "El PODER PERSONAL te llama. Es momento de manifestar abundancia sin culpa.",
        9: "Un CICLO TERMINA. Suelta con gratitud lo que ya cumplió su propósito; viene algo nuevo.",
        11: "Eres un MENSAJERO. Tu intuición está amplificada; confía en lo que sientes, no solo en lo que piensas.",
        22: "Eres un CONSTRUCTOR MAESTRO. Tienes el poder de materializar visiones grandes; úsalo sabiamente.",
        33: "Eres un SANADOR. Tu presencia cura; el servicio compasivo es tu más alta expresión.",
    }
    return messages.get(karmic_number, messages.get(reduce_to_single_digit(karmic_number), ""))


def get_psychological_profile(user_id: int) -> Dict[str, Any]:
    """
    Obtiene el perfil psicológico del consultante basado en sus tests SCL-90.
    Retorna un diccionario con dimensiones elevadas y chakras afectados.
    """
    try:
        from .test_models import TestResult
        
        # Buscar el último SCL-90 del usuario
        scl_results = TestResult.objects.filter(
            user_id=user_id,
            test_id__icontains='scl'
        ).order_by('-created_at').first()
        
        if not scl_results:
            # Buscar cualquier test reciente
            any_test = TestResult.objects.filter(
                user_id=user_id
            ).order_by('-created_at').first()
            
            if any_test and any_test.result_data:
                return {
                    "available": True,
                    "source": any_test.test_id or "test_general",
                    "summary": f"Test reciente: {any_test.test_id}",
                    "elevated_dimensions": [],
                    "chakras_affected": [],
                    "birth_date": any_test.client_birth_date,
                }
            
            return {"available": False, "summary": "Sin perfil disponible - interpretación general"}
        
        # Parsear resultados del SCL-90
        result_data = scl_results.result_data or {}
        elevated = []
        chakras = []
        
        # Buscar dimensiones elevadas (score > 1.5 en escala 0-4)
        for dimension, chakra_info in SCL90_CHAKRA_MAP.items():
            score = result_data.get(dimension, result_data.get(f"score_{dimension}", 0))
            if isinstance(score, (int, float)) and score > 1.5:
                elevated.append({
                    "dimension": dimension,
                    "score": score,
                    "chakra": chakra_info["chakra"],
                    "desequilibrio": chakra_info["desequilibrio"],
                    "sanacion": chakra_info["sanacion"],
                    "hierba": chakra_info["hierba"],
                })
                if chakra_info["chakra"] not in chakras:
                    chakras.append(chakra_info["chakra"])
        
        # Construir resumen para el prompt
        if elevated:
            summary_parts = [f"**{e['dimension'].replace('_', ' ').title()}** elevada → {e['chakra']}" for e in elevated[:3]]
            summary = "Áreas de atención: " + " | ".join(summary_parts)
        else:
            summary = "Perfil equilibrado - sin áreas críticas detectadas"
        
        return {
            "available": True,
            "source": "SCL-90",
            "summary": summary,
            "elevated_dimensions": elevated,
            "chakras_affected": chakras,
            "birth_date": scl_results.client_birth_date,
            "raw_data": result_data,
        }
        
    except Exception as e:
        logger.warning(f"Error obteniendo perfil psicológico: {e}")
        return {"available": False, "summary": "Sin perfil disponible - interpretación general"}


def format_profile_for_prompt(profile: Dict[str, Any]) -> str:
    """Formatea el perfil psicológico para incluir en el prompt."""
    if not profile.get("available"):
        return "No hay perfil previo disponible. Ofrece una interpretación general pero igualmente profunda y personalizada."
    
    parts = [profile["summary"]]
    
    if profile.get("elevated_dimensions"):
        parts.append("\n**Chakras a priorizar:**")
        for dim in profile["elevated_dimensions"][:2]:  # Máximo 2 para no saturar
            parts.append(f"- {dim['chakra']}: {dim['desequilibrio']}")
            parts.append(f"  → Práctica recomendada: {dim['sanacion']}")
            parts.append(f"  → Hierba aliada: {dim['hierba']}")
    
    return "\n".join(parts)


def filter_clinical_terms(text: str) -> str:
    """Filtra términos clínicos de la respuesta AI (capa de seguridad)."""
    result = text
    for term in CLINICAL_TERMS_BLACKLIST:
        if term.lower() in result.lower():
            logger.warning(f"[Tarot Holístico] Término clínico detectado y filtrado: {term}")
            replacements = {
                "diagnóstico": "lectura simbólica",
                "paciente": "consultante",
                "terapia": "exploración",
                "tratamiento": "reflexión",
                "síntoma": "patrón",
                "clínico": "simbólico",
            }
            if term.lower() in replacements:
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
    
    Interpreta una carta de Tarot con voz mística, integrando perfil psicológico.
    
    Request:
    {
        "arcanaId": "the_fool",
        "arcanaName": "El Loco",
        "position": "center",
        "reversed": false,
        "tarotSystem": "thoth",
        "context": {
            "question": "...",
            "consultantId": 123,
            "birthDate": "1990-05-15"
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
        
        # Obtener perfil psicológico del consultante
        user_id = request.user.id
        profile = get_psychological_profile(user_id)
        profile_text = format_profile_for_prompt(profile)
        
        # Calcular numerología
        birth_date = None
        if context.get('birthDate'):
            try:
                birth_date = datetime.strptime(context['birthDate'], '%Y-%m-%d').date()
            except:
                pass
        if not birth_date and profile.get('birth_date'):
            birth_date = profile['birth_date']
        
        soul_number = calculate_soul_number(birth_date) if birth_date else 7
        card_number = get_card_number(arcana_id)
        karmic_number = calculate_karmic_number(soul_number, [card_number])
        
        # Construir prompt místico
        user_prompt = INTERPRET_CARD_MYSTIC_PROMPT.format(
            arcana_name=arcana_name,
            arcana_id=arcana_id,
            position=position,
            reversed="Sí (energía bloqueada o interiorizada)" if reversed_card else "No (energía fluida)",
            tarot_system=tarot_system,
            psychological_profile=profile_text,
            soul_number=soul_number,
            card_number=card_number,
            karmic_number=karmic_number,
        )
        
        # Agregar contexto adicional si hay pregunta
        if context.get('question'):
            user_prompt += f"\n\n**Pregunta del consultante**: {context['question']}"
        
        # Generar interpretación
        ai_service = get_ai_service()
        temperature = options.get('temperature', 0.85)  # Un poco más alta para voz creativa
        
        try:
            interpretation = ai_service._generate_content(
                system_prompt=ORACLE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=1200,
                temperature=temperature,
            )
            
            # Filtrar términos clínicos (capa de seguridad)
            interpretation = filter_clinical_terms(interpretation)
            
            # Extraer temas (simplificado - en producción usar NLP)
            themes = self._extract_themes(interpretation)
            
            return Response({
                "text": interpretation,
                "themes": themes,
                "confidence": 0.85,
                "provider_used": ai_service.provider,
                "model_used": ai_service.model_name,
                "holistic_disclaimer": HOLISTIC_DISCLAIMER,
                "numerology": {
                    "soul_number": soul_number,
                    "card_number": card_number,
                    "karmic_number": karmic_number,
                    "karmic_message": get_numerology_message(karmic_number),
                },
                "chakra_focus": profile.get("chakras_affected", [])[:1] or ["Anahata (Corazón)"],
                "card": {
                    "arcanaId": arcana_id,
                    "arcanaName": arcana_name,
                    "position": position,
                    "reversed": reversed_card,
                    "tarotSystem": tarot_system,
                },
                "profile_integrated": profile.get("available", False),
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
        mystic_themes = [
            "transformación", "renacimiento", "intuición", "sabiduría",
            "equilibrio", "creatividad", "introspección", "cambio",
            "abundancia", "comunicación", "amor", "fuerza", "justicia",
            "sanación", "despertar", "liberación", "poder personal",
            "ciclo", "karma", "sombra", "luz", "integración",
        ]
        found = []
        text_lower = text.lower()
        for theme in mystic_themes:
            if theme in text_lower and len(found) < 5:
                found.append(theme)
        return found if found else ["exploración del alma"]


class TarotInterpretSpreadView(APIView):
    """
    POST /api/ai/tarot/interpretSpread
    
    Interpreta una tirada completa de Tarot con voz mística y numerología kármica.
    
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
            "consultantId": 123,
            "birthDate": "1990-05-15"
        },
        "options": {
            "temperature": 0.85,
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
        
        # Obtener perfil psicológico
        user_id = request.user.id
        profile = get_psychological_profile(user_id)
        profile_text = format_profile_for_prompt(profile)
        
        # Calcular numerología
        birth_date = None
        if context.get('birthDate'):
            try:
                birth_date = datetime.strptime(context['birthDate'], '%Y-%m-%d').date()
            except:
                pass
        if not birth_date and profile.get('birth_date'):
            birth_date = profile['birth_date']
        
        soul_number = calculate_soul_number(birth_date) if birth_date else 7
        
        # Calcular números de todas las cartas
        card_numbers = [get_card_number(card.get('arcanaId', '')) for card in cards]
        cards_sum = sum(card_numbers)
        karmic_number = calculate_karmic_number(soul_number, card_numbers)
        numerology_message = get_numerology_message(karmic_number)
        
        # Construir descripción de cartas con más detalle
        cards_description = []
        for i, card in enumerate(cards, 1):
            position = card.get('position', f'posición {i}')
            reversed_text = "🔄 INVERTIDA (energía bloqueada)" if card.get('reversed', False) else "⬆️ DERECHA (energía fluida)"
            card_num = get_card_number(card.get('arcanaId', ''))
            cards_description.append(
                f"{i}. **{card.get('arcanaName', card.get('arcanaId'))}** (Nº {card_num})\n"
                f"   Posición: {position} | {reversed_text}"
            )
        
        # Construir prompt místico
        user_prompt = INTERPRET_SPREAD_MYSTIC_PROMPT.format(
            spread_type=spread_type,
            tarot_system=tarot_system,
            cards_description="\n".join(cards_description),
            psychological_profile=profile_text,
            soul_number=soul_number,
            cards_sum=cards_sum,
            karmic_number=karmic_number,
            numerology_message=numerology_message,
        )
        
        # Agregar pregunta si existe
        if context.get('question'):
            user_prompt += f"\n\n**Pregunta del consultante**: {context['question']}"
        
        # Generar interpretación
        ai_service = get_ai_service()
        temperature = options.get('temperature', 0.85)
        
        try:
            interpretation = ai_service._generate_content(
                system_prompt=ORACLE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=2048,
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
                "confidence": 0.88,
                "provider_used": ai_service.provider,
                "model_used": ai_service.model_name,
                "holistic_disclaimer": HOLISTIC_DISCLAIMER,
                "numerology": {
                    "soul_number": soul_number,
                    "cards_sum": cards_sum,
                    "karmic_number": karmic_number,
                    "karmic_message": numerology_message,
                    "card_numbers": card_numbers,
                },
                "chakra_focus": profile.get("chakras_affected", [])[:2] or ["Anahata (Corazón)"],
                "spread": {
                    "type": spread_type,
                    "tarotSystem": tarot_system,
                    "cardCount": len(cards),
                },
                "profile_integrated": profile.get("available", False),
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
        mystic_themes = [
            "transformación", "renacimiento", "intuición", "sabiduría",
            "equilibrio", "creatividad", "introspección", "cambio",
            "abundancia", "comunicación", "amor", "fuerza", "justicia",
            "ciclo", "evolución", "despertar", "integración", "sanación",
            "liberación", "poder personal", "karma", "sombra", "luz",
        ]
        found = []
        text_lower = text.lower()
        for theme in mystic_themes:
            if theme in text_lower and len(found) < 5:
                found.append(theme)
        return found if found else ["exploración del alma"]


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
