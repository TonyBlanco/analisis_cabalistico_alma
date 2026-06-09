/**
 * Formative brief safety gate — shared prohibited-term validation.
 * Policy: degrade field to neutral fallback on violation; never emit prohibited terms.
 */
import type { FormativeBrief } from './formative-reading.types';
export interface SafetyValidationResult {
    passed: boolean;
    warnings: string[];
}
export interface FormativeSafetyViolation {
    field: string;
    warnings: string[];
}
/** Same rules as symbolic-interpreter validateSafetyContent (substring, case-insensitive). */
export declare function validateSafetyContent(content: string): SafetyValidationResult;
export declare const FORMATIVE_SAFE_DISCLAIMER = "Lectura formativa y simb\u00F3lica. No constituye evaluaci\u00F3n cl\u00EDnica ni recomendaci\u00F3n terap\u00E9utica autom\u00E1tica. El terapeuta integra con su marco y el relato del consultante.";
export declare function fallbackForFormativeField(fieldPath: string): string;
export declare function sanitizeFormativeField(fieldPath: string, text: string): {
    text: string;
    violation: FormativeSafetyViolation | null;
};
export declare class FormativeBriefSafetyGateError extends Error {
    readonly violations: FormativeSafetyViolation[];
    constructor(violations: FormativeSafetyViolation[]);
}
export interface ApplyFormativeSafetyGateOptions {
    /** When true, throws after sanitization so callers/tests can detect degraded fields. Default false. */
    throwOnViolation?: boolean;
}
export declare function applyFormativeBriefSafetyGate(brief: FormativeBrief, options?: ApplyFormativeSafetyGateOptions): FormativeBrief;
/** Collect all user-visible text from a brief (for fuzz / lint tests). */
export declare function collectFormativeBriefTextChunks(brief: FormativeBrief): string[];
//# sourceMappingURL=formative-safety.d.ts.map