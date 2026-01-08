from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from api.models import Patient
from api.models import PatientMessage

class PatientNotesTestCase(APITestCase):
    def setUp(self):
        # Therapist and their patient
        self.therapist = User.objects.create_user(username='therapist_a', password='pass')
        self.therapist.profile.user_type = 'therapist'
        self.therapist.profile.full_name = 'Therapist A'
        self.therapist.profile.save()

        self.patient_user = User.objects.create_user(username='patient_a', password='pass')
        self.patient_user.profile.user_type = 'patient'
        self.patient_user.profile.full_name = 'Patient A'
        self.patient_user.profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name='Patient',
            last_name='A',
            email='p@example.com',
            full_name='Patient A',
            birth_date='1990-01-01'
        )

        # Another patient (different user)
        self.other_patient_user = User.objects.create_user(username='patient_b', password='pass')
        self.other_patient_user.profile.user_type = 'patient'
        self.other_patient_user.profile.full_name = 'Patient B'
        self.other_patient_user.profile.save()

        self.other_patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.other_patient_user,
            first_name='Patient',
            last_name='B',
            email='p2@example.com',
            full_name='Patient B',
            birth_date='1992-02-02'
        )

        self.client = APIClient()

    def test_therapist_can_create_note_for_own_patient(self):
        self.client.force_authenticate(user=self.therapist)
        resp = self.client.post('/api/patient-notes/', {'patient': self.patient.id, 'content': 'Seguimiento después del test'}, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('id', resp.data)
        note = PatientMessage.objects.get(id=resp.data['id'])
        self.assertEqual(note.therapist, self.therapist)
        self.assertEqual(note.patient, self.patient)

    def test_patient_can_list_notes(self):
        # Create a note first
        note = PatientMessage.objects.create(therapist=self.therapist, patient=self.patient, content='Nota de prueba')
        self.client.force_authenticate(user=self.patient_user)
        resp = self.client.get('/api/patient-notes/')
        self.assertEqual(resp.status_code, 200)
        notes = resp.data.get('notes', [])
        self.assertTrue(any(n.get('id') == note.id for n in notes))

    def test_other_patient_cannot_see_notes(self):
        note = PatientMessage.objects.create(therapist=self.therapist, patient=self.patient, content='Nota privada')
        self.client.force_authenticate(user=self.other_patient_user)
        resp = self.client.get('/api/patient-notes/')
        self.assertEqual(resp.status_code, 200)
        notes = resp.data.get('notes', [])
        # other patient should not see the note
        self.assertFalse(any(n.get('id') == note.id for n in notes))

    def test_therapist_cannot_create_for_other_therapist_patient(self):
        # Create another therapist and attempt to create note for patient
        other_therapist = User.objects.create_user(username='therapist_b', password='pass')
        other_therapist.profile.user_type = 'therapist'
        other_therapist.profile.full_name = 'Therapist B'
        other_therapist.profile.save()

        self.client.force_authenticate(user=other_therapist)
        resp = self.client.post('/api/patient-notes/', {'patient': self.patient.id, 'content': 'Intruso'}, format='json')
        self.assertEqual(resp.status_code, 403)
