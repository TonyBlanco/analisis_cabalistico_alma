/**
 * Clinical lexicon & anti-fraud rail — role-aware safety for the Modo Híbrido.
 *
 * Policy (governed by Django UserProfile; see
 * docs/01_PROJECT_STATE/MODO_HIBRIDO_GOVERNANCE.md):
 *
 *  - OBSERVATIONAL (default, all non-clinical roles): the clinical lexicon
 *    (diagnóstico, trastorno, patología, enfermedad, "debes", "tienes que",
 *    "siempre", "nunca", "definitivamente", …) is BLOCKED. This preserves the
 *    educational / symbolic framing for personal users and non-verified therapists.
 *
 *  - CLINICAL (verified medical/psychiatrist therapists only): the clinical
 *    lexicon block is LIFTED, because licensed clinicians need real clinical
 *    vocabulary to do their work. The role is the single source of truth and is
 *    resolved in the Django backend (UserProfile.clinical_mode_enabled); it is
 *    NEVER trusted from the client.
 *
 *  - ANTI-FRAUD RAIL (ALWAYS enforced, every role, never lifted): the system must
 *    never prescribe medication / dosage, nor promise magical or guaranteed cures,
 *    nor tell the consultant to abandon or replace medical treatment. This is the
 *    non-negotiable guardrail against holistic fraud.
 */
export type SafetyRole = 'observational' | 'clinical';
export interface SafetyValidationResult {
    passed: boolean;
    warnings: string[];
}
/**
 * Clinical lexicon — diagnostic / deterministic terms.
 * Blocked for the observational role, lifted for the verified clinical role.
 * Mirrors the historical SYMBOLIC_INTERPRETER_META.prohibitedTerms list so that
 * existing observational behavior is preserved exactly.
 */
export declare const CLINICAL_LEXICON_TERMS: readonly string[];
/**
 * Anti-fraud rail terms/phrases (substring match, case-insensitive).
 * NEVER allowed, regardless of role. Phrases are intentionally specific
 * (prescription / dosage / guaranteed-cure / abandon-treatment) to avoid false
 * positives on descriptive clinical language a licensed clinician may legitimately
 * use (e.g. simply naming a drug class in a note).
 */
export declare const ANTI_FRAUD_TERMS: readonly string[];
/**
 * Enforce the anti-fraud rail. Never lifted, for any role.
 */
export declare function enforceAntiFraudRail(content: string): SafetyValidationResult;
/**
 * Role-aware safety validation.
 *  - Always enforces the anti-fraud rail.
 *  - Enforces the clinical-lexicon block ONLY for the non-clinical (observational) role.
 */
export declare function validateSafetyContentForRole(content: string, role?: SafetyRole): SafetyValidationResult;
//# sourceMappingURL=clinical-lexicon.d.ts.map