from django.test import TestCase
from ..diagnostics import compute_bdi, compute_bai
from ..diagnostics import compute_scl90, compute_stai, compute_mcmi4, compute_scid5, compute_past_lives


class DiagnosticTests(TestCase):
    def test_compute_bdi_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 40,
            'fecha': '1985-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {str(i): 1 for i in range(1, 22)}
        }
        res = compute_bdi(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('puntuaciones', res)
        self.assertEqual(res['puntuaciones']['total'], 21)  # 21 x 1

    def test_compute_bai_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 30,
            'fecha': '1995-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {str(i): 2 for i in range(1, 22)}
        }
        res = compute_bai(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('puntuaciones', res)
        self.assertEqual(res['puntuaciones']['total'], 42)  # 21 x 2
        self.assertTrue('items_criticos' in res['alertas'] or 'items_criticos' in res)

    def test_compute_scl90_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 35,
            'fecha': '1990-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {str(i): 1 for i in range(1, 91)}
        }
        res = compute_scl90(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('puntuaciones', res)
        self.assertAlmostEqual(res['puntuaciones']['gsi'], 1.0, places=1)

    def test_compute_stai_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 40,
            'fecha': '1985-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {str(i): 2 for i in range(1, 41)}
        }
        res = compute_stai(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('puntuaciones', res)
        self.assertEqual(res['puntuaciones']['estado'], 40)  # 20*2
        self.assertEqual(res['puntuaciones']['rasgo'], 40)   # 20*2

    def test_compute_mcmi4_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 50,
            'fecha': '1975-01-01',
            'terapeuta': 'Dr. Test',
            'responses': {str(i): 1 for i in range(1, 196)}
        }
        res = compute_mcmi4(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('puntuaciones', res)
        self.assertGreater(res['puntuaciones']['raw'], 0)
        self.assertIn('scales', res['puntuaciones'])
        self.assertTrue(len(res['puntuaciones']['scales']) >= 4)
        self.assertIn('top_scales', res['puntuaciones'])

    def test_compute_scid5_basic(self):
        input_data = {
            'nombre': 'Paciente',
            'edad': 33,
            'fecha': '1992-01-01',
            'terapeuta': 'Dr. Test',
            'responses': { 'B1': 3, 'B2': 3, 'B3': 3, 'B4': 3, 'B5': 3 }
        }
        res = compute_scid5(input_data)
        self.assertIn('codigo_evaluacion', res)
        self.assertIn('diagnosticos', res)
        self.assertTrue(res['diagnosticos'].get('MDE'))
        # Also test GAD detection
        input_data_gad = { 'G1': 3, 'G2': 3, 'G3': 3 }
        res2 = compute_scid5({**input_data, 'responses': input_data_gad})
        self.assertTrue(res2['diagnosticos'].get('GAD'))
        # Test PTSD detection
        input_data_pt = { 'PT1': 3, 'PT2': 3, 'PT3': 3, 'PT4': 3 }
        res3 = compute_scid5({**input_data, 'responses': input_data_pt})
        self.assertTrue(res3['diagnosticos'].get('PTSD'))


def _legacy_past_lives_responses():
    """Six original sections only, uniform score 4."""
    responses = {}
    for section in range(1, 7):
        for question in range(1, 6):
            responses[f'pl_s{section}_q{question}'] = 4
    return responses


class PastLivesDiagnosticTests(TestCase):
    REQUIRED_KEYS = {
        'symbolic_resonance_level',
        'dominant_themes',
        'reflection_axes',
        'summary_text',
    }

    def test_legacy_payload_retrocompat(self):
        payload = {
            'responses': _legacy_past_lives_responses(),
            'open_reflection': 'Sueño recurrente con un patio antiguo.',
        }
        res = compute_past_lives(payload)
        self.assertEqual(self.REQUIRED_KEYS, set(res.keys()))
        self.assertEqual(res['symbolic_resonance_level'], 'high')
        self.assertIn('Sensación de continuidad del alma', res['dominant_themes'])
        self.assertTrue(
            any('reflexión escrita' in axis.lower() for axis in res['reflection_axes']),
        )

    def test_new_sections_s7_s11_influence_dominant_themes(self):
        responses = _legacy_past_lives_responses()
        for question in range(1, 6):
            responses[f'pl_s7_q{question}'] = 5
            responses[f'pl_s8_q{question}'] = 3
            responses[f'pl_s9_q{question}'] = 3
            responses[f'pl_s10_q{question}'] = 3
            responses[f'pl_s11_q{question}'] = 3
        res = compute_past_lives({'responses': responses})
        self.assertIn('Talentos y saberes espontáneos', res['dominant_themes'])

    def test_guided_reflection_object_normalized(self):
        payload = {
            'responses': _legacy_past_lives_responses(),
            'open_reflection': {
                'recurring_scene': 'Un mercado al atardecer.',
                'familiar_person_place': 'Una mujer con mantón azul.',
            },
        }
        res = compute_past_lives(payload)
        self.assertTrue(
            any('reflexión escrita' in axis.lower() for axis in res['reflection_axes']),
        )
