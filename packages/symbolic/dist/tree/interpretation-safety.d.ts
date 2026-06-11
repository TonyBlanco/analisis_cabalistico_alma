/**
 * Interpretation safety sweep — role-aware defense-in-depth (Modo Híbrido).
 *
 * Re-validates every observation of an already-generated SymbolicInterpretation
 * against the session/request role and drops anything unsafe. This is a belt-and
 * -suspenders layer on top of generateSymbolicInterpretation: the BFF route runs
 * it again after the engine so that, regardless of how the interpretation was
 * produced (AI, fallback, cache), the role policy is enforced before the payload
 * leaves the server.
 *
 * Policy (see ./clinical-lexicon.ts):
 *  - clinical-lexicon block lifted ONLY for the verified clinical role,
 *  - anti-fraud rail ALWAYS enforced for every role.
 */
import { type SafetyRole } from './clinical-lexicon';
import type { SymbolicInterpretation } from './symbolic-interpreter.types';
export interface InterpretationSweepResult {
    interpretation: SymbolicInterpretation;
    /** Number of observations dropped because they failed the role-aware gate. */
    removed: number;
    /** Warnings collected from the dropped observations. */
    warnings: string[];
}
/**
 * Re-validate and filter an interpretation's observations for the given role.
 * Unsafe observations are removed; warnings are merged into safetyValidation.
 */
export declare function sweepInterpretationForRole(interpretation: SymbolicInterpretation, role?: SafetyRole): InterpretationSweepResult;
//# sourceMappingURL=interpretation-safety.d.ts.map