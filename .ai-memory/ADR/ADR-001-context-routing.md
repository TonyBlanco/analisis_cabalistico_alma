# ADR-001: Automatic Context Routing

**Date**: 2026-05-14  
**Status**: ✅ ACCEPTED  

---

## Context

Determining which model to use requires experience:
- "Is this engineering or architecture?"
- "Should I use Haiku or Sonnet?"
- "How much context do I load?"

This decision-making takes time and can lead to suboptimal choices.

---

## Decision

Implement **deterministic task classifier**:

1. **Keyword-based routing**
   - HAIKU keywords: organize, markdown, document, summary
   - SONNET keywords: implement, fix, debug, refactor
   - OPUS keywords: architecture, design, audit, security

2. **File scope analysis**
   - 1-2 files → consider HAIKU/Sonnet
   - 2-5 files → SONNET
   - >5 files or cross-module → OPUS

3. **Confidence scoring**
   - High (>80%): automatic routing
   - Medium (60-80%): suggest with option to override
   - Low (<60%): ask for clarification

---

## Consequences

### ✅ Positive

- No manual model selection needed
- Consistent decisions
- Prevents expensive model misuse
- New team members guided automatically

### ⚠️ Tradeoffs

- Occasional misclassification (90% accuracy typical)
- Requires tuning for project-specific keywords
- Can't handle ambiguous tasks

---

## Implementation

See: `.ai-memory/runtime/task_classifier.md`

Run:
```bash
python .claude/hooks/context_loader.py --dry-run "your task"
```

---

**Relates to**: ADR-000 (Memory Governance)
