import { analyzeTreeState } from '@holistica/symbolic/tree';
import type { AnalyzeRequestV1, AnalyzeResponseV1 } from '@holistica/symbolic/api';
import {
  errorResponse,
  jsonResponse,
  validateTreeStatePayload,
} from '@/lib/symbolic-api/server';

export async function POST(request: Request): Promise<Response> {
  let body: AnalyzeRequestV1;
  try {
    body = (await request.json()) as AnalyzeRequestV1;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const validation = validateTreeStatePayload(body.treeState);
  if (!validation.valid) {
    return errorResponse(validation.errors.join('; '), 400);
  }

  const analysis = analyzeTreeState(validation.state);
  const data: AnalyzeResponseV1 = {
    treeState: validation.state,
    analysis,
  };

  return jsonResponse(data);
}