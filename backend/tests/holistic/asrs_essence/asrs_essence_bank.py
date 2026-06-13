"""
ASRS-Essence — Banco de ítems (Conciencia Esencial Abierta)
Instrumento simbólico no clínico.

Correspondencia interna con ASRS v1.1 Parte A (Baron-Cohen et al.).
Los ítems están redactados en lenguaje simbólico; no reproducen texto clínico original.

Escala de respuesta (0-4):
  0 = Nunca
  1 = Rara vez
  2 = A veces        ← umbral positivo (shaded) para ítems 1-3
  3 = A menudo       ← umbral positivo (shaded) para ítems 4-6
  4 = Muy a menudo

Screener POSITIVO si ≥ 4 de 6 ítems están en zona positiva.
"""

ASRS_ESSENCE_SCALE = {
    0: "Nunca",
    1: "Rara vez",
    2: "A veces",
    3: "A menudo",
    4: "Muy a menudo",
}

ASRS_ESSENCE_BANK = [
    {
        "id": "q1",
        "text": "¿Con qué frecuencia pierdes el hilo al cerrar los últimos detalles de tus travesías internas, incluso cuando lo principal ya está completado?",
        "asrs_base_item": 1,
        "shaded_threshold": 2,
        "sephira": "Yesod",
    },
    {
        "id": "q2",
        "text": "¿Con qué frecuencia encuentras dificultad para ordenar el flujo de tus intenciones cuando el sendero requiere estructura y jerarquía?",
        "asrs_base_item": 2,
        "shaded_threshold": 2,
        "sephira": "Binah",
    },
    {
        "id": "q3",
        "text": "¿Con qué frecuencia olvidas compromisos del alma —encuentros, promesas, compromisos— que ya habías concertado?",
        "asrs_base_item": 3,
        "shaded_threshold": 2,
        "sephira": "Chesed",
    },
    {
        "id": "q4",
        "text": "¿Con qué frecuencia postergas o evitas los trabajos del espíritu que requieren sostenimiento prolongado de la atención?",
        "asrs_base_item": 4,
        "shaded_threshold": 3,
        "sephira": "Gevurah",
    },
    {
        "id": "q5",
        "text": "¿Con qué frecuencia sientes inquietud o movimiento interno cuando el camino te pide permanecer en quietud?",
        "asrs_base_item": 5,
        "shaded_threshold": 3,
        "sephira": "Netzach",
    },
    {
        "id": "q6",
        "text": "¿Con qué frecuencia percibes una energía interior que te lleva a actuar más allá de lo que la situación requiere, como si el impulso se impusiera al equilibrio?",
        "asrs_base_item": 6,
        "shaded_threshold": 3,
        "sephira": "Hod",
    },
]

ASRS_ESSENCE_METADATA = {
    "code": "asrs_essence",
    "name": "ASRS-Essence — Conciencia Esencial Abierta",
    "items_count": 6,
    "scale_range": "0-4",
    "screener_positive_threshold": 4,
    "internal_mapping": "ASRS v1.1 Part A. Texto kabbalístico; no reproducción literal.",
    "kabbalistic_frame": "Tiferet (equilibrio) — Malkuth (manifestación).",
    "disclaimer": "Exploración simbólica no clínica. No constituye diagnóstico de TDAH.",
}
