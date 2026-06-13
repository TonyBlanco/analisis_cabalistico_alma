"""
Tests for sha_harmony catalog activation (migration 0108) and therapist guide.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from importlib import import_module

from api.test_models import TestModule

_migration = import_module('api.migrations.0108_activate_sha_harmony')
migration_activate_sha_harmony = _migration.activate_sha_harmony

AVAILABLE_TESTS_URL = '/api/tests/'
User = get_user_model()

SHA_GUIDE_SNIPPET = 'lectura simbólica de Netzach'


def _make_therapist(username: str = 't_sha') -> tuple:
    user = User.objects.create_user(username, f'{username}@test.com', 'pass')
    user.profile.user_type = 'therapist'
    user.profile.save()
    token = Token.objects.create(user=user)
    return user, token.key


class ShaHarmonyActivationTests(TestCase):
    def setUp(self):
        self.module = TestModule.objects.create(
            code='sha_harmony',
            name='Sephirotic Harmony Audit (SHA)',
            description='',
            test_type='holistic_screening',
            domain='holistic',
            is_active=False,
            is_assignable=False,
            available_for_therapists=False,
            available_for_personal=False,
        )
        self.therapist, self.token = _make_therapist()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def _run_activation(self):
        from django.apps import apps

        migration_activate_sha_harmony(apps, None)

    def test_migration_activates_module_and_guide(self):
        self._run_activation()
        self.module.refresh_from_db()
        self.assertTrue(self.module.is_active)
        self.assertTrue(self.module.is_assignable)
        self.assertTrue(self.module.available_for_therapists)
        self.assertIn(SHA_GUIDE_SNIPPET, self.module.description)

    def test_safe_queryset_includes_sha_harmony(self):
        self._run_activation()
        qs = TestModule.objects.all()._safe_testmodule_queryset().filter(code='sha_harmony')
        self.assertTrue(qs.exists())

    def test_available_tests_lists_sha_harmony_for_therapist(self):
        self._run_activation()
        resp = self.client.get(AVAILABLE_TESTS_URL)
        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        tests = payload.get('tests', payload) if isinstance(payload, dict) else payload
        codes = {item['code'] for item in tests}
        self.assertIn('sha_harmony', codes)

    def test_idempotent_second_run(self):
        self._run_activation()
        first_desc = TestModule.objects.get(code='sha_harmony').description
        self._run_activation()
        second_desc = TestModule.objects.get(code='sha_harmony').description
        self.assertEqual(first_desc, second_desc)