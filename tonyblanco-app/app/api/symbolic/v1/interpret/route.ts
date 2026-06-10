import { analyzeTreeState, sweepInterpretationForRole } from '@holistica/symbolic/tree';
import {
  generateSymbolicInterpretation,
  createFallbackInterpretation,
} from '@holistica/symbolic/tree/symbolic-interpreter';
import type {
  InterpretRequestV1,
  InterpretResponseV1,
} from '@holistica/symbolic/api';
import { callDjangoSymbolicLLM } from '@/lib/symbolic-api/django-llm';
import { resolveSafetyRole } from '@/lib/symbolic-api/role';
import { recordSessionEvent } from '@/lib/symbolic-api/events';
import { isValidSystemId } from '@holistica/symbolic/api';
import {
  DEFAULT_CORRESPONDENCE_SYSTEM,
  errorResponse,
  jsonResponse,
  validateTreeStatePayload,
} from '@/lib/symbolic-api/server';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';

export async function POST(request: Request): Promise<Response> {
  let body: InterpretRequestV1;
  try {
    body = (await request.json()) as InterpretRequestV1;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Consent gate: SWM v3 explicit consent is required before any AI interpretation.
  if (!body.swmV3Consent) {
    return errorResponse(
      'SWM v3 consent required before symbolic AI interpretation.',
      403,
    );
  }

  const validation = validateTreeStatePayload(body.treeState);
  if (!validation.valid) {
    return errorResponse(validation.errors.join('; '), 400);
  }

  if (
    body.correspondenceSystem &&
    !isValidSystemId(body.correspondenceSystem)
  ) {
    return errorResponse('Invalid correspondenceSystem', 400);
  }

  const correspondenceSystem: SystemId =
    body.correspondenceSystem ?? DEFAULT_CORRESPONDENCE_SYSTEM;

  const analysis = analyzeTreeState(validation.state);
  const authorization = request.headers.get('authorization');

  // Modo Híbrido: the safety role is resolved server-side from the Django profile
  // (clinical_mode_enabled). It is NEVER taken from the request body.
  const role = await resolveSafetyRole(authorization);

  let interpretation;
  try {
    interpretation = await generateSymbolicInterpretation(
      {
        treeState: validation.state,
        safetyLevel: body.safetyLevel ?? 'educational',
        structuralAnalysis: analysis,
        correspondenceSystem,
        focusAreas: body.focusAreas,
      },
      async (prompt) =>
        callDjangoSymbolicLLM(
          prompt,
          validation.state as unknown as Record<string, unknown>,
          body.safetyLevel ?? 'educational',
          authorization,
        ),
      role,
    );
  } catch {
    interpretation = createFallbackInterpretation(validation.state);
  }

  // Defense-in-depth: re-run the role-aware safety sweep before the payload
  // leaves the server (anti-fraud rail always enforced; clinical lexicon only
  // for the verified clinical role).
  const swept = sweepInterpretationForRole(interpretation, role);

  const data: InterpretResponseV1 = {
    interpretation: swept.interpretation,
    analysis,
    correspondenceSystem,
    role,
  };

  // Observability (D6): best-effort, fire-and-forget. Therapist-only and
  // role-resolved server-side; never blocks or breaks this response.
  await recordSessionEvent(authorization, {
    eventType: 'interpretation_generated',
    workspace: 'generic',
    metadata: { correspondence_system: correspondenceSystem },
  });

  return jsonResponse(data);
}
