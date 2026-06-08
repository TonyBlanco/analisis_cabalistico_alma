/**
 * AI generation — routes through backend /api/ai/generate/ instead of calling
 * Gemini directly from the browser (which would expose the API key).
 *
 * Drop-in replacement: same exported API as the old Gemini-direct version so
 * no component changes are needed.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function generateWithGemini(
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _customModels?: string[],
): Promise<string | null> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  // Remove credentials:'include' when using token-based auth to avoid CORS preflight issues

  const res = await fetch(`${API_BASE}/ai/generate/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, temperature: 0.8, max_tokens: 2048 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI error ${res.status}`);
  }

  const data = await res.json();
  return data.text ?? null;
}

export function parseGeminiJSON<T>(text: string): T | null {
  try {
    let clean = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) clean = match[0];
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
}

// Legacy exports kept so existing imports compile without changes
export const GEMINI_API_KEY = '';
export const GEMINI_MODELS = [] as const;
export const GEMINI_GENERATION_CONFIG = { temperature: 0.8, topK: 40, topP: 0.95, maxOutputTokens: 4096 } as const;
export function getGeminiClient() { return null; }
