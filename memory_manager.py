"""
Studios33 / Análisis Cabalístico — Memory Manager CLI.

Modos de operación:
  offline (sin OPENAI_API_KEY): append a markdown + grep de texto
  online  (con OPENAI_API_KEY): ídem + Mem0 con embeddings semánticos

Comandos:
  store "evento"            Guarda un evento (auto-tag si no tiene prefijo)
  query "texto"             Busca en memoria (semántico online, grep offline)
  dump                      Exporta contexto completo para Codex (siempre funciona)
  list                      Lista últimas entradas del log de agentes
"""

import argparse
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent))

# ── Paths ─────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent
MEM_DIR = REPO_ROOT / ".ai-memory"
MEM_DB_PATH = MEM_DIR / ".mem0_db"
AGENT_LOG_PATH = MEM_DIR / "agent_log.md"

MEM_DIR.mkdir(parents=True, exist_ok=True)

# ── Mem0 (optional layer) ─────────────────────────────────────────────────────

_MEM0_CONFIG = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "collection_name": "analisis_cabalistico_memory",
            "path": str(MEM_DB_PATH),
            "on_disk": True,
        },
    },
    "embedder": {
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"},
    },
}

_mem0_instance = None


def _mem0_ready() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def _get_mem0():
    global _mem0_instance
    if _mem0_instance is not None:
        return _mem0_instance
    from mem0 import Memory
    _mem0_instance = Memory.from_config(_MEM0_CONFIG)
    return _mem0_instance


# ── Auto-tagger ───────────────────────────────────────────────────────────────

_KNOWN_TAGS = frozenset(
    ["[BUG]", "[DECISION]", "[ENDPOINT]", "[DEPENDENCY]", "[DEPLOY]",
     "[FEATURE]", "[ARCH]", "[SECURITY]"]
)


def _auto_tag(text: str) -> str:
    if any(text.startswith(t) for t in _KNOWN_TAGS):
        return text
    from agent_runtime.extractor import extract_events
    events = extract_events(text)
    for event in events:
        for tag in _KNOWN_TAGS:
            if event.startswith(tag):
                return f"{tag} {text}"
    return text


# ── Core: store ───────────────────────────────────────────────────────────────

def store(text: str, agent: str = "claude") -> str:
    """
    Guarda un evento. Siempre escribe en markdown.
    Si OPENAI_API_KEY disponible, también en Mem0.
    Devuelve el texto final (posiblemente con tag añadido).
    """
    tagged = _auto_tag(text)
    _append_log(tagged, agent)

    if _mem0_ready():
        try:
            mem = _get_mem0()
            meta = {"agent": agent, "timestamp": datetime.now(timezone.utc).isoformat()}
            mem.add(tagged, user_id=agent, metadata=meta)
        except Exception as exc:
            print(f"  [warn] Mem0 unavailable, saved to markdown only: {exc}", file=sys.stderr)

    return tagged


# ── Core: query ───────────────────────────────────────────────────────────────

def query(text: str, limit: int = 5) -> list[dict]:
    """
    Busca en memoria.
    Online:  búsqueda semántica via Mem0 + ranking.
    Offline: grep de texto sobre los archivos markdown.
    """
    if _mem0_ready():
        return _query_mem0(text, limit)
    return _query_markdown(text, limit)


def _query_mem0(text: str, limit: int) -> list[dict]:
    from agent_runtime.injector import rank_memories
    mem = _get_mem0()
    raw = mem.search(text, user_id=None, limit=limit * 2)
    results = raw.get("results", []) if isinstance(raw, dict) else raw
    memories = [
        {
            "text": r.get("memory", r.get("text", "")),
            "score": r.get("score", 0.5),
            "agent": r.get("metadata", {}).get("agent", "unknown"),
            "timestamp": r.get("metadata", {}).get("timestamp", ""),
        }
        for r in results
    ]
    return rank_memories(memories)[:limit]


def _query_markdown(text: str, limit: int) -> list[dict]:
    results = []
    pattern = re.compile(re.escape(text), re.IGNORECASE)
    for md in sorted(MEM_DIR.glob("*.md")):
        if md.name.startswith("."):
            continue
        for line in md.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if len(stripped) > 15 and pattern.search(stripped):
                results.append({
                    "text": stripped,
                    "score": 0.5,
                    "agent": "markdown",
                    "timestamp": "",
                    "source": md.name,
                })
            if len(results) >= limit * 3:
                break
    return results[:limit]


# ── Core: dump ────────────────────────────────────────────────────────────────

_DUMP_FILES = ["architecture.md", "decisions.md", "bugs.md", "api_contracts.md"]
_MAX_LINES_PER_SECTION = 60
_MAX_LOG_LINES = 40


def dump() -> str:
    """
    Genera bloque de contexto listo para pegar en Codex UI.
    Nunca requiere API key.
    """
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    parts: list[str] = []

    parts.append(
        f"╔══════════════════════════════════════════════════════════════╗\n"
        f"║  STUDIOS33 PROJECT MEMORY — Codex context dump              ║\n"
        f"║  {ts:<60}║\n"
        f"╚══════════════════════════════════════════════════════════════╝"
    )

    for fname in _DUMP_FILES:
        fpath = MEM_DIR / fname
        if not fpath.exists():
            continue
        lines = fpath.read_text(encoding="utf-8").splitlines()
        # Skip empty files and pure-header files
        content_lines = [l for l in lines if l.strip() and not l.startswith(">")]
        if not content_lines:
            continue
        trimmed = content_lines[-_MAX_LINES_PER_SECTION:]
        section_name = fname.replace(".md", "").upper()
        parts.append(f"\n── {section_name} {'─' * (58 - len(section_name))}\n" + "\n".join(trimmed))

    # Recent agent log
    if AGENT_LOG_PATH.exists():
        log_lines = AGENT_LOG_PATH.read_text(encoding="utf-8").splitlines()
        recent = [l for l in log_lines[-_MAX_LOG_LINES * 2:] if l.strip()][-_MAX_LOG_LINES:]
        if recent:
            parts.append(f"\n── RECENT AGENT LOG {'─' * 43}\n" + "\n".join(recent))

    return "\n".join(parts)


# ── Core: list ────────────────────────────────────────────────────────────────

def list_events(n: int = 20) -> str:
    if not AGENT_LOG_PATH.exists():
        return "No events logged yet."
    lines = AGENT_LOG_PATH.read_text(encoding="utf-8").splitlines()
    # Each entry is ~3 lines (header + text + blank)
    return "\n".join(lines[-(n * 3):])


# ── Markdown append ───────────────────────────────────────────────────────────

def _append_log(text: str, agent: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    entry = f"\n## [{ts}] {agent.capitalize()}\n{text}\n"
    with open(AGENT_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(entry)


# ── Core: prune ───────────────────────────────────────────────────────────────

_ENTRY_RE = re.compile(r"^## \[(\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC)\] (.+)$")


def _parse_log_entries(content: str) -> list[dict]:
    entries: list[dict] = []
    lines = content.splitlines(keepends=True)
    i = 0
    while i < len(lines):
        m = _ENTRY_RE.match(lines[i].rstrip("\n"))
        if m:
            body_lines: list[str] = []
            i += 1
            while i < len(lines) and not _ENTRY_RE.match(lines[i].rstrip("\n")):
                body_lines.append(lines[i])
                i += 1
            body = "".join(body_lines).strip()
            try:
                ts = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M UTC").replace(tzinfo=timezone.utc)
            except ValueError:
                ts = None
            entries.append({"header": lines[i - len(body_lines) - 1].rstrip("\n"),
                            "text": body, "timestamp": ts, "agent": m.group(2).strip()})
        else:
            i += 1
    return entries


def _format_entry(entry: dict) -> str:
    return f"{entry['header']}\n{entry['text']}\n\n" if entry["text"] else f"{entry['header']}\n\n"


def prune(archive_after_days: int = 90, dry_run: bool = False) -> dict:
    """
    Limpia agent_log.md:
      - Elimina duplicados exactos (conserva el más reciente)
      - Archiva entradas antiguas (>archive_after_days días) a agent_log.archive.md
    Devuelve estadísticas del proceso.
    """
    if not AGENT_LOG_PATH.exists():
        return {"total": 0, "removed_duplicates": 0, "archived": 0, "remaining": 0, "dry_run": dry_run}

    entries = _parse_log_entries(AGENT_LOG_PATH.read_text(encoding="utf-8"))
    original = len(entries)

    # Deduplicate: última ocurrencia gana (la más reciente)
    seen: dict[str, int] = {}
    for i, e in enumerate(entries):
        key = e["text"].strip().lower()
        if key:
            seen[key] = i
    keep = set(seen.values()) | {i for i, e in enumerate(entries) if not e["text"].strip()}
    unique = [e for i, e in enumerate(entries) if i in keep]
    removed_dupes = original - len(unique)

    # Particionar por antigüedad
    cutoff = datetime.now(timezone.utc) - timedelta(days=archive_after_days)
    recent = [e for e in unique if not e["timestamp"] or e["timestamp"] >= cutoff]
    to_archive = [e for e in unique if e["timestamp"] and e["timestamp"] < cutoff]

    if not dry_run:
        if to_archive:
            archive_path = MEM_DIR / "agent_log.archive.md"
            with open(archive_path, "a", encoding="utf-8") as f:
                f.write(f"\n# Archivado {datetime.now(timezone.utc).strftime('%Y-%m-%d')} (>{archive_after_days}d)\n\n")
                for e in to_archive:
                    f.write(_format_entry(e))

        with open(AGENT_LOG_PATH, "w", encoding="utf-8") as f:
            f.write("# Agent Action Log\n\n")
            for e in recent:
                f.write(_format_entry(e))

    return {
        "total": original,
        "removed_duplicates": removed_dupes,
        "archived": len(to_archive),
        "remaining": len(recent),
        "dry_run": dry_run,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="memory_manager",
        description="Studios33 Memory Manager — works offline and online",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  python3 memory_manager.py store "[BUG] JWT expires due to naive datetime"
  python3 memory_manager.py store "usamos ExoPlayer sobre media_kit" --agent codex
  python3 memory_manager.py query "JWT auth"
  python3 memory_manager.py dump
  python3 memory_manager.py dump --out context.txt
  python3 memory_manager.py list --n 30
""",
    )
    sub = p.add_subparsers(dest="cmd", metavar="command")

    s = sub.add_parser("store", help="save an event")
    s.add_argument("text", help='event text, e.g. "[BUG] login fails"')
    s.add_argument("--agent", default="claude", metavar="ID")

    q = sub.add_parser("query", help="search memory")
    q.add_argument("text", help="search query")
    q.add_argument("--limit", type=int, default=5)

    d = sub.add_parser("dump", help="export full context for Codex (copy-paste)")
    d.add_argument("--out", metavar="FILE", help="save to file instead of stdout")

    ls = sub.add_parser("list", help="show recent agent log entries")
    ls.add_argument("--n", type=int, default=20, metavar="N")

    pr = sub.add_parser("prune", help="deduplicate log + archive old entries")
    pr.add_argument("--days", type=int, default=90, metavar="N",
                    help="archive entries older than N days (default: 90)")
    pr.add_argument("--dry-run", action="store_true", help="preview without writing")

    ss = sub.add_parser("sync-session", help="refresh .ai-memory/active/session_context.md")
    ss.add_argument("--focus", help="override Current Focus")
    ss.add_argument("--completed", action="append", default=[], help="append to Completed (reciente)")
    ss.add_argument("--next", action="append", default=[], help="replace Next Steps")
    ss.add_argument("--task", action="append", default=[], help="replace Active Tasks")
    ss.add_argument("--dry-run", action="store_true")

    return p


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    if args.cmd == "store":
        saved = store(args.text, agent=args.agent)
        mode = "Mem0 + markdown" if _mem0_ready() else "markdown (offline)"
        print(f"  ✓ saved [{mode}]")
        print(f"    {saved}")

    elif args.cmd == "query":
        mode = "semantic/Mem0" if _mem0_ready() else "text grep (offline)"
        results = query(args.text, limit=args.limit)
        print(f"  mode: {mode}  results: {len(results)}\n")
        if not results:
            print("  no results.")
            return
        for i, r in enumerate(results, 1):
            score = r.get("final_score", r.get("score", 0))
            src = r.get("source", r.get("agent", "?"))
            ts = r.get("timestamp", "")[:10]
            print(f"  [{i}] score={score:.2f}  {src}  {ts}")
            print(f"       {r['text']}\n")

    elif args.cmd == "dump":
        output = dump()
        if getattr(args, "out", None):
            Path(args.out).write_text(output, encoding="utf-8")
            print(f"  ✓ saved to: {args.out}")
        else:
            print(output)

    elif args.cmd == "list":
        print(list_events(n=args.n))

    elif args.cmd == "prune":
        prefix = "  [dry-run] " if args.dry_run else "  "
        stats = prune(archive_after_days=args.days, dry_run=args.dry_run)
        print(f"  Procesando agent_log.md...")
        print(f"{prefix}Entradas totales:      {stats['total']}")
        print(f"{prefix}Duplicados eliminados: {stats['removed_duplicates']}")
        print(f"{prefix}Archivados (>{args.days}d): {stats['archived']}")
        print(f"{prefix}Quedan en log:         {stats['remaining']}")
        if not args.dry_run:
            print(f"  ✓ Listo")
        else:
            print(f"  (sin cambios — modo dry-run)")

    elif args.cmd == "sync-session":
        from importlib.util import module_from_spec, spec_from_file_location

        hook = REPO_ROOT / ".claude" / "hooks" / "update_session_context.py"
        spec = spec_from_file_location("update_session_context", hook)
        if spec is None or spec.loader is None:
            print("  ✗ missing .claude/hooks/update_session_context.py", file=sys.stderr)
            sys.exit(1)
        mod = module_from_spec(spec)
        spec.loader.exec_module(mod)
        path = mod.update_session_context(
            focus=getattr(args, "focus", None),
            completed_add=args.completed or None,
            next_steps=args.next or None,
            active_tasks=args.task or None,
            dry_run=args.dry_run,
        )
        if args.dry_run:
            print(mod.build_session_context(
                focus=getattr(args, "focus", None),
                completed_add=args.completed or None,
                next_steps=args.next or None,
                active_tasks=args.task or None,
            ))
        else:
            print(f"  ✓ session context updated: {path}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
