# Context Budget Guidelines

> Token limits and efficiency rules for each model.

---

## Token Budget Framework

### Per Session

Total context window → reserve 25-40% for output

```
Haiku:      10-20KB session load
Sonnet:     40-80KB session load
Opus:       60-110KB session load
Codex:      40-80KB session load
```

---

## Haiku Budget (10-20KB)

```
Memory load:    1-2KB (INDEX only)
Task context:   2-5KB (focused docs)
Output:         5-10KB (summaries)
Reserve:        2KB
─────────────────────────
Total:          10-20KB
```

**Rules**:
- Load INDEX.md + task-specific docs ONLY
- Never load full audits
- Compact output to summaries
- Single-file focus

---

## Sonnet Budget (40-80KB)

```
Memory load:    5-10KB (INDEX + core)
Task context:   10-20KB (related files)
Diffs/logs:     5-10KB (summarized)
Output:         10-20KB (detailed)
Reserve:        5-10KB
─────────────────────────
Total:          40-80KB
```

**Rules**:
- Use diffs, NOT full file rewrites
- Summarize error messages
- Keep session context fresh
- Load memory selectively

---

## Opus Budget (60-110KB)

```
Memory load:    10-20KB (full context)
Task context:   20-30KB (complete picture)
Analysis:       20-40KB (deep reasoning)
Reserve:        10-20KB
─────────────────────────
Total:          60-110KB (justified)
```

**Rules**:
- Use ONLY when justified
- Provide complete context upfront
- Allow extended thinking
- Track cost

---

## Codex Budget (40-80KB)

```
Memory load:    2-5KB (task-specific)
Files:          10-20KB (diffs, not full)
References:     20-30KB (examples)
Output code:    15-25KB
Reserve:        5-10KB
─────────────────────────
Total:          <80KB
```

**Rules**:
- Never load full project
- Use diffs over full dumps
- Load only modified files
- Clear cache between tasks

---

## Memory Load Strategy

**Always load selectively**:

```python
if "bug" in task:
    load("active/active_bugs.md")
    load("active/session_context.md")

if "architecture" in task:
    load("core/architecture.md")
    load("core/decisions.md")

if "implementation" in task:
    load("core/api_contracts.md")
    load("active/session_context.md")
```

Never load:
- Full audit files (30KB+)
- Agent logs (archive instead)
- Complete history folder
- All ADRs (reference specific ones)

---

## Monthly Monitoring

Track:
- Average session size
- Opus usage (target: <10%)
- Archive growth
- Model distribution

---

**Last updated**: 2026-05-14
