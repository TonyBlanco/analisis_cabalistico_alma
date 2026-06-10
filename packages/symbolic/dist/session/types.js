/**
 * Symbolic Session — types for the Modo Interactivo Asistido (Híbrido).
 *
 * A session is a deterministic state machine that drives an assisted therapy
 * session over the symbolic engine. It carries the safety role resolved in
 * Django (UserProfile.clinical_mode_enabled) and enforces:
 *   - a consent gate before any AI-assisted interpretation, and
 *   - the role-aware safety policy (clinical-lexicon block lifted only for the
 *     verified clinical role; anti-fraud rail ALWAYS enforced).
 *
 * The role is NEVER trusted from the client; it is provided by the backend when
 * the session is created. See docs/01_PROJECT_STATE/MODO_HIBRIDO_GOVERNANCE.md.
 */
export const SESSION_STAGE_ORDER = [
    'intake',
    'structural',
    'assisted_interpretation',
    'session_notes',
    'exercises',
    'closed',
];
