'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import { getActivePatientId } from '@/lib/active-patient';

type AnalysisRecordListItem = {
  id: string;
  created_at: string | null;
  kind: string;
  module_code: string;
  computed_result?: unknown;
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeDateLabel(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function extractMethodLabel(item: AnalysisRecordListItem): string {
  const cr = item.computed_result as any;
  const ca = cr?.cabala_aplicada;
  const methodName = ca?.method_name;
  const methodId = ca?.method_id || ca?.method;

  if (typeof methodName === 'string' && methodName.trim()) return methodName;
  if (typeof methodId === 'string' && methodId.trim()) return methodId;

  if (typeof item.module_code === 'string' && item.module_code.startsWith('CABALA_APLICADA_')) {
    return item.module_code.replace('CABALA_APLICADA_', '').toLowerCase();
  }

  return 'Método';
}

export default function CabalaAplicadaHistoryList() {
  const [patientId, setPatientId] = useState<number | null>(null);
  const [items, setItems] = useState<AnalysisRecordListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const resolvedPatientId = useMemo(() => patientId, [patientId]);

  useEffect(() => {
    let mounted = true;

    const load = () => {
      const pid = getActivePatientId();
      if (!mounted) return;
      setPatientId(pid ?? null);
    };

    load();
    window.addEventListener('activePatientChanged', load);
    return () => {
      mounted = false;
      window.removeEventListener('activePatientChanged', load);
    };
  }, []);

  useEffect(() => {
    if (!resolvedPatientId) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Sesión no válida. Vuelve a iniciar sesión.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/analysis-records/?patient_id=${encodeURIComponent(String(resolvedPatientId))}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || body.message || `Failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const results: AnalysisRecordListItem[] = Array.isArray(data?.results) ? data.results : [];
        const filtered = results
          .filter((r) => r && typeof r.module_code === 'string' && r.module_code.startsWith('CABALA_APLICADA_'))
          .slice(0, 10);
        setItems(filtered);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'No se pudo cargar el historial.');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedPatientId, reloadToken]);

  const handleDownload = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('Sesión no válida. Vuelve a iniciar sesión.');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/analysis-records/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || body.message || `Failed (${res.status})`);
    }

    const data = await res.json();
    const today = new Date().toISOString().slice(0, 10);
    downloadJson(`cabala_aplicada_${today}_${id.slice(0, 8)}.json`, data);
  };

  if (!resolvedPatientId) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
        Selecciona un paciente para ver el historial.
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-labelledby="cabala-history-heading">
      <p id="cabala-history-heading" className="sr-only">
        Historial de ejecuciones de Cábala Aplicada
      </p>
      {loading && (
        <div
          className="flex items-center gap-2 text-xs text-gray-500"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando historial…
        </div>
      )}
      {error && (
        <div className="space-y-2" role="alert" aria-live="assertive">
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500"
          role="status"
        >
          Aún no hay ejecuciones guardadas para este consultante.
        </div>
      )}

      <ul className="space-y-2" role="list" aria-label="Registros recientes">
        {items.map((it) => (
          <li key={it.id} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {extractMethodLabel(it)}
                </div>
                <div className="mt-1 text-[11px] text-gray-500">{safeDateLabel(it.created_at)}</div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  void handleDownload(it.id).catch((e) => setError(e?.message || 'No se pudo descargar el registro.'));
                }}
                aria-label={`Descargar registro ${extractMethodLabel(it)} en JSON`}
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                JSON
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
