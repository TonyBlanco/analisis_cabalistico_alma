# AI Memory Layer — Instalado en este repo

**Fecha:** 2026-06-08  
**Origen:** `/Volumes/T7/Development/ai-memory-layer`  
**Coordination:** `AGENTS.md`

## Qué hace

Memoria persistente entre sesiones de agentes: decisiones, bugs, deploys y contexto activo en markdown git-tracked, con búsqueda semántica opcional (Mem0 + `OPENAI_API_KEY`).

## Archivos clave

| Path | Rol |
|------|-----|
| `memory_manager.py` | CLI: `store`, `query`, `list`, `dump`, `prune` |
| `agent_runtime/` | Extractor/injector de eventos |
| `.ai-memory/` | Fuente de verdad humana |
| `.venv/` | Python 3.9+ + mem0ai (gitignored) |
| `CODEX_CONTEXT.md` | Dump para Codex (gitignored, regenerado) |
| `.claude/settings.json` | Hooks PostToolUse + Stop |

## Comandos

```bash
source .venv/bin/activate
python3 memory_manager.py list
python3 memory_manager.py store "[DECISION] ejemplo"
python3 memory_manager.py sync-session          # refresh session_context.md
python3 memory_manager.py sync-session --focus "..." --completed "..." --next "..."
python3 memory_manager.py dump --out CODEX_CONTEXT.md
python3 .claude/hooks/context_loader.py --dry-run "implement feature X"
python3 .claude/hooks/auto_compact.py --dry-run
```

## Reinstalar / actualizar desde upstream

```bash
bash /Volumes/T7/Development/ai-memory-layer/install.sh "/Volumes/T7/Development/Analisis Cabalistico"
# Luego re-copiar governance si upstream añadió hooks:
# cp ai-memory-layer/.ai-memory/INDEX.md .ai-memory/
# cp ai-memory-layer/.claude/hooks/context_loader.py .claude/hooks/
```

## Semántica online (opcional)

```bash
export OPENAI_API_KEY=sk-...
python3 memory_manager.py query "test catalog wiring"
```

Sin key: modo offline (grep en markdown) — suficiente para coordinación básica.

## Cursor / Grok — regla automática

Archivo: `.cursor/rules/agent-memory.mdc` con `alwaysApply: true`.

Cursor Agent incluye la regla en cada chat del proyecto: leer `AGENTS.md` + `session_context.md` al inicio y ejecutar `sync-session` al cerrar sesiones productivas.

Verificar en **Cursor Settings → Rules** que la regla aparece como *Always Apply*.