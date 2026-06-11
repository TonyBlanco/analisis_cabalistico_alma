/**
 * D6 observability — emit aggregable symbolic session events to Django.
 *
 * The Django endpoint (/api/symbolic/session-events/) is the source of truth: it
 * is therapist-only, resolves the safety role server-side (NEVER from the
 * client) and strips anything that is not an aggregable, non-PII scalar. From
 * the BFF we only send the event type, the workspace, an optional patient id
 * (ownership re-checked server-side) and a small, non-PII metadata bag.
 *
 * Emission is strictly observability: it must NEVER block, delay-fail or break
 * the primary route response. Every error is swallowed.
 */

import { getDjangoApiBase } from './server';

export type SymbolicSessionEventType =
  | 'session_started'
  | 'interpretation_generated'
  | 'interpretation_accepted'
  | 'exercise_completed'
  | 'anti_fraud_block';

export type SymbolicEventWorkspace =
  | 'astrology-tarot'
  | 'cabala-applied'
  | 'transgenerational'
  | 'generic';

export interface RecordSessionEventInput {
  eventType: SymbolicSessionEventType;
  workspace?: SymbolicEventWorkspace | string;
  patientId?: number | string | null;
  /** Aggregable, non-PII scalars only. Long/free-text values are dropped server-side. */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Best-effort, fire-and-forget emission of a symbolic session event.
 *
 * Returns `true` only if Django acknowledged with a 2xx (mostly useful for
 * tests); a `false`/silent return is expected and harmless for non-therapist
 * callers (the endpoint replies 403) or when the backend is unreachable.
 */
export async function recordSessionEvent(
  authorization: string | null,
  input: RecordSessionEventInput,
): Promise<boolean> {
  if (!authorization) return false;

  try {
    const payload: Record<string, unknown> = {
      event_type: input.eventType,
      workspace: input.workspace ?? 'generic',
    };

    if (
      input.patientId !== undefined &&
      input.patientId !== null &&
      `${input.patientId}`.trim() !== ''
    ) {
      payload.patient_id = input.patientId;
    }

    if (input.metadata && Object.keys(input.metadata).length > 0) {
      payload.metadata = input.metadata;
    }

    const res = await fetch(`${getDjangoApiBase()}/symbolic/session-events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      cache: 'no-store',
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    // Observability must never break the primary flow.
    return false;
  }
}

/**
 * True when a safety result tripped the always-on anti-fraud rail (as opposed to
 * the role-dependent clinical-lexicon block). Mirrors the warning prefixes
 * produced by validateSafetyContentForRole / enforceAntiFraudRail.
 */
export function hasAntiFraudViolation(
  result: { warnings?: string[] } | null | undefined,
): boolean {
  return Boolean(
    result?.warnings?.some((w) => w.startsWith('Anti-fraud rail violation')),
  );
}
