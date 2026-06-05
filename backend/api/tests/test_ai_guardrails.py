from django.test import TestCase

from api.ai.guardrails import check_output


class GuardrailTests(TestCase):
    def test_accepts_educational_text(self):
        ok, code, _ = check_output("Desde una lectura simbólica, el flujo podría sugerir equilibrio.")
        self.assertTrue(ok)
        self.assertIsNone(code)

    def test_rejects_diagnostic_language(self):
        ok, code, _ = check_output("Esto es un diagnóstico clínico definitivo.")
        self.assertFalse(ok)
        self.assertEqual(code, "guardrail_violation")

    def test_rejects_absolute_imperative(self):
        ok, code, _ = check_output("Debes abandonar este patrón inmediatamente.")
        self.assertFalse(ok)
        self.assertEqual(code, "guardrail_violation")