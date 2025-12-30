import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from api.models import Patient, ResonanciaObservation


class ResonanciaObservationAPITests(TestCase):
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

    def test_create_and_list_by_subject(self):
        payload = {
            'type': 'resonancia',
            'source': 'registro_manual',
            'context': 'relacional',
            'state': 'activo',
            'anchors': ['A', ' ', 'B', ''],
            'tags': ['tag1', ' tag2 '],
            'statement': '  Observación de prueba  ',
            'author': self.therapist_2.id,
            'subject': self.patient_2.id,
        }

        resp = self.client_api.post(
            f'/api/resonancia/observations/?subject={self.patient_1.id}',
            json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data['author'], self.therapist_1.id)
        self.assertEqual(data['subject'], self.patient_1.id)
        self.assertEqual(data['anchors'], ['A', 'B'])
        self.assertEqual(data['tags'], ['tag1', 'tag2'])
        self.assertEqual(data['statement'], 'Observación de prueba')

        resp_list = self.client_api.get(f'/api/resonancia/observations/?subject={self.patient_1.id}')
        self.assertEqual(resp_list.status_code, 200)
        list_data = resp_list.json()
        self.assertEqual(len(list_data), 1)
        self.assertEqual(list_data[0]['id'], data['id'])

    def test_cannot_access_other_patient(self):
        # Therapist 1 should not be able to list observations for therapist 2 patient
        ResonanciaObservation.objects.create(
            subject=self.patient_2,
            author=self.therapist_2,
            type='nota',
            source='registro_manual',
            context='familiar',
            state='activo',
            anchors=[],
            tags=[],
            statement='Nota',
        )

        resp_list = self.client_api.get(f'/api/resonancia/observations/?subject={self.patient_2.id}')
        self.assertEqual(resp_list.status_code, 404)

