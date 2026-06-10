import { validateSafetyContentForRole } from '@holistica/symbolic/tree';
import { resolveSafetyRole } from '@/lib/symbolic-api/role';
import { errorResponse, jsonResponse } from '@/lib/symbolic-api/server';

/**
 * BFF role-aware gate for interactive consultant exercises (Modo Híbrido — Step 8B).
 *
 * Exercises are generated client-side from the symbolic session state, but they
 * are surfaced to the consultant only under explicit consent and the therapist's
 * supervision. The safety role is resolved SERVER-SIDE from Django and each
 * exercise is re-validated (clinical lexicon by role + always-on anti-fraud rail).
 * Unsafe exercises are dropped. The role is NEVER taken from the request body.
 */

interface ExerciseInput {
  id?: string;
  title?: string;
  description?: string;
  kind?: string;
  provenance?: string;
}

interface ExercisesRequestBody {
  exercises?: ExerciseInput[];
  swmV3Consent?: boolean;
}

export async function POST(request: Request): Promise<Response> {
  let body: ExercisesRequestBody;
  try {
    body = (await request.json()) as ExercisesRequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Consent gate: consultant-exercises consent is required before generating.
  if (!body.swmV3Consent) {
    return errorResponse(
      'SWM v3 consent (consultant exercises) required before generating exercises.',
      403,
    );
  }

  if (!Array.isArray(body.exercises) || body.exercises.length === 0) {
    return errorResponse('exercises[] is required', 400);
  }

  const authorization = request.headers.get('authorization');

  // Role resolved server-side from the Django profile. NEVER from the body.
  const role = await resolveSafetyRole(authorization);

  const evaluated = body.exercises
    .map((e, i) => {
      const title = (e.title ?? '').trim();
      const description = (e.description ?? '').trim();
      const safety = validateSafetyContentForRole(`${title}\n${description}`, role);
      return {
        id: e.id ?? `ex-${i + 1}`,
        title,
        description,
        kind: e.kind ?? 'reflection',
        provenance: e.provenance ?? '',
        safety,
        safe: safety.passed && title.length > 0,
      };
    })
    .filter((e) => e.title.length > 0);

  const safeExercises = evaluated.filter((e) => e.safe);

  return jsonResponse({ role, exercises: evaluated, safeExercises });
}
