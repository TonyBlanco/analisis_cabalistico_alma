"""
PCL-5 synthetic bank (20 items) - user allowed synthetic bank (Option A).
Includes items (synthetic paraphrase), scoring (0-4 sum), cluster sums and provisional cutoff check.
"""
from typing import List, Dict, Optional
import json
import csv

# 20 synthetic PCL-5-style items (original phrasing avoided; items map to DSM-5 clusters 1-20)
PCL5_ITEMS: List[Dict] = [
    {"id": f"PCL5_{i+1:02d}", "instrument": "PCL-5_sintetico", "position": i+1, "text": text, "scale": "PTSD", "weight": 1}
    for i, text in enumerate([
        "He tenido recuerdos angustiosos e intrusivos del evento traumático.",
        "He tenido sueños perturbadores relacionados con el trauma.",
        "Siento que los recuerdos del trauma me vienen a la mente sin querer.",
        "Me asaltan reacciones emocionales intensas al recordar el trauma.",
        "Evito pensar o hablar sobre el evento traumático.",
        "Evito lugares, personas o actividades que me recuerdan el trauma.",
        "No puedo recordar partes importantes del evento traumático.",
        "Tengo creencias negativas persistentes sobre mí o el mundo.",
        "Siento culpa o vergüenza excesiva relacionada con lo ocurrido.",
        "He perdido interés en actividades que antes disfrutaba.",
        "Tengo dificultad para sentir emociones positivas.",
        "Me siento irritable o tengo arrebatos de ira sin motivo claro.",
        "Tengo dificultades para concentrarme en tareas sencillas.",
        "Me sobresalto o me siento hipervigilante con facilidad.",
        "Tengo problemas para dormir o me despierto a menudo.",
        "Evito recordar detalles del trauma por miedo a alterarme.",
        "Siento que el trauma ha cambiado mi forma de ver el mundo.",
        "Experimento reacciones físicas intensas cuando algo me recuerda el trauma.",
        "Me cuesta confiar en la gente desde que ocurrió el evento.",
        "He notado disminución de mi sensación de seguridad personal."
    ])]

# Clusters mapping (DSM-5 clusters B/C/D/E) - mapping by item indices
CLUSTERS = {
    "B": list(range(1,6)),   # intrusion (items 1-5)
    "C": list(range(6,8+1)), # avoidance (6-7) plus num adjusting; keep simple mapping
    "D": list(range(8,15)),  # negative alterations (8-14)
    "E": list(range(14,21))  # arousal/reactivity (15-20)
}


def export_json(path: str = "pcl5_items.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(PCL5_ITEMS, f, ensure_ascii=False, indent=2)


def export_csv(path: str = "pcl5_items.csv") -> None:
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in PCL5_ITEMS:
            writer.writerow(it)


def score_pcl5(responses: Dict[str, int]) -> Dict[str, Optional[object]]:
    """
    responses: mapping id->0..4
    returns: total (0-80), cluster sums and probable PTSD boolean (cutoff 31 by default)
    """
    vals = []
    for it in PCL5_ITEMS:
        v = responses.get(it["id"]) if responses else None
        if v is None:
            return {"total": None, "clusters": None, "probable_PTSD": None, "note":"Missing responses"}
        vals.append(v)
    total = sum(vals)
    clusters_sum = {}
    # compute clusters based on CLUSTERS mapping
    for k, idxs in CLUSTERS.items():
        s = 0
        for idx in idxs:
            # items are 1-based positions
            if 1 <= idx <= len(PCL5_ITEMS):
                s += responses.get(f"PCL5_{idx:02d}",0)
        clusters_sum[k] = s
    probable = total >= 31
    return {"total": total, "clusters": clusters_sum, "probable_PTSD": probable}

if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported PCL-5 synthetic JSON/CSV and scoring function.")
