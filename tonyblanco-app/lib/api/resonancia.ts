import { API_BASE_URL, getAuthToken } from '../api';

export type ResonanciaObservationType = 'resonancia' | 'eje' | 'repeticion' | 'nota';
export type ResonanciaObservationSource = 'observacion_directa' | 'registro_manual';
export type ResonanciaObservationContext = 'familiar' | 'relacional' | 'sistemico';
export type ResonanciaObservationState = 'activo' | 'latente';

export interface ResonanciaObservation {
  id: string;
  subject: number | string;
  author: number | string;
  type: ResonanciaObservationType;
  source: ResonanciaObservationSource;
  context: ResonanciaObservationContext;
  state: ResonanciaObservationState;
  anchors: string[];
  tags: string[];
  statement: string;
  created_at: string;
  updated_at: string;
}

export interface ResonanciaRelation {
  id: string;
  subject: number | string;
  author: number | string;
  created_at: string;
  updated_at: string;
  context: ResonanciaObservationContext;
  from_ref: string;
  to_label: string;
  position: number;
  note: string;
  tags: string[];
}

function buildHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function getReadableApiError(response: Response): Promise<string> {
  const statusLabel = `Error ${response.status}`;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as any;
      const message =
        data?.message ||
        data?.detail ||
        data?.error ||
        (typeof data === 'string' ? data : null) ||
        (data ? JSON.stringify(data) : null);
      return message ? `${statusLabel}: ${message}` : statusLabel;
    } catch {
      return statusLabel;
    }
  }

  // Django debug pages and other HTML/text responses should not be rendered in UI.
  if (contentType.includes('text/html')) {
    return `${statusLabel}: Error del servidor (respuesta HTML). Verifica que el backend esté corriendo y que las migraciones estén aplicadas.`;
  }

  try {
    const text = (await response.text()).trim();
    if (!text) return statusLabel;
    const preview = text.length > 280 ? `${text.slice(0, 280)}…` : text;
    return `${statusLabel}: ${preview}`;
  } catch {
    return statusLabel;
  }
}

export async function listResonanciaObservations(params: {
  subjectId: number | string | null | undefined;
  type?: ResonanciaObservationType;
  context?: ResonanciaObservationContext;
  state?: ResonanciaObservationState;
}): Promise<ResonanciaObservation[]> {
  if (params.subjectId == null || params.subjectId === '') return [];

  const search = new URLSearchParams({ subject: String(params.subjectId) });
  if (params.type) search.set('type', params.type);
  if (params.context) search.set('context', params.context);
  if (params.state) search.set('state', params.state);

  const response = await fetch(`${API_BASE_URL}/resonancia/observations/?${search.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 400) return [];
    throw new Error(await getReadableApiError(response));
  }

  return response.json();
}

export async function createResonanciaObservation(params: {
  subjectId: number | string;
  type: ResonanciaObservationType;
  source?: ResonanciaObservationSource;
  context: ResonanciaObservationContext;
  state: ResonanciaObservationState;
  anchors: string[];
  tags: string[];
  statement: string;
}): Promise<ResonanciaObservation> {
  const search = new URLSearchParams({ subject: String(params.subjectId) });
  const response = await fetch(`${API_BASE_URL}/resonancia/observations/?${search.toString()}`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      type: params.type,
      source: params.source ?? 'registro_manual',
      context: params.context,
      state: params.state,
      anchors: params.anchors,
      tags: params.tags,
      statement: params.statement,
    }),
  });

  if (!response.ok) {
    throw new Error(await getReadableApiError(response));
  }

  return response.json();
}

export async function listResonanciaRelations(params: {
  subjectId: number | string | null | undefined;
  context?: ResonanciaObservationContext;
}): Promise<ResonanciaRelation[]> {
  if (params.subjectId == null || params.subjectId === '') return [];

  const search = new URLSearchParams({ subject: String(params.subjectId) });
  if (params.context) search.set('context', params.context);

  const response = await fetch(`${API_BASE_URL}/resonancia/relations/?${search.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 400) return [];
    throw new Error(await getReadableApiError(response));
  }

  return response.json();
}

export async function createResonanciaRelation(params: {
  subjectId: number | string;
  context: ResonanciaObservationContext;
  toLabel: string;
  position: number;
  note?: string;
  tags: string[];
}): Promise<ResonanciaRelation> {
  const search = new URLSearchParams({ subject: String(params.subjectId) });
  const response = await fetch(`${API_BASE_URL}/resonancia/relations/?${search.toString()}`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      context: params.context,
      to_label: params.toLabel,
      position: params.position,
      note: params.note ?? '',
      tags: params.tags,
    }),
  });

  if (!response.ok) {
    throw new Error(await getReadableApiError(response));
  }

  return response.json();
}
