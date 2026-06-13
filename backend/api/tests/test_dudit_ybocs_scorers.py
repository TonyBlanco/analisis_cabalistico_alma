"""
Unit tests for compute_dudit_spirit and compute_ybocs_soul scorers.

Scorer contract:
  compute_dudit_spirit  → backend/api/diagnostics.py
  compute_ybocs_soul    → backend/api/diagnostics.py

Both functions are pure (no DB, no network).
"""

from django.test import SimpleTestCase

from api.diagnostics import compute_dudit_spirit, compute_ybocs_soul


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _dudit(overrides: dict | None = None, sex: str = 'hombre') -> dict:
    """Return DUDIT responses (all 0) with optional key overrides."""
    base = {f'q{i}': 0 for i in range(1, 12)}
    if overrides:
        base.update(overrides)
    return {'responses': base, 'sex': sex}


def _ybocs(overrides: dict | None = None) -> dict:
    """Return Y-BOCS responses (all 0) with optional key overrides."""
    base = {f'q{i}': 0 for i in range(1, 11)}
    if overrides:
        base.update(overrides)
    return {'responses': base}


# ===========================================================================
# compute_dudit_spirit — 8 tests
# ===========================================================================

class DuditSpiritTests(SimpleTestCase):
    """Unit tests for the DUDIT-Spirit scorer."""

    def test_all_zeros_returns_low_hombre(self):
        """All zeros for hombre → total=0, risk_level='low'."""
        result = compute_dudit_spirit(_dudit(sex='hombre'))
        self.assertTrue(result['processed'])
        sd = result['structured_data']
        self.assertEqual(sd['score_total'], 0)
        self.assertEqual(sd['risk_level'], 'low')
        self.assertFalse(sd['referral_recommended'])

    def test_sex_dependent_threshold_mujer(self):
        """Mujer with score=2 → medium (threshold=2). Hombre with same score → low (threshold=6)."""
        # score_total = 2: q1=1 (clamp 0-4) + rest 0 → total = 1. Not enough.
        # Use q1=2 → total=2.
        mujer_result = compute_dudit_spirit(_dudit({'q1': 2}, sex='mujer'))
        hombre_result = compute_dudit_spirit(_dudit({'q1': 2}, sex='hombre'))

        self.assertEqual(mujer_result['structured_data']['risk_level'], 'medium',
                         "score=2 should be medium for mujer (threshold=2)")
        self.assertEqual(hombre_result['structured_data']['risk_level'], 'low',
                         "score=2 should be low for hombre (threshold=6)")

    def test_problematic_threshold_stored(self):
        """structured_data includes problematic_threshold and sex_used."""
        result_h = compute_dudit_spirit(_dudit(sex='hombre'))
        result_m = compute_dudit_spirit(_dudit(sex='mujer'))
        self.assertEqual(result_h['structured_data']['problematic_threshold'], 6)
        self.assertEqual(result_m['structured_data']['problematic_threshold'], 2)
        self.assertEqual(result_h['structured_data']['sex_used'], 'hombre')
        self.assertEqual(result_m['structured_data']['sex_used'], 'mujer')

    def test_high_risk_at_25_both_sexes(self):
        """score >= 25 → high for both sexes. Q1-Q6 each=4 (24pts) + q10=2 (snap) → 26 pts."""
        responses = {f'q{i}': 4 for i in range(1, 7)}
        responses.update({f'q{i}': 0 for i in range(7, 12)})
        responses['q10'] = 2  # snap to 2

        for sex in ['hombre', 'mujer']:
            with self.subTest(sex=sex):
                result = compute_dudit_spirit({'responses': dict(responses), 'sex': sex})
                sd = result['structured_data']
                self.assertEqual(sd['risk_level'], 'high')
                self.assertTrue(sd['referral_recommended'])

    def test_q10_q11_snap_to_0_2_4(self):
        """Q10/Q11 values snapped: raw 1→2 pts, raw 3→4 pts."""
        # Raw 1 on q10 should snap to 2 pts
        r1 = compute_dudit_spirit(_dudit({'q10': 1}))
        # Raw 3 on q10 should snap to 4 pts
        r3 = compute_dudit_spirit(_dudit({'q10': 3}))
        # Raw 2 on q10 should stay 2 pts
        r2 = compute_dudit_spirit(_dudit({'q10': 2}))

        self.assertEqual(r1['structured_data']['score_total'], 2, "raw 1 → snap 2")
        self.assertEqual(r2['structured_data']['score_total'], 2, "raw 2 → stays 2")
        self.assertEqual(r3['structured_data']['score_total'], 4, "raw 3 → snap 4")

    def test_referral_false_for_low(self):
        """referral_recommended is False for low risk."""
        result = compute_dudit_spirit(_dudit({'q1': 1}, sex='hombre'))  # score=1 < 6
        self.assertFalse(result['structured_data']['referral_recommended'])

    def test_referral_true_for_medium_mujer(self):
        """referral_recommended is True for medium risk (score>=2 for mujer)."""
        result = compute_dudit_spirit(_dudit({'q1': 2}, sex='mujer'))
        sd = result['structured_data']
        self.assertEqual(sd['risk_level'], 'medium')
        self.assertTrue(sd['referral_recommended'])

    def test_empty_responses_does_not_raise(self):
        """Empty responses (all default to 0) must not raise."""
        result = compute_dudit_spirit({'responses': {}, 'sex': 'hombre'})
        self.assertTrue(result['processed'])
        sd = result['structured_data']
        self.assertEqual(sd['score_total'], 0)
        self.assertEqual(sd['risk_level'], 'low')


# ===========================================================================
# compute_ybocs_soul — 8 tests
# ===========================================================================

class YbocsSoulTests(SimpleTestCase):
    """Unit tests for the Y-BOCS-Soul scorer."""

    def test_all_zeros_returns_subclinical(self):
        """All zeros → total_score=0, severity='subclinical'."""
        result = compute_ybocs_soul(_ybocs())
        self.assertTrue(result['processed'])
        sd = result['structured_data']
        self.assertEqual(sd['total_score'], 0)
        self.assertEqual(sd['obsession_score'], 0)
        self.assertEqual(sd['compulsion_score'], 0)
        self.assertEqual(sd['severity'], 'subclinical')
        self.assertFalse(sd['referral_recommended'])

    def test_subscale_split_q1_q5_obsessions(self):
        """Q1-Q5 contribute only to obsession_score."""
        result = compute_ybocs_soul(_ybocs({'q1': 4, 'q2': 4, 'q3': 4, 'q4': 4, 'q5': 4}))
        sd = result['structured_data']
        self.assertEqual(sd['obsession_score'], 20)
        self.assertEqual(sd['compulsion_score'], 0)
        self.assertEqual(sd['total_score'], 20)

    def test_subscale_split_q6_q10_compulsions(self):
        """Q6-Q10 contribute only to compulsion_score."""
        result = compute_ybocs_soul(_ybocs({'q6': 4, 'q7': 4, 'q8': 4, 'q9': 4, 'q10': 4}))
        sd = result['structured_data']
        self.assertEqual(sd['obsession_score'], 0)
        self.assertEqual(sd['compulsion_score'], 20)
        self.assertEqual(sd['total_score'], 20)

    def test_severity_mild(self):
        """total 8-15 → mild. Use q1=4, q2=4 (obs=8)."""
        result = compute_ybocs_soul(_ybocs({'q1': 4, 'q2': 4}))
        self.assertEqual(result['structured_data']['severity'], 'mild')

    def test_severity_moderate(self):
        """total 16-23 → moderate. Use all obs at 4 → 20."""
        result = compute_ybocs_soul(
            _ybocs({'q1': 4, 'q2': 4, 'q3': 4, 'q4': 4, 'q5': 4})
        )
        self.assertEqual(result['structured_data']['severity'], 'moderate')

    def test_severity_severe(self):
        """total 24-31 → severe. obs=20 + comp q6=4 → total=24."""
        result = compute_ybocs_soul(
            _ybocs({'q1': 4, 'q2': 4, 'q3': 4, 'q4': 4, 'q5': 4, 'q6': 4})
        )
        self.assertEqual(result['structured_data']['severity'], 'severe')
        self.assertTrue(result['structured_data']['referral_recommended'])

    def test_referral_false_for_mild(self):
        """referral_recommended is False for mild severity."""
        result = compute_ybocs_soul(_ybocs({'q1': 4, 'q2': 4}))  # total=8 → mild
        self.assertFalse(result['structured_data']['referral_recommended'])

    def test_deterministic(self):
        """Same input → same structured_data (excluding timestamp)."""
        responses = {f'q{i}': (i % 5) for i in range(1, 11)}
        r1 = compute_ybocs_soul({'responses': dict(responses)})
        r2 = compute_ybocs_soul({'responses': dict(responses)})
        self.assertEqual(r1['structured_data'], r2['structured_data'])
