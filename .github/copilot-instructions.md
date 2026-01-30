# Copilot Instructions — Análisis Cabalístico del Alma

⚠️ Read `docs/AGENT_ONBOARDING_README.md` before any intervention.

---

## Architecture Overview

**Holistic Psychotherapy Platform** with:
- **Backend**: `backend/` — Django 5.0 + DRF (port 8000), SQLite (`db.sqlite3`)
- **Frontend**: `tonyblanco-app/` — Next.js 16 App Router (port 3000)
- **Symbolic Package**: `packages/symbolic/` — TypeScript shared library (`@holistica/symbolic`)
- **SWM Modules**: `backend/swm/` — Specialized Workspace Modules (mcmi4, tarot, cabala, sha, transgenerational)

### Key Data Flows
```
Frontend (Next.js) → API (Django DRF) → Models → SWM Modules
                                      ↓
              @holistica/symbolic ← Symbolic Engines (astrology, gematria, tarot)
```

### User Types & Dashboards
- `personal` → `/dashboard/personal/` (self-exploration tools)
- `therapist` → `/dashboard/therapist/` (patient management + SWM tools)
- `patient` → `/dashboard/patient/` (assigned assessments)

---

## Developer Workflows

### Starting Development
```powershell
.\start-all.ps1          # Django (8000) + Flask (5000) + Next.js (3000)
.\start-backend.ps1      # Django only
.\start-frontend.ps1     # Next.js only
```

### Dual Backend Architecture
| Server | Port | Purpose | Entry Point |
|--------|------|---------|-------------|
| **Django** | 8000 | Main API (auth, SWM, tests, federation) | `backend/manage.py` |
| **Flask** | 5000 | Numerology engine (Dshevastan®/Coquatrix) | `app_cabalistica.py` |

Flask provides specialized **Kabbalistic numerology** calculations via `backend/cabala_py/`:
- `/api/ficha-numerologica` — Full numerological chart with Tree of Life correspondences
- `/api/arbol-vida` — Tree of Life analysis
- `/api/tests/interpretar` — Map clinical test scores to Sefirá + Angel remedies
- `/api/tests/procesar-completo` — Unified clinical + soul interpretation

Django handles everything else (users, workspaces, SWM modules, assessments).

**⚠️ Production (Render)**: Flask is **NOT deployed** — Django directly imports `cabala_py` via:
- `backend/api/views.py` → `generar_mapa_cabalista_completo`
- `backend/swm/cabala/services/comprehensive_engine.py` → Phoenix Bridge
- Endpoint: `GET /api/swm/cabala/comprehensive-report/`

Flask is **local dev only** for legacy testing/debugging.

### Toolchain Constraints
- **Node**: 20.9.0 (use `nvm`) — fixed for `next@16` + `lightningcss`
- **Python**: 3.10+ with `.venv/` — auto-created by `start-all.ps1`
- **DB Migrations**: `cd backend && python manage.py migrate`

### Build Validation
```powershell
cd tonyblanco-app && npm run build   # Must pass before PR
```

---

## Critical Patterns

### API Integration
- Base URL logic in `tonyblanco-app/lib/api-base.ts` — auto-detects local vs production
- Token auth: `rest_framework.authtoken` — header `Authorization: Token <token>`
- All API routes: `backend/api/urls.py` (376 lines, ~100 endpoints)

### Workspace Isolation (NON-NEGOTIABLE)
- ❌ **Prohibited**: Auto-sync between workspaces, cross-workspace writes
- ✅ **Permitted**: Manual export, Federation Hub reads (SCDF, SCID-5, MSHE only)
- See `docs/HOLISTIC_FEDERATION_POLICY.md` for exceptions

### SWM Module Structure
Each SWM in `backend/swm/<module>/` has: `models.py`, `views.py`, `serializers.py`, `urls.py`
Frontend routes: `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/`

**Critical SWM Pattern**:
- **Subject-based**: Every workspace MUST have `subject_user` (consultante/patient being analyzed)
- **Therapist-created**: Workspaces created by therapist, NOT by subject
- **Role separation**: Subject ≠ Executor (therapist interprets subject's data)
- **Workspace isolation**: Each instance is sovereign, no auto-sync between workspaces

**SHA (Auditoría de Armonía Sefirótica)**:
- Backend: ✅ Complete (`backend/swm/sha/`)
- API: `POST /api/swm/sha/create`, `/list`, `/status`, `/save-artifact`, `/seal`, `/review`
- Frontend: ⚠️ Implemented but needs patient selector integration
- Models: `WorkspaceDefinition`, `WorkspaceInstance`, `WorkspacePermission`, `WorkspaceArtifact`
- Access: `/dashboard/therapist/sha` (therapist role only)

### Symbolic AI Safety
- **No diagnosis**: AI outputs are educational/symbolic, never clinical
- **Validation layers**: 5-layer safety in `backend/api/utils/symbolic_interpreter_ai.py`
- **Prohibited terms**: 14 blacklisted medical/diagnostic terms

---

## Agent Workflow Protocol

### Prefix Routing
| Prefix | Role | Allowed | Forbidden |
|--------|------|---------|-----------|
| `AGENTE_ARQ >` | Architecture | Define scope | Write code |
| `CODE >` | Implementation | Diffs, tests | Out-of-scope changes |
| `DEBUG >` | Diagnosis | Evidence, root cause | Apply fixes |
| `DOCS >` | Documentation | Audits, contracts | Touch code |

### Skills (read before executing)
- `.agent/skills/` — primary skills
- `.agent/skills/skills/` — 228+ extended skills

### Mandatory Sequence
1. `AGENTE_ARQ` — Decide scope
2. `DEBUG` — Diagnose (if needed)
3. `AGENTE_ARQ` — Approve solution
4. `CODE` or `DOCS` — Execute ONE thing
5. `DEBUG` — Verify (read-only)

### STOP Rules
- ❌ Mixed objectives (code+docs+debug) → Request reformulation
- ❌ Ambiguous scope → Ask for clarification
- **Silence > wrong execution**

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Django settings | `backend/core/settings.py` |
| API routes | `backend/api/urls.py` |
| Core models | `backend/api/models.py` (1500+ lines) |
| Frontend API client | `tonyblanco-app/lib/api.ts` |
| Symbolic data | `packages/symbolic/` |
| Governance docs | `docs/` (canonical location, never root)

---

## Documentation Governance

- **Canonical location**: `docs/` only — never create `.md` at repo root
- **Source of truth**: `docs/00_SOURCE_OF_TRUTH.md`
- **Onboarding**: `docs/AGENT_ONBOARDING_README.md`
- **Move files**: Always use `git mv` to preserve history