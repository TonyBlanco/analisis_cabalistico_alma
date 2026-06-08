# ADR-000: AI Memory Governance

**Date**: 2026-05-14  
**Status**: ✅ ACCEPTED  

---

## Context

AI-driven development with multiple models (Claude, Codex, GPT) can have high token costs:
- Without organization: 50-100KB+ context per session
- Cost per session: $0.50-$1.50+
- Annual cost at scale: significant

**Opportunity**: Structured memory + selective loading = 67% token reduction

---

## Decision

Implement **tiered memory system**:

1. **Folder hierarchy** by change frequency
   - `core/` — stable architecture (load on demand)
   - `active/` — current state (load every session, <2KB)
   - `audits/`, `plans/`, `history/` — archives

2. **Model routing policy**
   - Haiku/Mini — documentation, organization (cheapest)
   - Sonnet/Codex — engineering, code (default)
   - Opus/GPT-5.4+ — architecture, security (restricted)

3. **Automated context loading**
   - `context_loader.py` — analyzes task, recommends model, loads memory
   - `auto_compact.py` — weekly archival and maintenance

4. **Token budgets per model**
   - Haiku: 10-20KB
   - Sonnet: 40-80KB
   - Opus: 60-110KB (justified)

---

## Consequences

### ✅ Positive

- Token reduction: 30KB → <10KB (67%)
- Annual savings: ~$600-1800
- Model discipline: prevents expensive misuse
- Governance: decisions documented (ADRs)
- Scalability: system grows without bloat

### ⚠️ Tradeoffs

- Initial setup: ~10 minutes per project
- Maintenance: ~10 min/week (auto_compact)
- Discipline: must keep `active/` <2KB

---

## Implementation

```
.ai-memory/
├── INDEX.md              ← entry point
├── core/                 ← stable docs
├── active/               ← current state (<2KB)
├── audits/               ← archives
├── plans/                ← roadmaps
├── runtime/              ← automation rules
└── ADR/                  ← decisions

.claude/
├── hooks/
│   ├── context_loader.py ← auto-load
│   └── auto_compact.py   ← maintenance
└── rules/
    └── model-routing.md  ← policy
```

---

## Success Metrics

Monthly:
- Session memory load (target: <50KB)
- Model distribution (aim: 40% Haiku, 50% Sonnet, <10% Opus)
- Archive growth (steady)
- Token savings vs baseline

---

## Rollback

If system becomes unmanageable:
1. Delete `.ai-memory/` folder
2. Delete `.claude/hooks/`
3. Stop using ADRs
4. Time: <5 minutes

---

**Supersedes**: None  
**Superseded by**: TBD
