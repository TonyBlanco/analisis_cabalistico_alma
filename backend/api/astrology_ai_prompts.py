"""
Catálogo de Prompts AI para Astrología Profesional

Este módulo contiene los prompts especializados para cada tipo de interpretación
astrológica. Los prompts están diseñados para generar lecturas simbólicas
profesionales, NO diagnósticos clínicos.

REGLAS DE CONTENIDO:
1. Terminología: "consultante" (no "paciente")
2. Enfoque: Lectura simbólica/holística (no clínico/diagnóstico)
3. Tono: Profesional, orientativo, sin absolutismos
4. Longitud: Respuestas concisas pero completas (300-500 palabras)
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PromptConfig:
    """Configuración para un prompt de interpretación."""
    system_prompt: str
    user_template: str
    max_tokens: int = 1024
    temperature: float = 0.7


# ==============================================================================
# PROMPTS BASE
# ==============================================================================

SYSTEM_BASE = """Eres un astrólogo profesional especializado en lectura simbólica y holística.

REGLAS ESTRICTAS:
1. NUNCA uses terminología clínica o diagnóstica
2. Usa "consultante" en lugar de "paciente"
3. Ofrece orientaciones, NO predicciones absolutas
4. Incluye siempre el disclaimer de lectura simbólica
5. Responde en español profesional pero accesible
6. Máximo 500 palabras por respuesta

Tu enfoque integra:
- Astrología psicológica (Liz Greene, Howard Sasportas)
- Correspondencias cabalísticas tradicionales
- Orientación práctica para el terapeuta holístico
"""

DISCLAIMER = """
---
*Lectura simbólica orientativa. No constituye diagnóstico ni prescripción.*
"""


# ==============================================================================
# PROMPT: CARTA NATAL
# ==============================================================================

NATAL_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="""Analiza la siguiente carta natal para el terapeuta:

**Datos del Consultante:**
- Signo Solar: {sun_sign}
- Signo Lunar: {moon_sign}
- Ascendente: {ascendant}
- Sol en Casa: {sun_house}
- Luna en Casa: {moon_house}

**Planetas relevantes:**
{planets_summary}

**Aspectos mayores:**
{aspects_summary}

**Estructura de tu respuesta:**
1. **Síntesis de Personalidad** (Sol-Luna-Ascendente): Describe la dinámica central
2. **Patrones Energéticos**: Identifica los temas principales
3. **Áreas de Desarrollo**: Sugiere focos de crecimiento
4. **Orientación Terapéutica**: Cómo puede el terapeuta acompañar este patrón

Incluye el disclaimer de lectura simbólica al final.
""",
    max_tokens=1024,
    temperature=0.7,
)


# ==============================================================================
# PROMPT: TRÁNSITOS
# ==============================================================================

TRANSITS_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="""Analiza los tránsitos actuales sobre la carta natal:

**Carta Natal Base:**
- Sol natal: {natal_sun}
- Luna natal: {natal_moon}
- Ascendente: {ascendant}

**Tránsitos Actuales ({transit_date}):**
{transits_summary}

**Aspectos Tránsito-Natal relevantes:**
{transit_aspects}

**Estructura de tu respuesta:**
1. **Clima Energético Actual**: Describe el tono general del momento
2. **Tránsitos Destacados**: Los 2-3 más significativos
3. **Desafíos del Período**: Qué requiere atención consciente
4. **Oportunidades**: Qué se puede aprovechar
5. **Recomendación Terapéutica**: Cómo acompañar este momento

Incluye el disclaimer de lectura simbólica al final.
""",
    max_tokens=1024,
    temperature=0.7,
)


# ==============================================================================
# PROMPT: PROGRESIONES
# ==============================================================================

PROGRESSIONS_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="""Analiza las progresiones secundarias actuales:

**Carta Natal Base:**
- Sol natal: {natal_sun} en Casa {natal_sun_house}
- Luna natal: {natal_moon} en Casa {natal_moon_house}
- Ascendente: {ascendant}

**Progresiones Secundarias ({progression_date}):**
- Sol progresado: {progressed_sun}
- Luna progresada: {progressed_moon}
- Ascendente progresado: {progressed_asc}

**Detalles:**
{progressions_summary}

**Estructura de tu respuesta:**
1. **Ciclo Evolutivo**: En qué fase de desarrollo se encuentra
2. **Sol Progresado**: Cómo evoluciona la identidad/propósito
3. **Luna Progresada**: Ciclo emocional de 28 años
4. **Temas de Desarrollo**: Qué está madurando internamente
5. **Orientación Terapéutica**: Cómo acompañar esta evolución

Incluye el disclaimer de lectura simbólica al final.
""",
    max_tokens=1024,
    temperature=0.7,
)


# ==============================================================================
# PROMPT: RETORNO SOLAR
# ==============================================================================

SOLAR_RETURN_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE,
    user_template="""Analiza el Retorno Solar para el año actual:

**Carta Natal Base:**
- Sol natal: {natal_sun}
- Luna natal: {natal_moon}
- Ascendente natal: {natal_asc}

**Retorno Solar {solar_return_year}:**
- Ascendente del Retorno: {sr_ascendant}
- Luna del Retorno: {sr_moon} en Casa {sr_moon_house}
- Regente del Año: {sr_ruler}

**Posiciones del Retorno:**
{solar_return_summary}

**Estructura de tu respuesta:**
1. **Tema del Año Solar**: El enfoque principal del período
2. **Ascendente del Retorno**: Cómo se presentará ante el mundo
3. **Luna del Retorno**: Necesidades emocionales del año
4. **Casas Activadas**: Áreas de vida en foco
5. **Recomendaciones para el Año**: Orientación práctica

Incluye el disclaimer de lectura simbólica al final.
""",
    max_tokens=1024,
    temperature=0.7,
)


# ==============================================================================
# PROMPT: SITUACIÓN ESPECÍFICA
# ==============================================================================

SITUATION_PROMPT = PromptConfig(
    system_prompt=SYSTEM_BASE + """

Además, en este modo respondes preguntas específicas del terapeuta sobre
la carta del consultante. Usa la información astrológica para orientar,
nunca para predecir con certeza.
""",
    user_template="""El terapeuta pregunta sobre una situación específica:

**Pregunta del Terapeuta:**
{question}

**Contexto Astrológico del Consultante:**
{chart_context}

**Tránsitos Actuales (si relevantes):**
{transits_context}

Responde de forma directa y práctica, enfocándote en la pregunta.
Máximo 300 palabras. Incluye el disclaimer al final.
""",
    max_tokens=800,
    temperature=0.7,
)


# ==============================================================================
# FUNCIONES HELPER
# ==============================================================================

def get_prompt_for_layer(layer: str) -> Optional[PromptConfig]:
    """Obtiene el prompt configurado para una capa específica."""
    prompts = {
        'natal': NATAL_PROMPT,
        'transits': TRANSITS_PROMPT,
        'progressions': PROGRESSIONS_PROMPT,
        'solar_return': SOLAR_RETURN_PROMPT,
        'situation': SITUATION_PROMPT,
    }
    return prompts.get(layer)


def format_planets_for_prompt(planets: list) -> str:
    """Formatea lista de planetas para incluir en prompt."""
    if not planets:
        return "No disponible"
    
    lines = []
    for p in planets:
        name = p.get('nombre', 'Unknown')
        sign = p.get('signo', '?')
        house = p.get('casa', '?')
        degree = p.get('grado', 0)
        lines.append(f"- {name}: {degree:.1f}° {sign}, Casa {house}")
    
    return "\n".join(lines) if lines else "No disponible"


def format_aspects_for_prompt(aspects: list) -> str:
    """Formatea lista de aspectos para incluir en prompt."""
    if not aspects:
        return "Sin aspectos mayores registrados"
    
    aspect_names = {
        'conjunction': 'Conjunción',
        'opposition': 'Oposición',
        'trine': 'Trígono',
        'square': 'Cuadratura',
        'sextile': 'Sextil',
    }
    
    lines = []
    for a in aspects[:10]:  # Limitar a 10 aspectos
        p1 = a.get('planeta1', '?')
        p2 = a.get('planeta2', '?')
        aspect_type = a.get('tipo', 'aspect')
        orb = a.get('orbe', 0)
        aspect_label = aspect_names.get(aspect_type, aspect_type)
        lines.append(f"- {p1} {aspect_label} {p2} (orbe: {orb:.1f}°)")
    
    return "\n".join(lines) if lines else "Sin aspectos mayores registrados"


def build_natal_prompt(chart_data: Dict[str, Any]) -> str:
    """Construye el prompt completo para interpretación natal."""
    planets = chart_data.get('planetas', [])
    aspects = chart_data.get('aspectos', [])
    
    # Extraer datos principales
    sun = next((p for p in planets if p.get('nombre', '').lower() == 'sun'), {})
    moon = next((p for p in planets if p.get('nombre', '').lower() == 'moon'), {})
    
    # Buscar ascendente en casas
    houses = chart_data.get('casas', [])
    asc_house = next((h for h in houses if h.get('numero') == 1), {})
    ascendant = asc_house.get('signo', 'Desconocido')
    
    return NATAL_PROMPT.user_template.format(
        sun_sign=sun.get('signo', 'Desconocido'),
        moon_sign=moon.get('signo', 'Desconocido'),
        ascendant=ascendant,
        sun_house=sun.get('casa', '?'),
        moon_house=moon.get('casa', '?'),
        planets_summary=format_planets_for_prompt(planets),
        aspects_summary=format_aspects_for_prompt(aspects),
    )


def build_transits_prompt(
    natal_data: Dict[str, Any],
    transits_data: Dict[str, Any],
    transit_date: str = "actual"
) -> str:
    """Construye el prompt para interpretación de tránsitos."""
    natal_planets = natal_data.get('planetas', [])
    transit_planets = transits_data.get('planetas', [])
    
    natal_sun = next((p for p in natal_planets if p.get('nombre', '').lower() == 'sun'), {})
    natal_moon = next((p for p in natal_planets if p.get('nombre', '').lower() == 'moon'), {})
    
    natal_houses = natal_data.get('casas', [])
    asc_house = next((h for h in natal_houses if h.get('numero') == 1), {})
    
    return TRANSITS_PROMPT.user_template.format(
        natal_sun=f"{natal_sun.get('signo', '?')} Casa {natal_sun.get('casa', '?')}",
        natal_moon=f"{natal_moon.get('signo', '?')} Casa {natal_moon.get('casa', '?')}",
        ascendant=asc_house.get('signo', 'Desconocido'),
        transit_date=transit_date,
        transits_summary=format_planets_for_prompt(transit_planets),
        transit_aspects="(Calculados por el motor)",
    )


def build_progressions_prompt(
    natal_data: Dict[str, Any],
    progressions_data: Dict[str, Any],
    progression_date: str = "actual"
) -> str:
    """Construye el prompt para interpretación de progresiones."""
    natal_planets = natal_data.get('planetas', [])
    prog_planets = progressions_data.get('planetas', [])
    
    natal_sun = next((p for p in natal_planets if p.get('nombre', '').lower() == 'sun'), {})
    natal_moon = next((p for p in natal_planets if p.get('nombre', '').lower() == 'moon'), {})
    prog_sun = next((p for p in prog_planets if p.get('nombre', '').lower() == 'sun'), {})
    prog_moon = next((p for p in prog_planets if p.get('nombre', '').lower() == 'moon'), {})
    
    natal_houses = natal_data.get('casas', [])
    asc_house = next((h for h in natal_houses if h.get('numero') == 1), {})
    
    return PROGRESSIONS_PROMPT.user_template.format(
        natal_sun=natal_sun.get('signo', '?'),
        natal_sun_house=natal_sun.get('casa', '?'),
        natal_moon=natal_moon.get('signo', '?'),
        natal_moon_house=natal_moon.get('casa', '?'),
        ascendant=asc_house.get('signo', 'Desconocido'),
        progression_date=progression_date,
        progressed_sun=f"{prog_sun.get('signo', '?')} Casa {prog_sun.get('casa', '?')}",
        progressed_moon=f"{prog_moon.get('signo', '?')} Casa {prog_moon.get('casa', '?')}",
        progressed_asc="(Calculado)",
        progressions_summary=format_planets_for_prompt(prog_planets),
    )


def build_solar_return_prompt(
    natal_data: Dict[str, Any],
    solar_return_data: Dict[str, Any],
    year: int = 2026
) -> str:
    """Construye el prompt para interpretación de retorno solar."""
    natal_planets = natal_data.get('planetas', [])
    sr_planets = solar_return_data.get('planetas', [])
    
    natal_sun = next((p for p in natal_planets if p.get('nombre', '').lower() == 'sun'), {})
    natal_moon = next((p for p in natal_planets if p.get('nombre', '').lower() == 'moon'), {})
    sr_moon = next((p for p in sr_planets if p.get('nombre', '').lower() == 'moon'), {})
    
    natal_houses = natal_data.get('casas', [])
    sr_houses = solar_return_data.get('casas', [])
    natal_asc = next((h for h in natal_houses if h.get('numero') == 1), {})
    sr_asc = next((h for h in sr_houses if h.get('numero') == 1), {})
    
    return SOLAR_RETURN_PROMPT.user_template.format(
        natal_sun=f"{natal_sun.get('signo', '?')} Casa {natal_sun.get('casa', '?')}",
        natal_moon=f"{natal_moon.get('signo', '?')} Casa {natal_moon.get('casa', '?')}",
        natal_asc=natal_asc.get('signo', 'Desconocido'),
        solar_return_year=year,
        sr_ascendant=sr_asc.get('signo', 'Desconocido'),
        sr_moon=sr_moon.get('signo', '?'),
        sr_moon_house=sr_moon.get('casa', '?'),
        sr_ruler="(Regente del Ascendente del Retorno)",
        solar_return_summary=format_planets_for_prompt(sr_planets),
    )


def build_situation_prompt(
    question: str,
    chart_data: Dict[str, Any],
    transits_data: Optional[Dict[str, Any]] = None
) -> str:
    """Construye el prompt para una pregunta situacional."""
    return SITUATION_PROMPT.user_template.format(
        question=question,
        chart_context=format_planets_for_prompt(chart_data.get('planetas', [])),
        transits_context=format_planets_for_prompt(
            transits_data.get('planetas', []) if transits_data else []
        ) if transits_data else "No disponibles",
    )
