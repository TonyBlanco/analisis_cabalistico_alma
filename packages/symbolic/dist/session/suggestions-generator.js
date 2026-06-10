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
import { validateSafetyContentForRole, } from '../tree/clinical-lexicon';
const WORKSPACE_PROVENANCE = {
    'astrology-tarot': 'Astrología · Tarot',
    'cabala-applied': 'Cábala Aplicada',
    transgenerational: 'Transgeneracional',
    generic: 'Sesión simbólica',
};
const WORKSPACE_SEED_PROMPTS = {
    'astrology-tarot': [
        '¿Qué resonancia encuentra el consultante entre los ejes astrológicos y su momento vital actual?',
        '¿Qué arcano de la tirada le llama más la atención, y qué evoca en su experiencia personal?',
    ],
    'cabala-applied': [
        '¿Con qué sefirá siente el consultante mayor cercanía o distancia en este momento?',
        '¿Qué sendero del árbol describe mejor una tensión que está atravesando?',
    ],
    transgenerational: [
        '¿Qué patrón familiar reconoce el consultante que se repite a lo largo de las generaciones?',
        '¿Qué lealtad o mandato heredado siente que sigue influyendo en sus decisiones?',
    ],
    generic: [
        '¿Qué tema simbólico de la sesión resuena más con lo que el consultante está viviendo?',
        '¿Qué imagen o símbolo de hoy le gustaría seguir explorando?',
    ],
};
function isClinical(role) {
    return role === 'clinical';
}
/**
 * Build a deterministic, role-aware set of exploration prompts for the therapist.
 * Every prompt is validated against the role-aware safety policy and the
 * always-on anti-fraud rail; unsafe prompts are still returned (for transparency)
 * but excluded from `safeSuggestions`.
 */
export function buildExplorationSuggestions(state, options = {}) {
    const workspace = options.workspace ?? 'generic';
    const role = state.role;
    const clinical = isClinical(role);
    const generatedAt = (options.now ?? (() => new Date().toISOString()))();
    const limit = options.limit ?? 6;
    const consentSatisfied = state.consent.granted === true;
    const raw = [];
    // 1) Derived from accepted assisted interpretation observations.
    const observations = state.interpretation?.observations ?? [];
    for (const obs of observations) {
        const label = (obs.title || obs.type || 'patrón simbólico').trim();
        const prompt = clinical
            ? `Sobre "${label}": ¿cómo se articula este patrón con lo que el consultante está trabajando clínicamente?`
            : `Sobre "${label}": ¿qué relación reconoce el consultante con esto en su vida cotidiana?`;
        raw.push({ prompt, provenance: `Interpretación asistida · ${label}` });
    }
    // 2) Structural-map seed (only when a symbolic map was present).
    if (state.treeState || state.analysis) {
        raw.push({
            prompt: clinical
                ? '¿Qué hipótesis de trabajo sugiere el mapa estructural para contrastar con el consultante?'
                : '¿Qué parte del mapa simbólico despierta más curiosidad en el consultante?',
            provenance: 'Mapa estructural simbólico',
        });
    }
    // 3) Workspace-specific seed prompts.
    for (const seed of WORKSPACE_SEED_PROMPTS[workspace]) {
        raw.push({ prompt: seed, provenance: WORKSPACE_PROVENANCE[workspace] });
    }
    // De-duplicate, cap to `limit`, then validate role-aware (+ always-on anti-fraud rail).
    const seen = new Set();
    const suggestions = [];
    for (const item of raw) {
        if (suggestions.length >= limit)
            break;
        const key = item.prompt.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        const safety = validateSafetyContentForRole(item.prompt, role);
        suggestions.push({
            id: `sug-${suggestions.length + 1}`,
            prompt: item.prompt,
            provenance: item.provenance,
            safety,
            safe: safety.passed,
        });
    }
    const safeSuggestions = suggestions.filter((s) => s.safe);
    return {
        role,
        workspace,
        generatedAt,
        suggestions,
        safeSuggestions,
        consentSatisfied,
    };
}
