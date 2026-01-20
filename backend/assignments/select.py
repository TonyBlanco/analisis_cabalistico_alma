import hashlib
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple


_BANK_CACHE: List[Dict] = []


def _load_bank_items() -> List[Dict]:
    global _BANK_CACHE
    if _BANK_CACHE:
        return _BANK_CACHE

    root = Path(__file__).resolve().parents[1]
    json_path = root.parent / "mcmi4_items.json"
    if json_path.exists():
        with json_path.open("r", encoding="utf-8") as handle:
            _BANK_CACHE = json.load(handle)
        return _BANK_CACHE

    try:
        from mcmi4_bank import MCMI4_ITEMS
        _BANK_CACHE = list(MCMI4_ITEMS)
    except Exception:
        _BANK_CACHE = []
    return _BANK_CACHE


def _hash_questions(questions: List[str]) -> str:
    payload = "|".join(questions).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def select_questions(patient_id: int, test_type: str, n: int = 195) -> Tuple[List[str], Dict]:
    from api.test_models import Assignment

    items = _load_bank_items()
    question_ids = [item.get("id") for item in items if item.get("id")]
    total = len(question_ids)
    if total == 0:
        return [], {
            "collision": True,
            "collision_count": 0,
            "total_available": 0,
            "total_pool": 0,
            "questions_hash": "",
        }

    used = set()
    for assignment in Assignment.objects.filter(patient_id=patient_id, test_type=test_type):
        used.update(assignment.questions or [])

    available = [qid for qid in question_ids if qid not in used]
    seed = f"{patient_id}:{test_type}:{len(used)}"
    rng = random.Random(seed)

    selected: List[str] = []
    collisions: List[str] = []

    if len(available) >= n:
        rng.shuffle(available)
        selected = available[:n]
    else:
        rng.shuffle(available)
        selected = list(available)
        remaining = n - len(selected)
        pool = list(question_ids)
        rng.shuffle(pool)
        idx = 0
        while len(selected) < n:
            selected.append(pool[idx % len(pool)])
            idx += 1
        collisions = [qid for qid in selected if qid in used]

    meta = {
        "collision": len(collisions) > 0,
        "collision_count": len(collisions),
        "total_available": len(available),
        "total_pool": total,
        "questions_hash": _hash_questions(selected),
    }
    return selected, meta
