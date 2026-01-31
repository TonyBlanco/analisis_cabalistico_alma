'use client';

import { useMemo, useState } from 'react';
import CabalaAplicadaHistoryList from './CabalaAplicadaHistoryList';
import { saveCabalaAplicadaMethodRecord } from '@/lib/cabala-aplicada-api';
import { generateCabalaAplicadaGraphicPDF } from './cabalaAplicadaPdf';
import { SymbolicInterpretationPanel } from '@/components/SymbolicInterpretation';
import { generateAISymbolicInterpretation } from '@/lib/api/symbolic-interpreter-api';
import type { SymbolicInterpretation } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type { CabalaAplicadaWorkspaceExportState } from './CabalAppliedVisualCore';
import { FileText, Clock, Layers, Download, Filter, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { swmShaApi } from '@/lib/api/swm-sha-api';
import { swmTarotApi } from '@/lib/api/swm/tarot/client';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

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

export type CabalaToolsTabId = 'history' | 'snapshot' | 'pdf' | 'interpretation' | 'integration';

// P3.1: PDF Export Options
interface PDFExportOptions {
  includeTree: boolean;
  includeInterpretation: boolean;
  includeHistory: boolean;
  includeSoulMap: boolean;
  includeCycles: boolean;
  format: 'summary' | 'detailed' | 'clinical';
}

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

  // P3.1: PDF Export Options State
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptions>({
    includeTree: true,
    includeInterpretation: true,
    includeHistory: false,
    includeSoulMap: false,
    includeCycles: false,
    format: 'summary',
  });

  // P3.2: History Filter State
  const [historyFilter, setHistoryFilter] = useState<'all' | 'snapshots' | 'pdfs' | 'methods'>('all');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // P3.3: SWM Integration State
  const [swmLoading, setSwmLoading] = useState<string | null>(null);
  const [swmError, setSwmError] = useState<string | null>(null);
  const [swmSuccess, setSwmSuccess] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<{
    sha: any[] | null;
    tarot: any[] | null;
    mcmi4: any[] | null;
    trans: any[] | null;
  }>({ sha: null, tarot: null, mcmi4: null, trans: null });

  const canSnapshot = useMemo(() => Boolean(patientId && (treeState || backendStructuralState)), [patientId, treeState, backendStructuralState]);
  const canInterpret = useMemo(() => Boolean(treeState), [treeState]);
  const canPdf = useMemo(() => Boolean(patientId && patientName), [patientId, patientName]);

  const tabs: Array<{ id: CabalaToolsTabId; label: string; icon?: React.ReactNode }> = [
    { id: 'history', label: 'Historial', icon: <Clock className="h-3 w-3" /> },
    { id: 'snapshot', label: 'Snapshot', icon: <Layers className="h-3 w-3" /> },
    { id: 'interpretation', label: 'Interpretación' },
    { id: 'pdf', label: 'PDF', icon: <FileText className="h-3 w-3" /> },
    { id: 'integration', label: 'SWM', icon: <Layers className="h-3 w-3" /> },
  ];

  const saveSnapshot = async () => {
    setError(null);
    setOk(null);

    if (!patientId) {
      setError('Selecciona un consultante.');
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
      setError('Consultante no disponible.');
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

  // P3.3: SWM Integration Functions
  const importSHA = async () => {
    if (!patientId) {
      setSwmError('Seleccione un consultante primero');
      return;
    }
    setSwmLoading('sha');
    setSwmError(null);
    setSwmSuccess(null);
    
    try {
      const workspaces = await swmShaApi.listWorkspaces();
      // Filter by subject_user matching patientId
      const patientWorkspaces = workspaces.filter(
        (w: any) => w.subject_user?.id === patientId
      );
      
      if (patientWorkspaces.length === 0) {
        setSwmError('No hay workspaces SHA para este consultante');
        setImportedData(prev => ({ ...prev, sha: [] }));
      } else {
        setImportedData(prev => ({ ...prev, sha: patientWorkspaces }));
        setSwmSuccess(`SHA: ${patientWorkspaces.length} workspace(s) encontrado(s)`);
      }
    } catch (e: any) {
      setSwmError(`SHA: ${e?.message || 'Error al importar'}`);
    } finally {
      setSwmLoading(null);
    }
  };

  const importTarot = async () => {
    if (!patientId) {
      setSwmError('Seleccione un consultante primero');
      return;
    }
    setSwmLoading('tarot');
    setSwmError(null);
    setSwmSuccess(null);
    
    try {
      const workspaces = await swmTarotApi.listWorkspaces({ subject_user_id: patientId });
      
      if (workspaces.length === 0) {
        setSwmError('No hay tiradas de Tarot para este consultante');
        setImportedData(prev => ({ ...prev, tarot: [] }));
      } else {
        setImportedData(prev => ({ ...prev, tarot: workspaces }));
        setSwmSuccess(`Tarot: ${workspaces.length} tirada(s) encontrada(s)`);
      }
    } catch (e: any) {
      setSwmError(`Tarot: ${e?.message || 'Error al importar'}`);
    } finally {
      setSwmLoading(null);
    }
  };

  const importMCMI4 = async () => {
    if (!patientId) {
      setSwmError('Seleccione un consultante primero');
      return;
    }
    setSwmLoading('mcmi4');
    setSwmError(null);
    setSwmSuccess(null);
    
    try {
      const token = getAuthToken();
      const apiBase = getApiBaseUrl();
      const response = await fetch(
        `${apiBase}/api/swm/mcmi4/list?subject_user_id=${patientId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const workspaces = data.workspaces || data.results || [];
      
      if (workspaces.length === 0) {
        setSwmError('No hay workspaces MCMI-4 para este consultante');
        setImportedData(prev => ({ ...prev, mcmi4: [] }));
      } else {
        setImportedData(prev => ({ ...prev, mcmi4: workspaces }));
        setSwmSuccess(`MCMI-4: ${workspaces.length} workspace(s) encontrado(s)`);
      }
    } catch (e: any) {
      setSwmError(`MCMI-4: ${e?.message || 'Error al importar'}`);
    } finally {
      setSwmLoading(null);
    }
  };

  const importTransgeneracional = async () => {
    if (!patientId) {
      setSwmError('Seleccione un consultante primero');
      return;
    }
    setSwmLoading('trans');
    setSwmError(null);
    setSwmSuccess(null);
    
    try {
      const token = getAuthToken();
      const apiBase = getApiBaseUrl();
      const response = await fetch(
        `${apiBase}/api/swm/transgenerational/sessions/?patient_id=${patientId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      // Transgenerational returns array directly or {results: [...]}
      const sessions = Array.isArray(data) ? data : (data.results || []);
      
      if (sessions.length === 0) {
        setSwmError('No hay sesiones transgeneracionales para este consultante');
        setImportedData(prev => ({ ...prev, trans: [] }));
      } else {
        setImportedData(prev => ({ ...prev, trans: sessions }));
        setSwmSuccess(`Transgeneracional: ${sessions.length} sesión(es) encontrada(s)`);
      }
    } catch (e: any) {
      setSwmError(`Transgeneracional: ${e?.message || 'Error al importar'}`);
    } finally {
      setSwmLoading(null);
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
        <div><span className="font-medium">Consultante:</span> {patientName ?? '—'}</div>
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
        {/* P3.2: Enhanced History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Registros del consultante activo</p>
              <button
                onClick={() => setHistoryRefreshKey(k => k + 1)}
                className="p-1 rounded hover:bg-gray-100"
                title="Actualizar historial"
              >
                <RefreshCw className="h-3 w-3 text-gray-500" />
              </button>
            </div>
            
            {/* Filter buttons */}
            <div className="flex gap-1">
              {(['all', 'snapshots', 'pdfs', 'methods'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-2 py-1 text-[10px] rounded ${
                    historyFilter === filter
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter === 'all' ? 'Todos' : 
                   filter === 'snapshots' ? 'Snapshots' : 
                   filter === 'pdfs' ? 'PDFs' : 'Métodos'}
                </button>
              ))}
            </div>
            
            <CabalaAplicadaHistoryList 
              key={historyRefreshKey}
              filterType={historyFilter}
            />
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

        {/* P3.1: Enhanced PDF Tab */}
        {activeTab === 'pdf' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Exporta un PDF gráfico con opciones avanzadas.
            </p>
            
            {/* PDF Options */}
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-[11px] font-medium text-gray-700">Incluir en el PDF:</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeTree}
                    onChange={(e) => setPdfOptions(p => ({ ...p, includeTree: e.target.checked }))}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                  Árbol de la Vida
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeInterpretation}
                    onChange={(e) => setPdfOptions(p => ({ ...p, includeInterpretation: e.target.checked }))}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                  Interpretación
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeSoulMap}
                    onChange={(e) => setPdfOptions(p => ({ ...p, includeSoulMap: e.target.checked }))}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                  Mapa del Alma
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeCycles}
                    onChange={(e) => setPdfOptions(p => ({ ...p, includeCycles: e.target.checked }))}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                  Ciclos Tikún
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeHistory}
                    onChange={(e) => setPdfOptions(p => ({ ...p, includeHistory: e.target.checked }))}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                  Historial reciente
                </label>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[11px] font-medium text-gray-700 mb-1">Formato:</p>
                <select
                  value={pdfOptions.format}
                  onChange={(e) => setPdfOptions(p => ({ ...p, format: e.target.value as PDFExportOptions['format'] }))}
                  className="w-full text-[10px] rounded border-gray-200 py-1"
                >
                  <option value="summary">Resumen (1 página)</option>
                  <option value="detailed">Detallado (múltiples páginas)</option>
                  <option value="clinical">Clínico (para expediente)</option>
                </select>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={!canPdf || busy}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              <Download className="h-3 w-3" />
              {busy ? 'Generando…' : 'Generar PDF'}
            </button>
          </div>
        )}

        {/* P3.3: SWM Integration Tab */}
        {activeTab === 'integration' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Integración con otros módulos SWM del consultante.
            </p>
            
            {/* Status Messages */}
            {swmError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-2 flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <p className="text-[10px] text-red-700">{swmError}</p>
              </div>
            )}
            {swmSuccess && (
              <div className="rounded-md bg-green-50 border border-green-200 p-2 flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <p className="text-[10px] text-green-700">{swmSuccess}</p>
              </div>
            )}
            
            <div className="space-y-2">
              {/* SHA Integration */}
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">SHA - Auditoría Sefirótica</p>
                    <p className="text-[10px] text-gray-500">Sincronizar datos de armonía</p>
                  </div>
                  <button
                    className="px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1"
                    onClick={() => void importSHA()}
                    disabled={swmLoading !== null}
                  >
                    {swmLoading === 'sha' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {swmLoading === 'sha' ? 'Cargando…' : 'Importar'}
                  </button>
                </div>
                {(importedData.sha?.length ?? 0) > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 mb-1">{importedData.sha!.length} workspace(s):</p>
                    <ul className="text-[10px] space-y-0.5">
                      {importedData.sha!.slice(0, 3).map((ws: any) => (
                        <li key={ws.id} className="text-indigo-600">
                          • {ws.workspace_definition?.name || 'SHA'} ({ws.status || 'N/A'})
                        </li>
                      ))}
                      {importedData.sha!.length > 3 && (
                        <li className="text-gray-400">... y {importedData.sha!.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Tarot Integration */}
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Tarot Evolutivo</p>
                    <p className="text-[10px] text-gray-500">Correlacionar tiradas con sefirot</p>
                  </div>
                  <button
                    className="px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1"
                    onClick={() => void importTarot()}
                    disabled={swmLoading !== null}
                  >
                    {swmLoading === 'tarot' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {swmLoading === 'tarot' ? 'Cargando…' : 'Importar'}
                  </button>
                </div>
                {(importedData.tarot?.length ?? 0) > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 mb-1">{importedData.tarot!.length} tirada(s):</p>
                    <ul className="text-[10px] space-y-0.5">
                      {importedData.tarot!.slice(0, 3).map((ws: any) => (
                        <li key={ws.id} className="text-indigo-600">
                          • {ws.spread_type || 'Tirada'} - {ws.created_at ? new Date(ws.created_at).toLocaleDateString() : 'Sin fecha'}
                        </li>
                      ))}
                      {importedData.tarot!.length > 3 && (
                        <li className="text-gray-400">... y {importedData.tarot!.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* MCMI-4 Integration */}
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">MCMI-4 Reflexión</p>
                    <p className="text-[10px] text-gray-500">Mapeo clínico a sefirot</p>
                  </div>
                  <button
                    className="px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1"
                    onClick={() => void importMCMI4()}
                    disabled={swmLoading !== null}
                  >
                    {swmLoading === 'mcmi4' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {swmLoading === 'mcmi4' ? 'Cargando…' : 'Importar'}
                  </button>
                </div>
                {(importedData.mcmi4?.length ?? 0) > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 mb-1">{importedData.mcmi4!.length} reflexión(es):</p>
                    <ul className="text-[10px] space-y-0.5">
                      {importedData.mcmi4!.slice(0, 3).map((ws: any) => (
                        <li key={ws.id} className="text-indigo-600">
                          • Reflexión {ws.id} - {ws.created_at ? new Date(ws.created_at).toLocaleDateString() : 'Sin fecha'}
                        </li>
                      ))}
                      {importedData.mcmi4!.length > 3 && (
                        <li className="text-gray-400">... y {importedData.mcmi4!.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Transgeneracional Integration */}
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Transgeneracional</p>
                    <p className="text-[10px] text-gray-500">Patrones ancestrales</p>
                  </div>
                  <button
                    className="px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1"
                    onClick={() => void importTransgeneracional()}
                    disabled={swmLoading !== null}
                  >
                    {swmLoading === 'trans' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {swmLoading === 'trans' ? 'Cargando…' : 'Importar'}
                  </button>
                </div>
                {(importedData.trans?.length ?? 0) > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 mb-1">{importedData.trans!.length} análisis:</p>
                    <ul className="text-[10px] space-y-0.5">
                      {importedData.trans!.slice(0, 3).map((ws: any) => (
                        <li key={ws.id} className="text-indigo-600">
                          • Análisis {ws.id} - {ws.created_at ? new Date(ws.created_at).toLocaleDateString() : 'Sin fecha'}
                        </li>
                      ))}
                      {importedData.trans!.length > 3 && (
                        <li className="text-gray-400">... y {importedData.trans!.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-2 text-[10px] text-gray-500">
              La integración permite correlacionar datos de múltiples SWM para una visión holística del consultante.
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-3 text-[11px] text-gray-500">
        Workspace cerrado: sin tools globales.
      </div>
    </aside>
  );
}
