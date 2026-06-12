import { API_BASE_URL, getAuthToken } from './api';

export type CabalaAplicadaMethodRecordPayload = {
  method_id: string;
  method_name?: string | null;
  input?: Record<string, unknown> | null;
  method_output?: Record<string, unknown> | null;
  tree_state?: Record<string, unknown> | null;
  backend_structural_state?: Record<string, unknown> | null;
  symbolic_interpretation?: Record<string, unknown> | null;
  formative_brief?: Record<string, unknown> | null;
};

export type CabalaAplicadaSavedRecord = {
  id: string;
};

export const CABALA_APLICADA_RECORD_SAVED_EVENT = 'cabalaAplicadaRecordSaved';

/** Notifica al historial (y otros listeners) que hay un registro nuevo para el paciente. */
export function dispatchCabalaAplicadaRecordSaved(patientId: number): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CABALA_APLICADA_RECORD_SAVED_EVENT, { detail: { patientId } }),
  );
}

export async function saveCabalaAplicadaMethodRecord(
  patientId: number,
  payload: CabalaAplicadaMethodRecordPayload
): Promise<CabalaAplicadaSavedRecord> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `${API_BASE_URL}/therapist/patients/${encodeURIComponent(String(patientId))}/cabala-aplicada/records/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    // Best-effort: avoid breaking UI flows; surface minimal error when caller awaits.
    let msg = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as any;
      msg = data?.error || data?.detail || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = (await res.json().catch(() => null)) as any;
  const record = data?.record;
  const id = record?.id;
  if (typeof id === 'string' && id) {
    return { id };
  }
  // Fallback: keep best-effort semantics while still returning a stable shape.
  return { id: '' };
}
