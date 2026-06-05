import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings

from api.bioemotional.models import BioEmotionalSynthesis
from api.models import AIInteractionFeedback, Patient

MIN_TREE = {
    "source": {"methodId": "unit_test"},
    "sefirot": [{"id": f"s{i}"} for i in range(10)],
    "flows": [],
}


class GovernedAITests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user("therapist_pip", "pip@example.com", "pass")
        self.user.profile.user_type = "therapist"
        self.user.profile.save()
        self.client_api = Client()
        self.client_api.force_login(self.user)
        self.patient = Patient.objects.create(
            therapist=self.user,
            first_name="Ana",
            last_name="Test",
            email="ana@test.com",
            full_name="Ana Test",
            birth_date="1990-01-01",
        )
        self.synthesis = BioEmotionalSynthesis.objects.create(
            therapist=self.user,
            patient=self.patient,
            text="Borrador inicial",
            is_closed=False,
        )

    @patch("api.ai.governed_views.is_llm_available", return_value=True)
    @patch("api.ai.governed_views.generate_text")
    def test_kabbalah_interpret_ok(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "Lectura simbólica tentativa del flujo entre sefirot.",
            "provider": "groq",
        }
        resp = self.client_api.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["lane"], "symbolic")

    @patch("api.ai.governed_views.is_llm_available", return_value=True)
    @patch("api.ai.governed_views.generate_text")
    def test_kabbalah_guardrail_blocks_diagnosis(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "El paciente tiene un trastorno depresivo mayor.",
            "provider": "groq",
        }
        resp = self.client_api.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)
        self.assertTrue(resp.json().get("guardrail_violation"))

    @patch("api.ai.governed_views.is_llm_available", return_value=True)
    @patch("api.ai.governed_views.generate_text")
    def test_bioemotion_assist_draft_not_persisted(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "Podría integrarse la tensión reportada en el área emocional.",
            "provider": "groq",
        }
        url = f"/api/bioemotional/synthesis/{self.synthesis.id}/assist-draft/"
        resp = self.client_api.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["persisted"])
        self.synthesis.refresh_from_db()
        self.assertEqual(self.synthesis.text, "Borrador inicial")

    def test_ai_feedback_stored(self):
        resp = self.client_api.post(
            "/api/ai/feedback/",
            data=json.dumps(
                {
                    "feature": "kabbalah_interpret",
                    "rating": 4,
                    "patient_id": self.patient.id,
                    "provider": "groq",
                    "prompt_version": "kabbalah_educational_v1",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(AIInteractionFeedback.objects.count(), 1)

    @override_settings(AI_KABBALAH_ENABLED=False)
    def test_kabbalah_disabled_flag(self):
        resp = self.client_api.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 403)