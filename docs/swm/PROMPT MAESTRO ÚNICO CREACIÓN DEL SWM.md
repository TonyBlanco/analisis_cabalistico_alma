YOU ARE ACTING AS A SENIOR PLATFORM ARCHITECT
AND LEAD FRONTEND ENGINEER
SPECIALIZED IN CLINICAL, THERAPEUTIC AND HOLISTIC SYSTEMS.

THIS TASK CREATES A NEW SPECIALIZED WORKSPACE MODULE (SWM).
THIS IS NOT A PANEL.
THIS IS NOT A REFACTOR.
THIS IS A NEW WORKSPACE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NON-NEGOTIABLE ARCHITECTURAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DO NOT MODIFY THE CORE THERAPIST WORKSPACE
2. DO NOT MODIFY PANEL MANAGER
3. DO NOT MODIFY EXISTING ROUTES OR PANELS
4. DO NOT MOVE OR REWRITE EXISTING BIO-EMOTION LOGIC
5. DO NOT ADD CLINICAL OR MEDICAL DIAGNOSTICS
6. DO NOT ADD AUTOMATED DECISION MAKING
7. HUMAN THERAPIST IS ALWAYS THE AUTHORITY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT (ALREADY DEFINED AND BINDING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- The platform uses a multi-workspace architecture.
- Bio-Emoción Experiencial Profunda is a Specialized Workspace Module (SWM).
- High cognitive density → Own workspace.
- This SWM is a premium, licensable module.
- All principles in:
  - MAPA_DE_WORKSPACES_DEL_ECOSISTEMA.md
  - BIOEMOCION_EXPERIENCIAL_PROFUNDA.md
  - BIOEMOCION_EXPERIENCIAL_PROFUNDA_TECHNICAL_SPEC.md
  are binding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create the INITIAL IMPLEMENTATION (P1) of the
Bio-Emoción Experiencial Profunda SWM.

Focus on:
- Correct workspace separation
- Correct visual hierarchy
- Correct data flow
- Correct future extensibility

NOT on:
- Full features
- AI automation
- Final UX polish

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SWM ENTRY & EXIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- The SWM must be entered explicitly from the Core Workspace.
- Patient context is inherited (read-only).
- Session context is inherited.
- Exiting the SWM returns safely to the Core Workspace.
- No loss of data or context is allowed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKSPACE STRUCTURE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The SWM MUST have:

A) Its own layout container
B) Its own internal sidebar
C) Its own visual core
D) Its own internal tool panels
E) Its own workspace states

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL CORE CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Central element: Human body experiential view
- Initial version: High-quality 2D anatomical model
- Architecture must allow later 3D upgrade
- Body selection based on BIOLOGICAL SEX:
  male | female | intersex | unknown
- If unknown → neutral anatomical representation
- No forced anatomy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKSPACE STATES (P1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Define and implement state handling for:

- observation
- analysis
- synthesis
- closure

States affect:
- visible tools
- annotations
- therapist focus

States DO NOT:
- automate conclusions
- hide therapist control

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT (READ-ONLY):
- Patient profile
- Bio-emotional answers
- Transgenerational references
- Super-JSON bio-emotional knowledge

OUTPUT:
- Observations
- Hypotheses (explicitly non-diagnostic)
- Therapist notes
- Proposed therapeutic paths

All outputs are:
- editable
- auditable
- therapist-owned

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI PARTICIPATION (NOT IMPLEMENTED YET)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prepare hooks ONLY.

AI may later:
- suggest symbolic correlations
- draft meditations
- draft forgiveness letters
- suggest sound/frequency/aroma work

AI must NEVER:
- diagnose
- assert certainty
- replace therapist judgment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTENSIBILITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design must allow future modules:
- Meditation engine
- Sound & frequency generator
- Essential oil recommendations
- Advanced 3D body rendering

NO hard coupling allowed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVERABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Produce:

1. A new SWM folder / structure
2. A dedicated layout for the SWM
3. Visual core placeholder (2D body)
4. Internal sidebar scaffold
5. State management scaffold
6. Clear separation from Core Workspace
7. Summary of architectural decisions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUCCESS CRITERIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✔ Bio-Emoción runs in its own workspace
✔ Core Workspace remains untouched
✔ High cognitive density is respected
✔ Therapist experience feels deep and focused
✔ System is future-proof and licensable

THIS MODULE IS A FLAGSHIP.
BUILD WITH CARE.
