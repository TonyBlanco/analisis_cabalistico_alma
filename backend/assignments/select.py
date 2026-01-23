import hashlib
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple


_BANK_CACHE: List[Dict] = []


def _load_bank_items() -> List[Dict]:
    """
    Load MCMI-4 Místico question bank from the real JSON files.
    
    NOTE: The legacy mcmi4_items.json and mcmi4_bank.py are DEPRECATED.
    This function now loads from backend/data/mcmi4_mystic_questions_*.json
    """
    global _BANK_CACHE
    if _BANK_CACHE:
        return _BANK_CACHE

    # Load from the real MCMI-4 Místico question bank (4 worlds)
    root = Path(__file__).resolve().parents[1]  # backend/
    data_dir = root / "data"
    
    worlds = ['atzilut', 'briah', 'yetzirah', 'assiah']
    items = []
    
    for world in worlds:
        json_path = data_dir / f"mcmi4_mystic_questions_{world}.json"
        if json_path.exists():
            try:
                with json_path.open("r", encoding="utf-8") as handle:
                    world_data = json.load(handle)
                    # Extract questions from each dimension
                    dimensions = world_data.get('dimensions', {})
                    for dim_key, dim_data in dimensions.items():
                        for q in dim_data.get('questions', []):
                            items.append({
                                'id': q.get('id'),
                                'world': world,
                                'dimension_id': dim_data.get('dimension_id'),
                                'sefirah': dim_data.get('sefirah'),
                                'text': q.get('text'),
                                'reverse_scored': q.get('reverse_scored', False),
                                'weight': q.get('weight', 1.0),
                            })
            except Exception as e:
                print(f"Warning: Could not load {json_path}: {e}")
    
    _BANK_CACHE = items
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
