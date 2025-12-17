from typing import Any, Dict

from api.models import AnalysisRecord
from cabala_py.integracion_arbol import generar_mapa_cabalista_completo
from .base import BaseAnalysisAdapter


class KabbalahAdapter(BaseAnalysisAdapter):
    """Adapter para análisis cabalísticos de Alta Cábala.

    Usa el motor legacy `generar_mapa_cabalista_completo` sin modificarlo.

    Convención mínima:
    - birth_data_snapshot proporciona: legal_name, birth_date (YYYY-MM-DD)
    - raw_input puede incluir 'sistema' (p.ej. 'dshevastan') y otros flags.
    """

    def __init__(self, record: AnalysisRecord) -> None:
        super().__init__(record)

    def execute(self) -> Dict[str, Any]:
        birth = self.record.birth_data_snapshot or {}
        raw = self.record.raw_input or {}

        legal_name = birth.get("legal_name") or ""
        birth_date = str(birth.get("birth_date", ""))
        sistema = raw.get("sistema", "dshevastan")

        if not legal_name or not birth_date:
            raise ValueError("KabbalahAdapter requiere legal_name y birth_date en birth_data_snapshot")

        # Parseo muy simple de fecha: espera YYYY-MM-DD
        try:
            year_str, month_str, day_str = birth_date.split("-")
            anio = int(year_str)
            mes = int(month_str)
            dia = int(day_str)
        except Exception as e:
            raise ValueError(f"Formato de birth_date inválido para KabbalahAdapter: {birth_date} ({e})")

        # Llamar al motor legacy sin tocar su implementación
        legacy_result = generar_mapa_cabalista_completo(
            nombre_completo=legal_name,
            dia=dia,
            mes=mes,
            anio=anio,
            sistema=sistema,
        )

        # Para inicio, usamos el resultado completo como computed_result normalizado
        computed_result: Dict[str, Any] = {
            "engine": "alta_cabala_integracion_arbol",
            "version": "1.0.0",
            "profile": legacy_result,
        }

        legacy_output: Dict[str, Any] = legacy_result

        return {
            "computed_result": computed_result,
            "legacy_output": legacy_output,
        }



