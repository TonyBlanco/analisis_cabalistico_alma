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
    """
    return AnalysisRecord.objects.create(**validated_data)


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


