"""
PIP Fase 0 — integration tests for unified LLM router (mocked, no HTTP to providers).
"""
import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings

from api.holistic_synthesis_engine import HolisticSynthesisEngine
from api.utils.symbolic_interpreter_ai import SymbolicInterpreterAI
from api.utils.tarot_service import TarotTherapeuticAI


class AIRouterIntegrationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user("router_test", "router@test.com", "pass")
        self.user.profile.user_type = "therapist"
        self.user.profile.save()
        self.client_api = Client()
        self.client_api.force_login(self.user)

    def test_ai_status_endpoint(self):
        resp = self.client_api.get("/api/ai/status/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("ai_provider_mode", data)
        self.assertIn("available_providers", data)
        self.assertFalse(data["training"]["fine_tune"])
        self.assertFalse(data["training"]["lora"])
        self.assertFalse(data["training"]["checkpoints"])

    @patch("api.ai_views.is_llm_available", return_value=True)
    @patch("api.ai_views.generate_text")
    def test_holistic_query_uses_llm_bridge(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "Orientación educativa sobre MCMI-4.",
            "provider": "groq",
        }
        resp = self.client_api.post(
            "/api/ai/holistic-query/",
            data=json.dumps({"query": "¿Cómo leer un perfil holístico?"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["provider"], "groq")
        mock_gen.assert_called_once()

    @patch("api.ai.llm_bridge.is_llm_available", return_value=True)
    @patch("api.ai.llm_bridge.generate_text")
    def test_mshe_generate_ai_analysis_uses_bridge(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": json.dumps(
                {
                    "dominant_themes": ["Tema A"],
                    "priority_axes": ["identity_purpose"],
                    "recurrent_patterns": ["Patrón"],
                    "areas_of_progress": ["Progreso"],
                    "areas_of_stagnation": ["Estancamiento"],
                    "evaluated_summary": "Resumen simbólico tentativo.",
                }
            ),
            "provider": "groq",
        }
        engine = HolisticSynthesisEngine.__new__(HolisticSynthesisEngine)
        synthesis_data = {
            "scores": {"identity_purpose": 72.0, "emotion_regulation": 55.0},
            "color_alerts": {"identity_purpose": "verde"},
            "axis_contributions": {},
        }
        result = engine.generate_ai_analysis(synthesis_data)
        self.assertIn("dominant_themes", result)
        mock_gen.assert_called_once()

    @patch("api.ai.llm_bridge.is_llm_available", return_value=True)
    @patch("api.ai.llm_bridge.generate_text")
    def test_tarot_service_uses_llm_bridge(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": json.dumps(
                {
                    "analisis_sombra": "Lectura tentativa del arquetipo.",
                    "acciones_sanadoras": [],
                    "mensaje_integrador": "Integración simbólica.",
                }
            ),
            "provider": "groq",
        }
        ai = TarotTherapeuticAI()
        out = ai.analyze_archetype_vs_clinical(
            arcana_number=0,
            arcana_name="El Loco",
            hebrew_letter="א",
            test_name="GAD-7",
            clinical_severity="Ansiedad moderada",
        )
        self.assertNotIn("error", out)
        mock_gen.assert_called_once()

    @patch("api.ai.llm_bridge.is_llm_available", return_value=True)
    @patch("api.ai.llm_bridge.generate_text")
    def test_symbolic_interpreter_uses_llm_bridge(self, mock_gen, _mock_avail):
        mock_gen.return_value = {
            "success": True,
            "text": "Flujo simbólico entre sefirot podría equilibrarse.",
            "provider": "gemini",
        }
        svc = SymbolicInterpreterAI()
        text = svc.generate_symbolic_interpretation("Interpreta el flujo Keter-Malkuth.")
        self.assertIn("sefirot", text.lower())
        mock_gen.assert_called_once()

    @patch("api.utils.multi_ai_service._call_ollama", return_value=None)
    @patch("api.utils.multi_ai_service._call_openai", return_value=None)
    @patch("api.utils.multi_ai_service._call_gemini", return_value="respuesta gemini")
    @patch("api.utils.multi_ai_service._call_groq", return_value=None)
    @patch("api.utils.multi_ai_service.multi_ai")
    def test_free_first_fallback_second_provider(
        self, mock_multi, _groq, _gemini, _openai, _ollama
    ):
        mock_multi.available_providers = ["groq", "gemini", "openai", "ollama"]
        from api.utils.multi_ai_service import MultiAIService

        svc = MultiAIService()
        svc.available_providers = mock_multi.available_providers
        result = svc.generate("prompt de prueba")
        self.assertTrue(result["success"])
        self.assertEqual(result["provider"], "gemini")

    def test_swm_v3_still_wires_generate_with_fallback(self):
        import symbolic.swm_v3.views as swm_views

        self.assertIsNotNone(swm_views.generate_with_fallback)
        self.assertTrue(callable(swm_views.generate_with_fallback))