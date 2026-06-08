#!/usr/bin/env python3
"""
Refresh .ai-memory/active/session_context.md at session end.

- Updates timestamp, git branch/HEAD, working tree summary
- Merges new entries from agent_log.md into Completed (reciente)
- Preserves Current Focus, Active Tasks, Next Steps unless overridden via CLI

Usage:
  python3 .claude/hooks/update_session_context.py
  python3 .claude/hooks/update_session_context.py --focus "..." --completed "..." --next "..."
  python3 memory_manager.py sync-session [--focus ...]
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
SESSION_PATH = REPO / ".ai-memory" / "active" / "session_context.md"
AGENT_LOG_PATH = REPO / ".ai-memory" / "agent_log.md"

SECTION_RE = re.compile(r"^## (.+)$", re.MULTILINE)
LOG_ENTRY_RE = re.compile(
    r"^## \[(\d{4}-\d{2}-\d{2}[^\]]*)\] .+\n(.+?)(?=\n## |\Z)",
    re.MULTILINE | re.DOTALL,
)


def _run_git(*args: str) -> str:
    try:
        out = subprocess.run(
            ["git", *args],
            cwd=REPO,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        return (out.stdout or "").strip()
    except Exception:
        return ""


def _git_meta() -> dict[str, str]:
    branch = _run_git("rev-parse", "--abbrev-ref", "HEAD") or "unknown"
    head = _run_git("rev-parse", "--short", "HEAD") or "unknown"
    subject = _run_git("log", "-1", "--format=%s") or ""
    status = _run_git("status", "--short")
    dirty = str(len([ln for ln in status.splitlines() if ln.strip()])) if status else "0"
    return {
        "branch": branch,
        "head": head,
        "subject": subject,
        "dirty": dirty,
    }


def _extract_section(text: str, name: str) -> str:
    pattern = rf"## {re.escape(name)}\n\n(.*?)(?=\n## |\Z)"
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1).strip() if m else ""


def _parse_bullets(block: str) -> list[str]:
    items: list[str] = []
    for line in block.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("- "):
            items.append(s[2:].strip())
        elif re.match(r"^\d+\.\s+", s):
            items.append(re.sub(r"^\d+\.\s+", "", s).strip())
    return items


def _format_bullets(items: list[str], numbered: bool = False) -> str:
    if not items:
        return "_Sin entradas._"
    lines: list[str] = []
    for i, item in enumerate(items, 1):
        prefix = f"{i}. " if numbered else "- "
        lines.append(f"{prefix}{item}")
    return "\n".join(lines)


def _recent_log_entries(hours: int = 48, limit: int = 8) -> list[str]:
    if not AGENT_LOG_PATH.exists():
        return []
    raw = AGENT_LOG_PATH.read_text(encoding="utf-8")
    now = datetime.now(timezone.utc)
    entries: list[tuple[datetime, str]] = []

    for m in LOG_ENTRY_RE.finditer(raw):
        ts_raw = m.group(1).strip()
        body = " ".join(m.group(2).strip().split())
        if not body or body.startswith("<!--"):
            continue
        try:
            ts = datetime.strptime(ts_raw[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        age_h = (now - ts).total_seconds() / 3600
        if age_h <= hours:
            entries.append((ts, body))

    entries.sort(key=lambda x: x[0], reverse=True)
    seen: set[str] = set()
    out: list[str] = []
    for _, text in entries:
        key = text[:80].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
        if len(out) >= limit:
            break
    return out


def _merge_completed(existing: list[str], new_items: list[str], max_items: int = 12) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for item in new_items + existing:
        key = item[:60].lower()
        if key in seen:
            continue
        seen.add(key)
        merged.append(item)
    return merged[:max_items]


def build_session_context(
    *,
    focus: str | None = None,
    completed_add: list[str] | None = None,
    next_steps: list[str] | None = None,
    active_tasks: list[str] | None = None,
) -> str:
    existing = SESSION_PATH.read_text(encoding="utf-8") if SESSION_PATH.exists() else ""
    git = _git_meta()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    cur_focus = focus or _extract_section(existing, "Current Focus") or "_Definir al iniciar sesión._"
    cur_tasks = active_tasks if active_tasks is not None else _parse_bullets(_extract_section(existing, "Active Tasks"))
    cur_next = next_steps if next_steps is not None else _parse_bullets(_extract_section(existing, "Next Steps"))

    completed_existing = _parse_bullets(_extract_section(existing, "Completed (reciente)"))
    log_recent = _recent_log_entries()
    if git["subject"]:
        log_recent.insert(0, f"Último commit: `{git['head']}` — {git['subject']}")
    if completed_add:
        log_recent = completed_add + log_recent
    completed = _merge_completed(completed_existing, log_recent)

    dirty_note = f" · **Working tree:** {git['dirty']} archivo(s) sin commit" if git["dirty"] != "0" else ""

    key_docs = _extract_section(existing, "Key Docs")
    deploy_block = _extract_section(existing, "Deploy")

    if not key_docs:
        key_docs = """| Doc | Uso |
|-----|-----|
| `docs/01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` | Estado proyecto |
| `AGENTS.md` | Ritual multi-agente |
| `docs/01_PROJECT_STATE/AI_MEMORY_LAYER.md` | Memoria compartida |"""

    if not deploy_block:
        deploy_block = """```bash
bash deploy/studios33/scripts/deploy.sh
```"""

    return f"""# Session Context — Análisis Cabalístico / Studios33

**Última actualización:** {today}  
**Rama:** `{git['branch']}` · **HEAD:** `{git['head']}`{dirty_note}  
**Prod:** Hetzner `studios33.app` + `api.studios33.app`

## Current Focus

{cur_focus}

## Completed (reciente)

{_format_bullets(completed)}

## Active Tasks

{_format_bullets(cur_tasks)}

## Next Steps

{_format_bullets(cur_next, numbered=bool(cur_next))}

## Key Docs

{key_docs}

## Deploy

{deploy_block}
"""


def update_session_context(
    *,
    focus: str | None = None,
    completed_add: list[str] | None = None,
    next_steps: list[str] | None = None,
    active_tasks: list[str] | None = None,
    dry_run: bool = False,
) -> Path:
    SESSION_PATH.parent.mkdir(parents=True, exist_ok=True)
    content = build_session_context(
        focus=focus,
        completed_add=completed_add,
        next_steps=next_steps,
        active_tasks=active_tasks,
    )
    if not dry_run:
        SESSION_PATH.write_text(content, encoding="utf-8")
    return SESSION_PATH


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh session_context.md")
    parser.add_argument("--focus", help="Override Current Focus")
    parser.add_argument("--completed", action="append", default=[], help="Append to Completed (reciente)")
    parser.add_argument("--next", action="append", default=[], help="Replace Next Steps")
    parser.add_argument("--task", action="append", default=[], help="Replace Active Tasks")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    path = update_session_context(
        focus=args.focus,
        completed_add=args.completed or None,
        next_steps=args.next or None,
        active_tasks=args.task or None,
        dry_run=args.dry_run,
    )
    if args.dry_run:
        print(build_session_context(
            focus=args.focus,
            completed_add=args.completed or None,
            next_steps=args.next or None,
            active_tasks=args.task or None,
        ))
    else:
        print(f"  ✓ session context updated: {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())