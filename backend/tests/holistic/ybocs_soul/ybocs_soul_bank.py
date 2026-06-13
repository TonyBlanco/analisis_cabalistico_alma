"""
Banco de ítems Y-BOCS-Soul — Yetziratic Balance Obsessive-Compulsive Sanctuary
Reinterpretación kabbalistic del Y-BOCS (Yale-Brown Obsessive Compulsive Scale).
NO es diagnóstico clínico; es exploración simbólica de Ietzirá.

Estructura: 5 ítems de obsesiones (Q1-Q5) + 5 ítems de compulsiones (Q6-Q10).
Escala por ítem: 0-4.
Subescalas: obsession_score (0-20) + compulsion_score (0-20) = total_score (0-40).

Umbrales (Y-BOCS estándar):
  0-7:  Subclínico
  8-15: Leve
  16-23: Moderado
  24-31: Severo
  32-40: Extremo
"""

_SCALE_TIME = {
    0: "Ninguno — sin pensamiento intrusivo",
    1: "Leve — menos de 1 hora al día",
    2: "Moderado — 1 a 3 horas al día",
    3: "Severo — 3 a 8 horas al día",
    4: "Extremo — más de 8 horas al día (casi constante)",
}

_SCALE_INTERFERENCE = {
    0: "Sin interferencia",
    1: "Leve — pequeña interferencia en actividades",
    2: "Moderada — interferencia notable pero funciono",
    3: "Severa — interfiere significativamente",
    4: "Extrema — incapacitante",
}

_SCALE_DISTRESS = {
    0: "Sin malestar",
    1: "Leve — mínimo malestar si se interrumpen",
    2: "Moderado — malestar perturbador pero manejable",
    3: "Severo — malestar muy intenso",
    4: "Extremo — malestar prácticamente incapacitante",
}

_SCALE_RESISTANCE = {
    0: "Resistencia completa — siempre lo logro",
    1: "Resistencia alta — casi siempre resisto",
    2: "Resistencia moderada — a veces resisto",
    3: "Resistencia baja — rara vez resisto",
    4: "Sin resistencia — cedo completamente",
}

_SCALE_CONTROL = {
    0: "Control completo",
    1: "Control alto — puedo desviarlos con esfuerzo",
    2: "Control moderado — a veces los desvío",
    3: "Control bajo — raramente los desvío",
    4: "Sin control — totalmente incontrolables",
}

YBOCS_SOUL_QUESTIONS = [
    # ── OBSESIONES (Q1-Q5) ──────────────────────────────────────────────
    {
        "id": "q1",
        "group": "obsesiones",
        "text": "¿Cuánto tiempo al día ocupan los pensamientos repetitivos o intrusivos (ecos del alma)?",
        "scale": _SCALE_TIME,
    },
    {
        "id": "q2",
        "group": "obsesiones",
        "text": "¿En qué medida estos pensamientos interfieren con tu vida diaria, trabajo o relaciones?",
        "scale": _SCALE_INTERFERENCE,
    },
    {
        "id": "q3",
        "group": "obsesiones",
        "text": "¿Cuánto malestar o angustia te generan estos pensamientos si intentas ignorarlos o interrumpirlos?",
        "scale": _SCALE_DISTRESS,
    },
    {
        "id": "q4",
        "group": "obsesiones",
        "text": "¿En qué medida puedes resistir estos pensamientos y evitar que te arrastren?",
        "scale": _SCALE_RESISTANCE,
    },
    {
        "id": "q5",
        "group": "obsesiones",
        "text": "¿Cuánto control tienes sobre estos pensamientos cuando aparecen?",
        "scale": _SCALE_CONTROL,
    },
    # ── COMPULSIONES (Q6-Q10) ────────────────────────────────────────────
    {
        "id": "q6",
        "group": "compulsiones",
        "text": "¿Cuánto tiempo al día dedicas a rituales o conductas repetitivas que sientes que debes realizar?",
        "scale": _SCALE_TIME,
    },
    {
        "id": "q7",
        "group": "compulsiones",
        "text": "¿En qué medida estos rituales interfieren con tu vida diaria, trabajo o relaciones?",
        "scale": _SCALE_INTERFERENCE,
    },
    {
        "id": "q8",
        "group": "compulsiones",
        "text": "¿Cuánto malestar sientes si no puedes realizar estos rituales o se ven interrumpidos?",
        "scale": _SCALE_DISTRESS,
    },
    {
        "id": "q9",
        "group": "compulsiones",
        "text": "¿En qué medida puedes resistir el impulso de realizar estos rituales?",
        "scale": _SCALE_RESISTANCE,
    },
    {
        "id": "q10",
        "group": "compulsiones",
        "text": "¿Cuánto control tienes sobre los rituales? ¿Puedes posponerlos o modificarlos?",
        "scale": _SCALE_CONTROL,
    },
]

YBOCS_SOUL_METADATA = {
    "code": "ybocs_soul",
    "name_holistic": "Y-BOCS-Soul — Sanctuario del Balance Ietzirático",
    "sefira": "Tiferet",
    "mundo": "Ietzirá (Formativo)",
    "total_items": 10,
    "subscales": {
        "obsesiones": ["q1", "q2", "q3", "q4", "q5"],
        "compulsiones": ["q6", "q7", "q8", "q9", "q10"],
    },
    "scale_note": "Todos los ítems: 0-4. Subescalas: obsessions_score (0-20) + compulsions_score (0-20) = total (0-40).",
    "disclaimer": "Exploración simbólica no clínica. No sustituye diagnóstico médico.",
}
