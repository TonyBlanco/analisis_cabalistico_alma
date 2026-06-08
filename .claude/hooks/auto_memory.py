#!/usr/bin/env python3
"""
PostToolUse hook — captura automática de memoria durante la sesión.

Protocolo Claude Code: lee JSON de stdin con tool_name, tool_input, tool_response.
Solo guarda TAGS EXPLÍCITOS ([BUG], [DECISION], etc.) — nunca implícitos.
Máximo 2 eventos por invocación para evitar ruido.
Falla silenciosamente: los hooks nunca deben romper el flujo de Claude.
"""

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent.parent.parent
sys.path.insert(0, str(REPO))

# Solo tags explícitos — alta confianza, sin falsos positivos
EXPLICIT_TAGS = frozenset([
    "[BUG]", "[DECISION]", "[ENDPOINT]", "[DEPENDENCY]",
    "[DEPLOY]", "[SECURITY]", "[ARCH]", "[FEATURE]",
])

# Archivos que provocarían escrituras circulares
_SKIP_PATHS = frozenset([".ai-memory", "CODEX_CONTEXT.md", "memory_manager", "auto_memory"])

# Limite para no procesar archivos enormes (50KB)
_MAX_BYTES = 50_000

# Captura líneas de git commit: [branch abc1234] mensaje del commit
_GIT_COMMIT_RE = re.compile(r"^\[[\w/.\-]+\s+[a-f0-9]{6,}\]\s+(.{10,})$", re.MULTILINE)


# Prefijos de comentario a ignorar antes del tag: #, //, /*, *, --
_COMMENT_PREFIX = re.compile(r"^[\s#/*\-]+")


def _extract_explicit(text: str) -> list[str]:
    events = []
    for line in text[:_MAX_BYTES].splitlines():
        s = line.strip()
        # Strips comment characters so "# [BUG] ..." and "[BUG] ..." both match
        clean = _COMMENT_PREFIX.sub("", s).strip()
        if len(clean) > 20:
            for tag in EXPLICIT_TAGS:
                if clean.startswith(tag):
                    events.append(clean)
                    break
    return events


def _extract_git_commits(bash_output: str) -> list[str]:
    events = []
    for m in _GIT_COMMIT_RE.finditer(bash_output):
        events.append(f"[FEATURE] git commit — {m.group(1).strip()}")
    return events


def _should_skip(file_path: str) -> bool:
    return any(skip in file_path for skip in _SKIP_PATHS)


def main() -> None:
    raw = sys.stdin.read().strip()
    if not raw:
        return

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return

    tool = data.get("tool_name", "")
    inp = data.get("tool_input", {})
    resp = str(data.get("tool_response", ""))

    events: list[str] = []

    if tool in ("Write", "Edit"):
        if _should_skip(inp.get("file_path", "")):
            return
        content = inp.get("new_string", "") or inp.get("content", "")
        events = _extract_explicit(content)

    elif tool == "Bash":
        # Captura tags explícitos en la salida del comando
        events = _extract_explicit(resp)
        # Captura mensajes de git commit como [FEATURE]
        if "git commit" in inp.get("command", ""):
            events += _extract_git_commits(resp)

    if not events:
        return

    try:
        from memory_manager import store
        for event in events[:2]:  # cap: máximo 2 por invocación
            store(event, agent="claude-auto")
    except Exception:
        pass  # nunca propagar errores desde un hook


if __name__ == "__main__":
    main()
