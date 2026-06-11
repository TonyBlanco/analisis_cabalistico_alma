import { validateSafetyContentForRole } from '@holistica/symbolic/tree';
import { resolveSafetyRole } from '@/lib/symbolic-api/role';
import { recordSessionEvent, hasAntiFraudViolation } from '@/lib/symbolic-api/events';
import {
  errorResponse,
  getDjangoApiBase,
  jsonResponse,
} from '@/lib/symbolic-api/server';

/**
 * BFF persistence route for assisted session notes/summary (Modo Híbrido — Step 7).
 *
 * Flow:
 *   1. Require explicit consent (level 3 / session notes).
 *   2. Resolve the safety role SERVER-SIDE from the Django profile
 *      (clinical_mode_enabled). The role is NEVER taken from the request body.
 *   3. Defense-in-depth: re-run the role-aware safety policy (clinical lexicon
 *      by role + always-on anti-fraud rail) before persisting.
 *   4. Forward persistence to Django, the source of truth for storage and the
 *      patient<->therapist ownership check.
 */

interface SessionNotesRequestBody {
  patientId?: number | string;
  workspace?: string;
  summary?: string;
  fullText?: string;
  sections?: Array<{ id?: string; title?: string; body?: string }>;
  swmV3Consent?: boolean;
}

export async function POST(request: Request): Promise<Response> {
  let body: SessionNotesRequestBody;
  try {
    body = (await request.json()) as SessionNotesRequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Consent gate: session-notes consent is required before persisting.
  if (!body.swmV3Consent) {
    return errorResponse(
      'SWM v3 consent (session notes) required before saving.',
      403,
    );
  }

  if (
    body.patientId === undefined ||
    body.patientId === null ||
    `${body.patientId}`.trim() === ''
  ) {
    return errorResponse('patientId is required', 400);
  }

  const summary = (body.summary ?? '').trim();
  const fullText = (body.fullText ?? '').trim();
  if (!summary && !fullText) {
    return errorResponse('summary or fullText is required', 400);
  }

  const authorization = request.headers.get('authorization');

  // Role resolved server-side from the Django profile. NEVER from the body.
  const role = await resolveSafetyRole(authorization);

  // Defense-in-depth: re-run the role-aware safety policy before persisting.
  const safety = validateSafetyContentForRole(`${summary}\n${fullText}`, role);
  if (!safety.passed) {
    // Observability (D6): only count an anti-fraud_block when the always-on
    // anti-fraud rail tripped — not for role-dependent clinical-lexicon drops.
    if (hasAntiFraudViolation(safety)) {
      await recordSessionEvent(authorization, {
        eventType: 'anti_fraud_block',
        workspace: body.workspace ?? 'generic',
        patientId: body.patientId,
        metadata: { surface: 'session_notes', warning_count: safety.warnings.length },
      });
    }
    return jsonResponse({ persisted: false, role, safety }, 422);
  }

  let djangoResponse: Response;
  try {
    djangoResponse = await fetch(`${getDjangoApiBase()}/symbolic/session-notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify({
        patient_id: body.patientId,
        workspace: body.workspace ?? 'generic',
        summary,
        full_text: fullText || summary,
        sections: body.sections ?? [],
        role,
      }),
    });
  } catch {
    return errorResponse('Failed to reach persistence backend', 502);
  }

  let persistedData: unknown = null;
  try {
    persistedData = await djangoResponse.json();
  } catch {
    persistedData = null;
  }

  if (!djangoResponse.ok) {
    return jsonResponse(
      {
        persisted: false,
        role,
        safety,
        backendStatus: djangoResponse.status,
        backend: persistedData,
      },
      djangoResponse.status,
    );
  }

  return jsonResponse({ persisted: true, role, safety, note: persistedData });
}
