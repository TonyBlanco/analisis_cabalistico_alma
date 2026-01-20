from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from api.models import Patient, UserProfile
from api.test_models import Assignment


class AssignmentsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.therapist = User.objects.create_user(username="therapist", password="pass")
        t_profile, _ = UserProfile.objects.get_or_create(user=self.therapist)
        t_profile.user_type = "therapist"
        t_profile.save()

        self.patient_user = User.objects.create_user(username="patient", password="pass")
        p_profile, _ = UserProfile.objects.get_or_create(user=self.patient_user)
        p_profile.user_type = "patient"
        p_profile.save()

        self.admin_user = User.objects.create_user(username="admin", password="pass", is_staff=True)
        a_profile, _ = UserProfile.objects.get_or_create(user=self.admin_user)
        a_profile.user_type = "therapist"
        a_profile.is_admin = True
        a_profile.save()

        # Refresh users to avoid stale profile cache from the post_save signal.
        self.therapist = User.objects.get(pk=self.therapist.pk)
        self.patient_user = User.objects.get(pk=self.patient_user.pk)
        self.admin_user = User.objects.get(pk=self.admin_user.pk)

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

    def test_assignment_flow(self):
        self.client.force_authenticate(user=self.therapist)
        resp = self.client.post(
            "/api/assignments",
            {
                "patient_id": self.patient.id,
                "test_type": "mcmi4-mystic",
                "assigned_to_user_id": self.patient_user.id,
                "n_questions": 10,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        assignment_id = resp.data["id"]

        self.client.force_authenticate(user=self.patient_user)
        resp = self.client.post(f"/api/assignments/{assignment_id}/start", format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "in_progress")

        assignment = Assignment.objects.get(id=assignment_id)
        responses = [{"question_id": qid, "answer": 1} for qid in assignment.questions[:5]]
        resp = self.client.post(
            f"/api/assignments/{assignment_id}/submit",
            {"responses": responses},
            format="json",
        )
        self.assertEqual(resp.status_code, 202)
        self.assertEqual(resp.data["status"], "pending_compute")

        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.post(f"/api/assignments/{assignment_id}/compute", format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "completed")

        resp_again = self.client.post(f"/api/assignments/{assignment_id}/compute", format="json")
        self.assertEqual(resp_again.status_code, 200)
        self.assertEqual(resp_again.data["status"], "completed")

    def test_max_reassign_exceeded(self):
        self.client.force_authenticate(user=self.therapist)
        for _ in range(4):
            resp = self.client.post(
                "/api/assignments",
                {
                    "patient_id": self.patient.id,
                    "test_type": "mcmi4-mystic",
                    "assigned_to_user_id": self.patient_user.id,
                    "n_questions": 5,
                },
                format="json",
            )
            self.assertEqual(resp.status_code, 201)

        resp = self.client.post(
            "/api/assignments",
            {
                "patient_id": self.patient.id,
                "test_type": "mcmi4-mystic",
                "assigned_to_user_id": self.patient_user.id,
                "n_questions": 5,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.data["error"], "max_reassign_exceeded")
