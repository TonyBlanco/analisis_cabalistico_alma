from django.test import TestCase
from django.contrib.auth.models import User
from api.models import Patient, UserProfile
from api.test_models import Assignment
from assignments.select import select_questions
from assignments.select import _load_bank_items


class SelectQuestionsTests(TestCase):
    def setUp(self):
        self.therapist = User.objects.create_user(username="thera", password="pass")
        profile, _ = UserProfile.objects.get_or_create(user=self.therapist)
        profile.user_type = "therapist"
        profile.save()

        self.patient_user = User.objects.create_user(username="patient", password="pass")
        patient_profile, _ = UserProfile.objects.get_or_create(user=self.patient_user)
        patient_profile.user_type = "patient"
        patient_profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            user=self.patient_user,
            first_name="Luis",
            last_name="Fontela",
            email="luis@example.com",
            full_name="Luis Fontela",
            birth_date="1980-01-01",
            birth_city="Havana",
            birth_country="CU",
            birth_timezone="UTC",
        )

    def test_select_questions_avoids_repeats(self):
        items = _load_bank_items()
        used = [item["id"] for item in items[:10]]
        Assignment.objects.create(
            patient=self.patient,
            test_type="mcmi4-mystic",
            assigned_by_user=self.therapist,
            assigned_to_user=self.patient_user,
            questions=used,
        )

        selected, meta = select_questions(self.patient.id, "mcmi4-mystic", n=10)
        self.assertEqual(len(selected), 10)
        self.assertEqual(set(selected) & set(used), set())
        self.assertFalse(meta["collision"])

    def test_select_questions_exhausted_bank(self):
        items = _load_bank_items()
        all_ids = [item["id"] for item in items]
        Assignment.objects.create(
            patient=self.patient,
            test_type="mcmi4-mystic",
            assigned_by_user=self.therapist,
            assigned_to_user=self.patient_user,
            questions=all_ids,
        )

        selected, meta = select_questions(self.patient.id, "mcmi4-mystic", n=5)
        self.assertEqual(len(selected), 5)
        self.assertTrue(meta["collision"])
        self.assertGreater(meta["collision_count"], 0)
