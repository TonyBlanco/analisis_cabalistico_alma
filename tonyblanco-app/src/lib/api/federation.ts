import { getAuthToken } from '../auth';
import { getApiBaseUrl } from '../../../lib/api-base';

export type HubCode = 'MSHE' | 'SCDF' | 'SCID5';

export interface HubFeedRecord {
  record_id: string;
  module_code: string;
  kind: string;
  created_at: string;
  visibility: string;
  algorithm_snapshot?: {
    engine?: string;
    version?: string;
  };
  summary_public: string;
  summary_pro: string;
  tags: string[];
  record_ref: string;
}

export interface HubFeedSnapshot {
  metadata: {
    feed_id: string;
    subject_patient_id: number;
    requested_by_therapist_id: number;
    hub_code: HubCode;
    scope: string[];
    date_range: {
      start: string | null;
      end: string | null;
    };
    generated_at: string;
    records_count: number;
  };
  records: HubFeedRecord[];
  audit_log_id: string;
}

export interface FederationApiError extends Error {
  status?: number;
}

const API_BASE_URL = getApiBaseUrl().replace(/\/api$/, '');

export async function getFederationHubFeed(args: {
  patientId: number;
  hub: HubCode;
  dateFrom?: string;
  dateTo?: string;
  scope?: string[];
}): Promise<HubFeedSnapshot> {
  const token = getAuthToken();

  if (!token) {
    const authError: FederationApiError = new Error('Sesión no válida. Inicia sesión para continuar.');
    authError.status = 401;
    throw authError;
  }

  const params = new URLSearchParams();
  params.set('patient_id', String(args.patientId));
  params.set('hub', args.hub);

  if (args.dateFrom) {
    params.set('date_from', args.dateFrom);
  }

  if (args.dateTo) {
    params.set('date_to', args.dateTo);
  }

  if (args.scope && args.scope.length > 0) {
    params.set('scope', args.scope.join(','));
  }

  const response = await fetch(`${API_BASE_URL}/federation/hub-feed/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Error al cargar el feed federado';
    try {
      const data = await response.json();
      if (data && typeof data.error === 'string') {
        message = data.error;
      }
    } catch (_) {
      // Ignore parse errors to preserve default message
    }

    const apiError: FederationApiError = new Error(message);
    apiError.status = response.status;
    throw apiError;
  }

  return response.json();
}
