# Task Classification

> Deterministic decision tree for routing tasks to optimal models.

---

## Quick Decision Tree

```
Is this documentation/organization/summary?
├─ YES → Use HAIKU or Mini
└─ NO → Is this implementation/debugging/testing?
       ├─ YES → Use SONNET or CODEX
       └─ NO → Is this architecture/security/audit?
              ├─ YES → Use OPUS or GPT-5.5
              └─ Re-evaluate task
```

---

## Keywords & Signals

### HAIKU Signals

```
organize, markdown, template, summarize
index, document, archive, move file
generate adr, create guide, update readme
list files, show structure
```

### SONNET / CODEX Signals

```
implement, fix, debug, test, refactor
integrate, optimize, add feature, endpoint
api, database, service, component
django, fastapi, react, typescript, python
```

### OPUS / GPT-5.4/5.5 Signals

```
architecture, design, security audit, root cause
federation, scaling, microservice, compliance
system-wide, irreversible
why, deeply analyze, compare patterns
```

---

## File Scope Analysis

| Files | Model |
|-------|-------|
| 0-1 | Haiku |
| 1-2 | Haiku (if docs) or Sonnet |
| 2-5 | Sonnet |
| >5 | Opus (if complex) |
| Cross-module | Opus |

---

## Example Classifications

```
"fix CSS padding bug"           → SONNET (implementation)
"organize .ai-memory folders"   → HAIKU (docs)
"implement Django API endpoint" → CODEX (implementation)
"design microservice federation"→ OPUS (architecture)
"security audit of auth module" → OPUS (security)
"create README"                 → HAIKU (documentation)
"debug why queries timeout"     → SONNET (debugging)
"root cause production incident"→ OPUS (critical)
```

---

## Confidence Scoring

High confidence (>80%):
- Clear keyword match
- File scope obvious
- Task type unambiguous

Medium confidence (60-80%):
- Mixed signals
- Multiple possible interpretations
- Recommend manual override option

Low confidence (<60%):
- Ambiguous task
- Multiple valid approaches
- Ask for clarification

---

**Last updated**: 2026-05-14
