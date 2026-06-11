/**
 * Exploration suggestions generator — Step 8A of the Modo Interactivo Asistido (Híbrido).
 *
 * Deterministic, role-aware synthesis of OPEN-ENDED exploration prompts for the
 * THERAPIST, derived from the accumulated SymbolicSessionState (structural map +
 * accepted assisted interpretation). These are questions the therapist MAY choose
 * to ask — never directives, never prescriptions. Pure TS: no IO, no clinical
 * autonomy; the therapist decides which (if any) to use.
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
export interface ExplorationSuggestion {
    id: string;
    /** Open-ended question/prompt for the therapist to consider asking. */
    prompt: string;
    /** Symbolic provenance (which sefirah / arcano / pattern originated it). */
    provenance: string;
    /** Role-aware validation (clinical lexicon by role + anti-fraud rail). */
    safety: SafetyValidationResult;
    /** Convenience: true when safety.passed. */
    safe: boolean;
}
export interface ExplorationSuggestionsResult {
    role: SafetyRole;
    workspace: SessionWorkspaceId;
    generatedAt: string;
    /** All generated suggestions (safe and unsafe, for transparency). */
    suggestions: ExplorationSuggestion[];
    /** Only suggestions that passed the role-aware safety policy. */
    safeSuggestions: ExplorationSuggestion[];
    /** True when session consent is recorded. */
    consentSatisfied: boolean;
}
export interface BuildExplorationSuggestionsOptions {
    workspace?: SessionWorkspaceId;
    /** Injectable clock for deterministic output in tests. */
    now?: () => string;
    /** Max number of suggestions to return (defaults 6). */
    limit?: number;
}
/**
 * Build a deterministic, role-aware set of exploration prompts for the therapist.
 * Every prompt is validated against the role-aware safety policy and the
 * always-on anti-fraud rail; unsafe prompts are still returned (for transparency)
 * but excluded from `safeSuggestions`.
 */
export declare function buildExplorationSuggestions(state: SymbolicSessionState, options?: BuildExplorationSuggestionsOptions): ExplorationSuggestionsResult;
//# sourceMappingURL=suggestions-generator.d.ts.map