from unittest.mock import patch

from django.test import TestCase, override_settings

from api.ai.llm_bridge import generate_text, get_provider_status, is_llm_available


class LLMBridgeTests(TestCase):
    @patch("api.ai.llm_bridge.generate_with_fallback")
    def test_generate_text_success(self, mock_fallback):
        mock_fallback.return_value = {
            "success": True,
            "text": "respuesta de prueba",
            "provider": "groq",
            "error": None,
        }
        result = generate_text("hola")
        self.assertTrue(result["success"])
        self.assertEqual(result["text"], "respuesta de prueba")
        status = get_provider_status()
        self.assertFalse(status["training"]["fine_tune"])
        self.assertFalse(status["training"]["lora"])
        self.assertFalse(status["training"]["checkpoints"])

    @patch("api.ai.llm_bridge.multi_ai._check_available_providers")
    def test_is_llm_available_requires_cloud_key(self, _mock_check):
        from api.ai.llm_bridge import multi_ai

        multi_ai.available_providers = ["ollama"]
        self.assertFalse(is_llm_available())

    @override_settings(AI_PROVIDER="free_first")
    def test_provider_status_reports_mode(self):
        status = get_provider_status()
        self.assertEqual(status["ai_provider_mode"], "free_first")