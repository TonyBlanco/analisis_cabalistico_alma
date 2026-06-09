import { analyzeTreeState } from '@holistica/symbolic/tree';
import {
  generateSymbolicInterpretation,
  createFallbackInterpretation,
} from '@holistica/symbolic/tree/symbolic-interpreter';
import type {
  InterpretRequestV1,
  InterpretResponseV1,
} from '@holistica/symbolic/api';
import { callDjangoSymbolicLLM } from '@/lib/symbolic-api/django-llm';
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
    );
  } catch {
    interpretation = createFallbackInterpretation(validation.state);
  }

  const data: InterpretResponseV1 = {
    interpretation,
    analysis,
    correspondenceSystem,
  };

  return jsonResponse(data);
}