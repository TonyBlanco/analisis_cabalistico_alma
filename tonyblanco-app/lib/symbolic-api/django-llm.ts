/**
 * Proxy LLM calls to Django symbolic-interpreter endpoint (LLM bridge only).
 */

import { getDjangoApiBase } from './server';

export async function callDjangoSymbolicLLM(
  prompt: string,
  treeState: Record<string, unknown>,
  safetyLevel: string,
  authorization: string | null,
): Promise<string> {
  const response = await fetch(`${getDjangoApiBase()}/symbolic-interpreter/generate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify({
      prompt,
      treeState,
      safetyLevel,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || `LLM bridge failed (${response.status})`,
    );
  }

  const data = (await response.json()) as {
    success?: boolean;
    aiResponse?: string;
    error?: string;
  };

  if (!data.success || !data.aiResponse) {
    throw new Error(data.error || 'LLM bridge returned no content');
  }

  return data.aiResponse;
}