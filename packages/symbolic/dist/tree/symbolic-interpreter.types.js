/**
 * Symbolic Interpreter Types — AI-Assisted Symbolic Reading
 *
 * CRITICAL SAFETY RULES:
 * 1. NO clinical diagnosis
 * 2. NO personal advice
 * 3. NO psychological labels
 * 4. NO deterministic statements
 * 5. ONLY structural-symbolic observations
 *
 * This module ONLY reads TreeStructuralState.
 * It NEVER accesses personal data directly.
 */
export const SYMBOLIC_INTERPRETER_META = {
    version: '1.0.0',
    safetyRules: [
        'NO clinical diagnosis',
        'NO personal advice',
        'NO psychological labels',
        'NO deterministic statements',
        'ONLY structural-symbolic observations',
        'NO access to personal data',
    ],
    prohibitedTerms: [
        'diagnóstico',
        'diagnosis',
        'trastorno',
        'disorder',
        'patología',
        'pathology',
        'enfermedad',
        'disease',
        'debes',
        'must',
        'tienes que',
        'have to',
        'definitivamente',
        'definitely',
        'siempre',
        'always',
        'nunca',
        'never',
    ],
    disclaimerText: 'Lectura simbólica asistida (IA) · No interpretación clínica · Solo propósitos formativos y pedagógicos',
};
