from datetime import date

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from api.models import Patient, UserProfile


class TherapistPatientProfileDemographicsTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist = User.objects.create_user("therapist_demo", "therapist_demo@test.com", "pass12345")
        profile = UserProfile.objects.get(user=self.therapist)
        profile.user_type = "therapist"
        profile.membership_active = True
        profile.subscription_plan = "professional"
        profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            email="p1@test.com",
            full_name="Test Patient",
            first_name="Test",
            last_name="Patient",
            birth_date=date(1990, 1, 1),
        )

        self.client = Client()
        self.client.force_login(self.therapist)

    def test_patch_persists_demographics_fields(self):
        resp = self.client.patch(
            f"/api/therapist/patients/{self.patient.id}/profile/update/",
            data={"biologicalSex": "male", "genderIdentity": "man"},
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.biological_sex, "male")
        self.assertEqual(self.patient.gender_identity, "man")

