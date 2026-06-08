# Análisis Cabalístico / Studios33 — Claude Code

## MEMORY — mandatory at session start and end

### At session START

```bash
source .venv/bin/activate
python3 memory_manager.py list --n 15
```

Read:
- `AGENTS.md`
- `.ai-memory/active/session_context.md`
- `docs/01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` (if architecture/deploy)

### At session END

```bash
python3 memory_manager.py store "[TYPE] concise decision — context"
python3 memory_manager.py dump --out CODEX_CONTEXT.md
```

Update `.ai-memory/active/session_context.md` before closing.

| Event | Prefix |
|-------|--------|
| Bug fixed | `[BUG]` |
| Architecture | `[DECISION]` |
| API change | `[ENDPOINT]` |
| Deploy | `[DEPLOY]` |
| Security | `[SECURITY]` |

## Project memory files

- `.ai-memory/architecture.md` — stack, domains
- `.ai-memory/decisions.md` — technical decisions
- `.ai-memory/bugs.md` — known issues
- `.ai-memory/api_contracts.md` — API contracts

## Stack

Next.js (`tonyblanco-app/`) + Django (`backend/`) · Prod: Hetzner `studios33.app`

## Deploy (production)

```bash
bash deploy/studios33/scripts/deploy.sh
```

Do **not** use legacy VoxTV deploy scripts for this app.

## Governance

Canonical docs: `docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`  
Multi-agent: `AGENTS.md` · Memory setup: `docs/01_PROJECT_STATE/AI_MEMORY_LAYER.md`