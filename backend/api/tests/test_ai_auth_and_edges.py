import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings

from api.bioemotional.models import BioEmotionalSynthesis
from api.models import Patient
from api.tests.test_ai_governed import MIN_TREE


class AIAuthAndEdgeTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user("therapist_edges", "edges@example.com", "pass")
        self.user.profile.user_type = "therapist"
        self.user.profile.save()

        self.other_user = User.objects.create_user("therapist_other", "other_edges@example.com", "pass")
        self.other_user.profile.user_type = "therapist"
        self.other_user.profile.save()

        self.client_api = Client()
        self.client_api.force_login(self.user)
        self.anonymous_client = Client()

        self.patient = Patient.objects.create(
            therapist=self.user,
            first_name="Ana",
            last_name="Edges",
            email="ana.edges@example.com",
            full_name="Ana Edges",
            birth_date="1990-01-01",
        )
        self.foreign_patient = Patient.objects.create(
            therapist=self.other_user,
            first_name="Otra",
            last_name="Persona",
            email="otra.edges@example.com",
            full_name="Otra Persona",
            birth_date="1988-05-05",
        )
        self.synthesis = BioEmotionalSynthesis.objects.create(
            therapist=self.user,
            patient=self.patient,
            text="Borrador propio",
            is_closed=False,
        )
        self.foreign_synthesis = BioEmotionalSynthesis.objects.create(
            therapist=self.other_user,
            patient=self.foreign_patient,
            text="Borrador ajeno",
            is_closed=False,
        )

    def test_holistic_query_requires_auth(self):
        resp = self.anonymous_client.post(
            "/api/ai/holistic-query/",
            data=json.dumps({"query": "Lectura educativa"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_kabbalah_interpret_requires_auth(self):
        resp = self.anonymous_client.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_ai_feedback_requires_auth(self):
        resp = self.anonymous_client.post(
            "/api/ai/feedback/",
            data=json.dumps({"feature": "kabbalah_interpret", "rating": 4}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_bioemotion_assist_requires_auth(self):
        url = f"/api/bioemotional/synthesis/{self.synthesis.id}/assist-draft/"
        resp = self.anonymous_client.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 401)

    @patch("api.ai.governed_views.is_llm_available", return_value=True)
    @patch("api.ai.governed_views.generate_text")
    def test_kabbalah_interpret_allows_therapist_without_patient_binding(
        self, mock_gen, _mock_avail
    ):
        User = get_user_model()
        therapist_only = User.objects.create_user(
            "therapist_no_patient", "no_patient@example.com", "pass"
        )
        therapist_only.profile.user_type = "therapist"
        therapist_only.profile.save()
        client = Client()
        client.force_login(therapist_only)

        mock_gen.return_value = {
            "success": True,
            "text": "Podria reflejar una lectura simbolica tentativa del arbol.",
            "provider": "groq",
        }
        resp = client.post(
            "/api/ai/kabbalah/interpret/",
            data=json.dumps({"tree_structural_state": MIN_TREE}),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["lane"], "symbolic")

    def test_bioemotion_assist_denies_foreign_synthesis(self):
        url = f"/api/bioemotional/synthesis/{self.foreign_synthesis.id}/assist-draft/"
        resp = self.client_api.post(url, content_type="application/json")
        self.assertEqual(resp.status_code, 403)

    def test_holistic_query_returns_400_without_query(self):
        resp = self.client_api.post(
            "/api/ai/holistic-query/",
            data=json.dumps({"query": "   "}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    @patch("api.ai_views.is_llm_available", return_value=False)
    def test_holistic_query_returns_503_when_llm_unavailable(self, _mock_avail):
        resp = self.client_api.post(
            "/api/ai/holistic-query/",
            data=json.dumps({"query": "Como leer este perfil"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 503)

    @override_settings(GROQ_API_KEY="test-groq", GEMINI_API_KEY="", OPENAI_API_KEY="")
    @patch("api.ai.llm_bridge.generate_with_fallback")
    def test_ai_status_reports_last_call_after_mocked_generate_text(self, mock_fallback):
        from api.ai.llm_bridge import generate_text

        mock_fallback.return_value = {
            "success": True,
            "text": "respuesta mockeada",
            "provider": "groq",
            "error": None,
        }
        result = generate_text("status probe")
        resp = self.client_api.get("/api/ai/status/")

        self.assertTrue(result["success"])
        self.assertEqual(resp.status_code, 200)
        last_call = resp.json()["last_call"]
        self.assertEqual(last_call["provider"], "groq")
        self.assertTrue(last_call["success"])
        self.assertIsInstance(last_call["latency_ms"], int)
        self.assertIsNotNone(last_call["at"])

    @override_settings(
        AI_PROVIDER="free_first",
        GROQ_API_KEY="test-groq",
        GEMINI_API_KEY="test-gemini",
        OPENAI_API_KEY="",
    )
    @patch("api.utils.multi_ai_service._call_ollama", return_value=None)
    @patch("api.utils.multi_ai_service._call_openai", return_value=None)
    @patch("api.utils.multi_ai_service._call_gemini", return_value="respuesta gemini")
    @patch("api.utils.multi_ai_service._call_groq", return_value="respuesta groq")
    def test_multi_ai_free_first_prefers_groq_before_gemini(
        self, mock_groq, mock_gemini, _mock_openai, _mock_ollama
    ):
        from api.utils.multi_ai_service import MultiAIService

        result = MultiAIService().generate("prompt de prueba")

        self.assertTrue(result["success"])
        self.assertEqual(result["provider"], "groq")
        mock_groq.assert_called_once()
        mock_gemini.assert_not_called()

    @override_settings(
        AI_PROVIDER="free_first",
        GROQ_API_KEY="test-groq",
        GEMINI_API_KEY="test-gemini",
        OPENAI_API_KEY="",
    )
    @patch("api.utils.multi_ai_service._call_ollama", return_value=None)
    @patch("api.utils.multi_ai_service._call_openai", return_value=None)
    @patch("api.utils.multi_ai_service._call_gemini", return_value="respuesta gemini")
    @patch("api.utils.multi_ai_service._call_groq", return_value="respuesta groq")
    def test_multi_ai_preferred_provider_moves_provider_first(
        self, mock_groq, mock_gemini, _mock_openai, _mock_ollama
    ):
        from api.utils.multi_ai_service import MultiAIService

        result = MultiAIService(preferred_provider="gemini").generate("prompt de prueba")

        self.assertTrue(result["success"])
        self.assertEqual(result["provider"], "gemini")
        mock_gemini.assert_called_once()
        mock_groq.assert_not_called()

    def test_swm_v3_import_contract_remains_available(self):
        import symbolic.swm_v3.views as swm_views

        self.assertTrue(callable(swm_views.generate_with_fallback))
