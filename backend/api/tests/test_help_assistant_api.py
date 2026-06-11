import json
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import Client, TestCase, override_settings

from api.models_ai_usage import AIUsageEvent


def _make_result(title, path, excerpt, score=3.0):
    r = MagicMock()
    r.title = title
    r.path = path
    r.excerpt = excerpt
    r.score = score
    return r


def _make_fallback(title, path):
    r = MagicMock()
    r.title = title
    r.path = path
    return r


_PLAN_PATH = "docs/plans/PLAN-centro-aprendizaje-asistente-ia.md"
_PLAN_TITLE = "Plan — Centro de Aprendizaje + Asistente IA de ayuda"


class HelpAssistantApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("help_therapist", "help@example.com", "pass")
        self.user.profile.user_type = "therapist"
        self.user.profile.full_name = "Help Therapist"
        self.user.profile.save()
        self.client_api = Client()
        self.client_api.force_login(self.user)

    @patch("api.help_assistant.views.best_fallback_guide")
    @patch("api.help_assistant.views.search_help_docs")
    @patch("api.help_assistant.views.generate_text")
    @patch("api.help_assistant.views.is_llm_available", return_value=True)
    def test_help_ask_returns_frozen_contract_with_citations(
        self, _mock_available, mock_generate, mock_search, mock_fallback
    ):
        mock_search.return_value = [
            _make_result(_PLAN_TITLE, _PLAN_PATH, "El asistente responde SOLO sobre como funciona la app.", score=3.0),
        ]
        mock_fallback.return_value = _make_fallback(_PLAN_TITLE, _PLAN_PATH)
        mock_generate.return_value = {
            "success": True,
            "text": "Puedes usar el menú Aprender para ver las guías y novedades.",
            "provider": "groq",
            "model": "llama-3.1-8b-instant",
            "prompt_tokens": 120,
            "completion_tokens": 35,
            "total_tokens": 155,
        }

        resp = self.client_api.post(
            "/api/help/ask",
            data=json.dumps({"query": "¿Dónde veo las guías?"}),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["answer"], "Puedes usar el menú Aprender para ver las guías y novedades.")
        self.assertEqual(data["citations"][0]["path"], _PLAN_PATH)
        self.assertEqual(data["citations"][0]["title"], _PLAN_TITLE)
        self.assertEqual(data["grounding"], "partial")
        self.assertEqual(data["fallback_guide"]["path"], _PLAN_PATH)
        self.assertEqual(data["provider"], "groq")
        self.assertEqual(data["usage"]["prompt_tokens"], 120)
        self.assertEqual(data["usage"]["completion_tokens"], 35)
        self.assertEqual(data["usage"]["total_tokens"], 155)

    @patch("api.help_assistant.views.best_fallback_guide")
    @patch("api.help_assistant.views.search_help_docs")
    @patch("api.help_assistant.views.generate_text")
    def test_help_ask_declines_clinical_interpretation_before_llm(
        self, mock_generate, mock_search, mock_fallback
    ):
        mock_fallback.return_value = _make_fallback(_PLAN_TITLE, _PLAN_PATH)

        resp = self.client_api.post(
            "/api/help/ask",
            data=json.dumps({"query": "¿Esto es un diagnóstico clínico?"}),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Guard declined — LLM and search must NOT be called
        mock_search.assert_not_called()
        mock_generate.assert_not_called()
        self.assertIn("interpret", data["answer"].lower())
        self.assertEqual(data["grounding"], "none")
        self.assertIn("fallback_guide", data)

    @override_settings(AI_METERING_ENABLED=True)
    @patch("api.help_assistant.views.best_fallback_guide")
    @patch("api.help_assistant.views.search_help_docs")
    @patch("api.utils.multi_ai_service.MultiAIService")
    @patch("api.help_assistant.views.is_llm_available", return_value=True)
    def test_help_ask_records_ai_usage_event(
        self, _mock_available, mock_service_cls, mock_search, mock_fallback
    ):
        mock_search.return_value = [
            _make_result(_PLAN_TITLE, _PLAN_PATH, "El asistente es RAG anclado en /docs.", score=3.0),
        ]
        mock_fallback.return_value = _make_fallback(_PLAN_TITLE, _PLAN_PATH)
        _llm_result = {
            "success": True,
            "text": "Consulta la guía del Centro de Aprendizaje para ubicarte.",
            "provider": "groq",
            "model": "llama-3.1-8b-instant",
            "prompt_tokens": 80,
            "completion_tokens": 20,
            "total_tokens": 100,
        }
        mock_service_cls.return_value.generate.return_value = _llm_result

        resp = self.client_api.post(
            "/api/help/ask",
            data=json.dumps({"query": "¿Cómo encuentro la guía de novedades?"}),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            AIUsageEvent.objects.filter(therapist=self.user, task_type="help.ask").count(),
            1,
        )
        event = AIUsageEvent.objects.get(therapist=self.user, task_type="help.ask")
        self.assertEqual(event.provider, "groq")
        self.assertEqual(event.model, "llama-3.1-8b-instant")
        self.assertEqual(event.total_tokens, 100)
        self.assertEqual(resp.json()["provider"], "groq")
        # verify MultiAIService was instantiated with groq as preferred provider
        mock_service_cls.assert_called_once_with(preferred_provider="groq")

    @override_settings(AI_METERING_ENABLED=False)
    @patch("api.help_assistant.views.best_fallback_guide")
    @patch("api.help_assistant.views.search_help_docs")
    @patch("api.help_assistant.views.generate_text")
    @patch("api.help_assistant.views.is_llm_available", return_value=True)
    def test_help_ask_blocks_prohibited_output(
        self, _mock_available, mock_generate, mock_search, mock_fallback
    ):
        mock_search.return_value = [
            _make_result(_PLAN_TITLE, _PLAN_PATH, "El asistente responde SOLO sobre como funciona la app.", score=3.0),
        ]
        mock_fallback.return_value = _make_fallback(_PLAN_TITLE, _PLAN_PATH)
        mock_generate.return_value = {
            "success": True,
            "text": "Esto es un diagnóstico clínico definitivo.",
            "provider": "groq",
            "model": "llama-3.1-8b-instant",
            "prompt_tokens": 45,
            "completion_tokens": 15,
            "total_tokens": 60,
        }

        resp = self.client_api.post(
            "/api/help/ask",
            data=json.dumps({"query": "¿Cómo uso la ayuda?"}),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 422)
        body = resp.json()
        self.assertTrue(body["guardrail_violation"])
        self.assertEqual(body["code"], "guardrail_violation")
