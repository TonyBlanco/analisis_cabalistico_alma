'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Hash, Sparkles } from 'lucide-react';
import type { CabalSectionId } from './types';
import { getActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, type PatientProfileSummary } from '@/lib/patient-api';
import { useTreeStructuralState } from '@/lib/tree-structural-state';
import TreeOfLifeSVG from '@/components/Tree/TreeOfLifeSVG';
import { TreeWithFlows } from '@/components/Tree';
import TreeVisualPlaceholder from './TreeVisualPlaceholder';
import { ejecutarMetodoPitagorico } from '../../../src/symbolic/methods/pitagoras';
import type { PitagorasSymbolicState, PitagorasNumberMeaning } from '../../../src/symbolic/methods/pitagoras/pitagoras.types';
import { adaptPitagorasToTree, type TreeStructuralState } from '../../../src/symbolic/tree';

// Additional symbolic methods (FASE 1)
import { ejecutarMetodoGematriaStandard, adaptGematriaStandardToTree } from '../../../src/symbolic/methods/gematria-standard';
import { ejecutarMetodoGematriaKatan, adaptGematriaKatanToTree } from '../../../src/symbolic/methods/gematria-katan';
import { ejecutarMetodoMisparGadol, adaptMisparGadolToTree } from '../../../src/symbolic/methods/mispar-gadol';
import { ejecutarMetodoMisparSiduri, adaptMisparSiduriToTree } from '../../../src/symbolic/methods/mispar-siduri';
import { ejecutarMetodoMilui, adaptMiluiToTree } from '../../../src/symbolic/methods/milui';
import { ejecutarMetodoAtbash, adaptAtbashToTree } from '../../../src/symbolic/methods/atbash';
import { ejecutarMetodoAlbam, adaptAlbamToTree } from '../../../src/symbolic/methods/albam';
import { ejecutarMetodoAvgad, adaptAvgadToTree } from '../../../src/symbolic/methods/avgad';
import { ejecutarMetodoTemurah, adaptTemurahToTree } from '../../../src/symbolic/methods/temurah';
import { ejecutarMetodoNotarikon, adaptNotarikonToTree } from '../../../src/symbolic/methods/notarikon';

// Symbolic Interpretation AI
import { saveCabalaAplicadaMethodRecord } from '@/lib/cabala-aplicada-api';

export type CabalaAplicadaWorkspaceExportState = {
  patientId: number | null;
  patientName: string | null;
  patientBirthDate: string | null;
  selectedMethodId: string | null;
  treeState: TreeStructuralState | null;
  backendStructuralState: Record<string, unknown> | null;
  pdfSummary: {
    sefirotActivas: Array<{ id: string; indice?: number | null; peso?: number | null }>;
    senderosActivos: Array<{ from: string; to: string; peso?: number | null }>;
    repeticiones: Array<{ id: string; tipo?: string | null; veces?: number | null }>;
  };
};

// ============================================================================
// PITAGORAS PROFESSIONAL REPORT COMPONENTS (UI ONLY)
// ============================================================================

/** Card for fundamental numbers */
function PitagorasNumberCard({
  label,
  value,
  meaning,
  colorClass,
}: {
  label: string;
  value: number;
  meaning?: PitagorasNumberMeaning;
  colorClass: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">{meaning?.titulo ?? 'N/A'}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-2xl font-bold text-gray-900 shadow-inner">
          {value}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-600 leading-relaxed line-clamp-3">
        {meaning?.descripcion ?? 'Descripción no disponible.'}
      </p>
      {meaning?.cualidad && (
        <p className="mt-2 text-[10px] font-medium text-gray-500">
          Cualidad: <span className="text-gray-700">{meaning.cualidad}</span>
        </p>
      )}
    </div>
  );
}

/** 3x3 Pythagorean Grid */
function PitagorasGrid({
  inclusionMap,
}: {
  inclusionMap: PitagorasSymbolicState['inclusionMap'];
}) {
  // Grid layout: 1-9 in 3x3
  const gridLayout = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Hash className="h-4 w-4 text-gray-500" />
        <h4 className="text-sm font-semibold text-gray-900">Cuadrado Pitagórico</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {gridLayout.flat().map((num) => {
          const cell = inclusionMap[num];
          const isAbsent = cell?.isAbsent ?? false;
          const isDominant = cell?.isDominant ?? false;
          const frequency = cell?.frequency ?? 0;

          let bgClass = 'bg-gray-50 border-gray-200';
          let textClass = 'text-gray-400';
          let freqClass = 'text-gray-300';

          if (isDominant) {
            bgClass = 'bg-indigo-100 border-indigo-300';
            textClass = 'text-indigo-700';
            freqClass = 'text-indigo-500';
          } else if (!isAbsent && frequency > 0) {
            bgClass = 'bg-blue-50 border-blue-200';
            textClass = 'text-blue-700';
            freqClass = 'text-blue-500';
          } else if (isAbsent) {
            bgClass = 'bg-gray-100 border-dashed border-gray-300';
            textClass = 'text-gray-300';
            freqClass = 'text-gray-200';
          }

          return (
            <div
              key={num}
              className={`flex flex-col items-center justify-center rounded-lg border p-3 ${bgClass} transition-colors`}
            >
              <span className={`text-xl font-bold ${textClass}`}>{num}</span>
              <span className={`text-xs font-medium ${freqClass}`}>
                {frequency > 0 ? `×${frequency}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1 cursor-help" title="Mayor frecuencia en el perfil. Energía predominante.">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" /> Dominante
        </span>
        <span className="flex items-center gap-1 cursor-help" title="Número activo en el perfil con presencia natural.">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-300" /> Presente
        </span>
        <span className="flex items-center gap-1 cursor-help" title="Ausencia indica menor expresión espontánea, no carencia.">
          <span className="inline-block h-2 w-2 rounded-full border border-dashed border-gray-300 bg-gray-100" /> Ausente
        </span>
      </div>
    </div>
  );
}

/** Frequency Bar Chart */
function PitagorasBarChart({
  inclusionMap,
}: {
  inclusionMap: PitagorasSymbolicState['inclusionMap'];
}) {
  const maxFreq = Math.max(1, ...Object.values(inclusionMap).map((v) => v.frequency));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-gray-900">Distribución Numérica</h4>
      <div className="flex items-end gap-1 h-24">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const cell = inclusionMap[num];
          const freq = cell?.frequency ?? 0;
          const height = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
          const isDominant = cell?.isDominant ?? false;
          const isAbsent = cell?.isAbsent ?? false;

          let barClass = 'bg-blue-400';
          if (isDominant) barClass = 'bg-indigo-500';
          else if (isAbsent || freq === 0) barClass = 'bg-gray-200';

          return (
            <div key={num} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-20">
                <div
                  className={`w-full max-w-[20px] rounded-t ${barClass} transition-all`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="mt-1 text-[10px] font-medium text-gray-600">{num}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Collapsible Pedagogical Block */
function PitagorasPedagogicalBlock({
  inclusionMap,
  primaryNumbers,
}: {
  inclusionMap: PitagorasSymbolicState['inclusionMap'];
  primaryNumbers: PitagorasSymbolicState['primaryNumbers'];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const dominantes = Object.entries(inclusionMap)
    .filter(([, v]) => v.isDominant)
    .map(([k]) => k);
  const ausencias = Object.entries(inclusionMap)
    .filter(([, v]) => v.isAbsent)
    .map(([k]) => k);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-900">
            Lectura simbólica orientativa (formación)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-amber-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-600" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-amber-200 px-4 py-3 text-xs text-amber-900 space-y-3">
          <div>
            <p className="font-medium">Números dominantes:</p>
            <p className="text-amber-700">
              {dominantes.length > 0
                ? `Casas ${dominantes.join(', ')} muestran mayor frecuencia. Energías predominantes en el perfil.`
                : 'No hay dominancias marcadas.'}
            </p>
          </div>
          <div>
            <p className="font-medium">Ausencias:</p>
            <p className="text-amber-700">
              {ausencias.length > 0
                ? `Casas ${ausencias.join(', ')} están vacías. Áreas de menor expresión natural.`
                : 'Todas las casas tienen presencia.'}
            </p>
          </div>
          <div>
            <p className="font-medium">Números fundamentales:</p>
            <ul className="mt-1 space-y-1 text-amber-700">
              {primaryNumbers.map((n) => (
                <li key={n.key}>
                  <strong>{n.label}:</strong> {n.value} — {n.meaning?.titulo ?? 'N/A'}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t border-amber-200 text-[10px] text-amber-600">
            ⚠ Este contenido es puramente estructural y formativo. No constituye diagnóstico ni interpretación automática.
          </div>
        </div>
      )}
    </div>
  );
}

/** Main Pitagoras Professional Report */
function PitagorasReport({
  pitagorasState,
  treeState,
  treeLoading,
}: {
  pitagorasState: PitagorasSymbolicState;
  treeState: ReturnType<typeof useTreeStructuralState>['state'];
  treeLoading: boolean;
}) {
  const cardColors = [
    'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200',
    'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Informe Pitagórico Simbólico</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Lectura manual · Uso formativo y de consulta · No automática
            </p>
            <p className="mt-1 text-[10px] text-gray-400 italic">
              Los gráficos representan estructuras simbólicas, no escalas clínicas.
            </p>
          </div>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600">
            Solo lectura
          </span>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <span className="font-medium">Sujeto:</span>{' '}
          {pitagorasState.rawData.identidad.nombreCompleto} ·{' '}
          <span className="font-medium">Fecha:</span>{' '}
          {pitagorasState.rawData.identidad.fechaNacimiento}
        </div>
      </div>

      {/* Fundamental Numbers Cards */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-800">Números Fundamentales</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pitagorasState.primaryNumbers.map((n, idx) => (
            <PitagorasNumberCard
              key={n.key}
              label={n.label}
              value={n.value}
              meaning={n.meaning}
              colorClass={cardColors[idx % cardColors.length]}
            />
          ))}
        </div>
      </div>

      {/* Grid + Bar Chart Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <PitagorasGrid inclusionMap={pitagorasState.inclusionMap} />
        <PitagorasBarChart inclusionMap={pitagorasState.inclusionMap} />
      </div>

      {/* Tree of Life Correspondence */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Correspondencia con el Árbol de la Vida</h4>
        {treeLoading ? (
          <p className="text-xs text-gray-500">Cargando correspondencias...</p>
        ) : treeState?.sefirot_activas.length ? (
          <div className="space-y-2">
            {treeState.sefirot_activas.slice(0, 10).map((sefira) => {
              const maxPeso = Math.max(1, ...treeState.sefirot_activas.map((s) => s.peso));
              const widthPercent = (sefira.peso / maxPeso) * 100;
              return (
                <div key={sefira.id_canonico} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium text-gray-700 truncate">
                    {sefira.id_canonico}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] text-gray-500">
                    {sefira.peso.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No hay sefirot activas disponibles.</p>
        )}
        {treeState?.repeticiones.length ? (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Repeticiones:</span>{' '}
              {treeState.repeticiones.map((r) => `${r.simbolo_id} (×${r.conteo})`).join(', ')}
            </p>
          </div>
        ) : null}
      </div>

      {/* Pedagogical Block */}
      <PitagorasPedagogicalBlock
        inclusionMap={pitagorasState.inclusionMap}
        primaryNumbers={pitagorasState.primaryNumbers}
      />
    </div>
  );
}

interface CabalAppliedVisualCoreProps {
  activeSection: CabalSectionId;
  onWorkspaceStateChange?: (state: CabalaAplicadaWorkspaceExportState) => void;
}

export default function CabalAppliedVisualCore({
  activeSection,
  onWorkspaceStateChange,
}: CabalAppliedVisualCoreProps) {
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfileSummary | null>(null);
  const [pitagorasState, setPitagorasState] = useState<PitagorasSymbolicState | null>(null);
  const [treeStructuralState, setTreeStructuralState] = useState<TreeStructuralState | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('pitagoras');

  const METHODS = useMemo(() => [
    { id: 'pitagoras', name: 'Pitágoras', run: (input: any) => ejecutarMetodoPitagorico(input as any) },
    { id: 'gematria-standard', name: 'Gematría Estándar', run: (input: any) => ejecutarMetodoGematriaStandard(input as any) },
    { id: 'gematria-katan', name: 'Gematría Katan', run: (input: any) => ejecutarMetodoGematriaKatan(input as any) },
    { id: 'mispar-gadol', name: 'Mispar Gadol', run: (input: any) => ejecutarMetodoMisparGadol(input as any) },
    { id: 'mispar-siduri', name: 'Mispar Siduri', run: (input: any) => ejecutarMetodoMisparSiduri(input as any) },
    { id: 'milui', name: 'Milui', run: (input: any) => ejecutarMetodoMilui(input as any) },
    { id: 'atbash', name: 'Atbash', run: (input: any) => ejecutarMetodoAtbash(input as any) },
    { id: 'albam', name: 'Albam', run: (input: any) => ejecutarMetodoAlbam(input as any) },
    { id: 'avgad', name: 'Avgad', run: (input: any) => ejecutarMetodoAvgad(input as any) },
    { id: 'temurah', name: 'Temurah', run: (input: any) => ejecutarMetodoTemurah(input as any) },
    { id: 'notarikon', name: 'Notarikon', run: (input: any) => ejecutarMetodoNotarikon(input as any) },
  ], [] as any);

  function runSelectedMethodForPatient() {
    if (!patientProfile?.legal_full_name || !patientProfile?.birth_date) return;
    try {
      const date = new Date(patientProfile.birth_date);
      const input = {
        nombreCompleto: patientProfile.legal_full_name,
        fechaNacimiento: {
          dia: date.getUTCDate(),
          mes: date.getUTCMonth() + 1,
          anio: date.getUTCFullYear(),
        },
      };
      const method = METHODS.find((m: any) => m.id === selectedMethod) as any;
      if (!method) return;
      const estado: PitagorasSymbolicState = method.run(input);
      setPitagorasState(estado);
      
      // Generar TreeStructuralState según el método seleccionado
      let treeState: TreeStructuralState | null = null;
      switch (selectedMethod) {
        case 'pitagoras':
          treeState = adaptPitagorasToTree(estado);
          break;
        case 'gematria-standard':
          treeState = adaptGematriaStandardToTree(estado);
          break;
        case 'gematria-katan':
          treeState = adaptGematriaKatanToTree(estado);
          break;
        case 'mispar-gadol':
          treeState = adaptMisparGadolToTree(estado);
          break;
        case 'mispar-siduri':
          treeState = adaptMisparSiduriToTree(estado);
          break;
        case 'milui':
          treeState = adaptMiluiToTree(estado);
          break;
        case 'atbash':
          treeState = adaptAtbashToTree(estado);
          break;
        case 'albam':
          treeState = adaptAlbamToTree(estado);
          break;
        case 'avgad':
          treeState = adaptAvgadToTree(estado);
          break;
        case 'temurah':
          treeState = adaptTemurahToTree(estado);
          break;
        case 'notarikon':
          treeState = adaptNotarikonToTree(estado);
          break;
      }
      
      setTreeStructuralState(treeState);

      // Persistir ejecución como artefacto longitudinal (best-effort; no bloquea UX)
      if (activePatientId) {
        void saveCabalaAplicadaMethodRecord(activePatientId, {
          method_id: selectedMethod,
          method_name: method?.name ?? null,
          input: input as unknown as Record<string, unknown>,
          method_output: (estado as unknown as Record<string, unknown>) ?? null,
          tree_state: (treeState as unknown as Record<string, unknown>) ?? null,
          backend_structural_state: (state as unknown as Record<string, unknown>) ?? null,
          symbolic_interpretation: null,
        }).catch((e) => {
          console.warn('No se pudo guardar Cabala Aplicada en historial:', e);
        });
      }
    } catch (err) {
      console.error('Error ejecutando método simbólico:', err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const loadPatient = async () => {
      const patientId = getActivePatientId();
      if (!isMounted) return;
      setActivePatientId(patientId ?? null);
      if (!patientId) {
        setPatientProfile(null);
        return;
      }
      try {
        const profile = await getPatientProfileSummary(patientId);
        if (isMounted) {
          setPatientProfile(profile);
        }
      } catch (error) {
        if (isMounted) {
          setPatientProfile(null);
        }
      }
    };

    loadPatient();
    window.addEventListener('activePatientChanged', loadPatient);
    return () => {
      isMounted = false;
      window.removeEventListener('activePatientChanged', loadPatient);
    };
  }, []);

  const emptyTarotCards = useMemo(() => [], []);
  const treeInput = useMemo(
    () => ({
      fullName: patientProfile?.legal_full_name ?? null,
      birthDate: patientProfile?.birth_date ?? null,
      tarotCards: emptyTarotCards,
    }),
    [patientProfile?.legal_full_name, patientProfile?.birth_date, emptyTarotCards]
  );

  const { state, loading } = useTreeStructuralState(treeInput);

  useEffect(() => {
    const sefirotActivas =
      state?.sefirot_activas?.map((item: any) => ({
        id: String(item?.id_canonico ?? ''),
        indice: item?.indice ?? null,
        peso: item?.peso ?? null,
      }))?.filter((x: any) => x.id) ?? [];

    const senderosActivosRaw: Array<{ from: string; to: string; peso?: number | null } | null> =
      state?.senderos_activos?.map((item: any) => {
        const from = item?.endpoints?.from_sefira;
        const to = item?.endpoints?.to_sefira;
        if (!from || !to) return null;
        return {
          from: String(from),
          to: String(to),
          peso: item?.peso ?? null,
        };
      }) ?? [];

    const senderosActivos: Array<{ from: string; to: string; peso?: number | null }> = senderosActivosRaw.filter(
      (x): x is { from: string; to: string; peso?: number | null } => x !== null
    );

    const repeticiones =
      state?.repeticiones
        ?.map((item: any) => ({
          id: String(item?.simbolo_id ?? ''),
          tipo: item?.tipo ?? null,
          veces: item?.veces ?? null,
        }))
        ?.filter((x: any) => x.id) ?? [];

    onWorkspaceStateChange?.({
      patientId: activePatientId ?? null,
      patientName: patientProfile?.legal_full_name ?? null,
      patientBirthDate: patientProfile?.birth_date ?? null,
      selectedMethodId: selectedMethod ?? null,
      treeState: treeStructuralState ?? null,
      backendStructuralState: (state as unknown as Record<string, unknown>) ?? null,
      pdfSummary: {
        sefirotActivas,
        senderosActivos,
        repeticiones,
      },
    });
  }, [activePatientId, patientProfile?.legal_full_name, selectedMethod, treeStructuralState, state, onWorkspaceStateChange]);

  // Ensure typed arrays matching Tree types
  const highlightedSefirot = useMemo(() => {
    if (!state?.sefirot_activas.length) return [] as import('../Tree/tree.types').TreeSefirahId[];
    return state.sefirot_activas.map((item) => item.id_canonico as import('../Tree/tree.types').TreeSefirahId);
  }, [state?.sefirot_activas]);

  const highlightedPaths = useMemo(() => {
    if (!state?.senderos_activos.length) return [] as import('../Tree/tree.types').TreePathId[];
    return state.senderos_activos
      .map((sendero) => {
        const from = sendero.endpoints.from_sefira;
        const to = sendero.endpoints.to_sefira;
        return from && to ? `${from}-${to}` : null;
      })
      .filter((value): value is string => Boolean(value)) as import('../Tree/tree.types').TreePathId[];
  }, [state?.senderos_activos]);

  const repeatedSefirot = useMemo(() => {
    if (!state?.repeticiones.length) return [] as import('../Tree/tree.types').TreeSefirahId[];
    return state.repeticiones
      .map((item) => item.simbolo_id)
      .filter((id) => !id.includes('-')) as import('../Tree/tree.types').TreeSefirahId[];
  }, [state?.repeticiones]);

  const repeatedPaths = useMemo(() => {
    if (!state?.repeticiones.length) return [] as import('../Tree/tree.types').TreePathId[];
    return state.repeticiones
      .map((item) => item.simbolo_id)
      .filter((id) => id.includes('-')) as import('../Tree/tree.types').TreePathId[];
  }, [state?.repeticiones]);

  const mapWeightsToOpacity = (items: Array<{ id: string; weight: number }>) => {
    if (!items.length) {
      return {};
    }
    const weights = items.map((item) => item.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const minOpacity = 0.45;
    const maxOpacity = 1;
    return items.reduce<Record<string, number>>((acc, item) => {
      if (maxWeight === minWeight) {
        acc[item.id] = maxOpacity;
      } else {
        const ratio = (item.weight - minWeight) / (maxWeight - minWeight);
        acc[item.id] = minOpacity + ratio * (maxOpacity - minOpacity);
      }
      return acc;
    }, {});
  };

  const highlightedSefirotOpacity = useMemo(() => {
    const items =
      state?.sefirot_activas.map((item) => ({
        id: item.id_canonico,
        weight: item.peso,
      })) ?? [];
    return mapWeightsToOpacity(items);
  }, [state?.sefirot_activas]);

  const highlightedPathOpacity = useMemo(() => {
    const items =
      state?.senderos_activos
        .map((item) => {
          const from = item.endpoints.from_sefira;
          const to = item.endpoints.to_sefira;
          if (!from || !to) {
            return null;
          }
          return {
            id: `${from}-${to}`,
            weight: item.peso,
          };
        })
        .filter((value): value is { id: string; weight: number } => Boolean(value)) ?? [];
    return mapWeightsToOpacity(items);
  }, [state?.senderos_activos]);

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arbol de la Vida</h3>
          <p className="text-xs text-gray-500">
            Estado estructural observacional (v0.1).
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <TreeVisualPlaceholder />
      {!activePatientId ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Seleccione un paciente para ver el Arbol de la Vida.
        </div>
      ) : (
        <>
          <div id="cabala-aplicada-export-visual" className="mt-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div id="cabala-aplicada-export-tree" className="relative w-full h-72">
                {treeStructuralState ? (
                  // TreeStructuralState v0.1 con flechas (Pitágoras ejecutado)
                  <TreeWithFlows
                    treeState={treeStructuralState}
                    size="responsive"
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  // Fallback: árbol legacy con backend highlights
                  <>
                    <TreeOfLifeSVG
                      highlightedSefirot={[]}
                      highlightedPaths={[]}
                      emphasis="soft"
                      size="responsive"
                      className="absolute inset-0 h-full w-full opacity-40 pointer-events-none"
                    />
                    <TreeOfLifeSVG
                      highlightedSefirot={highlightedSefirot}
                      highlightedPaths={highlightedPaths}
                      highlightedSefirotOpacity={highlightedSefirotOpacity}
                      highlightedPathOpacity={highlightedPathOpacity}
                      repeatedSefirot={repeatedSefirot}
                      repeatedPaths={repeatedPaths}
                      emphasis="strong"
                      dimUnrelated={true}
                      size="responsive"
                      className="absolute inset-0 h-full w-full"
                    />
                  </>
                )}
              </div>
            </div>
          {activePatientId && (
            <div className="mt-4 flex items-center gap-3">
              <label className="sr-only">Método cabalístico</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="rounded-md border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                {METHODS.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                onClick={() => runSelectedMethodForPatient()}
              >
                Ejecutar
              </button>

              <span className="text-xs text-gray-500">Ejecutar manualmente el método seleccionado (solo lectura, formativo)</span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Sefirot activas</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.sefirot_activas.length ? (
                  <span>
                    {state.sefirot_activas
                      .map((item) => `${item.id_canonico} (${item.indice ?? '-'}, ${item.peso})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Senderos activos</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.senderos_activos.length ? (
                  <span>
                    {state.senderos_activos
                      .map((item) => `${item.id_canonico} (${item.numero ?? '-'}, ${item.peso})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Repeticiones</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state?.repeticiones.length ? (
                  <span>
                    {state.repeticiones
                      .map((item) => `${item.simbolo_id} (${item.conteo})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Pesos</div>
              <div className="mt-2 text-xs">
                {loading ? (
                  <span>Cargando...</span>
                ) : state && Object.keys(state.pesos).length ? (
                  <span>
                    {Object.entries(state.pesos)
                      .map(([key, value]) => `${key} (${value})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            <span className="font-medium">Ejes:</span> No disponible -{' '}
            <span className="font-medium">Polaridades:</span> No disponible -{' '}
            <span className="font-medium">Fuentes:</span> No disponible
          </div>

          {/* Pitagoras Professional Report (solo UI, no persistencia) */}
          {pitagorasState && (
            <PitagorasReport
              pitagorasState={pitagorasState}
              treeState={state}
              treeLoading={loading}
            />
          )}
          </div>
        </>
      )}
    </section>
  );
}
