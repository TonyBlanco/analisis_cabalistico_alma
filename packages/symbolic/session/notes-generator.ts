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

import {
  enforceAntiFraudRail,
  validateSafetyContentForRole,
  type SafetyRole,
  type SafetyValidationResult,
} from '../tree/clinical-lexicon';
import type { SymbolicSessionState } from './types';

export type SessionWorkspaceId =
  | 'astrology-tarot'
  | 'cabala-applied'
  | 'transgenerational'
  | 'generic';

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

const WORKSPACE_LABELS: Record<SessionWorkspaceId, string> = {
  'astrology-tarot': 'Astrología · Tarot',
  'cabala-applied': 'Cábala Aplicada',
  transgenerational: 'Transgeneracional',
  generic: 'Sesión simbólica',
};

/** Workspace-specific closing section title (common template + specifics). */
const WORKSPACE_FOCUS_TITLE: Record<SessionWorkspaceId, string> = {
  'astrology-tarot': 'Ejes astrológicos y arcanos a seguir',
  'cabala-applied': 'Sefirot y senderos a profundizar',
  transgenerational: 'Patrones transgeneracionales a explorar',
  generic: 'Líneas de trabajo sugeridas',
};

function isClinical(role: SafetyRole): boolean {
  return role === 'clinical';
}

function joinSections(summary: string, sections: SessionNotesSection[]): string {
  const parts = [summary, ...sections.map((s) => `${s.title}\n${s.body}`)];
  return parts.filter((p) => p && p.trim().length > 0).join('\n\n');
}

/**
 * Build a deterministic, role-aware, EDITABLE session-notes draft from the
 * accumulated session state. The output is always re-validated against the
 * role-aware safety policy and the (always-on) anti-fraud rail before it is
 * surfaced to the therapist for review.
 */
export function buildSessionNotesDraft(
  state: SymbolicSessionState,
  options: BuildSessionNotesOptions = {},
): SessionNotesDraft {
  const workspace = options.workspace ?? 'generic';
  const role = state.role;
  const clinical = isClinical(role);
  const generatedAt = (options.now ?? (() => new Date().toISOString()))();
  const includeExercises = options.includeExercises ?? true;
  const workspaceLabel = WORKSPACE_LABELS[workspace];

  // Consent for the session (level 3 / session notes) must be recorded.
  const consentSatisfied = state.consent.granted === true;

  const sections: SessionNotesSection[] = [];

  // 1) Encuadre y consentimiento
  const consentLine = consentSatisfied
    ? `Consentimiento registrado${state.consent.grantedAt ? ` (${state.consent.grantedAt})` : ''}.`
    : 'Sin consentimiento registrado para notas asistidas: este borrador no debe guardarse hasta recogerlo.';
  sections.push({
    id: 'encuadre',
    title: 'Encuadre de la sesión',
    body: [
      `Workspace: ${workspaceLabel}.`,
      state.consultantRef
        ? `Referencia de consultante: ${state.consultantRef}.`
        : 'Consultante: referencia no especificada.',
      `Modo de trabajo: ${clinical ? 'clínico verificado' : 'observacional'}.`,
      consentLine,
    ].join(' '),
  });

  // 2) Mapa simbólico (presencia de estado estructural / análisis)
  const symbolicObservations = state.interpretation?.observations ?? [];
  const mapBodyParts: string[] = [];
  if (state.treeState) {
    mapBodyParts.push('Se trabajó sobre el estado estructural simbólico de la sesión.');
  }
  if (state.analysis) {
    mapBodyParts.push('El análisis estructural aportó el contexto de patrones y relaciones.');
  }
  if (mapBodyParts.length === 0) {
    mapBodyParts.push('No se registró un mapa simbólico estructural en esta sesión.');
  }
  sections.push({ id: 'mapa', title: 'Mapa simbólico', body: mapBodyParts.join(' ') });

  // 3) Interpretación asistida aceptada
  if (symbolicObservations.length > 0) {
    const body = symbolicObservations
      .map((obs, i) => `${i + 1}. ${obs.title ? `${obs.title}: ` : ''}${obs.content ?? ''}`.trim())
      .join('\n');
    sections.push({
      id: 'interpretacion',
      title: clinical
        ? 'Interpretación asistida (revisión clínica)'
        : 'Interpretación asistida (lectura exploratoria)',
      body,
    });
  }

  // 4) Interacciones registradas (solo notas marcadas como seguras)
  const safeNotes = state.notes.filter((n) => n.safe);
  if (safeNotes.length > 0) {
    sections.push({
      id: 'interacciones',
      title: 'Interacciones y observaciones de la sesión',
      body: safeNotes.map((n) => `- ${n.content}`).join('\n'),
    });
  }

  // 5) Ejercicios propuestos (solo seguros)
  if (includeExercises && state.exercises.length > 0) {
    const body = state.exercises
      .filter((e) => e.safe)
      .map((e) => `- [${e.completed ? 'x' : ' '}] ${e.title}${e.description ? ` — ${e.description}` : ''}`)
      .join('\n');
    if (body.length > 0) {
      sections.push({ id: 'ejercicios', title: 'Ejercicios propuestos', body });
    }
  }

  // 6) Líneas de trabajo (específicas por workspace)
  sections.push({
    id: 'focus',
    title: WORKSPACE_FOCUS_TITLE[workspace],
    body: clinical
      ? 'Líneas de trabajo a precisar por el profesional en la próxima sesión, manteniendo el encuadre clínico.'
      : 'Temas y líneas de exploración sugeridas para la próxima sesión, en clave simbólica y educativa.',
  });

  // Resumen
  const summary =
    state.summary && state.summary.trim().length > 0
      ? state.summary.trim()
      : `Resumen de sesión (${workspaceLabel}, modo ${clinical ? 'clínico' : 'observacional'}): ` +
        `${symbolicObservations.length} observación(es) asistida(s), ${safeNotes.length} nota(s) de sesión.`;

  const fullText = joinSections(summary, sections);

  const antiFraud = enforceAntiFraudRail(fullText);
  const safetyValidation = validateSafetyContentForRole(fullText, role);

  return {
    role,
    workspace,
    generatedAt,
    summary,
    sections,
    fullText,
    safetyValidation,
    antiFraud,
    consentSatisfied,
  };
}
