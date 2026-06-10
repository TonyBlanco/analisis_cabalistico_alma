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
import { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
/**
 * Clinical lexicon — diagnostic / deterministic terms.
 * Blocked for the observational role, lifted for the verified clinical role.
 * Mirrors the historical SYMBOLIC_INTERPRETER_META.prohibitedTerms list so that
 * existing observational behavior is preserved exactly.
 */
export const CLINICAL_LEXICON_TERMS = SYMBOLIC_INTERPRETER_META.prohibitedTerms;
/**
 * Anti-fraud rail terms/phrases (substring match, case-insensitive).
 * NEVER allowed, regardless of role. Phrases are intentionally specific
 * (prescription / dosage / guaranteed-cure / abandon-treatment) to avoid false
 * positives on descriptive clinical language a licensed clinician may legitimately
 * use (e.g. simply naming a drug class in a note).
 */
export const ANTI_FRAUD_TERMS = [
    // Magical / guaranteed cures
    'cura garantizada',
    'curación garantizada',
    'sanación garantizada',
    'cura milagrosa',
    'curación milagrosa',
    'sanación milagrosa',
    'remedio milagroso',
    'garantiza la cura',
    'garantizo la cura',
    'te garantizo la sanación',
    'guaranteed cure',
    'miracle cure',
    // Prescription / dosage
    'te receto',
    'le receto',
    'recetar medicamentos',
    'prescribir medicamentos',
    'prescripción de medicamentos',
    'ajustar la dosis',
    'aumentar la dosis',
    'reducir la dosis',
    'cambiar la dosis',
    'i prescribe',
    'adjust your dose',
    // Abandon / replace medical treatment
    'suspender la medicación',
    'suspende la medicación',
    'deja la medicación',
    'dejar la medicación',
    'abandona el tratamiento médico',
    'abandonar el tratamiento médico',
    'reemplaza el tratamiento médico',
    'sustituye el tratamiento médico',
    'sustituir el tratamiento médico',
    'no necesitas medicación',
    'no necesitas un médico',
    'sin necesidad de médico',
    'stop your medication',
    'replace medical treatment',
];
/**
 * Enforce the anti-fraud rail. Never lifted, for any role.
 */
export function enforceAntiFraudRail(content) {
    const warnings = [];
    const lowercaseContent = (content || '').toLowerCase();
    for (const term of ANTI_FRAUD_TERMS) {
        if (lowercaseContent.includes(term.toLowerCase())) {
            warnings.push(`Anti-fraud rail violation: "${term}"`);
        }
    }
    return { passed: warnings.length === 0, warnings };
}
/**
 * Role-aware safety validation.
 *  - Always enforces the anti-fraud rail.
 *  - Enforces the clinical-lexicon block ONLY for the non-clinical (observational) role.
 */
export function validateSafetyContentForRole(content, role = 'observational') {
    const warnings = [];
    const lowercaseContent = (content || '').toLowerCase();
    if (role !== 'clinical') {
        for (const term of CLINICAL_LEXICON_TERMS) {
            if (lowercaseContent.includes(term.toLowerCase())) {
                warnings.push(`Prohibited term detected: "${term}"`);
            }
        }
    }
    warnings.push(...enforceAntiFraudRail(content).warnings);
    return { passed: warnings.length === 0, warnings };
}
