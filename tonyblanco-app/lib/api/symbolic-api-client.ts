/**
 * Client for Next.js BFF /api/symbolic/v1 (motor simbólico E2E).
 */

import type {
  AnalyzeResponseV1,
  CorrespondencesResponseV1,
  InterpretResponseV1,
} from '@holistica/symbolic/api';
import type { SymbolicApiEnvelope } from '@holistica/symbolic/api';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type {
  SymbolicInterpretationRequest,
  SymbolicSafetyLevel,
} from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type { TreeStructuralState } from '@holistica/symbolic/tree';
import { getAuthHeaders } from '@/lib/api';

async function parseEnvelope<T>(response: Response): Promise<T> {
  const json = (await response.json()) as SymbolicApiEnvelope<T> | { error?: string };
  if (!response.ok) {
    throw new Error((json as { error?: string }).error || `Request failed (${response.status})`);
  }
  return (json as SymbolicApiEnvelope<T>).data;
}

export async function analyzeTreeViaApi(
  treeState: TreeStructuralState,
): Promise<AnalyzeResponseV1> {
  const response = await fetch('/api/symbolic/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ treeState }),
  });
  return parseEnvelope<AnalyzeResponseV1>(response);
}

export async function fetchCorrespondencesViaApi(
  systemId: SystemId,
): Promise<CorrespondencesResponseV1> {
  const response = await fetch(
    `/api/symbolic/v1/correspondences?systemId=${encodeURIComponent(systemId)}`,
    { headers: getAuthHeaders() },
  );
  return parseEnvelope<CorrespondencesResponseV1>(response);
}

export async function interpretViaApi(
  request: SymbolicInterpretationRequest & {
    swmV3Consent: boolean;
  },
): Promise<InterpretResponseV1> {
  const response = await fetch('/api/symbolic/v1/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      treeState: request.treeState,
      safetyLevel: request.safetyLevel,
      correspondenceSystem: request.correspondenceSystem,
      swmV3Consent: request.swmV3Consent,
      focusAreas: request.focusAreas,
    }),
  });
  return parseEnvelope<InterpretResponseV1>(response);
}

export type { SystemId, SymbolicSafetyLevel };