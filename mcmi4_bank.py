"""
Banco sintético para MCMI-IV (195 ítems originales).
Estructura simplificada y orientativa: items originales creados para uso de investigación/wellness,
no reproducen textos con copyright de MCMI-IV.

Metadatos incluidos:
- id
- instrument
- scale (escala clínica o validez)
- facet (opcional)
- intensity
- weight
- text
- reverse_scored

Incluye funciones de selección y exportación JSON.
"""

from typing import List, Dict, Optional
import random
import json

# 25 escalas clínicas (nombres abreviados, originales y adaptados)
CLINICAL_SCALES = [
    "esquizoide", "esquizoide_personalidad_severa", "esquizotipico", "paranoide",
    "introversion_egocentrica", "dependencia", "depresion_clinica", "ansiedad_clinica",
    "trastorno_bipolar", "trastorno_de_personalidad_limite", "antisocial", "narcisista",
    "histrionico", "obsesivo_compulsivo_personalidad", "evitativo",
    "distimia", "consumo_sustancias", "trastorno_sueño", "ideacion_suicida",
    "trastorno_psicotico", "ansiedad_social", "conducta_impulsiva", "tempestuoso",
    "vulnerabilidad_emocional", "agotamiento"
]

# 45 facetas (nombres de ejemplo)
FACETS = [f"facet_{i+1:02d}" for i in range(45)]

# 5 validity/control scales
VALIDITY_SCALES = ["inconsistencia", "deseabilidad_social", "exageracion", "minimizacion", "respuesta_atipica"]

INTENSITIES = ["leve", "moderado", "alto"]

# We'll distribute 195 items across clinical scales and validity scales.
# Strategy: give each clinical scale 7 items -> 25*7=175; remaining 20 items reserved for validity + extra items across major scales -> total 195.


def build_mcmi4_items() -> List[Dict]:
    items: List[Dict] = []
    counter = 1

    # Assign 7 items per clinical scale
    for scale in CLINICAL_SCALES:
        for i in range(7):
            text = f"He experimentado comportamientos o sentimientos relacionados con {scale.replace('_',' ')} (ítem {i+1})."
            item = {
                "id": f"MCMI_CL_{counter:03d}",
                "instrument": "MCMI-IV_sintetico",
                "scale": scale,
                "facet": random.choice(FACETS) if random.random() < 0.6 else None,
                "intensity": INTENSITIES[(i) % len(INTENSITIES)],
                "weight": 1,
                "text": text,
                "reverse_scored": False
            }
            items.append(item)
            counter += 1

    # Distribute remaining items to reach 195 among validity scales
    extras_needed = 195 - len(items)
    # distribute extras_needed approximately evenly across VALIDITY_SCALES
    base = extras_needed // len(VALIDITY_SCALES)
    remainder = extras_needed % len(VALIDITY_SCALES)
    for idx, vs in enumerate(VALIDITY_SCALES):
        count = base + (1 if idx < remainder else 0)
        for i in range(count):
            text = f"(Validación) Ítem sobre {vs.replace('_',' ')} número {i+1}."
            item = {
                "id": f"MCMI_VA_{counter:03d}",
                "instrument": "MCMI-IV_sintetico",
                "scale": vs,
                "facet": None,
                "intensity": "control",
                "weight": 1,
                "text": text,
                "reverse_scored": False
            }
            items.append(item)
            counter += 1

    # Sanity check
    if len(items) != 195:
        raise ValueError(f"Se esperaban 195 ítems, generados: {len(items)}")

    return items


MCMI4_ITEMS = build_mcmi4_items()


def select_items_scdf(n: int = 30, seed: Optional[int] = None, scales: Optional[List[str]] = None) -> List[Dict]:
    if seed is not None:
        random.seed(seed)
    pool = [it for it in MCMI4_ITEMS if (scales is None or it["scale"] in scales)]
    # Stratify by scale
    strat = {}
    for it in pool:
        strat.setdefault(it["scale"], []).append(it)
    selected = []
    keys = list(strat.keys())
    idx = 0
    while len(selected) < n and any(strat.values()):
        key = keys[idx % len(keys)]
        bucket = strat.get(key)
        if bucket:
            choice = random.choice(bucket)
            selected.append(choice)
            bucket.remove(choice)
        idx += 1
    if seed is not None:
        selected = sorted(selected, key=lambda x: (x['scale'], x['id']))
    return selected[:n]


def export_mcmi4_json(path: str = "mcmi4_items.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(MCMI4_ITEMS, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    print(f"MCMI-IV sintético: {len(MCMI4_ITEMS)} ítems")
    export_mcmi4_json()
    print("Exportado mcmi4_items.json")
