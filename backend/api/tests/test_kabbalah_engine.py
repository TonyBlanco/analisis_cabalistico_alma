from django.test import TestCase
from api.symbolic.kabbalah_engine import map_sefer_letter, score_72_names, compute_tikun_signals


class KabbalahEngineTests(TestCase):
    def test_map_sefer_letter_empty(self):
        self.assertIsNone(map_sefer_letter(''))

    def test_score_72_names_basic(self):
        natal = {
            'dominant_planets': ['moon', 'venus'],
            'birth_name_letters': 'ABC',
            # no planet strengths in this basic case
            'planets': []
        }
        names_map = {
            'name1': {'letters': 'AX', 'associated_planet': 'moon'},
            'name2': {'letters': 'YZ', 'associated_planet': 'mars'},
            'name3': {'letters': 'B', 'associated_planet': 'venus'},
        }
        res = score_72_names(natal, names_map)
        self.assertIn('scores', res)
        # With no strength info, planet matches contribute 0; only letter bonuses apply
        self.assertEqual(res['scores']['name1'], 0.5)  # letter match (A)
        self.assertEqual(res['scores']['name2'], 0)
        self.assertEqual(res['scores']['name3'], 0.5)  # letter match (B)

    def test_score_72_names_weighted(self):
        natal = {
            'dominant_planets': ['moon'],
            'planets': [
                {'name': 'moon', 'house': 1, 'strength': 0.6},
                {'name': 'venus', 'house': 7, 'strength': 0.4},
            ],
            'birth_name_letters': ''
        }
        names_map = {
            'name1': {'letters': '', 'associated_planet': 'moon'},
            'name2': {'letters': '', 'associated_planet': 'venus'},
        }
        res = score_72_names(natal, names_map)
        # Expected computation:
        # moon: base 0.6 * (1 + house_weight(1)=0.5) = 0.6 * 1.5 = 0.9 ; dominant multiplier x1.3 -> 1.17
        # venus: base 0.4 * (1 + house_weight(7)=0.5) = 0.4 * 1.5 = 0.6 ; not dominant
        self.assertAlmostEqual(res['scores']['name1'], 1.17, places=2)
        self.assertAlmostEqual(res['scores']['name2'], 0.6, places=2)
        self.assertTrue(res['ranking'][0][0] == 'name1')

    def test_compute_tikun_signals(self):
        natal = {
            'inclusion_base': {'ausentes': ['2', '4']},
            'dias_fuerza': {'edad_transformacion': 24}
        }
        signals = compute_tikun_signals(natal, sephirot_mapping={'2': {}, '4': {}})
        types = [s['type'] for s in signals]
        self.assertIn('sefirot_absence', types)
        self.assertIn('age_transform', types)
