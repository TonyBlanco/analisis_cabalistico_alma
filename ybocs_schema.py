"""
Y-BOCS severity schema-only module (10 severity items) - schema-only per user request.
Includes IDs, metadata and scoring function (severity sum 0-40).
"""
from typing import List, Dict, Optional
import json
import csv

YBOCS_ITEMS: List[Dict] = [
    {"id": f"YBOCS_SV_{i+1:02d}", "instrument": "Y-BOCS_severity", "position": i+1, "text": None, "scale": "OCD_severity", "weight": 1}
    for i in range(10)
]

def export_json(path: str = "ybocs_severity_schema.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(YBOCS_ITEMS, f, ensure_ascii=False, indent=2)

def export_csv(path: str = "ybocs_severity_schema.csv") -> None:
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in YBOCS_ITEMS:
            writer.writerow(it)

def score_ybocs(responses: Dict[str, int]) -> Dict[str, Optional[int]]:
    """
    Score Y-BOCS severity items. responses: id -> value (0-4). Returns sum 0-40 and severity band.
    """
    vals = []
    for it in YBOCS_ITEMS:
        v = responses.get(it["id"])
        if v is None:
            return {"raw_sum": None, "severity_band": None, "note": "Missing responses"}
        vals.append(v)
    raw = sum(vals)
    if raw <= 7:
        band = "Subclinical/mild"
    elif raw <= 15:
        band = "Moderate"
    elif raw <= 23:
        band = "Marked"
    else:
        band = "Severe"
    return {"raw_sum": raw, "severity_band": band}

if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported Y-BOCS severity schema JSON/CSV (schema-only).")
