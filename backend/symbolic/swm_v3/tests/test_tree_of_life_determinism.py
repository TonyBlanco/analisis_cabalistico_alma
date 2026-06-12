"""Determinism and uniqueness for tree_of_life educational readings."""
from django.test import SimpleTestCase

from symbolic.swm_v3.views import (
    _consultant_rng,
    _normalize_consultant_name,
    generate_educational_reading,
)


def _card_signature(payload):
    cards = payload.get("cards") or []
    return [
        (c.get("id"), c.get("position", {}).get("id"), bool(c.get("reversed")))
        for c in cards
    ]


class TreeOfLifeDeterminismTests(SimpleTestCase):
    # marsella deck JSON is bundled in-repo; thoth/bota may be absent in minimal dev trees.
    SYSTEM_ID = "marsella"

    def test_normalize_consultant_name_strips_accents(self):
        self.assertEqual(_normalize_consultant_name("  José María  "), "jose maria")

    def test_same_consultant_same_tree_draw_twice(self):
        kwargs = {
            "system_id": self.SYSTEM_ID,
            "selected_cards": [],
            "spread_type": "tree_of_life",
            "consultant_name": "Laura García",
            "consultant_birthdate": "1985-03-14",
        }
        first = generate_educational_reading(**kwargs)
        second = generate_educational_reading(**kwargs)
        self.assertEqual(_card_signature(first), _card_signature(second))
        self.assertEqual(len(first["cards"]), 10)
        self.assertEqual(len(second["cards"]), 10)

    def test_different_consultants_different_draws(self):
        base = {
            "system_id": self.SYSTEM_ID,
            "selected_cards": [],
            "spread_type": "tree_of_life",
        }
        a = generate_educational_reading(
            **base,
            consultant_name="Ana López",
            consultant_birthdate="1990-01-01",
        )
        b = generate_educational_reading(
            **base,
            consultant_name="Beatriz Ruiz",
            consultant_birthdate="1990-01-01",
        )
        self.assertNotEqual(_card_signature(a), _card_signature(b))

    def test_tree_of_life_returns_ten_cards(self):
        payload = generate_educational_reading(
            system_id=self.SYSTEM_ID,
            selected_cards=[],
            spread_type="tree_of_life",
            consultant_name="Test User",
            consultant_birthdate="2000-06-15",
        )
        self.assertEqual(len(payload.get("cards", [])), 10)

    def test_first_card_never_reversed(self):
        payload = generate_educational_reading(
            system_id=self.SYSTEM_ID,
            selected_cards=[],
            spread_type="tree_of_life",
            consultant_name="Seed User",
            consultant_birthdate="1977-12-25",
        )
        self.assertFalse(payload["cards"][0].get("reversed"))

    def test_no_identity_fallback_is_non_repeatable(self):
        first = generate_educational_reading(
            system_id=self.SYSTEM_ID,
            selected_cards=[],
            spread_type="tree_of_life",
        )
        second = generate_educational_reading(
            system_id=self.SYSTEM_ID,
            selected_cards=[],
            spread_type="tree_of_life",
        )
        # Unseeded RNG: extremely unlikely to match twice (not forbidden, but we assert difference)
        self.assertNotEqual(_card_signature(first), _card_signature(second))

    def test_rng_local_not_global_module_seed(self):
        import random as global_random

        global_random.seed(42)
        rng_a = _consultant_rng(self.SYSTEM_ID, "tree_of_life", "Maria", "1990-05-05")
        rng_b = _consultant_rng(self.SYSTEM_ID, "tree_of_life", "Maria", "1990-05-05")
        self.assertEqual(rng_a.sample(range(100), 5), rng_b.sample(range(100), 5))