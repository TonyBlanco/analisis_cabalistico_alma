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

import type {
  FormativeBrief,
  SymbolicInterpretation,
  TreeStructuralAnalysis,
  TreeStructuralState,
} from '../tree';
import type { SafetyRole } from '../tree/clinical-lexicon';

export type { SafetyRole };

/** Ordered lifecycle stages of an assisted session. */
export type SessionStage =
  | 'intake'
  | 'structural'
  | 'assisted_interpretation'
  | 'session_notes'
  | 'exercises'
  | 'closed';

export const SESSION_STAGE_ORDER: readonly SessionStage[] = [
  'intake',
  'structural',
  'assisted_interpretation',
  'session_notes',
  'exercises',
  'closed',
];

export interface SessionConsent {
  /** True once the consultant consent has been explicitly recorded. */
  granted: boolean;
  /** Who recorded the consent (therapist identifier). */
  grantedBy?: string;
  /** ISO timestamp of when consent was recorded. */
  grantedAt?: string;
  /** Scope of the consent. */
  scope?: 'assisted_interpretation';
  /** Optional free-text note (already safety-gated by the caller). */
  note?: string;
}

export interface SessionNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  /** Passed the role-aware safety gate when stored. */
  safe: boolean;
}

export interface SessionExercise {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
  safe: boolean;
}

export type SessionSafetyOutcome = 'accepted' | 'rejected';

export interface SessionSafetyEvent {
  at: string;
  stage: SessionStage;
  /** Origin of the gated text, e.g. 'note', 'summary', 'exercise', 'interpretation.observation:...'. */
  source: string;
  outcome: SessionSafetyOutcome;
  warnings: string[];
}

export interface SessionStageEvent {
  from: SessionStage;
  to: SessionStage;
  at: string;
}

export interface SymbolicSessionState {
  id: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Safety role resolved in Django (UserProfile.clinical_mode_enabled).
   * 'clinical' lifts the clinical-lexicon block; the anti-fraud rail is always
   * enforced. NEVER trusted from the client.
   */
  role: SafetyRole;
  therapistId?: string;
  /** Opaque reference to the consultant. MUST NOT carry personal data. */
  consultantRef?: string;
  stage: SessionStage;
  consent: SessionConsent;
  treeState?: TreeStructuralState;
  analysis?: TreeStructuralAnalysis;
  formativeBrief?: FormativeBrief;
  interpretation?: SymbolicInterpretation;
  notes: SessionNote[];
  summary?: string;
  exercises: SessionExercise[];
  safetyLog: SessionSafetyEvent[];
  history: SessionStageEvent[];
}

export interface CreateSessionInput {
  id?: string;
  /** Defaults to 'observational' when omitted. */
  role?: SafetyRole;
  therapistId?: string;
  consultantRef?: string;
}

/** Injectable clock for deterministic timestamps in tests. */
export interface SessionClock {
  now: () => string;
}

export interface GuardResult {
  allowed: boolean;
  reasons: string[];
}

export interface AddTextResult {
  state: SymbolicSessionState;
  accepted: boolean;
  warnings: string[];
}

export interface AttachInterpretationResult {
  state: SymbolicSessionState;
  acceptedObservations: number;
  rejectedObservations: number;
  safetyEvents: SessionSafetyEvent[];
}
