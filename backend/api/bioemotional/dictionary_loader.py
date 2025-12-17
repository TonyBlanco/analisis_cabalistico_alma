import json
from pathlib import Path
from typing import List, Dict, Any

from django.conf import settings


class BioEmotionalDictionaryError(Exception):
    """Errores relacionados con la carga/validación del diccionario bio-emocional."""


_CACHE: List[Dict[str, Any]] | None = None


def _get_resources_path() -> Path:
    """Devuelve la ruta absoluta al directorio `backend/resources`.

    No depende de variables de entorno; se calcula de forma relativa al
    paquete `api` para mantener el módulo aislado.
    """

    # __file__ → backend/api/bioemotional/dictionary_loader.py
    # parents[2] → backend/
    return Path(__file__).resolve().parents[2] / "resources"


def _load_json_file(path: Path) -> Any:
    if not path.exists():
        raise BioEmotionalDictionaryError(f"Archivo no encontrado: {path}")
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:  # pragma: no cover - errores de IO/JSON
        raise BioEmotionalDictionaryError(f"No se pudo leer JSON desde {path}: {exc}") from exc


def _validate_against_schema(data: Any, schema: Dict[str, Any]) -> None:
    """Valida `data` contra un esquema JSON.

    Se usa `jsonschema` si está disponible; si no, se hace una validación
    mínima basada en el contrato del esquema (array de objetos con `termino`).
    En caso de fallo, se lanza `BioEmotionalDictionaryError`.
    """

    # Intentar usar jsonschema si está instalado
    try:  # pragma: no cover - dependiente del entorno
        from jsonschema import validate
        from jsonschema.exceptions import ValidationError

        try:
            validate(instance=data, schema=schema)
        except ValidationError as exc:  # type: ignore[name-defined]
            raise BioEmotionalDictionaryError(
                f"El diccionario bio-emocional no cumple el schema JSON: {exc.message}"
            ) from exc
        return
    except Exception:
        # Fallback mínimo: validar solo estructura base según schema_bioemocional.json
        pass

    # Validación mínima manual:
    if not isinstance(data, list):
        raise BioEmotionalDictionaryError("El diccionario debe ser un array de entradas.")

    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            raise BioEmotionalDictionaryError(f"Entrada #{idx} no es un objeto JSON.")
        if "termino" not in item or not isinstance(item["termino"], str) or not item["termino"].strip():
            raise BioEmotionalDictionaryError(
                f"Entrada #{idx} inválida: falta 'termino' o es vacío (según contrato del schema)."
            )


def load_bioemotional_dictionary() -> List[Dict[str, Any]]:
    """Carga y valida el diccionario bio-emocional 2016 como estructura READ-ONLY.

    - Lee `diccionario_bioemocional_2016.json` desde `backend/resources`.
    - Transforma cada entrada al contrato lógico del schema (`termino`, ...).
    - Valida contra `schema_bioemocional.json`.
    - Cachea el resultado en memoria para futuras peticiones.

    Si el schema no se cumple o hay cualquier problema de lectura, lanza
    `BioEmotionalDictionaryError`.
    """

    global _CACHE
    if _CACHE is not None:
        return _CACHE

    resources_path = _get_resources_path()
    raw_path = resources_path / "diccionario_bioemocional_2016.json"
    schema_path = resources_path / "schema_bioemocional.json"

    raw_data = _load_json_file(raw_path)
    schema = _load_json_file(schema_path)

    if not isinstance(raw_data, list):
        raise BioEmotionalDictionaryError("El diccionario bruto debe ser un array de entradas.")

    # Transformar a la forma esperada por el schema: usamos `title` como `termino`
    transformed: List[Dict[str, Any]] = []
    for idx, item in enumerate(raw_data):
        if not isinstance(item, dict):
            raise BioEmotionalDictionaryError(f"Entrada bruta #{idx} no es un objeto JSON.")

        title = item.get("title") or item.get("slug")
        if not isinstance(title, str) or not title.strip():
            raise BioEmotionalDictionaryError(f"Entrada bruta #{idx} carece de 'title'/'slug' válido.")

        description = item.get("description")
        source = item.get("source") or {}

        entry: Dict[str, Any] = {
            "termino": title,
            "definicion": description,
            # Campos opcionales del marco técnico y otros apartados del schema
            "marco_tecnico": {},
            "sentido_biologico": None,
            "conflictos_emocionales": [],
            "referencias_cruzadas": [],
            "fuente": source,
        }
        transformed.append(entry)

    # Validar contra el schema declarado
    _validate_against_schema(transformed, schema)

    _CACHE = transformed
    return _CACHE
