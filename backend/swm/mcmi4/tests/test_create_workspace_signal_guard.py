"""
Tests for CreateWorkspaceView SIGNAL guard.

Objective: Prevent creating an MCMI-4 Mystic workspace without a valid
mcmi4-signal TestResult that belongs to the subject_user.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api.mcmi4_signal_public_name import (
    MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
    MCMI4_SIGNAL_PUBLIC_NAME,
)
from api.test_models import TestModule, TestResult
from swm.mcmi4.models import WorkspaceDefinition, WorkspaceInstance

User = get_user_model()


class CreateWorkspaceSignalGuardTestCase(TestCase):
    def setUp(self):
        self.creator_user = User.objects.create_user(
            username='creator_guard_test',
            password='testpass123',
        )
        self.subject_user = User.objects.create_user(
            username='subject_guard_test',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other_guard_test',
            password='testpass123',
        )

        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.creator_user)

        self.signal_module = TestModule.objects.create(
            code='mcmi4-signal',
            name=MCMI4_SIGNAL_PUBLIC_NAME,
            public_name=MCMI4_SIGNAL_PUBLIC_NAME,
            description=MCMI4_SIGNAL_PUBLIC_DESCRIPTION,
            test_type='holistic_screening',
            domain=TestModule.Domain.TECHNICAL,
            is_active=True,
            is_assignable=False,
            is_internal=True,
            available_for_therapists=False,
            available_for_personal=False,
        )

        self.other_module = TestModule.objects.create(
            code='not-mcmi4-signal',
            name='Other Module',
            public_name='Other Module',
            description='Other module',
            test_type='holistic_screening',
            domain=TestModule.Domain.TECHNICAL,
            is_active=True,
            is_assignable=False,
            is_internal=True,
            available_for_therapists=False,
            available_for_personal=False,
        )

    def test_create_rejects_non_integer_source_id(self):
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': 'NOT_AN_ID',
                'config': {},
                'metadata': {},
            },
            format='json',
        )
        self.assertEqual(resp.status_code, 422)
        self.assertIn('mcmi4_source_data_id', resp.data.get('error', ''))

    def test_create_rejects_nonexistent_testresult(self):
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': '999999999',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, 422)

    def test_create_rejects_wrong_test_module_code(self):
        tr = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.other_module,
            input_data={},
            result_data={'signal': 'x'},
        )
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': str(tr.id),
            },
            format='json',
        )
        self.assertEqual(resp.status_code, 422)

    def test_create_rejects_subject_mismatch(self):
        tr = TestResult.objects.create(
            user=self.other_user,
            test_module=self.signal_module,
            input_data={},
            result_data={'signal': 'x'},
        )
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': str(tr.id),
            },
            format='json',
        )
        self.assertEqual(resp.status_code, 422)

    def test_create_allows_valid_mcmi4_signal_testresult(self):
        tr = TestResult.objects.create(
            user=self.subject_user,
            test_module=self.signal_module,
            input_data={},
            result_data={'signal': 'ok'},
        )
        resp = self.client.post(
            '/api/swm/mcmi4/create',
            {
                'subject_user_id': self.subject_user.id,
                'mcmi4_source_data_id': str(tr.id),
                'config': {},
                'metadata': {},
            },
            format='json',
        )
        self.assertEqual(resp.status_code, 201)

        workspace_id = resp.data.get('workspace_id')
        self.assertIsNotNone(workspace_id)

        workspace = WorkspaceInstance.objects.filter(id=workspace_id).first()
        self.assertIsNotNone(workspace)
        self.assertEqual(workspace.subject_user_id, self.subject_user.id)
        self.assertEqual(workspace.mcmi4_source_data_id, str(tr.id))
