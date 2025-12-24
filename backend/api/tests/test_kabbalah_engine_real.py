from django.test import TestCase
from api.symbolic.kabbalah_engine import score_72_names


class KabbalahEngineRealDataTests(TestCase):
    def test_realistic_sample_ranking(self):
        # Simulated realistic natal summary taken from ephemeris sample (Aug 01 1959 20:00 Havana)
        natal = {
            'dominant_planets': ['sun', 'jupiter'],
            'birth_name_letters': 'JUANPEREZ',
            'planets': [
                {'name': 'sun', 'house': 10},
                {'name': 'moon', 'house': 4},
                {'name': 'mercury', 'house': 11},
                {'name': 'venus', 'house': 6},
                {'name': 'mars', 'house': 6},
                {'name': 'jupiter', 'house': 8},
                {'name': 'saturn', 'house': 2},
                {'name': 'uranus', 'house': 10},
                {'name': 'neptune', 'house': 8},
                {'name': 'pluto', 'house': 6},
            ]
        }

        # Minimal names mapping to check ordering
        names_map = {
            'name_sun': {'letters': 'S', 'associated_planet': 'sun'},
            'name_jupiter': {'letters': 'J', 'associated_planet': 'jupiter'},
            'name_moon': {'letters': 'M', 'associated_planet': 'moon'},
            'name_venus': {'letters': 'V', 'associated_planet': 'venus'},
        }

        res = score_72_names(natal, names_map)
        ranking = res['ranking']
        # Expect 'name_sun' or 'name_jupiter' to be top due to angular houses and dominance
        top = ranking[0][0]
        self.assertIn(top, ('name_sun', 'name_jupiter'))
