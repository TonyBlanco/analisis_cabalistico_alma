import { getApiBaseUrl } from './api-base';
import { getAuthToken } from './auth';

const API_BASE_URL = getApiBaseUrl();

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body.error || body.detail || body.message || `Error ${res.status}`;
}

export type AstrologyReportSummary = {
  id: string;
  title: string;
  status: 'draft' | 'final';
  visibility: string;
  is_shared_with_patient: boolean;
  shared_at: string | null;
  created_at: string | null;
  active_layers: string[];
  chart_params: Record<string, unknown>;
  interpretation_count: number;
};

export type AstrologyReportDetail = AstrologyReportSummary & {
  therapist_notes: string;
  report: AstrologyReportPayload;
  interpretation_ids: number[];
  natal_chart_id: number | null;
};

export type AstrologyReportPayload = {
  version?: string;
  generated_at?: string;
  disclaimer?: string;
  title?: string;
  patient?: { id: number; name: string };
  therapist?: { id: number; username: string };
  chart_params?: Record<string, unknown>;
  active_layers?: string[];
  active_layer_labels?: string[];
  tables?: {
    planets?: unknown[];
    houses?: unknown[];
    aspects?: unknown[];
  };
  interpretations?: Array<{
    id: number;
    interpretation_type: string;
    interpretation_type_display?: string;
    interpretation_text: string;
    word_count?: number;
    created_at?: string;
    is_shared_with_patient?: boolean;
  }>;
  therapist_notes?: string;
};

export type CreateAstrologyReportInput = {
  active_layers?: string[];
  include_interpretations?: boolean;
  therapist_notes?: string;
  title?: string;
  status?: 'draft' | 'final';
};

export async function listAstrologyReports(
  patientId: number,
  limit = 20,
): Promise<{ results: AstrologyReportSummary[]; count: number }> {
  const res = await fetch(
    `${API_BASE_URL}/therapist/patients/${patientId}/astrology-reports/?limit=${limit}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    results: Array.isArray(data.results) ? data.results : [],
    count: typeof data.count === 'number' ? data.count : 0,
  };
}

export async function createAstrologyReport(
  patientId: number,
  input: CreateAstrologyReportInput,
): Promise<AstrologyReportDetail> {
  const res = await fetch(
    `${API_BASE_URL}/therapist/patients/${patientId}/astrology-reports/`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAstrologyReport(
  patientId: number,
  reportId: string,
): Promise<AstrologyReportDetail> {
  const res = await fetch(
    `${API_BASE_URL}/therapist/patients/${patientId}/astrology-reports/${reportId}/`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data;
}

export type PatchAstrologyReportInput = {
  therapist_notes?: string;
  title?: string;
  is_shared_with_patient?: boolean;
};

export async function patchAstrologyReport(
  patientId: number,
  reportId: string,
  input: PatchAstrologyReportInput,
): Promise<AstrologyReportDetail> {
  const res = await fetch(
    `${API_BASE_URL}/therapist/patients/${patientId}/astrology-reports/${reportId}/`,
    {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data;
}