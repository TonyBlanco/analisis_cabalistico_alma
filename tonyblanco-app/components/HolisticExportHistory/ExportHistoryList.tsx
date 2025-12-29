'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Loader2, Pencil, Save } from 'lucide-react';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { openPrintableReport } from '@/lib/report-printing';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

type ExportListItem = {
  id: string;
  created_at: string | null;
  module_code: string;
  visibility: string | null;
  summary: string | null;
  markdown: string | null;
};

type TherapistAnnotations = {
  summary?: string | null;
  notes?: string | null;
  clinical_notes?: string | null;
  diagnosis_hypotheses?: string | null;
  recommendations_next_steps?: string | null;
  visible_to_patient?: boolean | null;
};

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

export default function ExportHistoryList({
  patientId,
  onAddNote,
}: {
  patientId?: string | number | null;
  onAddNote?: (text: string) => void;
}) {
  const resolvedPatientId = useMemo(() => {
    if (patientId === undefined) return getActivePatientId();
    if (patientId === null) return null;
    if (typeof patientId === 'string') {
      const parsed = parseInt(patientId, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return patientId;
  }, [patientId]);

  const [items, setItems] = useState<ExportListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [annotations, setAnnotations] = useState<TherapistAnnotations>({});

  useEffect(() => {
    if (!resolvedPatientId) {
      setItems([]);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No auth token found');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/therapist/patients/${resolvedPatientId}/holistic-exports/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || body.message || `Failed to load exports (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const results = Array.isArray(data?.results) ? (data.results as ExportListItem[]) : [];
        setItems(results);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load exports');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedPatientId]);

  const handlePrint = (markdown: string | null) => {
    const md = (markdown || '').trim();
    if (!md) return;

    const subtitle = getActivePatientName();
    openPrintableReport({
      title: 'Reporte holístico (Terapeuta)',
      subtitle,
      markdown: md,
    });
  };

  const fetchRecordDetail = async (id: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found');

    const res = await fetch(`${API_URL}/analysis-records/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || body.message || `Failed to load record (${res.status})`);
    }

    return res.json();
  };

  const handleEditClinical = async (id: string) => {
    try {
      if (editingId === id) {
        setEditingId(null);
        return;
      }
      const data = await fetchRecordDetail(id);
      const ta: TherapistAnnotations = (data?.therapist_annotations || {}) as TherapistAnnotations;
      setAnnotations({
        clinical_notes: ta?.clinical_notes ?? '',
        diagnosis_hypotheses: ta?.diagnosis_hypotheses ?? '',
        recommendations_next_steps: ta?.recommendations_next_steps ?? '',
      });
      setEditingId(id);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load clinical fields');
    }
  };

  const handleSaveClinical = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const res = await fetch(`${API_URL}/analysis-records/${id}/annotations/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          therapist_annotations: {
            clinical_notes: annotations.clinical_notes || '',
            diagnosis_hypotheses: annotations.diagnosis_hypotheses || '',
            recommendations_next_steps: annotations.recommendations_next_steps || '',
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || body.message || `Failed to save (${res.status})`);
      }

      const updated = await res.json();
      const updatedMarkdown = updated?.computed_result?.export?.markdown;
      if (typeof updatedMarkdown === 'string') {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, markdown: updatedMarkdown } : it)));
      }

      setError(null);
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to save clinical fields');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadJson = async (id: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No auth token found');
      return;
    }

    const res = await fetch(`${API_URL}/analysis-records/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || body.message || `Failed to download JSON (${res.status})`);
    }

    const data = await res.json();
    const exportObj = data?.computed_result?.export ?? data?.computed_result ?? data;

    const today = new Date().toISOString().slice(0, 10);
    const patientName = sanitizeFilename(getActivePatientName() || `patient_${resolvedPatientId}`);
    const base = `holistic_export_${patientName}_${today}_${id.slice(0, 8)}`;
    downloadFile(`${base}.json`, JSON.stringify(exportObj, null, 2), 'application/json;charset=utf-8');
  };

    if (!resolvedPatientId) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
        Selecciona un consultante para ver su historial de exports.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando exports…
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
          Aún no hay exports holísticos guardados.
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">HOLISTIC_EXPORT_V1</p>
              <p className="text-[11px] text-gray-500">
                {item.created_at ? new Date(item.created_at).toLocaleString('es-ES') : '—'}
              </p>
              {item.summary && <p className="mt-1 text-xs text-gray-700">{item.summary}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleEditClinical(item.id)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                title="Editar lectura/hipótesis y recomendaciones"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => handlePrint(item.markdown)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                title="Abrir reporte para imprimir / guardar como PDF"
              >
                <FileText className="h-3 w-3" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadJson(item.id).catch((e) => setError(e?.message || 'Failed to download'))}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                title="Descargar JSON (snapshot)"
              >
                <Download className="h-3 w-3" />
                JSON
              </button>
            </div>
          </div>

          {editingId === item.id && (
            <div className="mt-3 space-y-2 rounded-md border border-gray-200 bg-white p-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-700">Notas consultivas</p>
                <textarea
                  value={annotations.clinical_notes ?? ''}
                  onChange={(e) => setAnnotations((prev) => ({ ...prev, clinical_notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-xs focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Motivo de consulta, antecedentes, contexto relevante…"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-700">Lectura / hipótesis</p>
                <textarea
                  value={annotations.diagnosis_hypotheses ?? ''}
                  onChange={(e) => setAnnotations((prev) => ({ ...prev, diagnosis_hypotheses: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-xs focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Hipótesis principal, diferenciales, señales de riesgo, objetivo de sesión…"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-700">Recomendaciones / próximos pasos</p>
                <textarea
                  value={annotations.recommendations_next_steps ?? ''}
                  onChange={(e) => setAnnotations((prev) => ({ ...prev, recommendations_next_steps: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-xs focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Plan, tareas, seguimiento, derivación si aplica…"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveClinical(item.id)}
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Save className="h-3 w-3" />
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Esto se guarda en el historial holístico del consultante y se inyecta en el PDF del export.
              </p>
            </div>
          )}

          {onAddNote && item.markdown && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onAddNote(item.markdown || '')}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Copiar a notas
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
