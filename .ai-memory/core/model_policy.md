# Model Routing Policy

> Decision framework for selecting optimal AI model for each task.

---

## Core Principle

**Use the cheapest capable model first.**

Order of preference by cost:
1. **Claude Haiku** / **GPT-5.4-Mini** (lowest)
2. **Claude Sonnet** / **GPT-5.3-Codex** (medium)
3. **Claude Opus** / **GPT-5.4** / **GPT-5.5** (highest)

---

## Claude Models

### Haiku — Governance & Docs

**Cost**: Lowest  
**Speed**: Fastest  
**Use for**:
- Markdown organization
- Memory restructuring
- Documentation maintenance
- Index creation
- File archival
- Summaries

### Sonnet 4.6 — Engineering (DEFAULT)

**Cost**: Medium  
**Speed**: Fast  
**Use for**:
- Feature implementation
- Debugging
- Testing & validation
- Refactoring
- API design
- Technical analysis

### Opus 4.6 — Architecture (RESTRICTED)

**Cost**: Highest (3-5x Sonnet)  
**Speed**: Slower  
**Use ONLY when**:
- Deep architectural reasoning
- Security audit
- Root cause analysis
- Irreversible decision
- **Justification required**

---

## OpenAI Models

### GPT-5.4-Mini — Quick Tasks

**Use for**:
- Small code snippets
- CSS fixes
- Quick explanations
- Small utilities

### GPT-5.3-Codex — Implementation (DEFAULT FOR VS CODE)

**Use for**:
- Backend development (Django, FastAPI, Node.js)
- Frontend implementation (React, Vue, Next.js)
- Mobile (Flutter, Android)
- Testing (unit, integration)
- Language: Python, TypeScript, JavaScript, Go
- All real coding tasks

### GPT-5.4 — System Design

**Use for**:
- Architecture decisions
- Competing design patterns
- System contracts
- Governance

### GPT-5.5 — Critical Work (RESTRICTED)

**Cost**: Highest  
**Use ONLY when**:
- Security audit required
- Production incident root cause
- Irreversible decision
- Deep reasoning needed
- **Cost justification mandatory**

---

## Decision Matrix

| Complexity | Claude | OpenAI |
|-----------|--------|--------|
| Trivial | Haiku | Mini |
| Simple | Haiku | Mini |
| Routine | Sonnet | Codex |
| Complex | Sonnet | Codex |
| Expert | Opus | GPT-5.4 |
| Critical | Opus | GPT-5.5 |

---

## Budget Per Task

| Model | Max Context | Reserve |
|-------|-------------|---------|
| Haiku | 10-20KB | Yes |
| Sonnet | 40-80KB | Yes |
| Codex | 40-80KB | Yes |
| Opus | 60-110KB | Yes |
| GPT-5.4 | 60-100KB | Yes |
| GPT-5.5 | 80-120KB | Yes |

Always reserve 25-40% of context for output.

---

**Last updated**: 2026-05-14
