import datetime
import json
import sys
from types import ModuleType, SimpleNamespace
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from api.models import Patient


class _StubGenAIResponse:
    def __init__(self, text: str):
        self.text = text


class _StubGenAIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.models = SimpleNamespace(generate_content=self._generate)

    def _generate(self, *args, **kwargs):
        payload = {
            "section": "Estado emocional y vitalidad",
            "depth_level": 1,
            "suggested_questions": [
                {"q": "¿Cómo te sientes en este momento?", "intent": "Explorar estado emocional"}
            ],
            "symbolic_correlations": [],
            "draft_section_synthesis": "La IA sugiere mantener la curiosidad simbólica.",
            "ethical_guardrails": ["Mantener el lenguaje simbólico y consultivo"],
            "therapist_actions": [
                {"action": "Validar emociones", "why": "Asegura descentramiento emocional"}
            ],
        }
        return _StubGenAIResponse(text=json.dumps(payload))


@override_settings(GEMINI_API_KEY="test-key", GEMINI_MODEL="gemini-1.5-flash")
class SCID5AIAssistantEndpointTest(TestCase):
    def setUp(self):
        self.password = "secure-pass-123"
        self.therapist = User.objects.create_user(
            username="therapist",
            password=self.password,
        )
        profile = self.therapist.profile
        profile.user_type = "therapist"
        profile.full_name = "Terapeuta Prueba"
        profile.save()

        self.patient = Patient.objects.create(
            therapist=self.therapist,
            email="patient@example.com",
            full_name="Paciente Prueba",
            birth_date=datetime.date(1990, 1, 1),
            birth_city="Ciudad Prueba",
            birth_country="Pais Prueba",
        )

        self.client.login(username=self.therapist.username, password=self.password)

    def test_endpoint_returns_ai_text_and_status_ok(self):
        payload = {
            "scid5_data": {"holistic_exploration": {"emotional_vitality": {"explorado": True}}},
            "depth_level": 1,
            "active_section": "emotional_vitality",
        }

        fake_google = ModuleType("google")
        fake_genai = ModuleType("google.genai")
        fake_genai.Client = _StubGenAIClient
        fake_google.genai = fake_genai

        with patch.dict(sys.modules, {"google": fake_google, "google.genai": fake_genai}):
            response = self.client.post(
                f"/api/analysis-records/scid5-ai-assistant/?patient_id={self.patient.id}",
                data=json.dumps(payload),
                content_type="application/json",
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("section", data)
        self.assertIn("suggested_questions", data)
        self.assertEqual(data.get("section"), "Estado emocional y vitalidad")
