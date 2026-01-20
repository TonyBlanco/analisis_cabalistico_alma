"""
AUDIT synthetic bank (10 items) - user requested synthetic bank (Option A).
Includes synthetic items and a simple scoring function (0-40) with common cutoffs.
"""
from typing import List, Dict, Optional
import json
import csv

AUDIT_ITEMS: List[Dict] = [
    {"id": f"AUDIT_{i+1:02d}", "instrument": "AUDIT_sintetico", "position": i+1, "text": text, "scale": "Alcohol", "weight": 1}
    for i, text in enumerate([
        "¿Con qué frecuencia tomas una bebida al día?",
        "¿Cuántas bebidas tomas en un día típico cuando bebes?",
        "¿Con qué frecuencia tomas 6 o más bebidas en una sola ocasión?",
        "¿Con qué frecuencia sientes que no puedes dejar de beber una vez que empiezas?",
        "¿Con qué frecuencia no puedes cumplir con tus responsabilidades por beber?",
        "¿Alguna vez has necesitado un trago por la mañana para calmarte o curar una resaca?",
        "¿Has tenido sentimientos de culpa o remordimiento por beber?",
        "¿Alguna vez has olvidado lo que hiciste mientras bebías?",
        "¿Alguna vez alguien se preocupó por tu consumo de alcohol o te sugirió reducirlo?",
        "¿Has tenido lesiones debido al alcohol (tuyas o de otra persona)?"
    ])]

# For simplicity: expect numeric responses where appropriate (0-4). Sum them to 0-40.
# Common cutoffs: >=8 hazardous; >=15 likely dependence; >=20 severe dependence


def export_json(path: str = "audit_items.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(AUDIT_ITEMS, f, ensure_ascii=False, indent=2)


def export_csv(path: str = "audit_items.csv") -> None:
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in AUDIT_ITEMS:
            writer.writerow(it)


def score_audit(responses: Dict[str, int]) -> Dict[str, Optional[object]]:
    total = 0
    for it in AUDIT_ITEMS:
        v = responses.get(it["id"])
        if v is None:
            return {"total": None, "zone": None, "note": "Missing responses"}
        total += v
    if total >= 20:
        zone = "Severe dependence"
    elif total >= 15:
        zone = "Likely dependence"
    elif total >= 8:
        zone = "Hazardous use"
    else:
        zone = "Low risk"
    return {"total": total, "zone": zone}

if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported AUDIT synthetic JSON/CSV and scoring.")
