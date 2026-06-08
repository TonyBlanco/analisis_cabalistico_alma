# AI Memory Layer — Index

> Single entry point for AI memory governance and model routing.

---

## Quick Start

1. Read this file
2. Read `.ai-memory/core/model_policy.md`
3. Read `.ai-memory/runtime/context_budget.md`
4. Run `python .claude/hooks/context_loader.py --dry-run "your task"`

---

## 📂 Folder Structure

### `core/` — Stable Architecture

- **model_policy.md** — Which model to use for what
- **api_contracts.md** (optional) — API endpoint documentation
- **decisions.md** (optional) — Technical decisions
- **architecture.md** (optional) — System design

Read these when designing solutions or questioning architecture.

### `active/` — Current State (Keep <2KB)

- **session_context.md** — What's being worked on now
- **session_template.md** — Template for next session
- **active_bugs.md** (optional) — Current issues

Load these every session to know current state.

### `runtime/` — Automation Rules

- **context_budget.md** — Token limits per model
- **task_classifier.md** — Auto-routing rules
- **token_strategy.md** — Token optimization

Reference when setting context budgets or classifying tasks.

### `codex/` — VS Code / Codex Rules

- **README.md** — Codex integration rules
- **context_rules.md** — Detailed context loading

Use when integrating with VS Code or Codex.

### `claude/` — Claude Rules

- **README.md** — Claude integration
- **model_roles.md** — Claude capability matrix

Use when working with Claude models.

### `ADR/` — Architecture Decisions

Numbered decisions:
- **ADR-000-memory-governance.md** — Why memory was organized
- **ADR-001-*.md** — Project decisions

Create ADR-NNN when making important architecture choices.

### `audits/`, `plans/`, `history/`, `prompts/`

- **audits/** — Historical audits and reviews
- **plans/** — Project roadmaps
- **history/** — Archived sessions (never auto-load)
- **prompts/** — Reusable prompt templates

---

## 🚀 Model Selection (Quick Reference)

| Model | Use | Budget | Confidence |
|-------|-----|--------|------------|
| **Haiku** | Docs, organization | 10-20KB | High |
| **Sonnet** | Engineering, code | 40-80KB | High |
| **Opus** | Architecture, audit | 60-110KB | Restricted |
| **GPT-5.4-Mini** | Small tasks | <10KB | High |
| **Codex** | Implementation | 40-80KB | High |
| **GPT-5.4** | System design | 60-100KB | Restricted |
| **GPT-5.5** | Critical audit | 80-120KB | Restricted |

---

## 🤖 Automation

### Context Loader (Automatic)

```bash
python .claude/hooks/context_loader.py --dry-run "your task here"
```

Analyzes task, recommends model, loads memory selectively.

### Auto-Compact (Weekly)

```bash
# Dry-run (default, safe)
python .claude/hooks/auto_compact.py --dry-run

# Apply changes
python .claude/hooks/auto_compact.py --execute
```

Archives old logs, detects duplicates, compacts markdown.

---

## 📊 Memory Budget

| Folder | Load | Size |
|--------|------|------|
| INDEX.md | Always | 2KB |
| core/ | On demand | 5-10KB |
| active/ | Every session | <2KB |
| audits/ | Never auto | 20KB+ |
| history/ | Never auto | Archive |

**Session target**: <10KB for Haiku, <50KB for Sonnet, <110KB for Opus

---

## ✅ Checklist: Set Up in New Project

- [ ] Create `.ai-memory/` folder structure
- [ ] Copy `.claude/rules/model-routing.md`
- [ ] Copy `.claude/hooks/context_loader.py`
- [ ] Copy `.claude/hooks/auto_compact.py`
- [ ] Create `.ai-memory/core/model_policy.md`
- [ ] Create `.ai-memory/active/session_context.md`
- [ ] Configure `.claude/settings.json` (optional hook integration)
- [ ] Run dry-run tests: `python .claude/hooks/context_loader.py --dry-run "test task"`
- [ ] Set up weekly auto-compact reminder
- [ ] Document project decisions in ADRs

---

**Last updated**: 2026-05-14  
**Status**: Template ready for reuse
