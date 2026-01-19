"""
SWM MCMI-4 SIGNAL synthetic bank (16 items).
Minimal symbolic signal, non-clinical, no diagnostic scoring.
"""
from typing import List, Dict
import json
import csv

MCMI4_SIGNAL_ITEMS: List[Dict] = [
    {
        "id": f"MCMI4_SIGNAL_{i+1:02d}",
        "instrument": "SWM_MCMI4_SIGNAL",
        "position": i + 1,
        "text": text,
        "scale": "symbolic_signal",
        "weight": 1
    }
    for i, text in enumerate([
        "Percibo patrones repetitivos en mi día a día.",
        "Siento que mis elecciones tienen un eco simbólico.",
        "Me resulta fácil reconocer mis ciclos personales.",
        "Identifico señales sutiles que orientan mis decisiones.",
        "Mi energía cambia de forma clara según el contexto.",
        "Me tomo pausas para observar antes de actuar.",
        "Puedo sostener una intención sin dispersarme.",
        "Siento coherencia entre lo que pienso y lo que hago.",
        "Tengo claridad sobre mis límites personales.",
        "Percibo cambios internos antes de que ocurran externamente.",
        "Sostengo mis decisiones aunque el entorno cambie.",
        "Me adapto sin perder mi foco principal.",
        "Identifico con facilidad lo que me desequilibra.",
        "Puedo volver al centro después de una tensión.",
        "Me es natural traducir experiencias en aprendizajes.",
        "Reconozco cuándo necesito silencio o pausa."
    ])
]


def export_json(path: str = "mcmi4_signal_items.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(MCMI4_SIGNAL_ITEMS, f, ensure_ascii=False, indent=2)


def export_csv(path: str = "mcmi4_signal_items.csv") -> None:
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in MCMI4_SIGNAL_ITEMS:
            writer.writerow(it)


if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported SWM MCMI-4 SIGNAL JSON/CSV.")
