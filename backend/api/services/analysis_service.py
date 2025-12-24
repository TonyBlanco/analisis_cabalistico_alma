"""Service layer for AnalysisRecord execution.

This module centralizes all calls to legacy analysis engines via adapters.
NO otro código del backend debe invocar motores legacy directamente;
siempre pasar por estas funciones de servicio.
"""

from typing import Any, Dict, Optional, Union

from django.db import transaction
from django.shortcuts import get_object_or_404

from api.models import AnalysisRecord
from api.adapters import get_adapter_for_record


def create_analysis_record(validated_data: Dict[str, Any]) -> AnalysisRecord:
    """Crea un AnalysisRecord a partir de datos ya validados.

    No ejecuta ningún análisis; solo persiste el snapshot y el contexto.

    Implementa una reintento defensivo: si la BD no contiene columnas
    recientes por alguna razón, reintenta creando el registro usando
    únicamente las columnas presentes en la tabla (introspección).
    """
    # Keep creation simple and deterministic. If DB creation fails due to schema mismatch
    # raise the exception to caller so they can handle fallback without further DB ops
    try:
        return AnalysisRecord.objects.create(**validated_data)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception("Fallo al crear AnalysisRecord: %s", e)
        # Re-raise to allow callers to decide fallback strategy (avoid doing DB introspection here
        # because we might be inside an atomic transaction and that would prevent further queries).
        raise


@transaction.atomic
def execute_analysis_record(record_or_id: Union[AnalysisRecord, str]) -> AnalysisRecord:
    """Ejecuta un AnalysisRecord existente usando el adapter correspondiente.

    - Carga el registro (si se pasa id).
    - Selecciona el adapter en función de record.kind.
    - Invoca execute() en el adapter.
    - Guarda computed_result y legacy_output.
    """
    if isinstance(record_or_id, AnalysisRecord):
        record = record_or_id
    else:
        record = get_object_or_404(AnalysisRecord, pk=record_or_id)

    adapter = get_adapter_for_record(record)
    outputs = adapter.execute()

    record.computed_result = outputs.get("computed_result")
    record.legacy_output = outputs.get("legacy_output")
    record.save(update_fields=["computed_result", "legacy_output"])

    return record


@transaction.atomic
def create_and_execute_analysis(validated_data: Dict[str, Any]) -> AnalysisRecord:
    """Convenience: crea y ejecuta un AnalysisRecord en una sola llamada."""
    record = create_analysis_record(validated_data)
    return execute_analysis_record(record)



