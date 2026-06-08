"""
Extractor — detecta eventos importantes en respuestas de agentes.
Opera sobre texto plano sin llamar a la API.
"""

import re
from typing import Optional

# Eventos con prefijo explícito — máxima prioridad
_EXPLICIT_TAGS = ["[BUG]", "[DECISION]", "[ENDPOINT]", "[DEPENDENCY]", "[DEPLOY]", "[FEATURE]", "[ARCH]", "[SECURITY]"]

# Señales implícitas: (regex, tag a asignar)
_IMPLICIT_SIGNALS: list[tuple[str, str]] = [
    (r"\b(error|exception|crash|traceback|falla|falló|roto)\b", "[BUG]"),
    (r"\b(decidimos|elegimos|optamos|vamos a usar|mejor usar|migramos)\b", "[DECISION]"),
    (r"\b(endpoint|ruta|route|POST|GET|DELETE|PUT|PATCH)\b\s+/\S+", "[ENDPOINT]"),
    (r"\b(pip install|npm install|pubspec|instalamos|install(ed)?|dependencies|import|require|==\d)\b", "[DEPENDENCY]"),
    (r"\b(deploy|scp|restart|nginx|systemctl|production|prod)\b", "[DEPLOY]"),
    (r"\b(vulnerab|CVE|injection|XSS|CSRF|token|JWT|auth)\b", "[SECURITY]"),
]

_MIN_SENTENCE_LEN = 20
_MAX_EVENTS_PER_RESPONSE = 8


def extract_events(text: str) -> list[str]:
    """
    Extrae eventos relevantes de una respuesta de agente.
    Primero busca tags explícitos; si no hay, aplica señales implícitas.
    """
    events: list[str] = []

    # Explicit tagged lines
    for line in text.splitlines():
        stripped = line.strip()
        if any(stripped.startswith(tag) for tag in _EXPLICIT_TAGS) and len(stripped) > _MIN_SENTENCE_LEN:
            events.append(stripped)

    # Implicit signals on sentences
    if not events:
        sentences = re.split(r"(?<=[.!\n])\s+", text)
        for sentence in sentences:
            s = sentence.strip()
            if len(s) < _MIN_SENTENCE_LEN:
                continue
            for pattern, tag in _IMPLICIT_SIGNALS:
                if re.search(pattern, s, re.IGNORECASE):
                    events.append(f"{tag} {s}")
                    break

    # Deduplicate preserving order
    seen: set[str] = set()
    unique = []
    for e in events:
        if e not in seen:
            seen.add(e)
            unique.append(e)

    return unique[:_MAX_EVENTS_PER_RESPONSE]
