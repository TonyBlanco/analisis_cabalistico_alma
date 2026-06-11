/**
 * Session notes & summary generator — Step 7 of the Modo Interactivo Asistido (Híbrido).
 *
 * Deterministic, role-aware synthesis of an EDITABLE session-notes DRAFT from the
 * accumulated SymbolicSessionState (symbolic findings + accepted assisted
 * interpretation + recorded interactions/exercises). Pure TS: no IO, no clinical
 * autonomy. The therapist always reviews/edits before persisting.
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
export type SessionWorkspaceId = 'astrology-tarot' | 'cabala-applied' | 'transgenerational' | 'generic';
export interface SessionNotesSection {
    id: string;
    title: string;
    body: string;
}
export interface SessionNotesDraft {
    role: SafetyRole;
    workspace: SessionWorkspaceId;
    generatedAt: string;
    /** Short headline summary (consent-gated, editable). */
    summary: string;
    /** Structured sections: common template + workspace-specific focus. */
    sections: SessionNotesSection[];
    /** Flat plain-text rendering of summary + sections (what gets safety-checked). */
    fullText: string;
    /** Role-aware validation (clinical lexicon by role + anti-fraud rail). */
    safetyValidation: SafetyValidationResult;
    /** Anti-fraud rail result on its own (always enforced, every role). */
    antiFraud: SafetyValidationResult;
    /** True when consent for the session (level 3 / session notes) is recorded. */
    consentSatisfied: boolean;
}
export interface BuildSessionNotesOptions {
    workspace?: SessionWorkspaceId;
    /** Injectable clock for deterministic output in tests. */
    now?: () => string;
    /** Include an exercises section (defaults true). */
    includeExercises?: boolean;
}
/**
 * Build a deterministic, role-aware, EDITABLE session-notes draft from the
 * accumulated session state. The output is always re-validated against the
 * role-aware safety policy and the (always-on) anti-fraud rail before it is
 * surfaced to the therapist for review.
 */
export declare function buildSessionNotesDraft(state: SymbolicSessionState, options?: BuildSessionNotesOptions): SessionNotesDraft;
//# sourceMappingURL=notes-generator.d.ts.map