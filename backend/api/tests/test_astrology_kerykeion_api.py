# -*- coding: utf-8 -*-
"""API contract tests for therapist astrology-kerykeion endpoint."""

from datetime import date, time
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Patient, UserProfile
from api.models_astrology import AstrologyNatalChart


def _sample_chart():
    return {
        'planetas': [
            {
                'nombre': 'sun',
                'signo': 'Aries',
                'grados': 10,
                'longitud_ecliptica': 10,
                'casa': 1,
                'es_retrogrado': False,
            }
        ],
        'casas': [{'numero': 1, 'signo': 'Aries', 'cuspide_grados': 0, 'cuspide_longitud': 0}],
        'aspectos': [],
        'metadatos': {
            'sistema_casas': 'placidus',
            'zodiac_type': 'tropical',
            'fuente': 'swiss_ephemeris',
            'version_engine': 'test',
        },
    }


def _sample_input():
    return {
        'birth_date': '1990-01-01',
        'birth_time': '12:00',
        'location': {
            'city': 'Madrid',
            'country': 'ES',
            'lat': 40.4168,
            'lng': -3.7038,
            'timezone': 'Europe/Madrid',
        },
        'house_system': 'placidus',
        'zodiac_type': 'tropical',
        'engine': 'kerykeion',
    }


def _sample_multitech():
    chart = _sample_chart()
    return {
        'meta': {'engine': 'swiss_ephemeris', 'version': 'test'},
        'natal': chart,
        'transits': {**chart, 'metadatos': {**chart['metadatos'], 'technique': 'transits'}},
        'solarReturn': {'reference_date': '2026-01-01T12:00:00', 'chart': chart},
        'progressions': {
            'reference_date': '2026-06-10T12:00:00',
            'method': 'secondary_progression_day_for_year',
            'chart': chart,
        },
    }


class AstrologyKerykeionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.therapist = User.objects.create_user(
            username='astro_therapist',
            email='astro@test.com',
            password='testpass123',
        )
        profile, _ = UserProfile.objects.get_or_create(user=self.therapist)
        profile.user_type = 'therapist'
        profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            first_name='Luna',
            last_name='Test',
            email='luna@test.com',
            birth_date=date(1990, 1, 1),
            birth_time=time(12, 0),
            birth_city='Madrid',
            birth_country='ES',
            birth_latitude=Decimal('40.4168'),
            birth_longitude=Decimal('-3.7038'),
            birth_timezone='Europe/Madrid',
        )
        self.client.force_authenticate(user=self.therapist)

    @override_settings(ASTRO_MULTITECH_ENABLED=True)
    @patch('api.cabalistic_views.build_multitech_payload')
    def test_get_kerykeion_includes_analysis_result(self, mock_multitech):
        mock_multitech.return_value = _sample_multitech()
        chart = _sample_chart()
        AstrologyNatalChart.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            house_system='placidus',
            source='kerykeion',
            status='ok',
            chart_payload=chart,
            input_snapshot=_sample_input(),
        )

        url = f'/api/therapist/patients/{self.patient.id}/astrology-kerykeion/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('chart', data)
        analysis = data.get('analysis_result') or {}
        for key in ('transits', 'progressions', 'solarReturn'):
            self.assertIn(key, analysis, msg=f'missing analysis_result.{key}')

    def test_get_kerykeion_without_chart_returns_404(self):
        url = f'/api/therapist/patients/{self.patient.id}/astrology-kerykeion/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @override_settings(ASTRO_MULTITECH_ENABLED=True)
    @patch('api.cabalistic_views.build_multitech_payload')
    @patch('api.cabalistic_views.normalize_kerykeion_output')
    @patch('api.cabalistic_views.execute_kerykeion')
    def test_post_kerykeion_persists_and_returns_multitech(
        self, mock_execute, mock_normalize, mock_multitech
    ):
        chart = _sample_chart()
        mock_execute.return_value = MagicMock(model_dump=lambda: {'raw': True})
        mock_normalize.return_value = chart
        mock_multitech.return_value = _sample_multitech()

        url = f'/api/therapist/patients/{self.patient.id}/astrology-kerykeion/'
        response = self.client.post(url, {'house_system': 'W'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data.get('status'), 'ok')
        self.assertTrue(AstrologyNatalChart.objects.filter(patient=self.patient).exists())
        analysis = data.get('analysis_result') or {}
        for key in ('transits', 'progressions', 'solarReturn'):
            self.assertIn(key, analysis)

    def test_post_kerykeion_missing_birth_fields_returns_400(self):
        incomplete = Patient.objects.create(
            therapist=self.therapist,
            first_name='Sin',
            last_name='Datos',
            email='incomplete@test.com',
            birth_date=date(1990, 1, 1),
        )
        url = f'/api/therapist/patients/{incomplete.id}/astrology-kerykeion/'
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('missing_fields', response.json())