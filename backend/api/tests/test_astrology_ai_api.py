# -*- coding: utf-8 -*-
"""API tests for astrology AI interpret endpoints and ai-status hardening."""

from datetime import date, time
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from api.astrology_ai_service import AIInterpretationResult, astrology_ai_service
from api.astrology_ai_views import _layer_chart_payload
from api.models import Patient
from api.models_astrology import AstrologyNatalChart


def _natal_payload():
    return {
        'planetas': [{'nombre': 'sun', 'longitud_ecliptica': 10}],
        'casas': [],
        'aspectos': [],
        'metadatos': {'fuente': 'test'},
    }


def _input_snapshot():
    return {
        'birth_date': '1990-01-01',
        'birth_time': '12:00',
        'location': {'lat': 40.4, 'lng': -3.7, 'timezone': 'UTC'},
        'house_system': 'placidus',
        'zodiac_type': 'tropical',
    }


class AstrologyAIAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.therapist = User.objects.create_user(
            username='astro_ai_therapist',
            email='astroai@test.com',
            password='testpass123',
        )
        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            first_name='Sol',
            last_name='Test',
            email='sol@test.com',
            birth_date=date(1990, 1, 1),
            birth_time=time(12, 0),
            birth_city='Madrid',
            birth_country='ES',
            birth_latitude=Decimal('40.4168'),
            birth_longitude=Decimal('-3.7038'),
            birth_timezone='Europe/Madrid',
        )
        self.natal_chart = AstrologyNatalChart.objects.create(
            patient=self.patient,
            created_by=self.therapist,
            house_system='placidus',
            source='kerykeion',
            status='ok',
            chart_payload=_natal_payload(),
            input_snapshot=_input_snapshot(),
        )

    @override_settings(AI_PROVIDER='gemini', GEMINI_API_KEY='', GROQ_API_KEY='gsk-test')
    def test_gemini_provider_falls_back_to_groq_when_gemini_key_missing(self):
        """Gemini sin clave debe intentar Groq y quedar habilitado con provider=groq."""
        svc = astrology_ai_service.__class__()
        svc._init_attempted = False
        svc.enabled = False
        svc.provider = None
        svc.model_name = None
        svc.error_message = None
        def _groq_init_sets_provider():
            svc.provider = 'groq'
            svc.model_name = 'llama-3.3-70b-versatile'
            svc.enabled = True
            return True

        with patch.object(svc, '_try_init_gemini', return_value=False) as mock_gemini:
            with patch.object(
                svc, '_try_init_groq', side_effect=_groq_init_sets_provider
            ) as mock_groq:
                svc._ensure_initialized()
        mock_gemini.assert_called_once()
        mock_groq.assert_called_once()
        self.assertTrue(svc.enabled)
        self.assertEqual(svc.provider, 'groq')

    def test_ai_status_anonymous_returns_enabled_only(self):
        with patch.object(astrology_ai_service, 'enabled', True), patch.object(
            astrology_ai_service, 'model_name', 'llama-test'
        ), patch.object(astrology_ai_service, '_ensure_initialized', lambda: None):
            response = self.client.get('/api/astrology/ai-status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('enabled', data)
        self.assertNotIn('model', data)
        self.assertNotIn('error', data)

    def test_ai_status_authenticated_returns_full_payload(self):
        self.client.force_authenticate(user=self.therapist)
        with patch.object(astrology_ai_service, 'enabled', True), patch.object(
            astrology_ai_service, 'model_name', 'llama-test'
        ), patch.object(astrology_ai_service, 'error_message', None), patch.object(
            astrology_ai_service, '_ensure_initialized', lambda: None
        ):
            response = self.client.get('/api/astrology/ai-status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['enabled'])
        self.assertEqual(data['model'], 'llama-test')

    @patch('api.astrology_ai_views.astrology_ai_service.enabled', True)
    @patch('api.astrology_ai_views.astrology_ai_service.interpret_natal')
    @patch('api.astrology_ai_views.astrology_ai_service._ensure_initialized')
    def test_interpret_natal_success_shape(self, _mock_init, mock_interpret):
        mock_interpret.return_value = AIInterpretationResult(
            success=True,
            interpretation='Lectura simbólica de prueba.',
            layer='natal',
        )
        self.client.force_authenticate(user=self.therapist)
        response = self.client.post(
            '/api/astrology/interpret/natal/',
            {'patient_id': self.patient.id, 'use_cached': False},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['layer'], 'natal')
        self.assertIn('interpretation', data)

    @override_settings(ASTRO_MULTITECH_ENABLED=True)
    @patch('api.astrology_kerykeion.multi_tech.build_multitech_payload')
    def test_layer_chart_payload_transits_differs_from_natal(self, mock_build):
        transits_chart = {**_natal_payload(), 'metadatos': {'technique': 'transits'}}
        mock_build.return_value = {
            'transits': transits_chart,
            'progressions': {'chart': _natal_payload()},
            'solarReturn': {'chart': _natal_payload()},
        }
        result = _layer_chart_payload(self.natal_chart, 'transits')
        self.assertEqual(result['metadatos']['technique'], 'transits')
        self.assertNotEqual(result, self.natal_chart.chart_payload)