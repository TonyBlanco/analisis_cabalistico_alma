/**
 * Symbolic Session Orchestrator — Modo Interactivo Asistido (Híbrido)
 *
 * Deterministic, framework-agnostic state machine that drives an assisted
 * therapy session over the symbolic engine while enforcing:
 *   - a consent gate before any AI-assisted interpretation, and
 *   - the role-aware safety policy: the clinical-lexicon block is lifted only
 *     for the verified clinical role; the anti-fraud rail is ALWAYS enforced.
 *
 * The safety role is resolved in Django (UserProfile.clinical_mode_enabled) and
 * passed in at session creation; it is NEVER trusted from the client. No LLM is
 * called here directly — only through the injected aiCallback used by the
 * existing generateSymbolicInterpretation engine.
 *
 * All functions are pure: they return a NEW state object and never mutate the
 * input. Timestamps and ids are deterministic when an explicit clock/id are
 * provided, which keeps sessions reproducible and easy to test.
 */
import { analyzeTreeState, generateSymbolicInterpretation, } from '../tree';
import { validateSafetyContentForRole } from '../tree/clinical-lexicon';
import { SESSION_STAGE_ORDER, } from './types';
const DEFAULT_CLOCK = { now: () => new Date().toISOString() };
function stageIndex(stage) {
    return SESSION_STAGE_ORDER.indexOf(stage);
}
function forwardStage(current, target) {
    return stageIndex(current) < stageIndex(target) ? target : current;
}
function historyWith(state, to, at) {
    if (state.stage === to)
        return state.history;
    return [...state.history, { from: state.stage, to, at }];
}
/** Thrown when an action is attempted while a gate (consent / structural) is unmet. */
export class SessionGateError extends Error {
    constructor(reasons) {
        super(`Session gate blocked: ${reasons.join(' ')}`);
        this.name = 'SessionGateError';
        this.reasons = reasons;
    }
}
export function createSession(input = {}, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    return {
        id: input.id ?? `session-${at}`,
        createdAt: at,
        updatedAt: at,
        role: input.role ?? 'observational',
        therapistId: input.therapistId,
        consultantRef: input.consultantRef,
        stage: 'intake',
        consent: { granted: false },
        notes: [],
        exercises: [],
        safetyLog: [],
        history: [],
    };
}
export function recordConsent(state, args = {}, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    return {
        ...state,
        consent: {
            granted: true,
            grantedBy: args.grantedBy,
            grantedAt: at,
            scope: 'assisted_interpretation',
            note: args.note,
        },
        updatedAt: at,
    };
}
export function revokeConsent(state, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    return { ...state, consent: { granted: false }, updatedAt: at };
}
export function attachStructuralState(state, treeState, analysis, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    const resolvedAnalysis = analysis ?? analyzeTreeState(treeState);
    const to = forwardStage(state.stage, 'structural');
    return {
        ...state,
        treeState,
        analysis: resolvedAnalysis,
        stage: to,
        history: historyWith(state, to, at),
        updatedAt: at,
    };
}
/** Consent + structural-state gate that protects assisted interpretation. */
export function canEnterAssistedInterpretation(state) {
    const reasons = [];
    if (!state.consent.granted) {
        reasons.push('Consentimiento del consultante no registrado.');
    }
    if (!state.treeState) {
        reasons.push('Falta el TreeStructuralState (estado estructural).');
    }
    if (state.stage === 'closed') {
        reasons.push('La sesión está cerrada.');
    }
    return { allowed: reasons.length === 0, reasons };
}
/**
 * Attach an already-computed interpretation, re-validating every observation
 * against the session role. Unsafe observations are dropped and logged; the
 * stored safetyValidation reflects the aggregate of all warnings.
 */
export function attachInterpretation(state, interpretation, clock = DEFAULT_CLOCK) {
    const guard = canEnterAssistedInterpretation(state);
    if (!guard.allowed) {
        throw new SessionGateError(guard.reasons);
    }
    const at = clock.now();
    const safetyEvents = [];
    const safeObservations = interpretation.observations.filter((obs) => {
        const validation = validateSafetyContentForRole(obs.content, state.role);
        safetyEvents.push({
            at,
            stage: 'assisted_interpretation',
            source: `interpretation.observation:${obs.type}`,
            outcome: validation.passed ? 'accepted' : 'rejected',
            warnings: validation.warnings,
        });
        return validation.passed;
    });
    const aggregateWarnings = safetyEvents.flatMap((e) => e.warnings);
    const gatedInterpretation = {
        ...interpretation,
        observations: safeObservations.map((o) => ({ ...o, containsProhibitedContent: false })),
        safetyValidation: {
            passed: aggregateWarnings.length === 0,
            warnings: aggregateWarnings,
        },
    };
    const to = forwardStage(state.stage, 'assisted_interpretation');
    return {
        state: {
            ...state,
            interpretation: gatedInterpretation,
            stage: to,
            history: historyWith(state, to, at),
            safetyLog: [...state.safetyLog, ...safetyEvents],
            updatedAt: at,
        },
        acceptedObservations: safeObservations.length,
        rejectedObservations: interpretation.observations.length - safeObservations.length,
        safetyEvents,
    };
}
/**
 * Convenience orchestration: enforce the gate, run the existing AI interpreter
 * with the session role, then attach + re-gate the result.
 */
export async function runAssistedInterpretation(state, request, aiCallback, clock = DEFAULT_CLOCK) {
    const guard = canEnterAssistedInterpretation(state);
    if (!guard.allowed) {
        throw new SessionGateError(guard.reasons);
    }
    const interpretation = await generateSymbolicInterpretation(request, aiCallback, state.role);
    return attachInterpretation(state, interpretation, clock);
}
export function addSessionNote(state, args, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    const validation = validateSafetyContentForRole(args.content, state.role);
    const event = {
        at,
        stage: 'session_notes',
        source: 'note',
        outcome: validation.passed ? 'accepted' : 'rejected',
        warnings: validation.warnings,
    };
    if (!validation.passed) {
        return {
            state: { ...state, safetyLog: [...state.safetyLog, event], updatedAt: at },
            accepted: false,
            warnings: validation.warnings,
        };
    }
    const note = {
        id: `${state.id}-note-${state.notes.length + 1}`,
        author: args.author,
        content: args.content,
        createdAt: at,
        safe: true,
    };
    const to = forwardStage(state.stage, 'session_notes');
    return {
        state: {
            ...state,
            notes: [...state.notes, note],
            stage: to,
            history: historyWith(state, to, at),
            safetyLog: [...state.safetyLog, event],
            updatedAt: at,
        },
        accepted: true,
        warnings: [],
    };
}
export function setSessionSummary(state, summary, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    const validation = validateSafetyContentForRole(summary, state.role);
    const event = {
        at,
        stage: 'session_notes',
        source: 'summary',
        outcome: validation.passed ? 'accepted' : 'rejected',
        warnings: validation.warnings,
    };
    if (!validation.passed) {
        return {
            state: { ...state, safetyLog: [...state.safetyLog, event], updatedAt: at },
            accepted: false,
            warnings: validation.warnings,
        };
    }
    const to = forwardStage(state.stage, 'session_notes');
    return {
        state: {
            ...state,
            summary,
            stage: to,
            history: historyWith(state, to, at),
            safetyLog: [...state.safetyLog, event],
            updatedAt: at,
        },
        accepted: true,
        warnings: [],
    };
}
export function addExercise(state, args, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    const combined = `${args.title}\n${args.description}`;
    const validation = validateSafetyContentForRole(combined, state.role);
    const event = {
        at,
        stage: 'exercises',
        source: 'exercise',
        outcome: validation.passed ? 'accepted' : 'rejected',
        warnings: validation.warnings,
    };
    if (!validation.passed) {
        return {
            state: { ...state, safetyLog: [...state.safetyLog, event], updatedAt: at },
            accepted: false,
            warnings: validation.warnings,
        };
    }
    const exercise = {
        id: `${state.id}-exercise-${state.exercises.length + 1}`,
        title: args.title,
        description: args.description,
        createdAt: at,
        completed: false,
        safe: true,
    };
    const to = forwardStage(state.stage, 'exercises');
    return {
        state: {
            ...state,
            exercises: [...state.exercises, exercise],
            stage: to,
            history: historyWith(state, to, at),
            safetyLog: [...state.safetyLog, event],
            updatedAt: at,
        },
        accepted: true,
        warnings: [],
    };
}
export function markExerciseCompleted(state, exerciseId, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    return {
        ...state,
        exercises: state.exercises.map((e) => e.id === exerciseId ? { ...e, completed: true } : e),
        updatedAt: at,
    };
}
export function closeSession(state, clock = DEFAULT_CLOCK) {
    const at = clock.now();
    const to = 'closed';
    return {
        ...state,
        stage: to,
        history: historyWith(state, to, at),
        updatedAt: at,
    };
}
