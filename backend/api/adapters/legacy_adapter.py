from typing import Any, Dict

from api.models import AnalysisRecord
from .base import BaseAnalysisAdapter


class LegacyAdapter(BaseAnalysisAdapter):
    """Adapter genérico de fallback para casos legacy.

    No aplica transformaciones adicionales: simplemente devuelve
    raw_input como computed_result y legacy_output, actuando como
    puente mínimo mientras se migran flujos puntuales.
    """

    def __init__(self, record: AnalysisRecord) -> None:
        super().__init__(record)

    def execute(self) -> Dict[str, Any]:
        raw = self.record.raw_input or {}

        computed_result: Dict[str, Any] = {
            "kind": self.record.kind,
            "module_code": self.record.module_code,
            "payload": raw,
        }

        legacy_output: Dict[str, Any] = raw

        return {
            "computed_result": computed_result,
            "legacy_output": legacy_output,
        }


