from django.test import TestCase
from ..pai import compute_pai


class PAIComputeTests(TestCase):
    def test_compute_pai_basic(self):
        input_data = {
            'nombre': 'Test Cliente',
            'edad': 30,
            'fecha': '1995-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {
                'BOR_1': 2,
                'BOR_2': 3,
                'BOR_3': 1,
                'BOR_4': 0,
                'BOR_5': 2,
                'BOR_6': 1,
                'SCZ_1': 1,
                'SCZ_2': 0,
                'SCZ_3': 2,
                'SCZ_4': 1,
                'SCZ_5': 0,
                'SCZ_6': 0,
                'INF_1': 0,
                'INF_2': 1,
                'MAL_1': 0,
                'MAL_2': 0,
            }
        }

        result = compute_pai(input_data)
        self.assertIn('codigo_evaluacion', result)
        self.assertIn('puntuaciones', result)
        self.assertIn('trastorno_limite', result['puntuaciones'])
        self.assertIn('puntuacion_bruta', result['puntuaciones']['trastorno_limite'])
        self.assertEqual(result['puntuaciones']['trastorno_limite']['puntuacion_bruta'], 2+3+1+0+2+1)
        self.assertTrue(result['puntuaciones']['trastorno_limite']['puntuacion_maxima'] == 24)
        self.assertIn('escalas_validez', result)
        self.assertIsInstance(result['interpretacion'], list)
