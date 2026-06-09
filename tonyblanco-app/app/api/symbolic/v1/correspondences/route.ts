import { buildCorrespondencesResponse } from '@holistica/symbolic/api';
import {
  errorResponse,
  jsonResponse,
  parseCorrespondenceSystem,
} from '@/lib/symbolic-api/server';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const systemId = parseCorrespondenceSystem(searchParams.get('systemId'));

  if (!systemId) {
    return errorResponse(
      'Invalid systemId. Use hermetic-golden-dawn or jewish-traditional.',
      400,
    );
  }

  return jsonResponse(buildCorrespondencesResponse(systemId));
}