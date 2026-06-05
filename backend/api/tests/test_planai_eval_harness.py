"""
PlanAI eval harness — 50+ synthetic LLM outputs, guardrails only (no HTTP).
Exit criterion (planai.md Fase 2): 0 violations on passing cases, 100% catch on failing cases.
"""
from django.test import SimpleTestCase

from api.ai.guardrails import PROHIBITED_DIAGNOSTIC, check_output
from api.tests.planai_eval_cases import EVAL_CASES


class PlanAIEvalHarnessTests(SimpleTestCase):
    """Runs outside DB when using SimpleTestCase — fast CI."""

    def test_eval_case_count_is_at_least_fifty(self):
        self.assertGreaterEqual(len(EVAL_CASES), 50)

    def test_harness_zero_violations_on_passing_cases(self):
        failures = []
        for case in EVAL_CASES:
            if not case["expect_ok"]:
                continue
            ok, code, detail = check_output(case["text"])
            if not ok:
                failures.append(f"{case['id']}: {code} — {detail}")
        self.assertEqual(
            failures,
            [],
            "Passing cases must not trigger guardrails:\n" + "\n".join(failures),
        )

    def test_harness_catches_all_failing_cases(self):
        missed = []
        for case in EVAL_CASES:
            if case["expect_ok"]:
                continue
            ok, code, detail = check_output(case["text"])
            if ok:
                missed.append(case["id"])
        self.assertEqual(
            missed,
            [],
            f"Failing cases not caught by guardrails: {missed}",
        )

    def test_harness_full_matrix(self):
        """Single assertion report for CI logs."""
        wrong = []
        for case in EVAL_CASES:
            ok, code, _ = check_output(case["text"])
            if ok != case["expect_ok"]:
                wrong.append(
                    f"{case['id']}: expected ok={case['expect_ok']} got ok={ok} code={code}"
                )
        self.assertEqual(wrong, [], "\n".join(wrong))

    def test_all_prohibited_diagnostic_terms_fail(self):
        missed = []
        for term in PROHIBITED_DIAGNOSTIC:
            ok, code, _ = check_output(f"Salida SWM v3 con termino prohibido: {term}.")
            if ok:
                missed.append(term)
            elif code != "guardrail_violation":
                missed.append(f"{term} -> {code}")
        self.assertEqual(missed, [], f"Diagnostic terms not caught: {missed}")
