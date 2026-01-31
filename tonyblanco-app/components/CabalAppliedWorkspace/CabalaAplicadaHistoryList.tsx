'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import { getActivePatientId } from '@/lib/active-patient';

/**
 * Determines if a record is a Cábala Aplicada record (vs kabbalah_core).
 * P1.1: History Panel Labels - Purple badge for Cábala Aplicada records.
 */
function isCabalaAplicadaRecord(item: AnalysisRecordListItem): boolean {
  return (
    typeof item.module_code === 'string' &&
    item.module_code.startsWith('CABALA_APLICADA_')
  );
}

/**
 * Returns badge configuration for the record type.
 */
function getRecordBadge(item: AnalysisRecordListItem): { label: string; className: string } | null {
  if (isCabalaAplicadaRecord(item)) {
    return {
      label: 'Cábala Aplicada',
      className: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
  }
  // kabbalah_core or other modules can have different badges
  if (item.module_code?.startsWith('KABBALAH_CORE_')) {
    return {
      label: 'Kabbalah Core',
      className: 'bg-blue-100 text-blue-800 border border-blue-200',
    };
  }
  return null;
}

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

// P3.2: Filter type for history list
export type HistoryFilterType = 'all' | 'snapshots' | 'pdfs' | 'methods';

interface CabalaAplicadaHistoryListProps {
  filterType?: HistoryFilterType;
}

export default function CabalaAplicadaHistoryList({ filterType = 'all' }: CabalaAplicadaHistoryListProps) {
  const [patientId, setPatientId] = useState<number | null>(null);
  const [items, setItems] = useState<AnalysisRecordListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('No auth token');
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
        let filtered = results
          .filter((r) => r && typeof r.module_code === 'string' && r.module_code.startsWith('CABALA_APLICADA_'));
        
        // P3.2: Apply filter type
        if (filterType !== 'all') {
          filtered = filtered.filter((r) => {
            const cr = r.computed_result as any;
            const methodId = cr?.cabala_aplicada?.method_id || cr?.cabala_aplicada?.method || '';
            switch (filterType) {
              case 'snapshots':
                return methodId === 'snapshot' || r.module_code?.includes('SNAPSHOT');
              case 'pdfs':
                return methodId === 'pdf' || r.module_code?.includes('PDF');
              case 'methods':
                return !['snapshot', 'pdf'].includes(methodId) && !r.module_code?.includes('SNAPSHOT') && !r.module_code?.includes('PDF');
              default:
                return true;
            }
          });
        }
        
        setItems(filtered.slice(0, 20));
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'Error loading history');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedPatientId, filterType]);

  const handleDownload = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('No auth token');
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
        Selecciona un consultante para ver el historial.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando…
        </div>
      )}
      {error && <div className="text-xs text-red-600">{error}</div>}

      {!loading && items.length === 0 && (
        <div className="text-xs text-gray-500">Sin ejecuciones guardadas.</div>
      )}

      <div className="space-y-2">
        {items.map((it) => {
          const badge = getRecordBadge(it);
          return (
            <div key={it.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* P1.1: Badge púrpura para Cábala Aplicada */}
                  {badge && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  )}
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {extractMethodLabel(it)}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">{safeDateLabel(it.created_at)}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    void handleDownload(it.id).catch((e) => setError(e?.message || 'Failed to download'));
                  }}
                  title="Descargar JSON"
                >
                  <Download className="h-3 w-3" />
                  JSON
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
