/**
 * Server-side helpers for /api/symbolic/v1 BFF routes.
 */

import {
  SYMBOLIC_API_VERSION,
  type SymbolicApiEnvelope,
} from '@holistica/symbolic/api';
import { isValidSystemId } from '@holistica/symbolic/api';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import {
  validateTreeStateForInterpretation,
} from '@holistica/symbolic/tree/symbolic-interpreter';
import { SYMBOLIC_INTERPRETER_META } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type { TreeStructuralState } from '@holistica/symbolic/tree';

export const DEFAULT_CORRESPONDENCE_SYSTEM: SystemId = 'hermetic-golden-dawn';

export function envelope<T>(data: T): SymbolicApiEnvelope<T> {
  return {
    version: SYMBOLIC_API_VERSION,
    timestamp: new Date().toISOString(),
    data,
  };
}

export function jsonResponse<T>(data: T, status = 200): Response {
  return Response.json(envelope(data), { status });
}

export function errorResponse(message: string, status: number): Response {
  return Response.json(
    { version: SYMBOLIC_API_VERSION, error: message },
    { status },
  );
}

export function parseCorrespondenceSystem(
  value: string | null | undefined,
): SystemId | null {
  if (!value) return DEFAULT_CORRESPONDENCE_SYSTEM;
  return isValidSystemId(value) ? value : null;
}

export function validateTreeStatePayload(
  treeState: unknown,
): { valid: true; state: TreeStructuralState } | { valid: false; errors: string[] } {
  if (!treeState || typeof treeState !== 'object') {
    return { valid: false, errors: ['treeState must be an object'] };
  }
  const result = validateTreeStateForInterpretation(treeState as TreeStructuralState);
  if (!result.valid) {
    return { valid: false, errors: result.errors };
  }
  return { valid: true, state: treeState as TreeStructuralState };
}

export function containsProhibitedTerms(text: string): boolean {
  const lower = text.toLowerCase();
  return SYMBOLIC_INTERPRETER_META.prohibitedTerms.some((term) =>
    lower.includes(term.toLowerCase()),
  );
}

export function getDjangoApiBase(): string {
  const raw =
    process.env.SYMBOLIC_DJANGO_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.studios33.app/api';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}