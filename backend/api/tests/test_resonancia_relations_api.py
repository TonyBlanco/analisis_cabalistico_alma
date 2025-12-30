import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from api.models import Patient, ResonanciaRelation


class ResonanciaRelationAPITests(TestCase):
    def setUp(self):
        User = get_user_model()

        self.therapist_1 = User.objects.create_user('thera1', 'thera1@example.com', 'password')
        self.therapist_1.profile.user_type = 'therapist'
        self.therapist_1.profile.save()

        self.therapist_2 = User.objects.create_user('thera2', 'thera2@example.com', 'password')
        self.therapist_2.profile.user_type = 'therapist'
        self.therapist_2.profile.save()

        self.patient_1 = Patient.objects.create(
            therapist=self.therapist_1,
            email='p1@example.com',
            first_name='Paciente',
            last_name='Uno',
            full_name='Paciente Uno',
            birth_date='1990-01-01',
            birth_city='Ciudad',
            birth_country='Pais',
        )

        self.patient_2 = Patient.objects.create(
            therapist=self.therapist_2,
            email='p2@example.com',
            first_name='Paciente',
            last_name='Dos',
            full_name='Paciente Dos',
            birth_date='1991-01-01',
            birth_city='Ciudad',
            birth_country='Pais',
        )

        self.client_api = Client()
        self.client_api.force_login(self.therapist_1)

    def test_list_without_subject_returns_empty_list(self):
        resp = self.client_api.get('/api/resonancia/relations/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])

    def test_create_and_list_by_subject(self):
        payload = {
            'context': 'relacional',
            'to_label': '  hermano mayor  ',
            'position': 3,
            'note': '  Observación breve  ',
            'tags': ['a', ' ', 'b', ''],
            'author': self.therapist_2.id,
            'subject': self.patient_2.id,
            'from_ref': 'otro',
        }

        resp = self.client_api.post(
            f'/api/resonancia/relations/?subject={self.patient_1.id}',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data['author'], self.therapist_1.id)
        self.assertEqual(data['subject'], self.patient_1.id)
        self.assertEqual(data['from_ref'], 'consultante')
        self.assertEqual(data['to_label'], 'hermano mayor')
        self.assertEqual(data['position'], 3)
        self.assertEqual(data['note'], 'Observación breve')
        self.assertEqual(data['tags'], ['a', 'b'])

        resp_list = self.client_api.get(f'/api/resonancia/relations/?subject={self.patient_1.id}')
        self.assertEqual(resp_list.status_code, 200)
        list_data = resp_list.json()
        self.assertEqual(len(list_data), 1)
        self.assertEqual(list_data[0]['id'], data['id'])

    def test_position_validation(self):
        payload = {
            'context': 'familiar',
            'to_label': 'tío materno',
            'position': 0,
            'tags': [],
        }

        resp = self.client_api.post(
            f'/api/resonancia/relations/?subject={self.patient_1.id}',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_cannot_access_other_patient(self):
        ResonanciaRelation.objects.create(
            subject=self.patient_2,
            author=self.therapist_2,
            context='familiar',
            from_ref='consultante',
            to_label='hermano',
            position=1,
            note='',
            tags=[],
        )

        resp_list = self.client_api.get(f'/api/resonancia/relations/?subject={self.patient_2.id}')
        self.assertEqual(resp_list.status_code, 404)

