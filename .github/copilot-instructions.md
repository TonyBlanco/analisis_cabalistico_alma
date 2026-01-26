⚠️ ESTE DOCUMENTO DEFINE EL FLUJO OFICIAL DE TRABAJO CON AGENTES.
Si un prompt no cumple el formato descrito, la ejecución debe detenerse.

---

## AUTO MODEL ROUTING (MANDATORY)

When running in AUTO mode, select the model strictly based on TASK TYPE:

| Prefijo | Modelo | Uso | Fortaleza |
|---------|--------|-----|-----------|
| **AGENTE_ARQ >** | Claude Sonnet 4.5 / GPT-5.2 | Arquitectura, gobernanza, alcance | Razonamiento estructurado, NO escribe código |
| **DEBUG >** | Claude Sonnet 4.5 | Diagnóstico root cause | Análisis profundo sin aplicar cambios |
| **CODE >** | Claude Sonnet 4.5 / Opus | Implementación precisa | Contexto largo, respeta restricciones |
| **DOCS >** | Claude Haiku / GPT-5.1 mini | Documentación, auditoría | Claridad, sin sobre-ingeniería |

If AUTO mode cannot infer the task type:
→ Default to AGENTE_ARQ and STOP.

---

## SKILL SELECTION PROTOCOL (NEW)

Before EACH task, the agent MUST:

1. **Identify task category** and search for skill in `.agent/skills/`
2. **Read the SKILL.md** before executing any code
3. **Follow the skill process** (e.g., 4 phases of `systematic-debugging`)

### Priority Skills by Category

| Category | Skills |
|----------|--------|
| Backend/Django | `django-drf-patterns`, `python-development`, `backend-development` |
| Frontend/React | `react-best-practices`, `frontend-design`, `nextjs-best-practices` |
| Debugging | `systematic-debugging` ⭐, `scientific-debugging` |
| AI/Agents | `ai-agents-architect`, `mcp-builder`, `prompt-engineer` |

### Where to find skills:
- Primary: `.agent/skills/`
- Extended: `.agent/skills/skills/` (228+ additional skills)

---

## PREFIXES AND ROLES

| Prefix | Role | Allowed | Forbidden |
|--------|------|---------|-----------|
| `AGENTE_ARQ >` | Arquitectura y gobernanza | Define alcance, autoriza | Escribir código |
| `CODE >` | Implementación | Diff, test steps, risks | Cambios fuera de scope |
| `DOCS >` | Documentación | Auditoría, contratos | Tocar código |
| `DEBUG >` | Diagnóstico | Evidencia, causas, propuesta | Aplicar fixes |

---

## STOPPING RULE

If the prompt:
- ❌ Mixes objectives (code+docs+debug) → STOP, request reformulation
- ❌ Doesn't respect prefix → STOP
- ❌ Is ambiguous → STOP, ask for clarification

---

## MANDATORY SEQUENCE

```
1) AGENTE_ARQ — Decision and authorization
2) DEBUG      — Diagnosis (if applicable)
3) AGENTE_ARQ — Decide solution
4) CODE or DOCS — Execute ONE thing
5) DEBUG      — Verification (read-only)
```

---

## PROMPT TEMPLATE (MANDATORY for CODE >)

```markdown
<PREFIX> >

**Skills applied**: [skill-1], [skill-2]

## Context
(1-3 lines describing current situation)

## Objective
(One clear, measurable thing)

## Restrictions
- ❌ DO NOT touch: [files/modules]
- ❌ DO NOT execute: [dangerous commands]
- ✅ Authorized scope: [limits]

## Deliverables
1. Diff with changes
2. Test steps
3. Verification command
4. Identified risks
```

---

## PROJECT REFERENCE

- **Backend**: `backend/` — Django, DRF, `db.sqlite3`
- **Frontend**: `tonyblanco-app/` — Next.js App Router
- **Skills**: `.agent/skills/` + `.agent/skills/skills/`
- **Source of Truth**: `docs/AUDITORIA CABALA APP 12182025.md`
- **Scripts**: `start-flask.ps1`, `start-backend.ps1`, `start-all.ps1`

---

## HARD STOP RULE

If a prompt mixes more than one task type (e.g. CODE + DOCS):
- Do NOT execute.
- Ask for reformulation using a single prefix.

**Silence is preferred over wrong execution.**

---

FIN — Pide aclaraciones si algún alcance no está explícito.