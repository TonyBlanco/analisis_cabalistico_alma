"""
Tarot Holístico - Interpretación simbólica para terapeutas

Este módulo genera lecturas de tarot orientadas al terapeuta (no al consultante),
integrando exploraciones holísticas previas con arquetipos y correspondencias.

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
    {"id": "hermetic", "name": "Hermetic Tarot (Dowson)", "major_arcana": 22, "minor_arcana": 56},
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
# PROMPTS — AUDIENCIA: TERAPEUTA (tercera persona sobre el consultante)
# =============================================================================

ORACLE_SYSTEM_PROMPT = """Eres un especialista en Tarot hermético y lectura simbólica integrativa.
Escribes EXCLUSIVAMENTE para el TERAPEUTA que acompaña al consultante — NUNCA para el consultante directamente.

AUDIENCIA Y VOZ (CRÍTICO):
- Dirígete al terapeuta: "Para este consultante...", "En la sesión podrías explorar...", "Observa cómo..."
- Habla del consultante en TERCERA PERSONA: "él/ella", "su proceso", "su campo simbólico"
- PROHIBIDO: segunda persona al consultante ("tú", "te", "tu", "querido consultante", "confía en tu proceso")
- PROHIBIDO: cerrar con mensajes motivacionales dirigidos al consultante
- Tono: profesional, cálido, analítico, pedagógico — como un supervisor simbólico experimentado

MODELO ORION (Integración Psicológica-Energética):
Conecta el perfil holístico del consultante (si existe) con arquetipos del tarot y chakras:
- Somatización → Muladhara (Raíz)
- Depresión → Manipura (Plexo Solar)
- Ansiedad → Manipura + Anahata
- Sensibilidad interpersonal → Anahata (Corazón)
- Obsesión-compulsión → Ajna (Tercer Ojo)
- Hostilidad → Manipura
- Ansiedad fóbica → Muladhara
- Paranoia → Ajna
- Psicoticismo → Sahasrara

REGLAS INQUEBRANTABLES:
1. USA "consultante" NUNCA "paciente"
2. USA "lectura simbólica" NUNCA "diagnóstico"
3. Ofrece "orientaciones de exploración" y "hipótesis simbólicas", NUNCA "tratamiento"
4. NO es consejo médico ni predicción
5. Longitud: 700-1000 palabras — desarrolla CADA sección con profundidad y ejemplos concretos
6. Incluye: resonancia con perfil, simbolismo, manifestaciones posibles, eje energético, orientaciones para sesión, práctica sugerida, preguntas de exploración
7. Español profesional y claro

Tu misión: dar al terapeuta un mapa simbólico rico para comprender al consultante y orientar la conversación."""

INTERPRET_CARD_MYSTIC_PROMPT = """🔮 ANÁLISIS DE CARTA PARA EL TERAPEUTA

**Consultante**: {consultant_name}
**Carta**: {arcana_name} ({arcana_id})
**Posición**: {position}
**Invertida**: {reversed}
**Sistema tarot**: {tarot_system}

**PERFIL HOLÍSTICO DEL CONSULTANTE** (exploraciones previas):
{psychological_profile}

**NUMEROLOGÍA SIMBÓLICA**:
- Número del alma (fecha nacimiento): {soul_number}
- Número de esta carta: {card_number}
- Número kármico combinado: {karmic_number}

---

Redacta un informe simbólico DETALLADO (700-1000 palabras) para el terapeuta. Estructura obligatoria:

1. **SÍNTESIS PARA EL TERAPEUTA**: Qué aporta esta carta al trabajo con {consultant_name} en este momento. Hipótesis simbólica central en 2-3 párrafos.

2. **RESONANCIA CON EL PERFIL**: Cómo dialoga la carta con las exploraciones previas del consultante (chakras, sefirot, patrones detectados). Si no hay perfil, indícalo y desarrolla igualmente la lectura arquetípica.

3. **SIMBOLISMO ARQUETÍPICO PROFUNDO**: Significado en el sistema {tarot_system}, correspondencias cabalísticas/herméticas, polaridad invertida/derecha según aplique.

4. **MANIFESTACIONES POSIBLES**: 3-5 formas concretas en que este arquetipo podría expresarse en la vida del consultante (relaciones, trabajo, cuerpo, espiritualidad).

5. **EJE ENERGÉTICO**: Chakra y/o sefirá prioritarios a considerar; por qué, vinculados al perfil y a la carta.

6. **ORIENTACIONES PARA LA SESIÓN**: Qué temas conviene explorar, qué dinámicas vigilar, qué recursos internos parecen disponibles.

7. **PRÁCTICA SUGERIDA** (para que el terapeuta pueda recomendar): Meditación, ritual simbólico, afirmación o ejercicio — con instrucción breve y justificación terapéutica-holística.

8. **PREGUNTAS DE EXPLORACIÓN**: 4-6 preguntas abiertas que el terapeuta puede usar en sesión.

Recuerda: tercera persona sobre el consultante. NUNCA hables al consultante en segunda persona."""

INTERPRET_SPREAD_MYSTIC_PROMPT = """🔮 ANÁLISIS DE TIRADA PARA EL TERAPEUTA

**Consultante**: {consultant_name}
**Tipo de tirada**: {spread_type}
**Sistema tarot**: {tarot_system}

**CARTAS EN LA TIRADA**:
{cards_description}

**PERFIL HOLÍSTICO DEL CONSULTANTE**:
{psychological_profile}

**NUMEROLOGÍA SIMBÓLICA**:
- Número del alma: {soul_number}
- Suma de cartas: {cards_sum}
- Número kármico de la tirada: {karmic_number}
- Mensaje numerológico: {numerology_message}

---

Redacta un informe simbólico DETALLADO (800-1100 palabras) para el terapeuta. Estructura obligatoria:

1. **SÍNTESIS NARRATIVA**: Historia que cuentan las cartas juntas para {consultant_name}; hilo conductor entre posiciones.

2. **PATRÓN SIMBÓLICO ACTIVO**: Qué ciclo, tensión o oportunidad emerge; lectura integrativa del conjunto.

3. **LECTURA POR POSICIÓN**: Breve análisis de cada carta en su posición (2-3 frases cada una, en tercera persona).

4. **RESONANCIA CON EL PERFIL**: Conexión con exploraciones holísticas previas del consultante.

5. **EJE ENERGÉTICO PRIORITARIO**: Chakra/sefirá central y secundarios.

6. **ORIENTACIONES PARA LA SESIÓN**: Temas a profundizar, dinámicas relacionales, recursos a potenciar.

7. **PRÁCTICA SUGERIDA**: Una práctica holística concreta con justificación para este consultante.

8. **PREGUNTAS DE EXPLORACIÓN**: 5-7 preguntas abiertas para el terapeuta.

Recuerda: audiencia = terapeuta. Tercera persona sobre el consultante. Sin segunda persona al consultante."""


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


# =============================================================================
# MAPEO DE TODOS LOS TESTS → INTERPRETACIÓN HOLÍSTICA
# 
# IMPORTANTE: Los nombres holísticos provienen de /docs/audit_tests_catalog.md
# Las sefirot provienen de /docs/HOLISTIC_CATEGORY_TAXONOMY.md
# =============================================================================

TEST_HOLISTIC_MAP = {
    # --- TESTS DE ANSIEDAD ---
    "gad-7": {
        "nombre_holistico": "Calm Alignment Gauge",  # public_name oficial
        "nombre_exploracion": "Exploración de Activación y Contención",  # HOLISTIC_CATEGORY_TAXONOMY
        "categoria": "mental",  # categoría holística oficial
        "sefira_principal": "Netzach",
        "sefirot_secundarias": ["Hod", "Yesod"],
        "chakra_principal": "Manipura + Anahata",
        "umbral_alto": 10,  # score >= 10 = ansiedad moderada-severa
        "interpretacion_alta": "Sistema nervioso en estado de alerta sostenida",
        "sanacion": "Respiración diafragmática, grounding con la tierra",
        "hierba": "Manzanilla, valeriana, pasiflora",
        "arcanos_relacionados": ["La Luna", "La Torre", "El Ermitaño"],
    },
    "bai": {
        "nombre_holistico": "Stillness Resonance Inventory",  # public_name oficial
        "nombre_exploracion": "Exploración de Respuesta Energética al Entorno",
        "categoria": "corporal",
        "sefira_principal": "Yesod",
        "sefirot_secundarias": ["Gevurah", "Hod"],
        "chakra_principal": "Manipura + Anahata",
        "umbral_alto": 16,
        "interpretacion_alta": "Cuerpo manifestando tensión emocional no procesada",
        "sanacion": "Body scan, yoga restaurativo, baños de sal",
        "hierba": "Lavanda, melisa, ashwagandha",
        "arcanos_relacionados": ["La Luna", "El Colgado"],
    },
    "anxiety-state-trait": {
        "nombre_holistico": "Ansiedad — Estado y rasgo",
        "nombre_exploracion": "Exploración de Ansiedad - Estado/Rasgo",
        "categoria": "emocional",
        "sefira_principal": "Netzach",
        "sefirot_secundarias": ["Tiferet"],
        "chakra_principal": "Manipura",
        "umbral_alto": 40,
        "interpretacion_alta": "Patrón de ansiedad integrado en la personalidad",
        "sanacion": "Terapia somática, meditación diaria, journaling",
        "hierba": "Kava, rhodiola, hierba de San Juan",
        "arcanos_relacionados": ["La Torre", "La Rueda de la Fortuna"],
    },
    
    # --- TESTS DE DEPRESIÓN ---
    "phq-9": {
        "nombre_holistico": "Pulse Resonance Mirror",  # public_name oficial
        "nombre_exploracion": "Exploración de Vitalidad Emocional",
        "categoria": "emocional",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Gevurah", "Chesed"],
        "chakra_principal": "Manipura (Plexo Solar)",
        "umbral_alto": 10,
        "interpretacion_alta": "Fuego interior apagado, pérdida de vitalidad",
        "sanacion": "Luz solar matutina, movimiento suave, conexión social",
        "hierba": "Hierba de San Juan, azafrán, rhodiola",
        "arcanos_relacionados": ["El Sol", "La Estrella", "La Fuerza"],
    },
    "bdi-ii": {
        "nombre_holistico": "Dawn Reflection Index",  # public_name oficial
        "nombre_exploracion": "Exploración de Flujo de Voluntad y Sentido",
        "categoria": "energia",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Chesed", "Gevurah"],
        "chakra_principal": "Manipura",
        "umbral_alto": 14,
        "interpretacion_alta": "Energía vital deprimida, necesita reactivación",
        "sanacion": "Exposición al sol, ejercicio aeróbico, nutrición",
        "hierba": "Ginkgo, cúrcuma, omega-3",
        "arcanos_relacionados": ["El Sol", "El Mundo", "La Templanza"],
    },
    
    # --- TESTS DE TRAUMA ---
    "ptsd-check": {
        "nombre_holistico": "Exploración de Huellas del Alma",
        "nombre_exploracion": "Exploración de Memorias Traumáticas",
        "categoria": "memoria",
        "sefira_principal": "Malkhut",
        "sefirot_secundarias": ["Yesod", "Gevurah"],
        "chakra_principal": "Muladhara (Raíz)",
        "umbral_alto": 31,
        "interpretacion_alta": "Huellas de trauma no integradas en el sistema nervioso",
        "sanacion": "EMDR, terapia somática, trabajo con el cuerpo",
        "hierba": "Valeriana, CBD, ashwagandha",
        "arcanos_relacionados": ["La Torre", "La Muerte", "El Juicio"],
    },
    
    # --- TESTS DE ALIMENTACIÓN ---
    "eat26_spirit": {
        "nombre_holistico": "Eternal Abundance Threshold (EAT-26-Spirit)",
        "nombre_exploracion": "Exploración de Relación con el Sustento",
        "categoria": "somatico",
        "sefira_principal": "Malkhut",
        "sefirot_secundarias": ["Yesod", "Netzach"],
        "chakra_principal": "Manipura + Svadhisthana",
        "umbral_alto": 20,
        "interpretacion_alta": "Relación conflictiva con el alimento y el placer",
        "sanacion": "Alimentación consciente, reconexión con el placer",
        "hierba": "Jengibre, menta, hinojo",
        "arcanos_relacionados": ["La Emperatriz", "La Templanza", "La Luna"],
    },
    "eating-disorder": {
        "nombre_holistico": "Alimentación — Relación y hábitos",
        "nombre_exploracion": "Exploración de Alimentación y Hábitos",
        "categoria": "somatico",
        "sefira_principal": "Malkhut",
        "sefirot_secundarias": ["Yesod"],
        "chakra_principal": "Svadhisthana (Sacro)",
        "umbral_alto": 15,
        "interpretacion_alta": "Desconexión con las necesidades del cuerpo físico",
        "sanacion": "Mindful eating, trabajo con imagen corporal",
        "hierba": "Diente de león, alcachofa",
        "arcanos_relacionados": ["La Emperatriz", "La Luna"],
    },
    "nutrition": {
        "nombre_holistico": "Alimentación — Relación y hábitos",
        "nombre_exploracion": "Exploración de Alimentación y Hábitos",
        "categoria": "somatico",
        "sefira_principal": "Malkhut",
        "sefirot_secundarias": ["Yesod"],
        "chakra_principal": "Svadhisthana",
        "umbral_alto": 15,
        "interpretacion_alta": "Oportunidad de mejorar la relación con la alimentación",
        "sanacion": "Alimentación intuitiva, conexión cuerpo-mente",
        "hierba": "Jengibre, menta, diente de león",
        "arcanos_relacionados": ["La Emperatriz", "La Templanza"],
    },
    
    # --- TESTS DE SUSTANCIAS ---
    "audit": {
        "nombre_holistico": "Sephirotic Harmony Audit (SHA)",  # Basado en sha_harmony
        "nombre_exploracion": "Exploración de Equilibrio de Pasiones",
        "categoria": "emocional",
        "sefira_principal": "Netzach",
        "sefirot_secundarias": ["Hod", "Yesod"],
        "chakra_principal": "Muladhara + Svadhisthana",
        "umbral_alto": 8,
        "interpretacion_alta": "Búsqueda de escape o adormecimiento emocional",
        "sanacion": "Trabajo de sombra, círculos de apoyo, reconexión con el cuerpo",
        "hierba": "Kudzu, cardo mariano, NAC",
        "arcanos_relacionados": ["El Diablo", "La Torre", "El Ermitaño"],
    },
    "sha_harmony": {
        "nombre_holistico": "Sephirotic Harmony Audit (SHA)",
        "nombre_exploracion": "Exploración de Equilibrio de Pasiones",
        "categoria": "emocional",
        "sefira_principal": "Netzach",
        "sefirot_secundarias": ["Hod", "Yesod"],
        "chakra_principal": "Svadhisthana",
        "umbral_alto": 8,
        "interpretacion_alta": "Patrón de uso como regulador emocional",
        "sanacion": "Círculos de apoyo, reconexión espiritual",
        "hierba": "Kudzu, cardo mariano",
        "arcanos_relacionados": ["El Diablo", "La Torre", "La Templanza"],
    },
    "dudit_spirit": {
        "nombre_holistico": "Divine Unity Drug Introspection (DUDIT-Spirit)",
        "nombre_exploracion": "Exploración de Interferencias Áuricas",
        "categoria": "corporal",
        "sefira_principal": "Hod",
        "sefirot_secundarias": ["Yesod"],
        "chakra_principal": "Muladhara",
        "umbral_alto": 6,
        "interpretacion_alta": "Patrón de evasión ante el dolor emocional",
        "sanacion": "Grupos de apoyo, trabajo con el vacío interno",
        "hierba": "Ashwagandha, rhodiola",
        "arcanos_relacionados": ["El Diablo", "La Luna", "El Ermitaño"],
    },
    "substance-use": {
        "nombre_holistico": "Exploración de Patrones de Sustancias",
        "nombre_exploracion": "Exploración de Uso de Sustancias",
        "categoria": "corporal",
        "sefira_principal": "Hod",
        "sefirot_secundarias": ["Yesod", "Malkhut"],
        "chakra_principal": "Muladhara",
        "umbral_alto": 10,
        "interpretacion_alta": "Uso de sustancias como mecanismo de afrontamiento",
        "sanacion": "Terapia de grupo, reconexión espiritual",
        "hierba": "Cardo mariano, diente de león",
        "arcanos_relacionados": ["El Diablo", "La Torre"],
    },
    
    # --- TESTS DE TOC ---
    "ocd-screen": {
        "nombre_holistico": "Exploración de Patrones Repetitivos",
        "nombre_exploracion": "Exploración de Rituales y Control",
        "categoria": "regulacion",
        "sefira_principal": "Gevurah",
        "sefirot_secundarias": ["Hod", "Binah"],
        "chakra_principal": "Ajna (Tercer Ojo)",
        "umbral_alto": 12,
        "interpretacion_alta": "Mente atrapada en patrones repetitivos de control",
        "sanacion": "Meditación de aceptación, exposición gradual",
        "hierba": "Lavanda, valeriana, inositol",
        "arcanos_relacionados": ["La Sacerdotisa", "El Ermitaño", "La Rueda"],
    },
    "ybocs_soul": {
        "nombre_holistico": "Yetziratic Balance Sanctuary (Y-BOCS-Soul)",
        "nombre_exploracion": "Exploración de Equilibrio y Purificación",
        "categoria": "regulacion",
        "sefira_principal": "Gevurah",
        "sefirot_secundarias": ["Hod"],
        "chakra_principal": "Ajna",
        "umbral_alto": 16,
        "interpretacion_alta": "Pensamientos intrusivos dominando la conciencia",
        "sanacion": "ACT (Terapia de Aceptación), mindfulness",
        "hierba": "Pasiflora, NAC, magnesio",
        "arcanos_relacionados": ["La Sacerdotisa", "La Rueda de la Fortuna"],
    },
    
    # --- TESTS DE SUEÑO ---
    "insomnia-index": {
        "nombre_holistico": "Exploración de Sueño y Descanso",
        "nombre_exploracion": "Exploración de Sueño y Recuperación",
        "categoria": "sueño",
        "sefira_principal": "Yesod",
        "sefirot_secundarias": ["Malkhut"],
        "chakra_principal": "Ajna + Sahasrara",
        "umbral_alto": 15,
        "interpretacion_alta": "Mente que no descansa, procesamiento nocturno",
        "sanacion": "Higiene del sueño, rutina nocturna, meditación",
        "hierba": "Valeriana, melatonina, lúpulo",
        "arcanos_relacionados": ["La Luna", "La Estrella", "El Ermitaño"],
    },
    "insomnia": {
        "nombre_holistico": "Insomnia — Descanso y hábitos",
        "nombre_exploracion": "Exploración de Sueño y Descanso",
        "categoria": "sueño",
        "sefira_principal": "Yesod",
        "sefirot_secundarias": ["Malkhut"],
        "chakra_principal": "Ajna",
        "umbral_alto": 10,
        "interpretacion_alta": "Dificultad para soltar el control y rendirse al descanso",
        "sanacion": "Yoga nidra, reducción de pantallas",
        "hierba": "Manzanilla, lavanda, CBD",
        "arcanos_relacionados": ["La Luna", "La Estrella"],
    },
    
    # --- TESTS DE TDAH ---
    "adhd-adult": {
        "nombre_holistico": "Exploración de Ritmo Arquetípico",
        "nombre_exploracion": "Exploración de Atención y Enfoque",
        "categoria": "mental",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Malkhut", "Hod"],
        "chakra_principal": "Ajna + Manipura",
        "umbral_alto": 14,
        "interpretacion_alta": "Energía mental dispersa, dificultad para anclar",
        "sanacion": "Técnicas de focus, ambiente estructurado, ejercicio",
        "hierba": "Ginkgo, bacopa, Lion's mane",
        "arcanos_relacionados": ["El Mago", "El Loco", "La Rueda"],
    },
    "asrs_essence": {
        "nombre_holistico": "Archetypal Soul Rhythm Scale (ASRS-Essence)",
        "nombre_exploracion": "Exploración de Ritmo del Alma",
        "categoria": "mental",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Malkhut"],
        "chakra_principal": "Ajna",
        "umbral_alto": 4,
        "interpretacion_alta": "Ritmo interno acelerado, mente en múltiples canales",
        "sanacion": "Mindfulness, pomodoro, movimiento físico",
        "hierba": "L-teanina, rhodiola",
        "arcanos_relacionados": ["El Mago", "El Loco"],
    },
    
    # --- TESTS MULTIAXIALES ---
    "scl90": {
        "nombre_holistico": "Soul Symmetry Lens",  # public_name oficial
        "nombre_exploracion": "Mapa Global de Tensiones del Alma",
        "categoria": "multidimensional",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Chesed", "Gevurah", "Netzach", "Hod"],
        "chakra_principal": "Múltiples",
        "umbral_alto": 1.5,  # GSI
        "interpretacion_alta": "Múltiples áreas del ser requieren atención",
        "sanacion": "Evaluación integral, priorizar área más urgente",
        "hierba": "Adaptógenos: ashwagandha, rhodiola, reishi",
        "arcanos_relacionados": ["El Mundo", "La Rueda", "El Juicio"],
    },
    "mcmi-iv": {
        "nombre_holistico": "Multiaxial Cosmic Matrix (MCMI-4-Mystic)",
        "nombre_exploracion": "Exploración de Matriz Cósmica Multiaxial",
        "categoria": "multidimensional",
        "sefira_principal": "Kether",
        "sefirot_secundarias": ["Chokmah", "Binah"],
        "chakra_principal": "Múltiples",
        "umbral_alto": 75,  # BR score
        "interpretacion_alta": "Patrones de personalidad arraigados requieren trabajo",
        "sanacion": "Terapia profunda, trabajo de sombra, autoconocimiento",
        "hierba": "Reishi, ashwagandha",
        "arcanos_relacionados": ["El Ermitaño", "La Muerte", "El Juicio"],
    },
    "mcmi4_mystic": {
        "nombre_holistico": "Multiaxial Cosmic Matrix (MCMI-4-Mystic)",
        "nombre_exploracion": "Exploración de Matriz Cósmica Multiaxial",
        "categoria": "multidimensional",
        "sefira_principal": "Kether",
        "sefirot_secundarias": ["Chokmah", "Binah"],
        "chakra_principal": "Múltiples",
        "umbral_alto": 75,
        "interpretacion_alta": "Mapa multiaxial de estilos de personalidad",
        "sanacion": "Trabajo de profundización, correspondencias sefiróticas",
        "hierba": "Reishi, ashwagandha, lion's mane",
        "arcanos_relacionados": ["El Ermitaño", "La Muerte", "El Juicio"],
    },
    "mcmi4-signal": {
        "nombre_holistico": "Exploración de Señales de Personalidad",
        "nombre_exploracion": "Exploración de Señales MCMI",
        "categoria": "multidimensional",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Da'at"],
        "chakra_principal": "Múltiples",
        "umbral_alto": 3,
        "interpretacion_alta": "Señales de patrones que merecen exploración profunda",
        "sanacion": "Autoindagación, trabajo terapéutico",
        "hierba": "Adaptógenos generales",
        "arcanos_relacionados": ["El Ermitaño", "El Colgado"],
    },
    
    # --- TESTS DE ESTRÉS ---
    "stress": {
        "nombre_holistico": "Estrés — Carga y regulación",
        "nombre_exploracion": "Exploración de Estrés y Regulación",
        "categoria": "regulacion",
        "sefira_principal": "Gevurah",
        "sefirot_secundarias": ["Chesed"],
        "chakra_principal": "Manipura + Muladhara",
        "umbral_alto": 20,
        "interpretacion_alta": "Sistema sobrecargado, necesita descarga",
        "sanacion": "Técnicas de relajación, límites, naturaleza",
        "hierba": "Ashwagandha, rhodiola, reishi",
        "arcanos_relacionados": ["La Torre", "La Templanza", "El Ermitaño"],
    },
    "stress-regulation": {
        "nombre_holistico": "Estrés — Carga y regulación",
        "nombre_exploracion": "Exploración de Estrés y Regulación",
        "categoria": "regulacion",
        "sefira_principal": "Gevurah",
        "sefirot_secundarias": ["Chesed", "Tiferet"],
        "chakra_principal": "Manipura",
        "umbral_alto": 15,
        "interpretacion_alta": "Capacidad de regulación comprometida",
        "sanacion": "Coherencia cardíaca, HRV training",
        "hierba": "Magnesio, L-teanina, GABA",
        "arcanos_relacionados": ["La Templanza", "La Fuerza"],
    },
    
    # --- TESTS HOLÍSTICOS/CABALÍSTICOS ---
    "basic-analysis": {
        "nombre_holistico": "Análisis Cabalístico Básico",
        "nombre_exploracion": "Exploración del Mapa del Alma",
        "categoria": "multidimensional",
        "sefira_principal": "Kether",
        "sefirot_secundarias": ["Chokmah", "Binah", "Tiferet"],
        "chakra_principal": "Sahasrara",
        "umbral_alto": None,  # No tiene umbral - es mapa natal
        "interpretacion_alta": "Mapa del alma disponible para integrar",
        "sanacion": "Meditación en los números personales",
        "hierba": "Incienso, mirra, sándalo",
        "arcanos_relacionados": ["El Mago", "La Sacerdotisa", "El Mundo"],
    },
    "past-lives": {
        "nombre_holistico": "Vidas Pasadas – Exploración de Memorias del Alma",
        "nombre_exploracion": "Exploración de Memorias del Alma",
        "categoria": "memoria",
        "sefira_principal": "Binah",
        "sefirot_secundarias": ["Chokmah", "Da'at"],
        "chakra_principal": "Sahasrara + Ajna",
        "umbral_alto": None,  # Cualitativo
        "interpretacion_alta": "Hilos narrativos de otras vidas emergiendo",
        "sanacion": "Regresión consciente, journaling de sueños",
        "hierba": "Mugwort, blue lotus, damiana",
        "arcanos_relacionados": ["La Rueda", "El Juicio", "El Mundo"],
    },
    "spiritual-path": {
        "nombre_holistico": "Exploración del Camino Espiritual",
        "nombre_exploracion": "Exploración del Sendero del Alma",
        "categoria": "multidimensional",
        "sefira_principal": "Kether",
        "sefirot_secundarias": ["Tiferet"],
        "chakra_principal": "Sahasrara",
        "umbral_alto": None,
        "interpretacion_alta": "Camino espiritual revelado",
        "sanacion": "Práctica contemplativa según tradición afín",
        "hierba": "Frankincienso, salvia blanca",
        "arcanos_relacionados": ["El Ermitaño", "La Estrella", "El Mundo"],
    },
    "belief-system": {
        "nombre_holistico": "Exploración de Sistema de Creencias",
        "nombre_exploracion": "Exploración de Creencias Limitantes",
        "categoria": "mental",
        "sefira_principal": "Binah",
        "sefirot_secundarias": ["Hod"],
        "chakra_principal": "Ajna",
        "umbral_alto": 30,
        "interpretacion_alta": "Creencias limitantes activas en el sistema",
        "sanacion": "Reestructuración cognitiva, afirmaciones",
        "hierba": "Gotu kola, brahmi",
        "arcanos_relacionados": ["El Mago", "La Sacerdotisa"],
    },
    "emotional-literacy": {
        "nombre_holistico": "Exploración de Alfabetización Emocional",
        "nombre_exploracion": "Exploración de Vocabulario Emocional",
        "categoria": "emocional",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Netzach", "Chesed"],
        "chakra_principal": "Anahata",
        "umbral_alto": 25,  # bajo = poca alfabetización
        "interpretacion_alta": "Oportunidad de desarrollar vocabulario emocional",
        "sanacion": "Journaling emocional, terapia expresiva",
        "hierba": "Rosa, espino blanco",
        "arcanos_relacionados": ["Los Enamorados", "La Emperatriz"],
    },
    "attachment-style": {
        "nombre_holistico": "Exploración de Estilo de Apego",
        "nombre_exploracion": "Exploración de Patrones Vinculares",
        "categoria": "emocional",
        "sefira_principal": "Chesed",
        "sefirot_secundarias": ["Netzach", "Yesod"],
        "chakra_principal": "Anahata + Svadhisthana",
        "umbral_alto": None,  # Categórico
        "interpretacion_alta": "Patrón de apego identificado para trabajar",
        "sanacion": "Terapia relacional, trabajo con el niño interior",
        "hierba": "Rosa, cacao ceremonial",
        "arcanos_relacionados": ["Los Enamorados", "La Emperatriz", "La Luna"],
    },
    "somatic-awareness": {
        "nombre_holistico": "Exploración de Conciencia Somática",
        "nombre_exploracion": "Exploración del Cuerpo como Sensor",
        "categoria": "corporal",
        "sefira_principal": "Malkhut",
        "sefirot_secundarias": ["Yesod"],
        "chakra_principal": "Muladhara + Svadhisthana",
        "umbral_alto": 20,  # bajo = poca conciencia
        "interpretacion_alta": "Desconexión del cuerpo como sensor",
        "sanacion": "Body scan, yoga, danza consciente",
        "hierba": "Jengibre, canela",
        "arcanos_relacionados": ["La Fuerza", "El Mundo"],
    },
    
    # --- TESTS GENERALES ---
    "wellness": {
        "nombre_holistico": "Wellness Assessment",
        "nombre_exploracion": "Exploración de Bienestar Integral",
        "categoria": "bienestar",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Malkhut", "Yesod"],
        "chakra_principal": "Anahata",
        "umbral_alto": None,
        "interpretacion_alta": "Panorama de bienestar disponible",
        "sanacion": "Equilibrio en las áreas detectadas",
        "hierba": "Adaptógenos generales",
        "arcanos_relacionados": ["La Templanza", "La Estrella", "El Sol"],
    },
    "screening-general": {
        "nombre_holistico": "Screening Psicologico General",
        "nombre_exploracion": "Exploración de Tamizaje General",
        "categoria": "tamizaje",
        "sefira_principal": "Tiferet",
        "sefirot_secundarias": ["Chesed", "Gevurah"],
        "chakra_principal": "Múltiples",
        "umbral_alto": None,
        "interpretacion_alta": "Áreas prioritarias identificadas",
        "sanacion": "Profundizar en las áreas señaladas",
        "hierba": "Según área predominante",
        "arcanos_relacionados": ["La Rueda", "El Juicio"],
    },
    "aq_kabbalah": {
        "nombre_holistico": "Aura Quotient for Kabbalistic Alignment (AQ-K)",
        "nombre_exploracion": "Exploración de Alineamiento Cabalístico del Aura",
        "categoria": "multidimensional",
        "sefira_principal": "Da'at",
        "sefirot_secundarias": ["Kether", "Tiferet"],
        "chakra_principal": "Sahasrara + Ajna",
        "umbral_alto": None,  # Cuantitativo diferente
        "interpretacion_alta": "Cociente áurico disponible para lectura",
        "sanacion": "Meditación en el Árbol de la Vida",
        "hierba": "Incienso, mirra, sándalo",
        "arcanos_relacionados": ["El Mago", "La Sacerdotisa", "El Mundo"],
    },
}


def get_holistic_profile(user_id: int) -> Dict[str, Any]:
    """
    Obtiene el perfil holístico COMPLETO del consultante basado en TODOS sus tests.
    Integra múltiples fuentes de información para una lectura profunda.
    """
    try:
        from .test_models import TestResult
        
        # Buscar TODOS los tests del usuario (últimos 30 días o los 10 más recientes)
        from datetime import timedelta
        from django.utils import timezone
        
        cutoff_date = timezone.now() - timedelta(days=90)
        
        all_tests = TestResult.objects.filter(
            user_id=user_id,
            created_at__gte=cutoff_date
        ).order_by('-created_at')[:15]  # Máximo 15 tests recientes
        
        if not all_tests.exists():
            return {
                "available": False, 
                "summary": "Sin tests realizados - interpretación general",
                "tests_found": 0,
            }
        
        # Estructuras para acumular información
        profile = {
            "available": True,
            "tests_found": all_tests.count(),
            "tests_analyzed": [],
            "areas_atencion": [],
            "chakras_afectados": [],
            "practicas_recomendadas": [],
            "hierbas_sugeridas": [],
            "arcanos_resonantes": [],
            "birth_date": None,
            "summary": "",
        }
        
        chakras_set = set()
        arcanos_set = set()
        hierbas_set = set()
        practicas_set = set()
        
        for test_result in all_tests:
            test_id = test_result.test_id or ""
            test_module = test_result.test_module
            
            # Buscar el código del test
            test_code = test_id.lower().replace("-", "_").replace(" ", "_")
            if test_module:
                test_code = test_module.code.lower().replace("-", "_")
            
            # Buscar en nuestro mapa holístico
            test_info = None
            for key, info in TEST_HOLISTIC_MAP.items():
                if key.replace("-", "_") in test_code or test_code in key.replace("-", "_"):
                    test_info = info
                    break
            
            if not test_info:
                continue  # Test no mapeado
            
            # Extraer score del test
            score = test_result.score
            if score is None and test_result.result_data:
                # Intentar extraer score de result_data
                score = (
                    test_result.result_data.get('total') or
                    test_result.result_data.get('score') or
                    test_result.result_data.get('total_score') or
                    test_result.result_data.get('GSI')  # Para SCL-90
                )
            
            # Determinar si está elevado
            umbral = test_info.get("umbral_alto")
            is_elevated = False
            if umbral is not None and score is not None:
                try:
                    is_elevated = float(score) >= float(umbral)
                except:
                    pass
            
            # Registrar el test analizado
            profile["tests_analyzed"].append({
                "test_id": test_id or (test_module.code if test_module else "unknown"),
                "categoria": test_info["categoria"],
                "score": score,
                "elevated": is_elevated,
                "date": test_result.created_at.isoformat() if test_result.created_at else None,
            })
            
            # Si está elevado, agregar a áreas de atención
            if is_elevated:
                profile["areas_atencion"].append({
                    "categoria": test_info["categoria"],
                    "chakra": test_info["chakra_principal"],
                    "interpretacion": test_info["interpretacion_alta"],
                    "sanacion": test_info["sanacion"],
                    "score": score,
                })
                
                chakras_set.add(test_info["chakra_principal"])
                practicas_set.add(test_info["sanacion"])
                hierbas_set.add(test_info["hierba"])
                for arcano in test_info.get("arcanos_relacionados", []):
                    arcanos_set.add(arcano)
            
            # Capturar fecha de nacimiento si existe
            if not profile["birth_date"] and test_result.client_birth_date:
                profile["birth_date"] = test_result.client_birth_date
        
        # Consolidar sets en listas
        profile["chakras_afectados"] = list(chakras_set)[:4]
        profile["arcanos_resonantes"] = list(arcanos_set)[:6]
        profile["hierbas_sugeridas"] = list(hierbas_set)[:4]
        profile["practicas_recomendadas"] = list(practicas_set)[:4]
        
        # Construir resumen
        if profile["areas_atencion"]:
            areas = [a["categoria"].title() for a in profile["areas_atencion"][:3]]
            chakras = profile["chakras_afectados"][:2]
            profile["summary"] = (
                f"Áreas de atención detectadas: {', '.join(areas)}. "
                f"Chakras prioritarios: {', '.join(chakras)}."
            )
        else:
            profile["summary"] = (
                f"Se analizaron {len(profile['tests_analyzed'])} tests. "
                "Perfil en equilibrio general - sin alertas críticas."
            )
        
        return profile
        
    except Exception as e:
        logger.warning(f"Error obteniendo perfil holístico: {e}")
        return {"available": False, "summary": "Error al obtener perfil - interpretación general"}


def get_psychological_profile(user_id: int) -> Dict[str, Any]:
    """
    Wrapper para compatibilidad - ahora usa get_holistic_profile.
    Obtiene el perfil completo del consultante basado en TODOS sus tests.
    """
    profile = get_holistic_profile(user_id)
    
    # Adaptar formato para compatibilidad con código existente
    if profile.get("available"):
        elevated_dimensions = []
        for area in profile.get("areas_atencion", []):
            elevated_dimensions.append({
                "dimension": area["categoria"],
                "score": area.get("score"),
                "chakra": area["chakra"],
                "desequilibrio": area["interpretacion"],
                "sanacion": area["sanacion"],
                "hierba": ", ".join(profile.get("hierbas_sugeridas", [])[:2]),
            })
        
        profile["elevated_dimensions"] = elevated_dimensions
    
    return profile


def format_profile_for_prompt(profile: Dict[str, Any]) -> str:
    """Formatea el perfil holístico completo para incluir en el prompt.
    
    Utiliza nomenclatura holística del sistema (Sefirot + chakras).
    NUNCA incluye terminología clínica.
    """
    if not profile.get("available"):
        return "No hay perfil previo disponible. Ofrece una interpretación general pero igualmente profunda y personalizada."
    
    parts = [profile.get("summary", "Perfil disponible")]
    
    # Tests analizados
    tests_count = profile.get("tests_found", 0)
    if tests_count > 0:
        parts.append(f"\n📊 **Exploraciones analizadas**: {tests_count} lecturas recientes")
    
    # Áreas de atención elevadas
    if profile.get("areas_atencion"):
        parts.append("\n⚠️ **Áreas que requieren atención**:")
        for area in profile["areas_atencion"][:3]:
            categoria = area['categoria'].title()
            # Obtener info de sefirot si disponible
            test_info = None
            for key, info in TEST_HOLISTIC_MAP.items():
                if info.get("categoria") == area['categoria']:
                    test_info = info
                    break
            
            sefira = test_info.get("sefira_principal", "") if test_info else ""
            nombre_exploracion = test_info.get("nombre_exploracion", categoria) if test_info else categoria
            
            if sefira:
                parts.append(f"- **{nombre_exploracion}** → Sefirá: {sefira} | Chakra: {area['chakra']}")
            else:
                parts.append(f"- **{nombre_exploracion}** → Chakra: {area['chakra']}")
            parts.append(f"  Interpretación: {area['interpretacion']}")
    
    # Sefirot prioritarias (extraer de áreas de atención)
    sefirot_set = set()
    for area in profile.get("areas_atencion", []):
        for key, info in TEST_HOLISTIC_MAP.items():
            if info.get("categoria") == area['categoria']:
                sefirot_set.add(info.get("sefira_principal", ""))
                break
    sefirot = [s for s in sefirot_set if s][:3]
    if sefirot:
        parts.append(f"\n🌳 **Sefirot del Árbol de la Vida prioritarias**: {', '.join(sefirot)}")
    
    # Chakras a trabajar
    if profile.get("chakras_afectados"):
        chakras = profile["chakras_afectados"][:3]
        parts.append(f"\n🔴 **Chakras prioritarios**: {', '.join(chakras)}")
    
    # Prácticas recomendadas
    if profile.get("practicas_recomendadas"):
        practicas = profile["practicas_recomendadas"][:2]
        parts.append(f"\n✨ **Prácticas sugeridas**: {'; '.join(practicas)}")
    
    # Hierbas aliadas
    if profile.get("hierbas_sugeridas"):
        hierbas = profile["hierbas_sugeridas"][:2]
        parts.append(f"\n🌿 **Hierbas aliadas**: {', '.join(hierbas)}")
    
    # Arcanos que resuenan con el perfil
    if profile.get("arcanos_resonantes"):
        arcanos = profile["arcanos_resonantes"][:4]
        parts.append(f"\n🃏 **Arcanos resonantes con el perfil**: {', '.join(arcanos)}")
    
    # Compatibilidad con formato antiguo (elevated_dimensions)
    elif profile.get("elevated_dimensions"):
        parts.append("\n**Dimensiones elevadas:**")
        for dim in profile["elevated_dimensions"][:2]:
            parts.append(f"- {dim.get('chakra', 'N/A')}: {dim.get('desequilibrio', 'N/A')}")
            if dim.get('sanacion'):
                parts.append(f"  → Práctica: {dim['sanacion']}")
    
    return "\n".join(parts)


def resolve_consultant_context(request, context: Dict[str, Any]) -> Dict[str, Any]:
    """Resolve consultant (patient) data for therapist-scoped tarot interpretation."""
    from .models import Patient

    consultant_id = context.get('consultantId')
    result: Dict[str, Any] = {
        'consultant_name': (context.get('consultantName') or '').strip() or 'el consultante',
        'profile_user_id': None,
        'birth_date': None,
    }

    if context.get('birthDate'):
        try:
            result['birth_date'] = datetime.strptime(context['birthDate'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            pass

    if not consultant_id:
        return result

    try:
        patient = Patient.objects.get(id=int(consultant_id), therapist=request.user)
        if not context.get('consultantName'):
            name = (patient.full_name or '').strip()
            if not name:
                name = f"{patient.first_name} {patient.last_name}".strip()
            result['consultant_name'] = name or 'el consultante'
        if patient.birth_date and not result['birth_date']:
            result['birth_date'] = patient.birth_date
        if patient.user_id:
            result['profile_user_id'] = patient.user_id
    except (Patient.DoesNotExist, ValueError, TypeError):
        logger.warning(
            "Consultant %s not found for therapist %s",
            consultant_id,
            request.user.id,
        )

    return result


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
        
        consultant_ctx = resolve_consultant_context(request, context)
        profile_user_id = consultant_ctx['profile_user_id']
        if profile_user_id:
            profile = get_psychological_profile(profile_user_id)
        else:
            profile = {
                'available': False,
                'summary': (
                    'Sin exploraciones holísticas previas vinculadas a este consultante. '
                    'Desarrolla la lectura desde el arquetipo y la numerología.'
                ),
            }
        profile_text = format_profile_for_prompt(profile)

        birth_date = consultant_ctx.get('birth_date')
        if not birth_date and profile.get('birth_date'):
            birth_date = profile['birth_date']

        soul_number = calculate_soul_number(birth_date) if birth_date else 7
        card_number = get_card_number(arcana_id)
        karmic_number = calculate_karmic_number(soul_number, [card_number])

        user_prompt = INTERPRET_CARD_MYSTIC_PROMPT.format(
            consultant_name=consultant_ctx['consultant_name'],
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

        if context.get('question'):
            user_prompt += f"\n\n**Intención o pregunta simbólica del trabajo**: {context['question']}"
        
        # Generar interpretación
        ai_service = get_ai_service()
        ai_service._ensure_initialized()
        if not ai_service.enabled:
            return Response({
                "error": ai_service.error_message or "Servicio AI no disponible",
                "code": "AI_UNAVAILABLE",
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        temperature = options.get('temperature', 0.75)

        try:
            interpretation = ai_service._generate_content(
                system_prompt=ORACLE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=4096,
                temperature=temperature,
            )
            
            if not interpretation or interpretation.startswith("Error:"):
                return Response({
                    "error": interpretation.replace("Error:", "", 1).strip() or "Servicio AI no disponible",
                    "code": "AI_GENERATION_FAILED",
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

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
        
        consultant_ctx = resolve_consultant_context(request, context)
        profile_user_id = consultant_ctx['profile_user_id']
        if profile_user_id:
            profile = get_psychological_profile(profile_user_id)
        else:
            profile = {
                'available': False,
                'summary': (
                    'Sin exploraciones holísticas previas vinculadas a este consultante. '
                    'Desarrolla la lectura desde los arquetipos de la tirada.'
                ),
            }
        profile_text = format_profile_for_prompt(profile)

        birth_date = consultant_ctx.get('birth_date')
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
        
        user_prompt = INTERPRET_SPREAD_MYSTIC_PROMPT.format(
            consultant_name=consultant_ctx['consultant_name'],
            spread_type=spread_type,
            tarot_system=tarot_system,
            cards_description="\n".join(cards_description),
            psychological_profile=profile_text,
            soul_number=soul_number,
            cards_sum=cards_sum,
            karmic_number=karmic_number,
            numerology_message=numerology_message,
        )

        if context.get('question'):
            user_prompt += f"\n\n**Intención o pregunta simbólica del trabajo**: {context['question']}"
        
        # Generar interpretación
        ai_service = get_ai_service()
        ai_service._ensure_initialized()
        if not ai_service.enabled:
            return Response({
                "error": ai_service.error_message or "Servicio AI no disponible",
                "code": "AI_UNAVAILABLE",
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        temperature = options.get('temperature', 0.75)

        try:
            interpretation = ai_service._generate_content(
                system_prompt=ORACLE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                max_tokens=4096,
                temperature=temperature,
            )

            if not interpretation or interpretation.startswith("Error:"):
                return Response({
                    "error": interpretation.replace("Error:", "", 1).strip() or "Servicio AI no disponible",
                    "code": "AI_GENERATION_FAILED",
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
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
