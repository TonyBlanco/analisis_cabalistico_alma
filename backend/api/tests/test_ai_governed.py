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
        self.assertEqual(resp.json().get("code"), "feature_disabled")

    def test_bioemotion_closed_synthesis_rejected(self):
        self.synthesis.is_closed = True
        self.synthesis.save(update_fields=["is_closed"])
        url = f"/api/bioemotional/synthesis/{self.synthesis.id}/assist-draft/"
        resp = self.client_api.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    @override_settings(AI_BIOEMOTION_DRAFT_ENABLED=False)
    def test_bioemotion_disabled_flag(self):
        url = f"/api/bioemotional/synthesis/{self.synthesis.id}/assist-draft/"
        resp = self.client_api.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.json().get("code"), "feature_disabled")

    @patch("api.ai.governed_views.is_llm_available", return_value=True)
    @patch("api.ai.governed_views.generate_text")
    def test_bioemotion_guardrail_blocks_draft(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "Debes abandonar el patrón de inmediato.",
            "provider": "groq",
        }
        url = f"/api/bioemotional/synthesis/{self.synthesis.id}/assist-draft/"
        resp = self.client_api.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 422)
        self.assertTrue(resp.json().get("guardrail_violation"))

    def test_kabbalah_invalid_tree_state(self):
        bad_tree = {"source": {}, "sefirot": [], "flows": []}
        resp = self.client_api.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": bad_tree}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json().get("code"), "invalid_tree_state")

    @patch("api.ai.governed_views.is_llm_available", return_value=False)
    def test_kabbalah_llm_unavailable(self, _mock_avail):
        resp = self.client_api.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 503)
        self.assertEqual(resp.json().get("code"), "llm_unavailable")

    def test_feedback_invalid_rating(self):
        resp = self.client_api.post(
            "/api/ai/feedback/",
            data=json.dumps({"feature": "bioemotion_draft", "rating": 9}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_feedback_wrong_patient_denied(self):
        User = get_user_model()
        other = User.objects.create_user("other_th", "other@test.com", "pass")
        other.profile.user_type = "therapist"
        other.profile.save()
        foreign = Patient.objects.create(
            therapist=other,
            first_name="Otro",
            last_name="Paciente",
            email="otro@test.com",
            full_name="Otro Paciente",
            birth_date="1985-05-05",
        )
        resp = self.client_api.post(
            "/api/ai/feedback/",
            data=json.dumps(
                {
                    "feature": "kabbalah_interpret",
                    "rating": 3,
                    "patient_id": foreign.id,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 403)

    def test_feedback_stores_correction_text_feature_and_prompt_version(self):
        resp = self.client_api.post(
            "/api/ai/feedback/",
            data=json.dumps(
                {
                    "feature": "bioemotion_draft",
                    "rating": 5,
                    "patient_id": self.patient.id,
                    "provider": "gemini",
                    "prompt_version": "bioemotional_draft_v1",
                    "correction_text": "Mantener el tono fenomenologico y no causal.",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 201)
        feedback = AIInteractionFeedback.objects.get()
        self.assertEqual(feedback.feature, "bioemotion_draft")
        self.assertEqual(feedback.rating, 5)
        self.assertEqual(feedback.patient, self.patient)
        self.assertEqual(feedback.provider, "gemini")
        self.assertEqual(feedback.prompt_version, "bioemotional_draft_v1")
        self.assertEqual(
            feedback.correction_text,
            "Mantener el tono fenomenologico y no causal.",
        )

    def test_feedback_create_read_roundtrip_in_test_db(self):
        created = AIInteractionFeedback.objects.create(
            therapist=self.user,
            patient=self.patient,
            feature="kabbalah_interpret",
            provider="groq",
            prompt_version="kabbalah_interpret_v1",
            rating=4,
            correction_text="Usar lenguaje mas tentativo.",
        )

        loaded = AIInteractionFeedback.objects.get(pk=created.pk)
        self.assertEqual(loaded.therapist, self.user)
        self.assertEqual(loaded.patient, self.patient)
        self.assertEqual(loaded.feature, "kabbalah_interpret")
        self.assertEqual(loaded.provider, "groq")
        self.assertEqual(loaded.prompt_version, "kabbalah_interpret_v1")
        self.assertEqual(loaded.rating, 4)
        self.assertEqual(loaded.correction_text, "Usar lenguaje mas tentativo.")
