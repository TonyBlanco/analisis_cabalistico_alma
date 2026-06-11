from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from api.ai.llm_usage import normalize_token_usage
from api.ai_usage_views import TherapistAIUsageHistoryView, TherapistAIUsageView
from api.ai.usage_meter import (
    UsageContext,
    UsageRecordInput,
    estimate_cost_eur,
    get_therapist_usage_summary,
    record_usage,
)
from api.models import Patient, UserProfile
from api.models_ai_usage import AIUsageEvent


class UsageMeterUnitTests(TestCase):
    def test_normalize_token_usage_fallback(self):
        tokens = normalize_token_usage(fallback_texts=('hola mundo test',))
        self.assertGreater(tokens['total_tokens'], 0)

    def test_estimate_cost_eur_gemini_flash(self):
        cost = estimate_cost_eur('gemini', 'gemini-2.5-flash', 1000, 2000)
        self.assertGreater(cost, Decimal('0'))

    @override_settings(AI_METERING_ENABLED=False)
    def test_record_usage_disabled(self):
        user = User.objects.create_user('t1', password='x')
        event = record_usage(
            UsageRecordInput(
                therapist=user,
                task_type='astrology.natal',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=100,
                completion_tokens=200,
            )
        )
        self.assertIsNone(event)
        self.assertEqual(AIUsageEvent.objects.count(), 0)

    @override_settings(AI_METERING_ENABLED=True)
    def test_record_usage_creates_event(self):
        user = User.objects.create_user('t2', password='x')
        event = record_usage(
            UsageRecordInput(
                therapist=user,
                task_type='astrology.natal',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=500,
                completion_tokens=1500,
            )
        )
        self.assertIsNotNone(event)
        self.assertEqual(event.total_tokens, 2000)
        self.assertEqual(AIUsageEvent.objects.filter(therapist=user).count(), 1)

    @override_settings(AI_METERING_ENABLED=True)
    def test_usage_summary_aggregates(self):
        user = User.objects.create_user('t3', password='x')
        record_usage(
            UsageRecordInput(
                therapist=user,
                task_type='astrology.natal',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=100,
                completion_tokens=100,
            )
        )
        record_usage(
            UsageRecordInput(
                therapist=user,
                task_type='astrology.snippet',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=50,
                completion_tokens=50,
            )
        )
        summary = get_therapist_usage_summary(user)
        self.assertEqual(summary['total_tokens'], 300)
        self.assertEqual(summary['event_count'], 2)
        self.assertIn('astrology.natal', summary['by_task_type'])


class LLMBridgeMeteringTests(TestCase):
    @override_settings(AI_METERING_ENABLED=True)
    @patch('api.ai.llm_bridge.generate_with_fallback')
    def test_generate_text_records_effective_fallback_provider(self, mock_fallback):
        from api.ai.llm_bridge import generate_text

        user = User.objects.create_user('bridge', password='x')
        mock_fallback.return_value = {
            'success': True,
            'text': 'ok',
            'provider': 'groq',
            'model': 'llama-3.1-8b-instant',
            'prompt_tokens': 10,
            'completion_tokens': 20,
            'total_tokens': 30,
            'error': None,
        }
        ctx = UsageContext(therapist=user, task_type='ai.generate')
        result = generate_text('prompt', usage_context=ctx)
        self.assertTrue(result['success'])
        self.assertEqual(result['provider'], 'groq')

        event = AIUsageEvent.objects.get(therapist=user)
        self.assertEqual(event.provider, 'groq')
        self.assertEqual(event.model, 'llama-3.1-8b-instant')


class TherapistAIUsageAPITests(TestCase):
    def setUp(self):
        self.therapist = User.objects.create_user('ther', password='pass', email='t@t.com')
        profile, _ = UserProfile.objects.get_or_create(user=self.therapist)
        profile.user_type = 'therapist'
        profile.full_name = 'Ther'
        profile.save(update_fields=['user_type', 'full_name'])
        self.therapist.refresh_from_db()
        self.factory = APIRequestFactory()

    @override_settings(AI_METERING_ENABLED=True)
    def test_therapist_ai_usage_endpoint(self):
        record_usage(
            UsageRecordInput(
                therapist=self.therapist,
                task_type='astrology.transits',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=200,
                completion_tokens=300,
            )
        )
        request = self.factory.get('/api/therapist/ai-usage/')
        force_authenticate(request, user=self.therapist)
        response = TherapistAIUsageView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_tokens'], 500)
        self.assertIn('astrology.transits', response.data['by_task_type'])

    @override_settings(AI_METERING_ENABLED=True)
    def test_therapist_ai_usage_history_endpoint(self):
        record_usage(
            UsageRecordInput(
                therapist=self.therapist,
                task_type='astrology.natal',
                provider='gemini',
                model='gemini-2.5-flash',
                prompt_tokens=100,
                completion_tokens=100,
            )
        )
        request = self.factory.get('/api/therapist/ai-usage/history/', {'limit': 10})
        force_authenticate(request, user=self.therapist)
        response = TherapistAIUsageHistoryView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['events'][0]['task_type'], 'astrology.natal')
