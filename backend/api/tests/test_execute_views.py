from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from api.test_models import TestModule
import json
from datetime import date

from api.models import Patient


class ExecuteTestAPITests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user('tuser', 'tuser@example.com', 'password')
        # Make user a therapist to have access to professional tests
        self.user.profile.user_type = 'therapist'
        self.user.profile.subscription_plan = 'professional'
        self.user.profile.membership_active = True
        self.user.profile.save()
        self.client_api = Client()
        # Login required for ExecuteTestView if permission restricts - use force login
        self.client_api.force_login(self.user)

        # Create a patient for therapist_clinical execution mode
        self.patient = Patient.objects.create(
            therapist=self.user,
            email='patient@example.com',
            full_name='Test Patient',
            birth_date=date(1990, 1, 1),
            first_name='Test',
            last_name='Patient'
        )

        # Create some test modules
        TestModule.objects.create(
            code='scl-90',
            name='SCL-90',
            test_type='scl90',
            is_active=True,
            available_for_therapists=True,
            available_for_personal=False,
            required_access_level='free'
        )
        TestModule.objects.create(
            code='stai',
            name='STAI',
            test_type='stai',
            is_active=True,
            available_for_therapists=True,
            available_for_personal=False,
            required_access_level='free'
        )
        TestModule.objects.create(
            code='mcmi-iv',
            name='MCMI-IV',
            test_type='mcmi-iv',
            is_active=True,
            requires_license=True,
            available_for_therapists=True,
            available_for_personal=False,
            required_access_level='free'
        )
        TestModule.objects.create(
            code='scid5',
            name='SCID-5',
            test_type='scid5',
            is_active=True,
            requires_license=True,
            available_for_therapists=True,
            available_for_personal=False,
            required_access_level='free'
        )
        # Grant the user a license for MCIM and SCID if modules require licenses
        from api.test_models import UserTestLicense, TestModule as TM
        try:
            mcmi = TM.objects.get(code='mcmi-iv')
            scid = TM.objects.get(code='scid5')
            UserTestLicense.objects.create(user=self.user, test_module=mcmi, active=True)
            UserTestLicense.objects.create(user=self.user, test_module=scid, active=True)
        except Exception:
            pass

    def test_execute_scl90(self):
        payload = {
            'test_module_code': 'scl-90',
            'patient_id': self.patient.id,
            'input_data': {
                'nombre': 'Paciente',
                'edad': 30,
                'fecha': '1995-01-01',
                'terapeuta': 'Dr. Test',
                'responses': {str(i): 1 for i in range(1, 91)}
            },
            'save_result': True
        }
        resp = self.client_api.post('/api/tests/execute/', json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('success'))
        self.assertIn('result', data)

    def test_execute_stai(self):
        payload = {
            'test_module_code': 'stai',
            'patient_id': self.patient.id,
            'input_data': {
                'nombre': 'Paciente',
                'edad': 30,
                'fecha': '1995-01-01',
                'terapeuta': 'Dr. Test',
                'responses': {str(i): 2 for i in range(1, 41)}
            },
            'save_result': True
        }
        resp = self.client_api.post('/api/tests/execute/', json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_execute_mcmi(self):
        payload = {
            'test_module_code': 'mcmi-iv',
            'patient_id': self.patient.id,
            'input_data': {
                'nombre': 'Paciente',
                'edad': 50,
                'fecha': '1975-01-01',
                'terapeuta': 'Dr. Test',
                'responses': {str(i): 1 for i in range(1, 196)}
            },
            'save_result': True
        }
        resp = self.client_api.post('/api/tests/execute/', json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_execute_mcmi_without_license(self):
        from api.test_models import UserTestLicense, TestModule as TM
        tm = TM.objects.get(code='mcmi-iv')
        # deactivate license for this user
        UserTestLicense.objects.filter(user=self.user, test_module=tm).update(active=False)
        payload = {
            'test_module_code': 'mcmi-iv',
            'patient_id': self.patient.id,
            'input_data': { 'nombre': 'Paciente', 'edad': 50, 'fecha': '1975-01-01', 'terapeuta': 'Dr. Test', 'responses': {str(i): 1 for i in range(1, 196)} },
            'save_result': True
        }
        resp = self.client_api.post('/api/tests/execute/', json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 403)

    def test_execute_scid5(self):
        payload = {
            'test_module_code': 'scid5',
            'patient_id': self.patient.id,
            'input_data': {
                'nombre': 'Paciente',
                'edad': 33,
                'fecha': '1992-01-01',
                'terapeuta': 'Dr. Test',
                'responses': { 'B1': 3, 'B2': 3, 'B3': 3, 'B4': 3, 'B5': 3 }
            },
            'save_result': True
        }
        resp = self.client_api.post('/api/tests/execute/', json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
