"""
Test suite for mcmi4-signal schema normalization (Requirement A).

Verifies that executing mcmi4-signal produces a TestResult with:
- schema_version: "mcmi4-signal:v1"
- total_items
- scale
- responses_summary: { mean, stdev, counts }
- timestamp
- note
"""
import json
from django.test import TestCase, Client
from django.contrib.auth.models import User
from api.test_models import TestModule, TestResult


class MCMI4SignalSchemaTest(TestCase):
    """Test mcmi4-signal produces normalized result_data schema."""

    def setUp(self):
        """Create test user and mcmi4-signal module."""
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            is_staff=False  # Not staff, regular user
        )
        # Create or get profile
        from api.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={
                'user_type': 'personal',
                'subscription_plan': 'premium'  # Premium to allow access
            }
        )
        profile.user_type = 'personal'
        profile.subscription_plan = 'premium'
        profile.save()
        
        self.test_module = TestModule.objects.create(
            code='mcmi4-signal',
            name='SWM MCMI-4 SIGNAL',
            description='Minimal 16-item signal for MCMI-4 Místico',
            test_type='holistic_screening',
            is_active=True,
            available_for_personal=True,
            required_access_level='personal'
        )
        # Log in
        self.client.login(username='testuser', password='testpass123')

    def test_mcmi4_signal_schema_normalization(self):
        """Test that POST /api/tests/execute with mcmi4-signal returns normalized schema."""
        # Simulate 16 responses (likert 1-5)
        responses = {str(i): (i % 5) + 1 for i in range(1, 17)}
        
        payload = {
            'test_module_code': 'mcmi4-signal',
            'input_data': {
                'responses': responses,
            },
            'save_result': True
        }
        
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200, f"Expected 200, got {response.status_code}: {response.content}")
        
        data = response.json()
        self.assertIn('result', data)
        result = data['result']
        
        # Verify required schema keys
        self.assertEqual(result.get('schema_version'), 'mcmi4-signal:v1', "Missing or incorrect schema_version")
        self.assertIn('total_items', result, "Missing total_items")
        self.assertIn('scale', result, "Missing scale")
        self.assertIn('timestamp', result, "Missing timestamp")
        self.assertIn('note', result, "Missing note")
        self.assertIn('responses_summary', result, "Missing responses_summary")
        
        summary = result['responses_summary']
        self.assertIn('mean', summary, "Missing responses_summary.mean")
        self.assertIn('stdev', summary, "Missing responses_summary.stdev")
        self.assertIn('counts', summary, "Missing responses_summary.counts")
        
        # Verify mean is normalized (0-1)
        mean = summary['mean']
        self.assertIsInstance(mean, (int, float), "mean should be numeric")
        self.assertGreaterEqual(mean, 0, "mean should be >= 0")
        self.assertLessEqual(mean, 1, "mean should be <= 1")
        
        # Verify stdev is normalized (0-1)
        stdev = summary['stdev']
        self.assertIsInstance(stdev, (int, float), "stdev should be numeric")
        self.assertGreaterEqual(stdev, 0, "stdev should be >= 0")
        self.assertLessEqual(stdev, 1, "stdev should be <= 1")
        
        # Verify counts has expected keys
        counts = summary['counts']
        for key in ['1', '2', '3', '4', '5']:
            self.assertIn(key, counts, f"Missing count for '{key}'")
        
        # Verify TestResult was saved with the schema
        if 'result_id' in data:
            tr = TestResult.objects.get(id=data['result_id'])
            self.assertIsNotNone(tr.result_data, "TestResult.result_data should not be None")
            self.assertEqual(tr.result_data.get('schema_version'), 'mcmi4-signal:v1', "Saved TestResult should have schema_version")

    def test_mcmi4_signal_handles_empty_responses(self):
        """Test that empty responses don't crash and produce valid schema with 0 mean/stdev."""
        payload = {
            'test_module_code': 'mcmi4-signal',
            'input_data': {
                'responses': {},
            },
            'save_result': True
        }
        
        response = self.client.post(
            '/api/tests/execute/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200, "Empty responses should not crash")
        data = response.json()
        result = data['result']
        
        self.assertEqual(result.get('schema_version'), 'mcmi4-signal:v1')
        self.assertEqual(result.get('total_items'), 0)
        # mean/stdev should be 0 for empty responses
        self.assertEqual(result['responses_summary']['mean'], 0)
        self.assertEqual(result['responses_summary']['stdev'], 0)
