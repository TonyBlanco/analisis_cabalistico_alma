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
python3 memory_manager.py sync-session
python3 memory_manager.py dump --out CODEX_CONTEXT.md
```

`sync-session` runs automatically on Claude **Stop** hook; call manually after large tasks.

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

## UX Rule: GuidedBlock for empty/blocked states (UNIVERSAL)

**When any module or field has missing data, blocked access, or requires an action:**  
NEVER show a generic error string. ALWAYS use `GuidedBlock` from `@/components/ui/guided-block`.

```tsx
import { GuidedBlock } from '@/components/ui/guided-block';

<GuidedBlock
  variant="missing"          // missing | consent | info | locked
  role="therapist"           // therapist | patient | both
  title="Datos incompletos"
  description="Explicación clara de qué falta y por qué importa."
  steps={[
    { label: 'Paso 1 que debe hacer el usuario' },
    { label: 'Paso 2...' },
  ]}
  actions={[
    { label: 'Acción principal', href: '/ruta-directa' },
    { label: 'Acción secundaria', onClick: handleRetry, variant: 'secondary' },
  ]}
/>
```

**Variants:**
- `missing` — datos ausentes (amber)
- `consent` — consentimiento requerido (purple)
- `info` — estado neutro informativo (blue)
- `locked` — sin acceso/asignación (gray)

**Applies to:** todas las páginas SWM, módulos clínicos, feeds federados, campos de perfil.  
**Already implemented in:** `MSHEClinicalModule`, `FederationHubFeedBlock`, `astrologia/page.tsx`.

---

## Governance

Canonical docs: `docs/00_SOURCE_OF_TRUTH/SOURCE_OF_TRUTH.md`  
Multi-agent: `AGENTS.md` · Memory setup: `docs/01_PROJECT_STATE/AI_MEMORY_LAYER.md`