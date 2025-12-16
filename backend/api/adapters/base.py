from typing import Any, Dict

from api.models import AnalysisRecord


class BaseAnalysisAdapter:
    """Adapter base para motores legacy.

    Contrato mínimo:
    - Recibe un AnalysisRecord ya validado (incluyendo snapshots).
    - Ejecuta la lógica legacy correspondiente.
    - Devuelve un diccionario con:
      {
        "computed_result": <JSON normalizado>,
        "legacy_output": <JSON u objeto serializado opcional>
      }
    """

    def __init__(self, record: AnalysisRecord) -> None:
        self.record = record

    def execute(self) -> Dict[str, Any]:  # pragma: no cover - interfaz
        """Ejecuta el análisis.

        Subclases deben implementar este método y NUNCA modificar
        funciones legacy directamente: solo llamarlas.
        """
        raise NotImplementedError("Subclasses must implement execute()")


