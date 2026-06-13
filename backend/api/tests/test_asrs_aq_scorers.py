"""
Unit tests for compute_asrs_essence and compute_aq_kabbalah scorers.

Scorer contract:
  compute_asrs_essence  → backend/api/diagnostics.py
  compute_aq_kabbalah   → backend/api/diagnostics.py

Both functions are pure (no DB, no network).
"""

from django.test import SimpleTestCase

from api.diagnostics import compute_asrs_essence, compute_aq_kabbalah


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _asrs(overrides: dict | None = None) -> dict:
    """Return ASRS responses (all 0) with optional key overrides."""
    base = {f'q{i}': 0 for i in range(1, 7)}
    if overrides:
        base.update(overrides)
    return {'responses': base}


def _aq(overrides: dict | None = None) -> dict:
    """Return AQ responses (all 0 = En desacuerdo) with optional overrides."""
    base = {f'q{i}': 0 for i in range(1, 51)}
    if overrides:
        base.update(overrides)
    return {'responses': base}


# ===========================================================================
# compute_asrs_essence — 8 tests
# ===========================================================================

class AsrsEssenceTests(SimpleTestCase):
    """Unit tests for the ASRS-Essence (ASRS Part A) scorer."""

    def test_all_zeros_returns_negative_screener(self):
        """All zeros → zone_count=0, screener_positive=False."""
        result = compute_asrs_essence(_asrs())
        self.assertTrue(result['processed'])
        sd = result['structured_data']
        self.assertEqual(sd['zone_count'], 0)
        self.assertFalse(sd['screener_positive'])
        self.assertEqual(sd['tiferet_state'], 'anchored')
        self.assertFalse(sd['referral_recommended'])

    def test_exactly_4_items_in_zone_is_positive(self):
        """≥4 items in zone → screener_positive=True.

        q1-q3 threshold=2, q4-q6 threshold=3.
        Set q1=2, q2=2, q3=2, q4=3 → 4 items in zone.
        """
        result = compute_asrs_essence(_asrs({'q1': 2, 'q2': 2, 'q3': 2, 'q4': 3}))
        sd = result['structured_data']
        self.assertEqual(sd['zone_count'], 4)
        self.assertTrue(sd['screener_positive'])
        self.assertEqual(sd['tiferet_state'], 'fragmented')
        self.assertTrue(sd['referral_recommended'])

    def test_3_items_in_zone_is_negative(self):
        """3 items in zone → screener_positive=False, tiferet_state=fluctuating."""
        result = compute_asrs_essence(_asrs({'q1': 2, 'q2': 2, 'q3': 2}))
        sd = result['structured_data']
        self.assertEqual(sd['zone_count'], 3)
        self.assertFalse(sd['screener_positive'])
        self.assertEqual(sd['tiferet_state'], 'fluctuating')

    def test_all_max_returns_positive(self):
        """All 4 → zone_count=6, screener_positive=True."""
        result = compute_asrs_essence(_asrs({f'q{i}': 4 for i in range(1, 7)}))
        sd = result['structured_data']
        self.assertEqual(sd['zone_count'], 6)
        self.assertTrue(sd['screener_positive'])

    def test_q1_threshold_boundary(self):
        """q1 threshold=2: value=1 not in zone, value=2 in zone."""
        not_in = compute_asrs_essence(_asrs({'q1': 1}))
        in_zone = compute_asrs_essence(_asrs({'q1': 2}))
        self.assertNotIn('q1', not_in['structured_data']['items_in_zone'])
        self.assertIn('q1', in_zone['structured_data']['items_in_zone'])

    def test_q4_threshold_boundary(self):
        """q4 threshold=3: value=2 not in zone, value=3 in zone."""
        not_in = compute_asrs_essence(_asrs({'q4': 2}))
        in_zone = compute_asrs_essence(_asrs({'q4': 3}))
        self.assertNotIn('q4', not_in['structured_data']['items_in_zone'])
        self.assertIn('q4', in_zone['structured_data']['items_in_zone'])

    def test_incomplete_payload_returns_processed_false(self):
        """Missing required keys → processed=False."""
        result = compute_asrs_essence({'responses': {'q1': 2, 'q2': 1}})
        self.assertFalse(result['processed'])
        self.assertIsNone(result['structured_data'])

    def test_deterministic(self):
        """Same input → same structured_data."""
        responses = {f'q{i}': (i % 5) for i in range(1, 7)}
        r1 = compute_asrs_essence({'responses': dict(responses)})
        r2 = compute_asrs_essence({'responses': dict(responses)})
        self.assertEqual(r1['structured_data'], r2['structured_data'])


# ===========================================================================
# compute_aq_kabbalah — 8 tests
# ===========================================================================

class AqKabbalahTests(SimpleTestCase):
    """Unit tests for the AQ-Kabbalah scorer."""

    def test_all_zeros_scores_reverse_items(self):
        """All-disagree (0) → only reverse items score. Expected = 26 reverse items."""
        result = compute_aq_kabbalah(_aq())
        self.assertTrue(result['processed'])
        sd = result['structured_data']
        # AQ-Kabbalah has 26 reverse items (disagree=autism direction)
        self.assertEqual(sd['total_score'], 26)
        self.assertTrue(sd['screener_positive'])

    def test_all_ones_scores_non_reverse_items(self):
        """All-agree (1) → only non-reverse items score. Expected = 24 non-reverse items."""
        result = compute_aq_kabbalah(_aq({f'q{i}': 1 for i in range(1, 51)}))
        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 24)
        self.assertFalse(sd['screener_positive'])

    def test_screener_threshold_at_26(self):
        """Total 25 → no screener; total 26 → screener_positive."""
        # All zeros gives 26 (all reverse items score). So all-zeros is already positive.
        # To get exactly 25: agree on 1 reverse item (losing 1 point from 26).
        # Reverse items include q1 (item 1, reverse=True). Set q1=1 to lose that point.
        result_25 = compute_aq_kabbalah(_aq({'q1': 1}))  # 26 - 1 = 25
        self.assertEqual(result_25['structured_data']['total_score'], 25)
        self.assertFalse(result_25['structured_data']['screener_positive'])

        result_26 = compute_aq_kabbalah(_aq())  # 26 = all reverse items
        self.assertTrue(result_26['structured_data']['screener_positive'])

    def test_high_positive_threshold_at_32(self):
        """total >= 32 → high_positive=True."""
        # All-zeros gives 26. Need 6 more non-reverse items to score.
        # Non-reverse items include q2, q4, q5, q6, q7, q9 (among others).
        agrees = {f'q{i}': 1 for i in [2, 4, 5, 6, 7, 9]}  # 6 non-reverse items
        result = compute_aq_kabbalah(_aq(agrees))  # 26 + 6 = 32
        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 32)
        self.assertTrue(sd['high_positive'])
        self.assertEqual(sd['spectrum_label'], 'alta_intensidad')

    def test_subscale_scores_sum_to_total(self):
        """Sum of all subscale scores equals total_score."""
        responses = {f'q{i}': (i % 2) for i in range(1, 51)}
        result = compute_aq_kabbalah({'responses': responses})
        sd = result['structured_data']
        subscale_sum = sum(sd['subscale_scores'].values())
        self.assertEqual(subscale_sum, sd['total_score'])

    def test_each_subscale_max_is_10(self):
        """Subscale scores are bounded 0-10."""
        result = compute_aq_kabbalah(_aq())
        for key, score in result['structured_data']['subscale_scores'].items():
            self.assertGreaterEqual(score, 0, f'{key} below 0')
            self.assertLessEqual(score, 10, f'{key} above 10')

    def test_referral_false_when_below_high_positive(self):
        """referral_recommended only at total >= 32 (governance §5)."""
        screener_only = compute_aq_kabbalah(_aq())  # 26 → screener, not referral
        self.assertTrue(screener_only['structured_data']['screener_positive'])
        self.assertFalse(screener_only['structured_data']['referral_recommended'])

        below = compute_aq_kabbalah(_aq({'q1': 1}))  # 25 → no screener
        self.assertFalse(below['structured_data']['referral_recommended'])

    def test_referral_true_at_high_positive(self):
        """total >= 32 → referral_recommended=True."""
        agrees = {f'q{i}': 1 for i in [2, 4, 5, 6, 7, 9]}
        result = compute_aq_kabbalah(_aq(agrees))
        self.assertTrue(result['structured_data']['high_positive'])
        self.assertTrue(result['structured_data']['referral_recommended'])

    def test_incomplete_payload_returns_processed_false(self):
        """Missing required keys → processed=False."""
        result = compute_aq_kabbalah({'responses': {f'q{i}': 0 for i in range(1, 10)}})
        self.assertFalse(result['processed'])
        self.assertIsNone(result['structured_data'])
