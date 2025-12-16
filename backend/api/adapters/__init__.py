"""Adapter layer for legacy analysis engines.

Each adapter takes an AnalysisRecord and is responsible for:
- Mapear snapshots + raw_input a la firma de la función legacy
- Invocar la función legacy SIN modificarla
- Normalizar la salida a computed_result
- (Opcional) conservar la salida original en legacy_output

Este paquete NO cambia flujos existentes todavía; solo provee la capa
que otros servicios pueden utilizar para orquestar análisis normalizados.
"""

from .base import BaseAnalysisAdapter
from .clinical_test_adapter import ClinicalTestAdapter
from .kabbalah_adapter import KabbalahAdapter
from .astrology_adapter import AstrologyAdapter
from .legacy_adapter import LegacyAdapter


ADAPTER_REGISTRY = {
    'clinical_test': ClinicalTestAdapter,
    'kabbalah': KabbalahAdapter,
    'astrology': AstrologyAdapter,
    'legacy': LegacyAdapter,
}


def get_adapter_for_record(record):
    """Return the concrete adapter class for a given AnalysisRecord.kind."""
    adapter_cls = ADAPTER_REGISTRY.get(record.kind, LegacyAdapter)
    return adapter_cls(record)

