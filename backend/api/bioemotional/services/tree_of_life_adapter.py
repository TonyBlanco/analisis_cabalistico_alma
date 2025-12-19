"""
Adaptador clínico del Árbol de la Vida
Uso: Bio-Emoción (lectura orientativa, no diagnóstica)
NO persistente
"""
from cabala_py.arbol_vida import obtener_interpretacion_sefira

# Mapeo clínico mínimo (ejemplo inicial)
BIO_TO_SEFIRA_MAP = {
    "hígado": "gevurah",
    "control": "gevurah",
    "límites": "gevurah",
    "pulmón": "tiferet",
    "corazón": "tiferet",
    "retención": "yesod",
    "repetición": "yesod",
}

def consult_tree_of_life(bio_term: str):
    """
    Devuelve una lectura orientativa de Árbol de la Vida
    basada en un término bioemocional.
    """
    if not bio_term:
        return None

    key = bio_term.lower()
    sefira_id = BIO_TO_SEFIRA_MAP.get(key)

    if not sefira_id:
        return None

    return {
        "sefira": sefira_id,
        "interpretacion": obtener_interpretacion_sefira(sefira_id),
        "nota": "Lectura orientativa. No constituye diagnóstico clínico."
    }
