"""
AQ-Kabbalah — Banco de ítems (Espectro de Conciencia Cabalístico)
50 ítems, 5 subescalas de 10 ítems cada una.

Escala de respuesta binaria:
  0 = En desacuerdo
  1 = De acuerdo

Scoring por ítem:
  - Ítems normales  (reverse=False): puntúa 1 si respuesta == 1 (de acuerdo)
  - Ítems inversos  (reverse=True):  puntúa 1 si respuesta == 0 (en desacuerdo)

Umbrales totales (0-50):
  < 26  → No screener
  ≥ 26  → Screener positivo
  ≥ 32  → Alto positivo

Subescalas (0-10 cada una):
  social_skill       → Netzach-Hod   (relación con el Otro)
  attention_switching → Tiferet-Yesod (estabilidad y transición)
  attention_to_detail → Binah-Hokhmah (percepción del detalle)
  communication      → Chesed-Gevurah (expresión e intercambio)
  imagination        → Keter-Malkuth  (mundo interior y creación)

Correspondencia interna con AQ-50 (Baron-Cohen et al. 2001).
Texto kabbalístico; no reproducción literal del instrumento original.
"""

AQ_KABBALAH_BANK = [
    # --- Social Skill / Netzach-Hod (ítems: 1,11,13,15,22,36,44,45,47,48) ---
    {
        "id": "q1", "dimension": "social_skill", "reverse": True,
        "text": "Prefiero el tejido del encuentro con otros antes que caminar solo por el sendero interior.",
    },
    {
        "id": "q2", "dimension": "attention_switching", "reverse": False,
        "text": "Cuando encuentro una forma de hacer algo, tiendo a repetirla de la misma manera una y otra vez.",
    },
    {
        "id": "q3", "dimension": "imagination", "reverse": True,
        "text": "Cuando intento imaginar algo, surge en mí con facilidad una imagen vívida y clara.",
    },
    {
        "id": "q4", "dimension": "attention_switching", "reverse": False,
        "text": "Con frecuencia me sumerjo en una sola corriente de atención hasta perder conciencia del entorno.",
    },
    {
        "id": "q5", "dimension": "attention_to_detail", "reverse": False,
        "text": "Con frecuencia percibo sonidos sutiles que pasan desapercibidos para quienes me rodean.",
    },
    {
        "id": "q6", "dimension": "attention_to_detail", "reverse": False,
        "text": "Suelo reparar en secuencias de signos —matrículas, códigos, patrones visuales— de manera espontánea.",
    },
    {
        "id": "q7", "dimension": "communication", "reverse": False,
        "text": "Otros me señalan con frecuencia que algo que expresé resultó descortés, aunque yo no lo percibí de ese modo.",
    },
    {
        "id": "q8", "dimension": "imagination", "reverse": True,
        "text": "Al leer un relato, construyo con facilidad la imagen interior de sus personajes.",
    },
    {
        "id": "q9", "dimension": "attention_to_detail", "reverse": False,
        "text": "Los registros de fechas, ciclos y momentos temporales me resultan especialmente fascinantes.",
    },
    {
        "id": "q10", "dimension": "attention_switching", "reverse": True,
        "text": "En un encuentro colectivo, puedo seguir el hilo de varias conversaciones simultáneamente.",
    },
    {
        "id": "q11", "dimension": "social_skill", "reverse": True,
        "text": "Me muevo con fluidez en los espacios donde se entrelazan las energías de otras personas.",
    },
    {
        "id": "q12", "dimension": "attention_to_detail", "reverse": False,
        "text": "Tiendo a percibir detalles que otros no registran.",
    },
    {
        "id": "q13", "dimension": "social_skill", "reverse": False,
        "text": "Siento mayor afinidad con el silencio de la biblioteca que con el bullicio de una celebración.",
    },
    {
        "id": "q14", "dimension": "imagination", "reverse": True,
        "text": "Inventar y narrar historias me resulta algo completamente natural.",
    },
    {
        "id": "q15", "dimension": "social_skill", "reverse": True,
        "text": "Me siento atraído hacia las almas más que hacia los objetos y las cosas.",
    },
    {
        "id": "q16", "dimension": "attention_switching", "reverse": False,
        "text": "Tengo campos de interés muy profundos y me genera malestar no poder habitarlos libremente.",
    },
    {
        "id": "q17", "dimension": "communication", "reverse": True,
        "text": "Disfruto de la conversación ligera y espontánea en el encuentro cotidiano.",
    },
    {
        "id": "q18", "dimension": "communication", "reverse": False,
        "text": "En el diálogo, a veces me cuesta ceder el espacio para que el otro tome la palabra.",
    },
    {
        "id": "q19", "dimension": "attention_to_detail", "reverse": False,
        "text": "El lenguaje de los números y sus patrones me atrae de modo especial.",
    },
    {
        "id": "q20", "dimension": "imagination", "reverse": False,
        "text": "Al leer un relato, me cuesta descifrar las motivaciones internas de sus personajes.",
    },
    {
        "id": "q21", "dimension": "imagination", "reverse": False,
        "text": "La ficción narrativa no despierta en mí un disfrute particular.",
    },
    {
        "id": "q22", "dimension": "social_skill", "reverse": False,
        "text": "Tejo nuevas conexiones del alma con dificultad.",
    },
    {
        "id": "q23", "dimension": "attention_to_detail", "reverse": False,
        "text": "Percibo patrones y estructuras repetitivas en todo lo que observo.",
    },
    {
        "id": "q24", "dimension": "imagination", "reverse": True,
        "text": "Prefiero la experiencia viva del teatro al orden estático de las colecciones y museos.",
    },
    {
        "id": "q25", "dimension": "attention_switching", "reverse": True,
        "text": "Las alteraciones en el flujo habitual de mi día no me generan perturbación.",
    },
    {
        "id": "q26", "dimension": "communication", "reverse": False,
        "text": "Con frecuencia no sé cómo sostener el hilo de una conversación.",
    },
    {
        "id": "q27", "dimension": "communication", "reverse": True,
        "text": "Puedo descifrar con facilidad lo que no se dice en las palabras del otro.",
    },
    {
        "id": "q28", "dimension": "attention_to_detail", "reverse": True,
        "text": "Suelo mantener mi atención en el conjunto más que en los pequeños detalles.",
    },
    {
        "id": "q29", "dimension": "attention_to_detail", "reverse": True,
        "text": "Las cadenas de datos como secuencias numéricas no se fijan con facilidad en mi memoria.",
    },
    {
        "id": "q30", "dimension": "attention_to_detail", "reverse": True,
        "text": "Los cambios sutiles en el ambiente o en la apariencia de otros no suelen llegar a mi conciencia.",
    },
    {
        "id": "q31", "dimension": "communication", "reverse": True,
        "text": "Percibo con claridad cuando mi interlocutor ha perdido el interés en lo que le comunico.",
    },
    {
        "id": "q32", "dimension": "attention_switching", "reverse": True,
        "text": "Me resulta natural sostener varias corrientes de atención de forma simultánea.",
    },
    {
        "id": "q33", "dimension": "communication", "reverse": False,
        "text": "Cuando me comunico sin presencia directa, no siempre sé cuándo es mi turno de intervenir.",
    },
    {
        "id": "q34", "dimension": "attention_switching", "reverse": True,
        "text": "Disfruto de la frescura de actuar sin planificar, siguiendo el impulso del momento.",
    },
    {
        "id": "q35", "dimension": "communication", "reverse": False,
        "text": "Suelo ser el último en captar el núcleo de un juego de palabras o una broma.",
    },
    {
        "id": "q36", "dimension": "social_skill", "reverse": True,
        "text": "Puedo discernir los estados interiores de otros simplemente al contemplar su presencia.",
    },
    {
        "id": "q37", "dimension": "attention_switching", "reverse": True,
        "text": "Si hay una interrupción en mi camino, retorno al hilo de mi enfoque con facilidad.",
    },
    {
        "id": "q38", "dimension": "communication", "reverse": True,
        "text": "La conversación cotidiana y social fluye con naturalidad en mí.",
    },
    {
        "id": "q39", "dimension": "communication", "reverse": False,
        "text": "Otros me señalan que vuelvo repetidamente al mismo tema.",
    },
    {
        "id": "q40", "dimension": "imagination", "reverse": True,
        "text": "De niño, disfrutaba de los juegos donde podía encarnar mundos imaginarios con otros.",
    },
    {
        "id": "q41", "dimension": "imagination", "reverse": False,
        "text": "Me gusta acumular información sobre categorías de cosas, creando mi propia taxonomía interior.",
    },
    {
        "id": "q42", "dimension": "imagination", "reverse": False,
        "text": "Me resulta difícil sumergirme de verdad en la perspectiva de otra persona desde adentro.",
    },
    {
        "id": "q43", "dimension": "attention_switching", "reverse": False,
        "text": "Cuando participo en algo, prefiero haberlo trazado con cuidado de antemano.",
    },
    {
        "id": "q44", "dimension": "social_skill", "reverse": True,
        "text": "Los encuentros colectivos son momentos de júbilo y conexión para mí.",
    },
    {
        "id": "q45", "dimension": "social_skill", "reverse": False,
        "text": "Descifrar las intenciones ocultas del otro me resulta difícil.",
    },
    {
        "id": "q46", "dimension": "attention_switching", "reverse": False,
        "text": "Las situaciones nuevas me generan inquietud interior.",
    },
    {
        "id": "q47", "dimension": "social_skill", "reverse": True,
        "text": "Me alegra abrirme al encuentro con almas que aún no conozco.",
    },
    {
        "id": "q48", "dimension": "social_skill", "reverse": True,
        "text": "Soy hábil para navegar las aguas del encuentro con tino y elegancia.",
    },
    {
        "id": "q49", "dimension": "attention_to_detail", "reverse": True,
        "text": "Las fechas de nacimiento de quienes forman parte de mi mundo no permanecen grabadas en mí.",
    },
    {
        "id": "q50", "dimension": "imagination", "reverse": True,
        "text": "Encarnar mundos de fantasía junto a niños en sus juegos me resulta algo natural.",
    },
]

AQ_KABBALAH_METADATA = {
    "code": "aq_kabbalah",
    "name": "AQ-Kabbalah — Espectro de Conciencia Cabalístico",
    "items_count": 50,
    "scale": "binario: 0=En desacuerdo, 1=De acuerdo",
    "screener_threshold": 26,
    "high_threshold": 32,
    "subscales": {
        "social_skill": {"label": "Habilidad Social", "sephirot": "Netzach-Hod", "items": [1,11,13,15,22,36,44,45,47,48]},
        "attention_switching": {"label": "Cambio de Atención", "sephirot": "Tiferet-Yesod", "items": [2,4,10,16,25,32,34,37,43,46]},
        "attention_to_detail": {"label": "Atención al Detalle", "sephirot": "Binah-Hokhmah", "items": [5,6,9,12,19,23,28,29,30,49]},
        "communication": {"label": "Comunicación", "sephirot": "Chesed-Gevurah", "items": [7,17,18,26,27,31,33,35,38,39]},
        "imagination": {"label": "Imaginación", "sephirot": "Keter-Malkuth", "items": [3,8,14,20,21,24,40,41,42,50]},
    },
    "internal_mapping": "AQ-50 (Baron-Cohen et al. 2001). Texto kabbalístico; no reproducción literal.",
    "disclaimer": "Exploración simbólica no clínica. No constituye diagnóstico de TEA.",
}
