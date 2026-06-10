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
import { type SymbolicInterpretation, type SymbolicInterpretationRequest, type TreeStructuralAnalysis, type TreeStructuralState } from '../tree';
import { type AddTextResult, type AttachInterpretationResult, type CreateSessionInput, type GuardResult, type SessionClock, type SymbolicSessionState } from './types';
/** Thrown when an action is attempted while a gate (consent / structural) is unmet. */
export declare class SessionGateError extends Error {
    readonly reasons: string[];
    constructor(reasons: string[]);
}
export declare function createSession(input?: CreateSessionInput, clock?: SessionClock): SymbolicSessionState;
export declare function recordConsent(state: SymbolicSessionState, args?: {
    grantedBy?: string;
    note?: string;
}, clock?: SessionClock): SymbolicSessionState;
export declare function revokeConsent(state: SymbolicSessionState, clock?: SessionClock): SymbolicSessionState;
export declare function attachStructuralState(state: SymbolicSessionState, treeState: TreeStructuralState, analysis?: TreeStructuralAnalysis, clock?: SessionClock): SymbolicSessionState;
/** Consent + structural-state gate that protects assisted interpretation. */
export declare function canEnterAssistedInterpretation(state: SymbolicSessionState): GuardResult;
/**
 * Attach an already-computed interpretation, re-validating every observation
 * against the session role. Unsafe observations are dropped and logged; the
 * stored safetyValidation reflects the aggregate of all warnings.
 */
export declare function attachInterpretation(state: SymbolicSessionState, interpretation: SymbolicInterpretation, clock?: SessionClock): AttachInterpretationResult;
/**
 * Convenience orchestration: enforce the gate, run the existing AI interpreter
 * with the session role, then attach + re-gate the result.
 */
export declare function runAssistedInterpretation(state: SymbolicSessionState, request: SymbolicInterpretationRequest, aiCallback: (prompt: string) => Promise<string>, clock?: SessionClock): Promise<AttachInterpretationResult>;
export declare function addSessionNote(state: SymbolicSessionState, args: {
    author: string;
    content: string;
}, clock?: SessionClock): AddTextResult;
export declare function setSessionSummary(state: SymbolicSessionState, summary: string, clock?: SessionClock): AddTextResult;
export declare function addExercise(state: SymbolicSessionState, args: {
    title: string;
    description: string;
}, clock?: SessionClock): AddTextResult;
export declare function markExerciseCompleted(state: SymbolicSessionState, exerciseId: string, clock?: SessionClock): SymbolicSessionState;
export declare function closeSession(state: SymbolicSessionState, clock?: SessionClock): SymbolicSessionState;
//# sourceMappingURL=session-orchestrator.d.ts.map