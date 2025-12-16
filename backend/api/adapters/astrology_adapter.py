from typing import Any, Dict

from api.models import AnalysisRecord
from api.astrology_kerykeion.service import execute_kerykeion
from api.astrology_kerykeion.schemas import KerykeionInputSchema
from .base import BaseAnalysisAdapter


class AstrologyAdapter(BaseAnalysisAdapter):
    """Adapter para análisis astrológicos Kerykeion.

    Por simplicidad, asume que `record.raw_input` ya viene en el formato
    esperado por `KerykeionInputSchema` (como en el endpoint actual).
    El snapshot de birth_data se conserva pero no se re-deriva aquí para
    evitar duplicar lógica de validación/geocoding.
    """

    def __init__(self, record: AnalysisRecord) -> None:
        super().__init__(record)

    def execute(self) -> Dict[str, Any]:
        raw = self.record.raw_input or {}

        # Validar y construir schema Pydantic igual que la vista actual
        input_schema = KerykeionInputSchema(**raw)

        # Llamar al engine legacy Kerykeion sin modificarlo
        result = execute_kerykeion(input_schema)

        result_dict = result.model_dump()

        computed_result: Dict[str, Any] = {
            "engine": "kerykeion",
            "engine_version": result_dict.get("engine_version"),
            "planets": result_dict.get("planets"),
            "houses": result_dict.get("houses"),
            "aspects": result_dict.get("aspects"),
            "cabalistic_mapping": result_dict.get("cabalistic_mapping"),
        }

        legacy_output: Dict[str, Any] = result_dict

        return {
            "computed_result": computed_result,
            "legacy_output": legacy_output,
        }


