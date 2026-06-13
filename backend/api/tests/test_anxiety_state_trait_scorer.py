"""Unit tests for compute_anxiety_state_trait (seed/ID round-trip + completeness guard)."""

from django.test import SimpleTestCase

from api.diagnostics import compute_anxiety_state_trait
from tests.wellness.anxiety_state_trait.stai_bank import (
    FRONTEND_LEGACY_TO_CANONICAL,
    FRONTEND_SELECTED_ITEM_IDS,
    FRONTEND_FIXED_SEED,
)


def _legacy_responses(value: int) -> dict:
    return {legacy_id: value for legacy_id in FRONTEND_LEGACY_TO_CANONICAL.keys()}


class AnxietyStateTraitScorerTests(SimpleTestCase):
    def test_complete_legacy_responses_produce_nonzero_index(self):
        result = compute_anxiety_state_trait({'responses': _legacy_responses(2)})

        self.assertTrue(result.get('processed'))
        self.assertEqual(result['puntuaciones']['indice_0_100'], 50)
        self.assertEqual(result['puntuaciones']['regulacion'], 'Media')
        self.assertIn('regulación', result['interpretacion']['resumen'].lower())

    def test_max_responses_yield_high_regulation(self):
        result = compute_anxiety_state_trait({'responses': _legacy_responses(4)})

        self.assertTrue(result.get('processed'))
        self.assertEqual(result['puntuaciones']['indice_0_100'], 100)
        self.assertEqual(result['puntuaciones']['regulacion'], 'Alta')
        self.assertIn('sólida', result['interpretacion']['resumen'].lower())

    def test_low_regulation_summary_matches_label(self):
        result = compute_anxiety_state_trait({'responses': _legacy_responses(1)})

        self.assertTrue(result.get('processed'))
        self.assertEqual(result['puntuaciones']['regulacion'], 'Baja')
        self.assertIn('ansiedad', result['interpretacion']['resumen'].lower())

    def test_selected_item_ids_round_trip_with_canonical_keys(self):
        responses = {item_id: 2 for item_id in FRONTEND_SELECTED_ITEM_IDS}
        result = compute_anxiety_state_trait({
            'responses': responses,
            'seed': FRONTEND_FIXED_SEED,
            'selected_item_ids': FRONTEND_SELECTED_ITEM_IDS,
        })

        self.assertTrue(result.get('processed'))
        self.assertEqual(result['puntuaciones']['indice_0_100'], 50)

    def test_missing_responses_return_processed_false(self):
        partial = {'anst-state-1': 2}
        result = compute_anxiety_state_trait({'responses': partial})

        self.assertFalse(result.get('processed'))
        self.assertIn('incompletas', result.get('message', '').lower())

    def test_seed_without_matching_ids_and_no_legacy_returns_false(self):
        result = compute_anxiety_state_trait({
            'responses': {'E_TENS_001': 2},
            'seed': 999,
            'selected_item_ids': ['E_TENS_001'],
        })

        self.assertFalse(result.get('processed'))

    def test_empty_payload_returns_processed_false(self):
        result = compute_anxiety_state_trait({'responses': {}})

        self.assertFalse(result.get('processed'))