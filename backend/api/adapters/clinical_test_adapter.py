from typing import Any, Dict, List

from api.models import AnalysisRecord
from api.utils.clinical_scorer import ClinicalScorer
from api.diagnostics import compute_scid5
from .base import BaseAnalysisAdapter


class ClinicalTestAdapter(BaseAnalysisAdapter):
    """Adapter para tests clínicos psicométricos.

    Supone que AnalysisRecord.kind == 'clinical_test' y que:
    - record.module_code mapea al identificador de test usado por ClinicalScorer
      (por ejemplo: 'phq-9', 'gad-7', 'bdi-ii', etc.).
    - record.raw_input contiene un campo "answers" con la lista de respuestas
      crudas en el orden esperado por el baremo para tests tipo cuestionario.

    Integración específica (sin tocar lógica legacy clínica):
    - Para el código de módulo 'scid5' / 'scid-5-rv' se usa compute_scid5()
      del módulo api.diagnostics, esperando raw_input['responses'].

    Este adapter NO crea ni modifica TestResult; se centra en
    producir un resultado normalizado a partir de los motores legacy.
    """

    def __init__(self, record: AnalysisRecord) -> None:
        super().__init__(record)
        self.scorer = ClinicalScorer()

    def _get_answers(self) -> List[int]:
        raw = self.record.raw_input or {}
        answers = raw.get("answers", [])
        if not isinstance(answers, list):
            raise ValueError("ClinicalTestAdapter espera raw_input['answers'] como lista de respuestas")
        try:
            return [int(a) for a in answers]
        except (TypeError, ValueError) as e:
            raise ValueError(f"Respuestas inválidas para ClinicalTestAdapter: {e}")

    def execute(self) -> Dict[str, Any]:
        # Derivar identificador de test desde module_code
        test_id = (self.record.module_code or "").strip().lower()
        if not test_id:
            raise ValueError("module_code requerido para ClinicalTestAdapter")

        raw = self.record.raw_input or {}

        # --- Rama específica: Entrevista Clínica Integrativa (SCID-5) ---
        # Sin modificar la lógica legacy compute_scid5, solo la orquestamos.
        if test_id in ("scid5", "scid-5-rv"):
            responses = raw.get("responses") or {}
            if not isinstance(responses, dict):
                raise ValueError("ClinicalTestAdapter para scid5 espera raw_input['responses'] como dict de ítems")

            input_data = {
                "nombre": raw.get("nombre"),
                "edad": raw.get("edad"),
                "fecha": raw.get("fecha"),
                "terapeuta": raw.get("terapeuta"),
                "responses": responses,
            }

            legacy_result = compute_scid5(input_data)

            computed_result: Dict[str, Any] = {
                "test_id": test_id,
                "diagnosticos": legacy_result.get("diagnosticos"),
                "recomendaciones": legacy_result.get("recomendaciones"),
                "raw": legacy_result,
                "execution_mode": self.record.execution_mode,
            }

            legacy_output: Dict[str, Any] = legacy_result

            return {
                "computed_result": computed_result,
                "legacy_output": legacy_output,
            }

        # --- Resto de tests clínicos estándar: usar ClinicalScorer (legacy) ---
        answers = self._get_answers()

        # Llamar al motor clínico legacy SIN modificarlo
        score_data = self.scorer.calcular_score(test_id=test_id, respuestas=answers)

        computed_result: Dict[str, Any] = {
            "test_id": test_id,
            "score_bruto": score_data.get("score_bruto"),
            "diagnostico_clinico": score_data.get("diagnostico_clinico"),
            "answers": answers,
            "execution_mode": self.record.execution_mode,
        }

        # Para ahora, legacy_output puede ser el mismo payload (el motor ya es legacy)
        legacy_output: Dict[str, Any] = {
            "engine": "clinical_scorer",
            "version": "1.0.0",
            "payload": computed_result,
        }

        return {
            "computed_result": computed_result,
            "legacy_output": legacy_output,
        }



