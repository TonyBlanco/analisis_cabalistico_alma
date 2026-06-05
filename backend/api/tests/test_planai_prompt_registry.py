from django.test import TestCase

from api.ai.prompt_registry import PROMPT_BIOEMOTION_NAME, PROMPT_KABBALAH_NAME, render_planai_prompt, render_prompt
from api.ai.prompts import bioemotion_synthesis_draft_prompt, kabbalah_interpret_prompt


class PlanAIPromptRegistryTests(TestCase):
    def test_core_template_loads_and_replaces_placeholders(self):
        prompt, version, temp, max_tok = render_planai_prompt(
            lane="symbolic",
            user_task="Tarea de prueba",
            rag_context="chunk-1",
            patient_history_summary="hist-1",
        )
        self.assertEqual(version, "1.0")
        self.assertEqual(temp, 0.65)
        self.assertEqual(max_tok, 1200)
        self.assertIn("PlanAI", prompt)
        self.assertIn("chunk-1", prompt)
        self.assertIn("hist-1", prompt)
        self.assertIn("Tarea de prueba", prompt)
        self.assertIn("— PlanAI", prompt)

    def test_kabbalah_domain_template(self):
        prompt, temp, max_tok, version = kabbalah_interpret_prompt(
            '{"source":{"methodId":"t"},"sefirot":[],"flows":[]}'
        )
        self.assertEqual(version, "1.0")
        self.assertEqual(temp, 0.6)
        self.assertEqual(max_tok, 1200)
        self.assertIn("intérprete educativo de Cábala", prompt)
        self.assertIn("arquetípico", prompt)

    def test_kabbalah_yaml_direct(self):
        prompt, version, _, _ = render_prompt(
            template_name=PROMPT_KABBALAH_NAME,
            lane="symbolic",
            user_task='{"flows":[]}',
        )
        self.assertEqual(version, "1.0")
        self.assertIn("Cábala educativa", prompt)
        self.assertIn('{"flows":[]}', prompt)

    def test_bioemotion_domain_template(self):
        prompt, temp, max_tok, version = bioemotion_synthesis_draft_prompt(
            patient_context="Observación: tensión en pecho",
            current_text="Borrador parcial",
        )
        self.assertEqual(version, "1.0")
        self.assertEqual(temp, 0.55)
        self.assertEqual(max_tok, 1000)
        self.assertIn("síntesis bioemocional", prompt)
        self.assertIn("fenomenológico", prompt)
        self.assertIn("Borrador parcial", prompt)

    def test_bioemotion_yaml_lane(self):
        prompt, version, _, _ = render_prompt(
            template_name=PROMPT_BIOEMOTION_NAME,
            lane="clinical_support",
            user_task="(vacío)",
            patient_history_summary="Hipótesis: patrón transgeneracional",
        )
        self.assertEqual(version, "1.0")
        self.assertIn("Bioemoción", prompt)

    def test_clinical_lane_rejects_wrong_lane_in_builder(self):
        with self.assertRaises(ValueError):
            render_prompt(template_name=PROMPT_BIOEMOTION_NAME, lane="symbolic", user_task="x")