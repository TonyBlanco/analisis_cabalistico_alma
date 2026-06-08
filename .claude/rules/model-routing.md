# Model Routing Policy

> Rules for selecting and routing tasks to optimal models.

---

## Core Decision Tree

```
Documentation/organization?
├─ YES → HAIKU (cheapest)
└─ NO → Implementation/debugging?
       ├─ YES → SONNET (default)
       └─ NO → Architecture/security?
              ├─ YES → OPUS (justified)
              └─ Reconsider task type
```

---

## Model Budgets

| Model | Context | Best For |
|-------|---------|----------|
| Haiku | 10-20KB | Docs, organization, summaries |
| Sonnet | 40-80KB | Engineering, code, debugging |
| Opus | 60-110KB | Architecture, audits, security |
| Codex | 40-80KB | VS Code implementation |
| GPT-5.4-Mini | <10KB | Snippets, quick tasks |
| GPT-5.3 | 40-80KB | Backend/frontend impl |
| GPT-5.4 | 60-100KB | System design |
| GPT-5.5 | 80-120KB | Critical audits |

---

## Rules

1. **Use cheapest capable model** — always
2. **Load context selectively** — never maximum
3. **Keep `active/` compact** — <2KB always
4. **Archive old content** — weekly with auto_compact
5. **Document decisions** — create ADRs for architecture
6. **Reserve context** — 25-40% for output
7. **Monitor usage** — track monthly

---

## Escalation Path

```
HAIKU → SONNET (if task needs >2 files or debugging)
      → OPUS (if architecture decision needed)

SONNET → OPUS (if system-wide impact or security)

OPUS → None (already highest tier)
```

---

**Last updated**: 2026-05-14
