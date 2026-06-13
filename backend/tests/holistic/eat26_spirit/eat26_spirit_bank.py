"""
Banco de ítems EAT-26-Spirit — Eternal Abundance Threshold
Reinterpretación kabbalistic del EAT-26.
NO es diagnóstico clínico; es exploración simbólica de Malkhut.
"""

EAT26_SPIRIT_SCALE = {
    0: "Siempre",
    1: "Casi siempre",
    2: "Muchas veces",
    3: "A veces",
    4: "Pocas veces",
    5: "Nunca"
}

EAT26_SPIRIT_QUESTIONS = [
    {"id": "q1", "text": "Me aterra la idea de engordar."},
    {"id": "q2", "text": "Evito comer cuando tengo hambre."},
    {"id": "q3", "text": "Me preocupa y obsesiona el tema de la comida."},
    {"id": "q4", "text": "Me he dado atracones de comida sintiéndome incapaz de parar."},
    {"id": "q5", "text": "Corto mis alimentos en trozos pequeños."},
    {"id": "q6", "text": "Conozco el valor calórico de los alimentos que ingiero."},
    {"id": "q7", "text": "Evito especialmente alimentos con muchos carbohidratos (pan, arroz, patatas)."},
    {"id": "q8", "text": "Siento que los demás prefieren que yo coma más."},
    {"id": "q9", "text": "Vomito después de comer."},
    {"id": "q10", "text": "Me siento muy culpable después de comer."},
    {"id": "q11", "text": "Me obsesiona el deseo de estar más delgado/a."},
    {"id": "q12", "text": "Pienso en quemar calorías cuando hago ejercicio."},
    {"id": "q13", "text": "Los demás piensan que estoy demasiado delgado/a."},
    {"id": "q14", "text": "Me preocupa la idea de tener grasa en el cuerpo."},
    {"id": "q15", "text": "Tardo más en comer que los demás."},
    {"id": "q16", "text": "Evito los alimentos que contienen azúcar."},
    {"id": "q17", "text": "Como alimentos de dieta."},
    {"id": "q18", "text": "Siento que la comida controla mi vida."},
    {"id": "q19", "text": "Muestro autocontrol ante la comida."},
    {"id": "q20", "text": "Siento que los demás me presionan para que coma."},
    {"id": "q21", "text": "Paso demasiado tiempo pensando en la comida."},
    {"id": "q22", "text": "Me siento incómodo/a después de comer dulces."},
    {"id": "q23", "text": "Me comprometo con comportamientos de dieta estricta."},
    {"id": "q24", "text": "Me gusta sentir el estómago vacío."},
    {"id": "q25", "text": "Disfruto probando nuevos alimentos sabrosos.", "reverse": True},
    {"id": "q26", "text": "Siento el impulso de vomitar después de las comidas."},
]

EAT26_SPIRIT_METADATA = {
    "code": "eat26_spirit",
    "name_holistic": "Eternal Abundance Threshold (EAT-26-Spirit)",
    "sefira": "Malkhut",
    "mundo": "Asiá → Ietzirá",
    "total_items": 26,
    "scale_note": "0=Siempre … 5=Nunca. Q25 puntúa inversamente.",
    "disclaimer": "Exploración simbólica no clínica. No sustituye diagnóstico médico.",
}
