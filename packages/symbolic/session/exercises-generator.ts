/**
 * Interactive exercises generator — Step 8B of the Modo Interactivo Asistido (Híbrido).
 *
 * Deterministic, role-aware synthesis of small guided activities (reflection,
 * symbolic association, visualization, journaling) for the CONSULTANT, tied to the
 * active workspace and derived from the session's symbolic material. Pure TS: no
 * IO, no clinical autonomy. These are DRAFTS — surfaced to the consultant only
 * under the session consent and the therapist's supervision.
 *
 * Safety policy (canonical source: ../tree/clinical-lexicon.ts):
 *   - The clinical lexicon is lifted ONLY for the verified 'clinical' role.
 *   - The anti-fraud rail (no medication/dosage, no magical/guaranteed cures,
 *     no abandoning medical treatment) is ALWAYS enforced, for every role.
 *   - The role is resolved server-side (Django) and carried on the session;
 *     it is NEVER trusted from the client.
 */

import {
  validateSafetyContentForRole,
  type SafetyRole,
  type SafetyValidationResult,
} from '../tree/clinical-lexicon';
import type { SymbolicSessionState } from './types';
import type { SessionWorkspaceId } from './notes-generator';

export type ExerciseKind =
  | 'reflection'
  | 'symbolic-association'
  | 'visualization'
  | 'journaling';

export interface ExerciseDraft {
  id: string;
  title: string;
  description: string;
  kind: ExerciseKind;
  /** Symbolic provenance that motivated the exercise. */
  provenance: string;
  /** Role-aware validation (clinical lexicon by role + anti-fraud rail). */
  safety: SafetyValidationResult;
  /** Convenience: true when safety.passed. */
  safe: boolean;
}

export interface InteractiveExercisesResult {
  role: SafetyRole;
  workspace: SessionWorkspaceId;
  generatedAt: string;
  /**
   * Exercises are surfaced to the consultant only under session consent and the
   * therapist's supervision. Mirrors the session consent flag.
   */
  consentSatisfied: boolean;
  exercises: ExerciseDraft[];
  /** Only exercises that passed the role-aware safety policy. */
  safeExercises: ExerciseDraft[];
}

export interface BuildInteractiveExercisesOptions {
  workspace?: SessionWorkspaceId;
  /** Injectable clock for deterministic output in tests. */
  now?: () => string;
  /** Max number of exercises to return (defaults 5). */
  limit?: number;
}

interface SeedExercise {
  title: string;
  description: string;
  kind: ExerciseKind;
}

const WORKSPACE_PROVENANCE: Record<SessionWorkspaceId, string> = {
  'astrology-tarot': 'Astrología · Tarot',
  'cabala-applied': 'Cábala Aplicada',
  transgenerational: 'Transgeneracional',
  generic: 'Sesión simbólica',
};

const WORKSPACE_SEED_EXERCISES: Record<SessionWorkspaceId, readonly SeedExercise[]> = {
  'astrology-tarot': [
    {
      title: 'Carta del día',
      description:
        'Elige una carta que represente cómo te sientes hoy y escribe, sin juzgar, qué imagen o recuerdo te evoca.',
      kind: 'symbolic-association',
    },
    {
      title: 'Diálogo con un eje',
      description:
        'Escoge uno de los ejes que aparecieron en la sesión y describe qué te gustaría preguntarle si pudiera responderte.',
      kind: 'journaling',
    },
  ],
  'cabala-applied': [
    {
      title: 'Una sefirá esta semana',
      description:
        'Elige la sefirá con la que más resonaste y registra un momento del día en que sentiste su cualidad presente o ausente.',
      kind: 'reflection',
    },
    {
      title: 'Recorrido de un sendero',
      description:
        'Visualiza con calma el sendero entre dos sefirot que trabajamos y observa qué sensaciones aparecen al recorrerlo.',
      kind: 'visualization',
    },
  ],
  transgenerational: [
    {
      title: 'Una frase de la familia',
      description:
        'Anota una frase que se repetía en tu familia y reflexiona, sin obligarte a concluir, sobre cómo la sientes hoy.',
      kind: 'journaling',
    },
    {
      title: 'Línea de los cuidados',
      description:
        'Piensa en quién cuidó a quién en generaciones anteriores y observa qué emociones surgen al imaginar esa cadena.',
      kind: 'reflection',
    },
  ],
  generic: [
    {
      title: 'Símbolo para llevar',
      description:
        'Elige un símbolo de la sesión de hoy y obsérvalo unos minutos; escribe después lo primero que aparezca, sin filtrarlo.',
      kind: 'reflection',
    },
    {
      title: 'Bitácora simbólica',
      description:
        'Durante los próximos días, anota cualquier situación cotidiana que te recuerde a lo que exploramos en la sesión.',
      kind: 'journaling',
    },
  ],
};

/**
 * Build a deterministic, role-aware set of consultant exercise drafts. Every
 * exercise is validated against the role-aware safety policy and the always-on
 * anti-fraud rail; unsafe exercises are still returned (for transparency) but
 * excluded from `safeExercises`.
 */
export function buildInteractiveExercises(
  state: SymbolicSessionState,
  options: BuildInteractiveExercisesOptions = {},
): InteractiveExercisesResult {
  const workspace = options.workspace ?? 'generic';
  const role = state.role;
  const generatedAt = (options.now ?? (() => new Date().toISOString()))();
  const limit = options.limit ?? 5;
  const consentSatisfied = state.consent.granted === true;

  const raw: Array<SeedExercise & { provenance: string }> = [];

  // 1) Personalized reflection from accepted interpretation observations.
  const observations = state.interpretation?.observations ?? [];
  for (const obs of observations) {
    const label = (obs.title || obs.type || 'tema simbólico').trim();
    raw.push({
      title: `Explorar: ${label}`,
      description: `Dedica unos minutos a observar qué sensaciones aparecen al pensar en "${label}", y anota lo que notes sin intentar explicarlo.`,
      kind: 'reflection',
      provenance: `Interpretación asistida · ${label}`,
    });
  }

  // 2) Workspace-specific seed exercises.
  for (const seed of WORKSPACE_SEED_EXERCISES[workspace]) {
    raw.push({ ...seed, provenance: WORKSPACE_PROVENANCE[workspace] });
  }

  const seen = new Set<string>();
  const exercises: ExerciseDraft[] = [];
  for (const item of raw) {
    if (exercises.length >= limit) break;
    const key = item.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const safety = validateSafetyContentForRole(
      `${item.title}\n${item.description}`,
      role,
    );
    exercises.push({
      id: `ex-${exercises.length + 1}`,
      title: item.title,
      description: item.description,
      kind: item.kind,
      provenance: item.provenance,
      safety,
      safe: safety.passed,
    });
  }

  const safeExercises = exercises.filter((e) => e.safe);

  return {
    role,
    workspace,
    generatedAt,
    consentSatisfied,
    exercises,
    safeExercises,
  };
}
