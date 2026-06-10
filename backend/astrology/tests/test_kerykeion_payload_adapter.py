from datetime import datetime
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase

from astrology.services.persistence_service import PersistenceService


def _sample_kerykeion_payload():
    return {
        'planetas': [
            {'nombre': 'sun', 'signo': 'Tauro', 'grados': 24.5, 'longitud_ecliptica': 54.5, 'casa': 10, 'es_retrogrado': False},
            {'nombre': 'moon', 'signo': 'Capricornio', 'grados': 28.4, 'longitud_ecliptica': 298.4, 'casa': 6, 'es_retrogrado': False},
        ],
        'casas': [
            {'numero': 1, 'signo': 'Leo', 'cuspide_grados': 12.0, 'cuspide_longitud': 132.0},
            {'numero': 10, 'signo': 'Tauro', 'cuspide_grados': 24.5, 'cuspide_longitud': 54.5},
        ],
        'aspectos': [],
        'metadatos': {'sistema_casas': 'placidus', 'zodiac_type': 'tropical'},
    }


class KerykeionPayloadAdapterTest(SimpleTestCase):
    def test_convert_api_chart_reads_planetas_and_normalizes_codes(self):
        api_chart = SimpleNamespace(
            patient_id=42,
            house_system='placidus',
            chart_payload=_sample_kerykeion_payload(),
            input_snapshot={
                'birth_date': '1990-05-15',
                'birth_time': '14:30',
                'location': {'lat': 40.4168, 'lng': -3.7038, 'timezone': 'Europe/Madrid'},
                'zodiac_type': 'tropical',
            },
        )

        with patch('astrology.services.persistence_service.AstrologyNatalChart', create=True):
            chart = PersistenceService()._convert_api_chart_to_domain(api_chart)

        self.assertEqual(chart.house_system, 'P')
        self.assertEqual(chart.zodiac_type, 'T')
        self.assertEqual(len(chart.planets), 2)
        self.assertEqual(chart.planets[0].planet_name, 'sun')
        self.assertEqual(float(chart.planets[1].longitude), 298.4)
        self.assertEqual(chart.houses[0].house_number, 1)
        self.assertEqual(float(chart.houses[1].longitude), 54.5)