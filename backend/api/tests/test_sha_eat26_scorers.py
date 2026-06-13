"""
Unit tests for compute_sha_harmony and compute_eat26_spirit scorers.

Scorer contract:
  compute_sha_harmony  → backend/api/diagnostics.py
  compute_eat26_spirit → backend/api/diagnostics.py

Both functions are pure (no DB, no network) and can be exercised directly
using Django TestCase (for test discovery compatibility with manage.py test).
"""

from django.test import SimpleTestCase

from api.diagnostics import compute_sha_harmony, compute_eat26_spirit


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sha_all(value: int) -> dict:
    """Return SHA responses where all 10 questions have the same raw value."""
    return {'responses': {f'q{i}': value for i in range(1, 11)}}


def _eat26_all(value: int) -> dict:
    """Return EAT-26 responses where all 26 questions have the same raw value."""
    return {'responses': {f'q{i}': value for i in range(1, 27)}}


# ===========================================================================
# compute_sha_harmony — 6 tests
# ===========================================================================

class ShaHarmonyTests(SimpleTestCase):
    """Unit tests for the SHA (Sephirotic Harmony Audit) scorer."""

    # ------------------------------------------------------------------
    # 1. All zeros → total_score=0, risk_zone='low'
    # ------------------------------------------------------------------
    def test_sha_all_zeros_returns_low_zone(self):
        """Arrange: all 10 responses = 0.
        Q1-Q8 contribute 0 each; Q9/Q10 special (0→0pts).
        Total = 0. Zone = low (<=7).
        """
        result = compute_sha_harmony(_sha_all(0))

        self.assertTrue(result['processed'])
        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 0)
        self.assertEqual(sd['risk_zone'], 'low')

    # ------------------------------------------------------------------
    # 2. Moderate zone — responses summing to a score in [8, 15]
    # ------------------------------------------------------------------
    def test_sha_moderate_zone(self):
        """Arrange: Q1-Q8 each = 1 (8 pts), Q9=Q10 = 0 (0 pts).
        Total = 8. Zone = moderate (8 <= 15).
        """
        responses = {f'q{i}': 1 for i in range(1, 9)}
        responses['q9'] = 0
        responses['q10'] = 0
        result = compute_sha_harmony({'responses': responses})

        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 8)
        self.assertEqual(sd['risk_zone'], 'moderate')

    # ------------------------------------------------------------------
    # 3. Severe zone — max responses produce total_score=40, risk_zone='severe'
    # ------------------------------------------------------------------
    def test_sha_severe_zone(self):
        """Arrange: Q1-Q8 = 4 (4 pts each = 32), Q9=Q10 = 2 (4 pts each = 8).
        Total = 40. Zone = severe (>19).
        """
        responses = {f'q{i}': 4 for i in range(1, 9)}
        responses['q9'] = 2
        responses['q10'] = 2
        result = compute_sha_harmony({'responses': responses})

        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 40)
        self.assertEqual(sd['risk_zone'], 'severe')

    # ------------------------------------------------------------------
    # 4. Q9/Q10 special scoring
    # ------------------------------------------------------------------
    def test_sha_q9_q10_special_scoring(self):
        """The scorer maps 0→0, 1→2, 2→4 for Q9 and Q10.

        Verify isolated contributions:
          - Q9=1 contributes exactly 2 pts
          - Q9=2 contributes exactly 4 pts
        """
        # All other questions at 0 so the total equals only Q9 contribution
        def _score_with_q9(val):
            responses = {f'q{i}': 0 for i in range(1, 11)}
            responses['q9'] = val
            return compute_sha_harmony({'responses': responses})['structured_data']['total_score']

        self.assertEqual(_score_with_q9(0), 0, "q9=0 should contribute 0 pts")
        self.assertEqual(_score_with_q9(1), 2, "q9=1 should contribute 2 pts")
        self.assertEqual(_score_with_q9(2), 4, "q9=2 should contribute 4 pts")

        # Same for Q10
        def _score_with_q10(val):
            responses = {f'q{i}': 0 for i in range(1, 11)}
            responses['q10'] = val
            return compute_sha_harmony({'responses': responses})['structured_data']['total_score']

        self.assertEqual(_score_with_q10(0), 0, "q10=0 should contribute 0 pts")
        self.assertEqual(_score_with_q10(1), 2, "q10=1 should contribute 2 pts")
        self.assertEqual(_score_with_q10(2), 4, "q10=2 should contribute 4 pts")

    # ------------------------------------------------------------------
    # 5. Determinism — same input produces identical structured_data
    # ------------------------------------------------------------------
    def test_sha_deterministic(self):
        """Two calls with the same responses must yield identical structured_data.
        (timestamp is excluded from comparison.)
        """
        responses = {
            'q1': 2, 'q2': 1, 'q3': 0, 'q4': 3,
            'q5': 1, 'q6': 0, 'q7': 2, 'q8': 1,
            'q9': 1, 'q10': 0,
        }
        input_data = {'responses': responses}

        result1 = compute_sha_harmony(input_data)
        result2 = compute_sha_harmony(input_data)

        self.assertEqual(result1['structured_data'], result2['structured_data'])
        self.assertEqual(result1['raw_answers'], result2['raw_answers'])

    # ------------------------------------------------------------------
    # 6. referral_recommended — True only for high and severe zones
    # ------------------------------------------------------------------
    def test_sha_referral_recommended_flag(self):
        """referral_recommended must be False for low/moderate, True for high/severe."""
        low_result = compute_sha_harmony(_sha_all(0))
        moderate_responses = {f'q{i}': 1 for i in range(1, 9)}
        moderate_responses['q9'] = 0
        moderate_responses['q10'] = 0
        moderate_result = compute_sha_harmony({'responses': moderate_responses})
        severe_responses = {f'q{i}': 4 for i in range(1, 9)}
        severe_responses['q9'] = 2
        severe_responses['q10'] = 2
        severe_result = compute_sha_harmony({'responses': severe_responses})

        self.assertFalse(low_result['structured_data']['referral_recommended'])
        self.assertFalse(moderate_result['structured_data']['referral_recommended'])
        self.assertTrue(severe_result['structured_data']['referral_recommended'])

    # ------------------------------------------------------------------
    # 7. Empty responses — must not raise, must return processed=True
    # ------------------------------------------------------------------
    def test_sha_empty_responses(self):
        """{'responses': {}} is a valid edge case: no answer recorded yet.
        The scorer should not raise an exception and should mark processed=True
        with total_score=0 (all defaults to 0).
        """
        result = compute_sha_harmony({'responses': {}})

        self.assertTrue(result['processed'])
        self.assertIsNotNone(result['structured_data'])
        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 0)
        self.assertEqual(sd['risk_zone'], 'low')


# ===========================================================================
# compute_eat26_spirit — 6 tests
# ===========================================================================

class Eat26SpiritTests(SimpleTestCase):
    """Unit tests for the EAT-26-Spirit scorer."""

    # ------------------------------------------------------------------
    # 1. All 'Never' (5) → total_score=0, risk_level='low'
    # ------------------------------------------------------------------
    def test_eat26_all_never_returns_low(self):
        """Arrange: all 26 responses = 5 ('Nunca').
        Standard items: val=5 >= 3 → 0 pts.
        Q25 reverse: val=5 >= 3 → 3 pts.
        Total = 3 (only Q25 scores).
        Risk = low (<10).
        """
        result = compute_eat26_spirit(_eat26_all(5))

        self.assertTrue(result['processed'])
        sd = result['structured_data']
        # Q25 alone scores 3 pts when val=5 (reverse: val>=3 → 3 pts)
        self.assertEqual(sd['total_score'], 3)
        self.assertEqual(sd['risk_level'], 'low')

    # ------------------------------------------------------------------
    # 2. All 'Always' (0) for Q1-Q24 and Q26, Q25='Never' (5)
    #    → score = 75, risk_level='high'
    # ------------------------------------------------------------------
    def test_eat26_all_always_except_q25(self):
        """Arrange: Q1-Q24=0 (Always), Q26=0 (Always), Q25=5 (Never).
        Standard 25 items (excl Q25): val=0 <= 2 → 3 pts each → 25×3 = 75.
        Q25 reverse: val=5 >= 3 → 3 pts → total = 78.

        Note: 26 items total = 25 standard + 1 reverse.
        Q25 reverse with val=5 adds 3 pts; all others (0) also add 3 pts each.
        Total = 26 × 3 = 78. Risk = high (>=20).
        """
        responses = {f'q{i}': 0 for i in range(1, 27)}
        responses['q25'] = 5   # Never = no penalty via standard; reverse gives 3 pts
        result = compute_eat26_spirit({'responses': responses})

        sd = result['structured_data']
        # All 25 standard items at 0 (Always) → 3 pts each = 75
        # Q25 at 5 (Never) reverse → 3 pts
        # Total = 78
        self.assertEqual(sd['total_score'], 78)
        self.assertEqual(sd['risk_level'], 'high')

    # ------------------------------------------------------------------
    # 3. Q25 reverse scoring — isolated verification
    # ------------------------------------------------------------------
    def test_eat26_q25_reverse_scoring(self):
        """Q25 is reverse-scored.
        - val >= 3 (A veces, Pocas veces, Nunca) → 3 pts
        - val < 3  (Siempre, Casi siempre, Muchas veces) → 0 pts

        We isolate Q25 by setting all other responses to 5 (Nunca → 0 pts).
        """
        def _score_q25(val):
            responses = {f'q{i}': 5 for i in range(1, 27)}
            responses['q25'] = val
            return compute_eat26_spirit({'responses': responses})['structured_data']['total_score']

        # val=3 (A veces) → 3 pts reverse
        self.assertEqual(_score_q25(3), 3, "Q25=3 should score 3 pts (reverse)")
        # val=4 (Pocas veces) → 3 pts reverse
        self.assertEqual(_score_q25(4), 3, "Q25=4 should score 3 pts (reverse)")
        # val=5 (Nunca) → 3 pts reverse
        self.assertEqual(_score_q25(5), 3, "Q25=5 should score 3 pts (reverse)")

        # val=0 (Siempre) → 0 pts (standard items at 5 = 0 pts; Q25 val<3 → 0 pts)
        self.assertEqual(_score_q25(0), 0, "Q25=0 (Siempre) should score 0 pts (reverse)")
        # val=1 (Casi siempre) → 0 pts
        self.assertEqual(_score_q25(1), 0, "Q25=1 should score 0 pts (reverse)")
        # val=2 (Muchas veces) → 0 pts
        self.assertEqual(_score_q25(2), 0, "Q25=2 should score 0 pts (reverse)")

    # ------------------------------------------------------------------
    # 4. Moderate zone — score between 10 and 19
    # ------------------------------------------------------------------
    def test_eat26_moderate_zone(self):
        """Arrange: exactly 4 standard items score 3 pts each = 12. Others = 0.
        risk_level must be 'moderate' (10 <= 12 < 20).
        Q25 at 5 (never → 3 pts reverse) + 3 other standard at 0 → total 12+3=15.

        Simpler: use 4 items with val=0 (scores 3 pts each = 12), Q25=5 (3 pts),
        rest = 5 (0 pts). Total = 15. Moderate (10-19).
        """
        responses = {f'q{i}': 5 for i in range(1, 27)}
        # Make exactly 4 standard items score (Q1, Q2, Q3, Q4 each at 0)
        responses['q1'] = 0
        responses['q2'] = 0
        responses['q3'] = 0
        responses['q4'] = 0
        # Q25 stays at 5 → reverse → 3 pts extra
        result = compute_eat26_spirit({'responses': responses})

        sd = result['structured_data']
        # 4 standard × 3 + 1 reverse (Q25=5) × 3 = 15
        self.assertEqual(sd['total_score'], 15)
        self.assertEqual(sd['risk_level'], 'moderate')

    # ------------------------------------------------------------------
    # 5. Determinism — same input yields same structured_data
    # ------------------------------------------------------------------
    def test_eat26_deterministic(self):
        """Two calls with identical responses must produce identical structured_data."""
        responses = {f'q{i}': (i % 5) for i in range(1, 27)}
        input_data = {'responses': responses}

        result1 = compute_eat26_spirit(input_data)
        result2 = compute_eat26_spirit(input_data)

        self.assertEqual(result1['structured_data'], result2['structured_data'])
        self.assertEqual(result1['raw_answers'], result2['raw_answers'])

    # ------------------------------------------------------------------
    # 6. referral_recommended — True only for high zone
    # ------------------------------------------------------------------
    def test_eat26_referral_recommended_flag(self):
        """referral_recommended must be True only for high risk_level."""
        low_result = compute_eat26_spirit(_eat26_all(5))

        high_responses = {f'q{i}': 0 for i in range(1, 27)}
        high_responses['q25'] = 5
        high_result = compute_eat26_spirit({'responses': high_responses})

        self.assertFalse(low_result['structured_data']['referral_recommended'])
        self.assertTrue(high_result['structured_data']['referral_recommended'])

    # ------------------------------------------------------------------
    # 7. Empty responses — must not raise, returns processed=True
    # ------------------------------------------------------------------
    def test_eat26_empty_responses(self):
        """{'responses': {}} must not raise.
        The scorer defaults missing values to 5 ('Nunca').
        Only Q25 (reverse, defaulting to 5 → 3 pts) contributes.
        Total = 3. Risk = low.
        """
        result = compute_eat26_spirit({'responses': {}})

        self.assertTrue(result['processed'])
        self.assertIsNotNone(result['structured_data'])
        sd = result['structured_data']
        # All default to 5 (Nunca). Standard items: val=5>=3 → 0 pts.
        # Q25 reverse: val=5>=3 → 3 pts. Total = 3.
        self.assertEqual(sd['total_score'], 3)
        self.assertEqual(sd['risk_level'], 'low')
