"""
EAT-26 synthetic bank (26 items) - user requested synthetic bank (Option A).
Includes synthetic items, scoring mapping and cutoff (>=20 referral recommended).
"""
from typing import List, Dict, Optional
import json
import csv

# Synthetic EAT-26 style items (avoid copying exact copyrighted wording)
EAT26_ITEMS: List[Dict] = [
    {"id": f"EAT26_{i+1:02d}", "instrument": "EAT-26_sintetico", "position": i+1, "text": text, "scale": "Eating_Attitudes", "weight": 1}
    for i, text in enumerate([
        "Me preocupo mucho por el control de mi peso.",
        "Me siento culpable después de comer en exceso.",
        "Pienso a menudo en querer adelgazar.",
        "Evito comidas sociales por miedo a perder control.",
        "Me siento fuera de control al comer ciertos alimentos.",
        "Cuento las calorías con regularidad.",
        "Me siento satisfecho/a con mi figura. (invertido)",
        "Hago esfuerzos para limitar lo que como.",
        "Hago ejercicio excesivamente para compensar lo que como.",
        "Me siento feliz cuando controlo mi ingesta de comida. (invertido)",
        "Me peso frecuentemente para vigilar mi cuerpo.",
        "Evito comer cuando estoy preocupado/a por mi peso.",
        "Me gustaría perder una gran cantidad de peso.",
        "Pienso en métodos para hacerme vomitar o purgar. (si/no conducta)",
        "Mi bienestar diario se ve afectado por pensamientos sobre la comida.",
        "Me siento ansioso/a si como algo que considero 'prohibido'.",
        "Hago dietas extremas para perder peso.",
        "Siento atracones de comida que luego me avergüenzan.",
        "Evito ciertos alimentos incluso si me gustan.",
        "Siento que mi forma de comer afecta mi autoestima.",
        "Me siento feliz con mi cuerpo la mayor parte del tiempo. (invertido)",
        "Me esfuerzo por controlar la cantidad que como en cada comida.",
        "Me preocupo por la idea de engordar aunque esté delgado/a.",
        "A veces me siento fuera de control con la comida en privado.",
        "La comida ocupa mucho de mi tiempo pensando o planeando."
    ])]

# Scoring mapping typical for EAT-26: Always/Usually/Often = 3/2/1; Sometimes/Rarely/Never = 0 ; some items invert scoring
EAT26_INVERT_IDS = {"EAT26_07","EAT26_10","EAT26_21"}  # sample invert items (synthetic)

RESPONSE_MAP = {
    "Always": 3,
    "Usually": 2,
    "Often": 1,
    "Sometimes": 0,
    "Rarely": 0,
    "Never": 0
}


def export_json(path: str = "eat26_items.json") -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(EAT26_ITEMS, f, ensure_ascii=False, indent=2)


def export_csv(path: str = "eat26_items.csv") -> None:
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id","instrument","position","text","scale","weight"])
        writer.writeheader()
        for it in EAT26_ITEMS:
            writer.writerow(it)


def score_eat26(responses: Dict[str, str]) -> Dict[str, Optional[object]]:
    """
    responses: mapping id -> response string (Always/Usually/Often/Sometimes/Rarely/Never)
    returns total score (>=20 referral recommended) and note about inverted items
    """
    total = 0
    for it in EAT26_ITEMS:
        r = responses.get(it["id"])
        if r is None:
            return {"total": None, "referral": None, "note": "Missing responses"}
        score = RESPONSE_MAP.get(r, None)
        if score is None:
            return {"total": None, "referral": None, "note": f"Invalid response value: {r}"}
        if it["id"] in EAT26_INVERT_IDS:
            # invert (3->0,2->1,1->2,0->3) simple inversion across 0-3 range
            score = 3 - score
        total += score
    referral = total >= 20
    return {"total": total, "referral": referral, "note": "Synthetic EAT-26 style scoring; verify with official guidelines before clinical use"}

if __name__ == "__main__":
    export_json()
    export_csv()
    print("Exported synthetic EAT-26 JSON/CSV and scoring.")
