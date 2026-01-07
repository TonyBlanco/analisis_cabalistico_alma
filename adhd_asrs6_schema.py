"""
ASRS-6 schema-only module (ASRS v1.1 screener) - schema-only by user request.
Contains item IDs, metadata, and placeholder scoring guidance (official algorithm requires the shaded-box method).
"""
from typing import List, Dict, Optional
import json
import csv

ASRS6_ITEMS: List[Dict] = [
    {"id": "ASRS6_001", "instrument": "ASRS_v1.1_screener", "position": 1, "text": None, "scale": "ADHD", "weight": 1},
    {"id": "ASRS6_002", "instrument": "ASRS_v1.1_screener", "position": 2, "text": None, "scale": "ADHD", "weight": 1},
    {"id": "ASRS6_003", "instrument": "ASRS_v1.1_screener", "position": 3, "text": None, "scale": "ADHD", "weight": 1},
    {"id": "ASRS6_004", "instrument": "ASRS_v1.1_screener", "position": 4, "text": None, "scale": "ADHD", "weight": 1},
    {"id": "ASRS6_005", "instrument": "ASRS_v1.1_screener", "position": 5, "text": None, "scale": "ADHD", "weight": 1},
    {"id": "ASRS6_006", "instrument": "ASRS_v1.1_screener", "position": 6, "text": None, "scale": "ADHD", "weight": 1},
]

def export_json(path: str = "asrs6_schema.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(ASRS6_ITEMS, f, ensure_ascii=False, indent=2)

def export_csv(path: str = "asrs6_schema.csv") -> None:
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in ASRS6_ITEMS:
            writer.writerow(it)

def score_asrs6(responses: Dict[str, int]) -> Dict[str, Optional[int]]:
    """
    Placeholder scorer for ASRS-6. `responses` should map item id -> numeric response (0-4).
    Official ASRS-6 screener uses a shaded-box threshold algorithm (see Harvard HCP site).
    This function returns raw_sum and a flag `possible_ADHD` determined by a simple threshold
    (sum >= 9) as a conservative proxy. Use official scoring for clinical decisions.
    """
    vals = []
    for it in ASRS6_ITEMS:
        v = responses.get(it["id"])
        if v is None:
            return {"raw_sum": None, "possible_ADHD": None, "note": "Missing responses"}
        vals.append(v)
    raw_sum = sum(vals)
    possible = raw_sum >= 9
    return {"raw_sum": raw_sum, "possible_ADHD": possible, "note": "Proxy scoring - replace with official shaded-box algorithm for clinical use"}

if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported ASRS-6 schema JSON/CSV (schema-only).")
