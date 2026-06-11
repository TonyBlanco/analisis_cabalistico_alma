/**
 * Interactive exercises generator — Step 8B of the Modo Interactivo Asistido (Híbrido).
 *
 * Deterministic, role-aware synthesis of small guided activities (reflection,
 * symbolic association, visualization, journaling) for the CONSULTANT, tied to the
 * active workspace and derived from the session's symbolic material. Pure TS: no
 * IO, no clinical autonomy. These are DRAFTS — surfaced to the consultant only
 * under the session consent and the therapist's supervision.
 *
 * Safety policy (canonical source: ../tree/clinical-lexicon.ts):
 *   - The clinical lexicon is lifted ONLY for the verified 'clinical' role.
 *   - The anti-fraud rail (no medication/dosage, no magical/guaranteed cures,
 *     no abandoning medical treatment) is ALWAYS enforced, for every role.
 *   - The role is resolved server-side (Django) and carried on the session;
 *     it is NEVER trusted from the client.
 */
import { type SafetyRole, type SafetyValidationResult } from '../tree/clinical-lexicon';
import type { SymbolicSessionState } from './types';
import type { SessionWorkspaceId } from './notes-generator';
export type ExerciseKind = 'reflection' | 'symbolic-association' | 'visualization' | 'journaling';
export interface ExerciseDraft {
    id: string;
    title: string;
    description: string;
    kind: ExerciseKind;
    /** Symbolic provenance that motivated the exercise. */
    provenance: string;
    /** Role-aware validation (clinical lexicon by role + anti-fraud rail). */
    safety: SafetyValidationResult;
    /** Convenience: true when safety.passed. */
    safe: boolean;
}
export interface InteractiveExercisesResult {
    role: SafetyRole;
    workspace: SessionWorkspaceId;
    generatedAt: string;
    /**
     * Exercises are surfaced to the consultant only under session consent and the
     * therapist's supervision. Mirrors the session consent flag.
     */
    consentSatisfied: boolean;
    exercises: ExerciseDraft[];
    /** Only exercises that passed the role-aware safety policy. */
    safeExercises: ExerciseDraft[];
}
export interface BuildInteractiveExercisesOptions {
    workspace?: SessionWorkspaceId;
    /** Injectable clock for deterministic output in tests. */
    now?: () => string;
    /** Max number of exercises to return (defaults 5). */
    limit?: number;
}
/**
 * Build a deterministic, role-aware set of consultant exercise drafts. Every
 * exercise is validated against the role-aware safety policy and the always-on
 * anti-fraud rail; unsafe exercises are still returned (for transparency) but
 * excluded from `safeExercises`.
 */
export declare function buildInteractiveExercises(state: SymbolicSessionState, options?: BuildInteractiveExercisesOptions): InteractiveExercisesResult;
//# sourceMappingURL=exercises-generator.d.ts.map