'use client';

import { useMemo, useState } from 'react';
import CabalaAplicadaHistoryList from './CabalaAplicadaHistoryList';
import { saveCabalaAplicadaMethodRecord } from '@/lib/cabala-aplicada-api';
import { generateCabalaAplicadaGraphicPDF } from './cabalaAplicadaPdf';
import { SymbolicInterpretationPanel } from '@/components/SymbolicInterpretation';
import { generateAISymbolicInterpretation } from '@/lib/api/symbolic-interpreter-api';
import type { SymbolicInterpretation } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type { CabalaAplicadaWorkspaceExportState } from './CabalAppliedVisualCore';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} (timeout ${ms}ms)`));
    }, ms);
    promise
      .then((v) => {
        window.clearTimeout(timeoutId);
        resolve(v);
      })
      .catch((e) => {
        window.clearTimeout(timeoutId);
        reject(e);
      });
  });
}

export type CabalaToolsTabId = 'history' | 'snapshot' | 'pdf' | 'interpretation';

export default function CabalAppliedToolsPanel({
  activeTab,
  onChangeTab,
  workspaceState,
  lastSnapshotRecordId,
  onSnapshotSaved,
}: {
  activeTab: CabalaToolsTabId;
  onChangeTab: (tab: CabalaToolsTabId) => void;
  workspaceState: CabalaAplicadaWorkspaceExportState;
  lastSnapshotRecordId: string | null;
  onSnapshotSaved: (id: string) => void;
}) {
  const { patientId, patientName, selectedMethodId, treeState, backendStructuralState } = workspaceState;
  const { patientBirthDate, pdfSummary } = workspaceState;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [interpretation, setInterpretation] = useState<SymbolicInterpretation | null>(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);

  const canSnapshot = useMemo(() => Boolean(patientId && (treeState || backendStructuralState)), [patientId, treeState, backendStructuralState]);
  const canInterpret = useMemo(() => Boolean(treeState), [treeState]);
  const canPdf = useMemo(() => Boolean(patientId && patientName), [patientId, patientName]);

  const tabs: Array<{ id: CabalaToolsTabId; label: string }> = [
    { id: 'history', label: 'Historial' },
    { id: 'snapshot', label: 'Snapshot' },
    { id: 'interpretation', label: 'Interpretación' },
    { id: 'pdf', label: 'PDF' },
  ];

  const saveSnapshot = async () => {
    setError(null);
    setOk(null);

    if (!patientId) {
      setError('Selecciona un paciente.');
      return;
    }

    if (!treeState && !backendStructuralState) {
      setError('No hay estado estructural disponible.');
      return;
    }

    setBusy(true);
    try {
      const res = await saveCabalaAplicadaMethodRecord(patientId, {
        method_id: 'snapshot',
        method_name: 'Snapshot',
        input: {
          source: 'cabala_aplicada_internal_panel',
          selected_method_id: selectedMethodId,
          snapshot_reason: 'manual',
        },
        method_output: null,
        tree_state: (treeState as unknown as Record<string, unknown>) ?? null,
        backend_structural_state: backendStructuralState ?? null,
        symbolic_interpretation: null,
      });

      if (res?.id) {
        onSnapshotSaved(res.id);
      }
      setOk('Snapshot guardado.');
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el snapshot.');
    } finally {
      setBusy(false);
    }
  };

  const requestInterpretation = async () => {
    setError(null);
    setOk(null);

    if (!treeState) return;
    setInterpretationLoading(true);
    try {
      const result = await generateAISymbolicInterpretation({
        treeState,
        safetyLevel: 'educational',
        focusAreas: ['flows', 'sefirot-roles'],
      });
      setInterpretation(result);
      setOk('Interpretación generada (educativa).');
    } catch (e: any) {
      setError(e?.message || 'No se pudo generar interpretación.');
    } finally {
      setInterpretationLoading(false);
    }
  };

  const exportPdf = async () => {
    setError(null);
    setOk(null);

    if (!patientId || !patientName) {
      setError('Paciente no disponible.');
      return;
    }

    setBusy(true);
    try {
      const interpretationText = (() => {
        const raw = (interpretation as any)?.summary || (interpretation as any)?.text;
        if (typeof raw === 'string' && raw.trim()) return raw;
        return null;
      })();

      const { filename, base64 } = await generateCabalaAplicadaGraphicPDF({
        patientName,
        patientBirthDate,
        selectedMethodId,
        interpretationText,
        pdfSummary,
      });

      // Best-effort persistence in AnalysisRecord (no model changes): store PDF base64 inside computed_result.
      try {
        await withTimeout(
          saveCabalaAplicadaMethodRecord(patientId, {
            method_id: 'pdf',
            method_name: 'PDF gráfico',
            input: {
              source: 'cabala_aplicada_internal_panel',
              selected_method_id: selectedMethodId,
              snapshot_record_id: lastSnapshotRecordId,
            },
            method_output: {
              deliverable: {
                type: 'pdf',
                mime: 'application/pdf',
                filename,
                base64,
              },
            },
            tree_state: (treeState as unknown as Record<string, unknown>) ?? null,
            backend_structural_state: backendStructuralState ?? null,
            symbolic_interpretation: (interpretation as unknown as Record<string, unknown>) ?? null,
          }),
          20_000,
          'Guardado en historial'
        );

        setOk('PDF generado y guardado en historial (best-effort).');
      } catch (persistErr: any) {
        setOk('PDF generado. Guardado en historial pendiente (best-effort).');
        setError(persistErr?.message || 'No se pudo confirmar guardado en historial.');
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo generar PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="w-96 border-l border-gray-200 bg-white flex flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Panel interno</p>
        <h3 className="text-sm font-semibold text-gray-900">Cábala Aplicada</h3>
      </div>

      <div className="px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTab(t.id)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-gray-300 bg-gray-100 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-2 text-[11px] text-gray-600">
        <div><span className="font-medium">Paciente:</span> {patientName ?? '—'}</div>
        <div><span className="font-medium">Método:</span> {selectedMethodId ?? '—'}</div>
        <div><span className="font-medium">Snapshot asociado:</span> {lastSnapshotRecordId ? lastSnapshotRecordId.slice(0, 8) : '—'}</div>
      </div>

      {(error || ok) && (
        <div className="px-4 pb-2">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {ok && <div className="text-xs text-emerald-700">{ok}</div>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'history' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Registros del paciente activo (últimos 10).</p>
            <CabalaAplicadaHistoryList />
          </div>
        )}

        {activeTab === 'snapshot' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Guarda el estado estructural actual como artefacto longitudinal.
            </p>
            <button
              type="button"
              onClick={() => void saveSnapshot()}
              disabled={!canSnapshot || busy}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {busy ? 'Guardando…' : 'Guardar snapshot'}
            </button>
          </div>
        )}

        {activeTab === 'interpretation' && (
          <div className="space-y-3">
            {!canInterpret ? (
              <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                Ejecuta un método para habilitar la interpretación educativa.
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void requestInterpretation()}
                  disabled={interpretationLoading}
                  className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {interpretationLoading ? 'Generando…' : 'Generar interpretación (educativa)'}
                </button>
                <SymbolicInterpretationPanel
                  interpretation={interpretation}
                  isLoading={interpretationLoading}
                  onRequestInterpretation={requestInterpretation}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Exporta un PDF gráfico desde el render visible del Árbol y gráficos.
            </p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-600">
              Recomendado: guardar snapshot y (opcional) generar interpretación antes de exportar.
            </div>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={!canPdf || busy}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {busy ? 'Generando…' : 'Generar PDF gráfico'}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-3 text-[11px] text-gray-500">
        Workspace cerrado: sin tools globales.
      </div>
    </aside>
  );
}
