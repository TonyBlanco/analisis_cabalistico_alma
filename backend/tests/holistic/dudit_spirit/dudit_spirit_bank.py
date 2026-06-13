"""
Banco de ítems DUDIT-Spirit — Divine Unity Drug Introspection Test
Reinterpretación kabbalistic del DUDIT-11.
NO es diagnóstico clínico; es exploración simbólica.

Escala Q1-Q9: 0-4 (frecuencia).
Escala Q10-Q11: 0/2/4 solamente (No / Sí, no en el último año / Sí, en el último año).

Umbral de uso problemático (sexo-dependiente):
  Hombre: puntuación ≥ 6
  Mujer:  puntuación ≥ 2
Umbral de alto riesgo (ambos sexos): ≥ 25
Puntuación máxima: 44 (Q1-Q9 × 4 + Q10-Q11 × 4).
"""

_SCALE_FREQ = {
    0: "Nunca",
    1: "Menos de una vez al mes",
    2: "Mensualmente",
    3: "Semanalmente",
    4: "A diario o casi a diario",
}

_SCALE_0_2_4 = {
    0: "No",
    2: "Sí, pero no en el último año",
    4: "Sí, en el último año",
}

DUDIT_SPIRIT_QUESTIONS = [
    {
        "id": "q1",
        "text": "¿Con qué frecuencia usas sustancias (distintas del alcohol) para modificar tu estado de conciencia o buscar alivio emocional?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q2",
        "text": "¿Combinas varias sustancias en una misma ocasión para intensificar o variar el efecto?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q3",
        "text": "¿Cuántas tomas o dosis consumes en un día típico de uso?",
        "scale": {
            0: "Una o dos",
            1: "Tres o cuatro",
            2: "Cinco o seis",
            3: "Siete a nueve",
            4: "Diez o más",
        },
    },
    {
        "id": "q4",
        "text": "¿Con qué frecuencia quedas profundamente alterado/a por los efectos de las sustancias?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q5",
        "text": "En el último año, ¿con qué frecuencia sentiste que el impulso de consumir era tan intenso que no podías resistirlo?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q6",
        "text": "En el último año, ¿con qué frecuencia no pudiste dejar de consumir una vez que habías empezado?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q7",
        "text": "En el último año, ¿con qué frecuencia el consumo te impidió cumplir responsabilidades importantes (trabajo, estudios, familia)?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q8",
        "text": "En el último año, ¿con qué frecuencia necesitaste consumir a primera hora del día para superar el malestar del día anterior?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q9",
        "text": "En el último año, ¿con qué frecuencia sentiste culpa, vergüenza o angustia tras el consumo?",
        "scale": _SCALE_FREQ,
    },
    {
        "id": "q10",
        "text": "¿En algún momento tú u otra persona sufrió daño (físico o emocional) como consecuencia de tu consumo?",
        "scale": _SCALE_0_2_4,
        "score_values": [0, 2, 4],
    },
    {
        "id": "q11",
        "text": "¿Algún familiar, amigo o profesional de salud ha expresado preocupación por tu consumo o te ha sugerido reducirlo?",
        "scale": _SCALE_0_2_4,
        "score_values": [0, 2, 4],
    },
]

DUDIT_SPIRIT_METADATA = {
    "code": "dudit_spirit",
    "name_holistic": "Divine Unity Drug Introspection (DUDIT-Spirit)",
    "sefira": "Yesod",
    "mundo": "Ietzirá → Asiá",
    "total_items": 11,
    "scale_note": (
        "Q1-Q9: frecuencia 0-4. "
        "Q10-Q11: escala 0/2/4 únicamente (No / Sí-no-último-año / Sí-en-último-año). "
        "Umbral problemático: ≥6 hombre, ≥2 mujer. Alto riesgo: ≥25 (ambos)."
    ),
    "sex_required": True,
    "disclaimer": "Exploración simbólica no clínica. No sustituye diagnóstico médico.",
}
