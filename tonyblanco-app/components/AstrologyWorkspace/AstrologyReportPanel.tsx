'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Loader2,
  Share2,
  ChevronLeft,
  Save,
  AlertCircle,
} from 'lucide-react';
import {
  createAstrologyReport,
  getAstrologyReport,
  listAstrologyReports,
  patchAstrologyReport,
  type AstrologyReportDetail,
  type AstrologyReportSummary,
} from '@/lib/astrology-reports-api';

const LAYER_LABELS: Record<string, string> = {
  natal: 'Carta natal',
  transits: 'Tránsitos',
  progressions: 'Progresiones',
  return_solar: 'Retorno solar',
  solarArc: 'Arco solar',
  return_lunar: 'Retorno lunar',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function layerLabel(key: string) {
  return LAYER_LABELS[key] || key;
}

interface Props {
  patientId: number;
  hasChart: boolean;
  activeLayers: Set<string>;
}

export default function AstrologyReportPanel({ patientId, hasChart, activeLayers }: Props) {
  const [items, setItems] = useState<AstrologyReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AstrologyReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [includeInterpretations, setIncludeInterpretations] = useState(true);

  const layersForReport = useMemo(() => Array.from(activeLayers), [activeLayers]);

  const refreshList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAstrologyReports(patientId);
      setItems(data.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const openDetail = useCallback(async (reportId: string) => {
    setSelectedId(reportId);
    setDetailLoading(true);
    setError(null);
    try {
      const data = await getAstrologyReport(patientId, reportId);
      setDetail(data);
      setNotesDraft(data.therapist_notes || '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el informe');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [patientId]);

  const handleGenerate = async () => {
    if (!hasChart) return;
    setGenerating(true);
    setError(null);
    try {
      const created = await createAstrologyReport(patientId, {
        active_layers: layersForReport,
        include_interpretations: includeInterpretations,
      });
      await refreshList();
      setSelectedId(created.id);
      setDetail(created);
      setNotesDraft(created.therapist_notes || '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el informe');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedId) return;
    setSavingNotes(true);
    setError(null);
    try {
      const updated = await patchAstrologyReport(patientId, selectedId, {
        therapist_notes: notesDraft,
      });
      setDetail(updated);
      await refreshList();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar las notas');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleShareToggle = async (share: boolean) => {
    if (!selectedId) return;
    setSharing(true);
    setError(null);
    try {
      const updated = await patchAstrologyReport(patientId, selectedId, {
        is_shared_with_patient: share,
      });
      setDetail(updated);
      await refreshList();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el compartido');
    } finally {
      setSharing(false);
    }
  };

  const reportPayload = detail?.report;

  if (selectedId && (detail || detailLoading)) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          onClick={() => {
            setSelectedId(null);
            setDetail(null);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al historial
        </button>

        {detailLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando informe…
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-gray-900">{detail.title}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Generado {formatDate(detail.created_at)}
                {detail.chart_params?.zodiac_type ? (
                  <> · {String(detail.chart_params.zodiac_type)} · casas {String(detail.chart_params.house_system || 'P')}</>
                ) : null}
              </p>
              {detail.active_layers?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {detail.active_layers.map((layer) => (
                    <span
                      key={layer}
                      className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800"
                    >
                      {layerLabel(layer)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {reportPayload?.disclaimer ? (
              <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {reportPayload.disclaimer}
              </p>
            ) : null}

            {reportPayload?.interpretations && reportPayload.interpretations.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Interpretaciones incluidas</h4>
                {reportPayload.interpretations.map((interp) => (
                  <div key={interp.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-700">
                      {interp.interpretation_type_display || interp.interpretation_type}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {interp.interpretation_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin interpretaciones AI en este snapshot.</p>
            )}

            {reportPayload?.tables?.planets && reportPayload.tables.planets.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-2 py-2">Planeta</th>
                      <th className="px-2 py-2">Signo</th>
                      <th className="px-2 py-2">Grados</th>
                      <th className="px-2 py-2">Casa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportPayload.tables.planets as Array<Record<string, unknown>>).slice(0, 12).map((p, idx) => (
                      <tr key={String(p.nombre || p.name || idx)} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 capitalize">{String(p.nombre || p.name || '—')}</td>
                        <td className="px-2 py-1.5">{String(p.signo || p.sign || '—')}</td>
                        <td className="px-2 py-1.5">
                          {p.grados != null ? `${Number(p.grados).toFixed(1)}°` : '—'}
                        </td>
                        <td className="px-2 py-1.5">{p.casa != null ? String(p.casa) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="rounded-lg border border-gray-200 p-3">
              <label className="block text-sm font-medium text-gray-900">Notas del terapeuta</label>
              <textarea
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={4}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Observaciones de sesión, acuerdos, seguimiento…"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar notas
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                  onClick={() => handleShareToggle(!detail.is_shared_with_patient)}
                  disabled={sharing}
                >
                  {sharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  {detail.is_shared_with_patient ? 'Dejar de compartir' : 'Compartir con consultante'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Informe de sesión</h3>
            <p className="mt-1 text-sm text-gray-600">
              Guarda un snapshot de la carta, capas activas e interpretaciones AI para revisión posterior.
            </p>
          </div>
          <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
        </div>

        {!hasChart ? (
          <div className="mt-3 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            Calcula primero la carta natal para poder generar un informe.
          </div>
        ) : (
          <>
            <div className="mt-3 text-xs text-gray-600">
              Capas que se incluirán:{' '}
              {layersForReport.length
                ? layersForReport.map(layerLabel).join(', ')
                : 'Carta natal'}
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeInterpretations}
                onChange={(e) => setIncludeInterpretations(e.target.checked)}
              />
              Incluir interpretaciones AI más recientes
            </label>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generar informe
            </button>
          </>
        )}
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Historial</h4>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando…
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay informes guardados.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50"
                  onClick={() => openDetail(item.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    {item.is_shared_with_patient ? (
                      <span className="text-[10px] uppercase tracking-wide text-green-700">Compartido</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(item.created_at)}
                    {item.interpretation_count > 0
                      ? ` · ${item.interpretation_count} interpretación(es)`
                      : ''}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}