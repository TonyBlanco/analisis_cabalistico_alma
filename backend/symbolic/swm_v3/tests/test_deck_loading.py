"""SWM v3 deck loading for extended tarot systems."""
from django.test import SimpleTestCase

from symbolic.swm_v3.views import (
    generate_educational_reading,
    load_deck_for_system,
    normalize_system_id,
)


class SwmV3DeckLoadingTests(SimpleTestCase):
    def test_normalize_marseille_alias(self):
        self.assertEqual(normalize_system_id("marseille"), "marsella")

    def test_load_marsella_deck_has_22_cards(self):
        deck = load_deck_for_system("marsella")
        self.assertEqual(len(deck.get("majorArcana", [])), 22)

    def test_load_rider_waite_deck_has_22_cards(self):
        deck = load_deck_for_system("rider-waite")
        self.assertEqual(len(deck.get("majorArcana", [])), 22)

    def test_load_rota_deck_has_22_cards(self):
        deck = load_deck_for_system("rota")
        self.assertEqual(len(deck.get("majorArcana", [])), 22)

    def test_load_oracle_symbolic_deck_has_22_cards(self):
        deck = load_deck_for_system("oracle-symbolic")
        self.assertEqual(len(deck.get("majorArcana", [])), 22)

    def test_generate_reading_marsella_returns_cards(self):
        payload = generate_educational_reading(
            system_id="marsella",
            selected_cards=[],
            spread_type="simple",
        )
        self.assertGreaterEqual(len(payload.get("cards", [])), 1)
        self.assertTrue(payload.get("system", {}).get("implemented"))