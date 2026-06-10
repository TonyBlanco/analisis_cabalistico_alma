import { validateSafetyContentForRole } from '@holistica/symbolic/tree';
import { resolveSafetyRole } from '@/lib/symbolic-api/role';
import { errorResponse, jsonResponse } from '@/lib/symbolic-api/server';

/**
 * BFF role-aware gate for therapist exploration suggestions (Modo Híbrido — Step 8A).
 *
 * Suggestions are generated client-side from the symbolic session state, but the
 * safety role is the source of truth in Django and is resolved SERVER-SIDE here.
 * Each suggestion is re-validated against the role-aware policy (clinical lexicon
 * by role + always-on anti-fraud rail). Unsafe suggestions are dropped from
 * `safeSuggestions` and never surfaced. The role is NEVER taken from the body.
 */

interface SuggestionInput {
  id?: string;
  prompt?: string;
  provenance?: string;
}

interface SuggestionsRequestBody {
  suggestions?: SuggestionInput[];
  swmV3Consent?: boolean;
}

export async function POST(request: Request): Promise<Response> {
  let body: SuggestionsRequestBody;
  try {
    body = (await request.json()) as SuggestionsRequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Consent gate: assisted-interpretation consent is required before suggesting.
  if (!body.swmV3Consent) {
    return errorResponse(
      'SWM v3 consent required before generating suggestions.',
      403,
    );
  }

  if (!Array.isArray(body.suggestions) || body.suggestions.length === 0) {
    return errorResponse('suggestions[] is required', 400);
  }

  const authorization = request.headers.get('authorization');

  // Role resolved server-side from the Django profile. NEVER from the body.
  const role = await resolveSafetyRole(authorization);

  const evaluated = body.suggestions
    .map((s, i) => {
      const prompt = (s.prompt ?? '').trim();
      const safety = validateSafetyContentForRole(prompt, role);
      return {
        id: s.id ?? `sug-${i + 1}`,
        prompt,
        provenance: s.provenance ?? '',
        safety,
        safe: safety.passed && prompt.length > 0,
      };
    })
    .filter((s) => s.prompt.length > 0);

  const safeSuggestions = evaluated.filter((s) => s.safe);

  return jsonResponse({ role, suggestions: evaluated, safeSuggestions });
}
