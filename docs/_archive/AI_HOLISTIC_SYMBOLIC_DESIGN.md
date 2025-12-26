# Holistic Symbolic AI  Design (Phase 0)

## 1. Scope and Intent
The purpose of this layer is to generate symbolic, holistic insights that support human interpretation. It is non-clinical, non-diagnostic, and must assist human judgment rather than replace it.

## 2. Position in the Architecture
The AI layer lives outside the UI, plugins, and the visual motor. It consumes symbolic state and PatientContext, then produces structured insights that can be reviewed by a human operator.

## 3. Inputs
- PatientContext (patientId, birthDate)
- Observed symbolic state (Tarot selections, Tree focus, interactions)
- Session metadata (time, workspace)

## 4. Outputs
- Symbolic correlations
- Pattern summaries
- Hypotheses labeled as non-clinical
- Confidence and uncertainty indicators

## 5. Non-Goals (Critical)
- No diagnosis
- No prediction
- No automated decisions
- No clinical recommendations

## 6. Governance and Ethics
- Human-in-the-loop review is mandatory
- Audit trails keyed by patientId
- Explainability requirements for all generated outputs
- Opt-in and opt-out considerations for patients and therapists

## 7. Evolution Path
- Phase 0: design only
- Phase 1: offline analysis and review
- Phase 2: assisted insights
- Phase 3: advanced correlations (still non-clinical)
