'use client';

import { useEffect, useMemo, useState } from 'react';
import { Hash, Sparkles, Activity, Sun, Scale, Loader2 } from 'lucide-react';
import type { CabalSectionId } from './types';
import {
  getActivePatientId,
  getActivePatientName,
  setActivePatientId as persistActivePatientId,
} from '@/lib/active-patient';
import { getPatientProfileSummary, type PatientProfileSummary } from '@/lib/patient-api';
import useActiveConsultante from '@/hooks/useActiveConsultante';
import { API_BASE_URL, getAuthHeaders, getAuthToken } from '@/lib/api';
import { analyzeTreeViaApi } from '@/lib/api/symbolic-api-client';
import { TreeWithFlows } from '@/components/Tree';
import type { TreeStructuralAnalysis } from '@holistica/symbolic/tree/tree-analysis.types';
import TreeVisualPlaceholder from './TreeVisualPlaceholder';
import { ejecutarMetodoPitagorico } from '@holistica/symbolic/methods/pitagoras';
import type { PitagorasSymbolicState, PitagorasNumberMeaning } from '@holistica/symbolic/methods/pitagoras/pitagoras.types';
import {
  adaptPitagorasToTree,
  analyzeTreeState,
  buildFormativeBrief,
  methodContextFromSymbolicState,
  type FormativeBrief,
  type TreeStructuralState,
} from '@holistica/symbolic/tree';
import FormativeReadingPanel from './FormativeReadingPanel';
import GematriaInterpretacionPanel, {
  extractGematriaInterpretacion,
} from './GematriaInterpretacionPanel';
import { GuidedBlock } from '@/components/ui/guided-block';

// ============================================================================
// CLINICAL CONTEXT TYPES (from Ghost Tests pipeline)
// ============================================================================

interface RitmoAlmico {
  ritmo_esencial: 'fluido' | 'latente' | 'forzado' | 'fragmentado';
  mundo_predominante: string;
  nivel_del_alma: string;
  indice_coherencia?: number;
  lectura?: string;
  foco_de_trabajo?: string;
}

interface SefirahScore {
  name: string;
  intensity: number;
  aq_score?: number;
}

interface ClinicalContextSummary {
  has_ritmo_almico: boolean;
  has_aq_kabbalah: boolean;
  has_sha_harmony: boolean;
  illuminated_sefirot: SefirahScore[];
  ritmo_state: string | null;
  mundo_predominante?: string;
  harmony_index?: number;
}

// ============================================================================
// CLINICAL CONTEXT BADGE COMPONENT
// ============================================================================

const RITMO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fluido: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  latente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  forzado: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  fragmentado: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const MUNDO_LABELS: Record<string, string> = {
  Atzilut: '🌟 Atzilut (Emanación)',
  Beria: '💭 Beria (Creación)',
  Yetzirah: '💫 Yetzirah (Formación)',
  Assiah: '🌍 Assiah (Acción)',
};

function ClinicalContextBadges({ context }: { context: ClinicalContextSummary | null }) {
  if (!context) return null;
  
  const { has_ritmo_almico, has_aq_kabbalah, has_sha_harmony, ritmo_state, mundo_predominante, illuminated_sefirot, harmony_index } = context;
  
  if (!has_ritmo_almico && !has_aq_kabbalah && !has_sha_harmony) {
    return null;
  }
  
  const ritmoColors = ritmo_state ? RITMO_COLORS[ritmo_state] || RITMO_COLORS.latente : null;
  
  return (
    <div className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-semibold text-indigo-900">Contexto Clínico Integrado</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Ritmo Almico Badge */}
        {has_ritmo_almico && ritmo_state && ritmoColors && (
          <div 
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${ritmoColors.bg} ${ritmoColors.border}`}
            title={`Ritmo del Alma: ${ritmo_state}${mundo_predominante ? ` (${mundo_predominante})` : ''}`}
          >
            <Activity className={`h-3.5 w-3.5 ${ritmoColors.text}`} />
            <span className={`text-xs font-medium ${ritmoColors.text}`}>
              Ritmo: <span className="capitalize">{ritmo_state}</span>
            </span>
            {mundo_predominante && (
              <span className={`text-[10px] ${ritmoColors.text} opacity-75`}>
                {MUNDO_LABELS[mundo_predominante] || mundo_predominante}
              </span>
            )}
          </div>
        )}
        
        {/* AQ-Kabbalah / Sefirot Iluminadas Badge */}
        {has_aq_kabbalah && illuminated_sefirot.length > 0 && (
          <div 
            className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5"
            title={`Sefirot iluminadas: ${illuminated_sefirot.map(s => s.name).join(', ')}`}
          >
            <Sun className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">
              {illuminated_sefirot.length} Sefirot Activas
            </span>
            <div className="flex -space-x-1">
              {illuminated_sefirot.slice(0, 4).map((sefira) => (
                <span 
                  key={sefira.name}
                  className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-yellow-200 text-[8px] font-bold text-yellow-800 border border-yellow-300"
                  title={`${sefira.name}: ${sefira.aq_score ?? sefira.intensity * 10}/10`}
                  style={{ opacity: 0.5 + sefira.intensity * 0.5 }}
                >
                  {sefira.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {illuminated_sefirot.length > 4 && (
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-yellow-300 text-[8px] font-bold text-yellow-800 border border-yellow-400">
                  +{illuminated_sefirot.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* SHA Harmony Badge */}
        {has_sha_harmony && (
          <div 
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
              harmony_index && harmony_index >= 3.5 
                ? 'border-teal-200 bg-teal-50' 
                : 'border-slate-200 bg-slate-50'
            }`}
            title={`Índice de Armonía Sefirótica: ${harmony_index?.toFixed(1) ?? 'N/A'}/5`}
          >
            <Scale className={`h-3.5 w-3.5 ${harmony_index && harmony_index >= 3.5 ? 'text-teal-600' : 'text-slate-500'}`} />
            <span className={`text-xs font-medium ${harmony_index && harmony_index >= 3.5 ? 'text-teal-700' : 'text-slate-600'}`}>
              Armonía: {harmony_index?.toFixed(1) ?? '—'}/5
            </span>
          </div>
        )}
      </div>
      
      {/* Illuminated Sefirot Detail (expandable) */}
      {has_aq_kabbalah && illuminated_sefirot.length > 0 && (
        <div className="mt-3 pt-3 border-t border-indigo-100">
          <p className="text-[10px] text-indigo-600 font-medium mb-1.5">Sefirot iluminadas por AQ-Kabbalah:</p>
          <div className="flex flex-wrap gap-1">
            {illuminated_sefirot.map((sefira) => (
              <span 
                key={sefira.name}
                className="inline-flex items-center gap-1 rounded-md bg-white/80 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700"
              >
                <span 
                  className="h-2 w-2 rounded-full bg-yellow-400"
                  style={{ opacity: 0.4 + sefira.intensity * 0.6 }}
                />
                <span className="capitalize font-medium">{sefira.name}</span>
                {sefira.aq_score && (
                  <span className="text-indigo-400">({sefira.aq_score}/10)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Additional symbolic methods (FASE 1)
import { ejecutarMetodoGematriaStandard, adaptGematriaStandardToTree } from '@holistica/symbolic/methods/gematria-standard';
import { ejecutarMetodoGematriaKatan, adaptGematriaKatanToTree } from '@holistica/symbolic/methods/gematria-katan';
import { ejecutarMetodoMisparGadol, adaptMisparGadolToTree } from '@holistica/symbolic/methods/mispar-gadol';
import { ejecutarMetodoMisparSiduri, adaptMisparSiduriToTree } from '@holistica/symbolic/methods/mispar-siduri';
import { ejecutarMetodoMilui, adaptMiluiToTree } from '@holistica/symbolic/methods/milui';
import { ejecutarMetodoAtbash, adaptAtbashToTree } from '@holistica/symbolic/methods/atbash';
import { ejecutarMetodoAlbam, adaptAlbamToTree } from '@holistica/symbolic/methods/albam';
import { ejecutarMetodoAvgad, adaptAvgadToTree } from '@holistica/symbolic/methods/avgad';
import { ejecutarMetodoTemurah, adaptTemurahToTree } from '@holistica/symbolic/methods/temurah';
import { ejecutarMetodoNotarikon, adaptNotarikonToTree } from '@holistica/symbolic/methods/notarikon';

// Symbolic Interpretation AI
import {
  dispatchCabalaAplicadaRecordSaved,
  saveCabalaAplicadaMethodRecord,
} from '@/lib/cabala-aplicada-api';

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

function parsePathEndpoints(pathId: string): { from: string; to: string } | null {
  const idx = pathId.indexOf('-');
  if (idx <= 0) return null;
  const from = pathId.slice(0, idx);
  const to = pathId.slice(idx + 1);
  if (!from || !to) return null;
  return { from, to };
}

function resolvePatientDisplayName(
  profile: PatientProfileSummary | null,
  consultanteName?: string | null,
  storedName?: string | null,
): string | null {
  const candidates = [
    profile?.legal_full_name,
    profile?.full_name,
    consultanteName,
    storedName,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function resolvePatientBirthDate(
  profile: PatientProfileSummary | null,
  consultanteBirthDate?: string | null,
): string | null {
  const candidates = [profile?.birth_date, consultanteBirthDate];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function parseBirthDateParts(
  birthDate: string,
): { dia: number; mes: number; anio: number } | null {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate.trim());
  if (isoMatch) {
    return {
      anio: Number(isoMatch[1]),
      mes: Number(isoMatch[2]),
      dia: Number(isoMatch[3]),
    };
  }
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return {
    dia: parsed.getUTCDate(),
    mes: parsed.getUTCMonth() + 1,
    anio: parsed.getUTCFullYear(),
  };
}

function buildPdfSummaryFromAnalysis(
  analysis: TreeStructuralAnalysis | null,
  treeState: TreeStructuralState | null,
): CabalaAplicadaWorkspaceExportState['pdfSummary'] {
  const sefirotActivas =
    analysis?.ranking
      ?.filter((item) => item.role !== 'latent')
      .map((item, index) => ({
        id: item.id,
        indice: index + 1,
        peso: item.activation,
      })) ?? [];

  const senderosActivos =
    analysis?.graph.activePaths
      ?.map((pathId) => {
        const endpoints = parsePathEndpoints(pathId);
        if (!endpoints) return null;
        const flow = treeState?.flows.find(
          (f) =>
            (f.from === endpoints.from && f.to === endpoints.to) ||
            (f.from === endpoints.to && f.to === endpoints.from),
        );
        return {
          from: endpoints.from,
          to: endpoints.to,
          peso: flow?.intensity ?? null,
        };
      })
      .filter((x): x is { from: string; to: string; peso: number | null } => x !== null) ?? [];

  const repeticiones =
    treeState?.sefirot
      .filter((s) => s.role === 'dominant')
      .map((s) => ({
        id: s.id,
        tipo: 'dominant',
        veces: Math.round(s.activation * 10),
      })) ?? [];

  return { sefirotActivas, senderosActivos, repeticiones };
}

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

const SECTION_META: Record<
  CabalSectionId,
  { title: string; subtitle: string }
> = {
  tree: {
    title: 'Árbol de la Vida',
    subtitle: 'Visualización estructural y ejecución del método.',
  },
  synthesis: {
    title: 'Síntesis formativa',
    subtitle: 'Lectura terapéutica avanzada (determinística, sin IA).',
  },
  gematria: {
    title: 'Datos numéricos del método',
    subtitle: 'Gráficos, números e interpretación simbólica educativa del cálculo.',
  },
  resources: {
    title: 'Recursos',
    subtitle: 'Material consultivo de apoyo.',
  },
};

/** Main Pitagoras numeric report (charts only — synthesis lives in Síntesis tab) */
function PitagorasReport({
  pitagorasState,
}: {
  pitagorasState: PitagorasSymbolicState;
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
              <Hash className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Perfil numérico Pitagórico</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Solo datos y gráficos · La lectura terapéutica está en la pestaña Síntesis
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

    </div>
  );
}

interface CabalAppliedVisualCoreProps {
  activeSection: CabalSectionId;
  onSectionChange?: (section: CabalSectionId) => void;
  onWorkspaceStateChange?: (state: CabalaAplicadaWorkspaceExportState) => void;
  onSnapshotSaved?: (id: string) => void;
}

export default function CabalAppliedVisualCore({
  activeSection,
  onSectionChange,
  onWorkspaceStateChange,
  onSnapshotSaved,
}: CabalAppliedVisualCoreProps) {
  const consultante = useActiveConsultante();
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientLoadError, setPatientLoadError] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfileSummary | null>(null);
  const [pitagorasState, setPitagorasState] = useState<PitagorasSymbolicState | null>(null);
  const [methodSymbolicState, setMethodSymbolicState] = useState<Record<string, unknown> | null>(null);
  const [treeStructuralState, setTreeStructuralState] = useState<TreeStructuralState | null>(null);
  const [treeAnalysis, setTreeAnalysis] = useState<TreeStructuralAnalysis | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('gematria-standard');
  const [clinicalContext, setClinicalContext] = useState<ClinicalContextSummary | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [saveHistoryWarning, setSaveHistoryWarning] = useState<string | null>(null);

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

  function adaptMethodStateToTree(methodId: string, estado: unknown): TreeStructuralState | null {
    switch (methodId) {
      case 'pitagoras':
        return adaptPitagorasToTree(estado as PitagorasSymbolicState);
      case 'gematria-standard':
        return adaptGematriaStandardToTree(estado);
      case 'gematria-katan':
        return adaptGematriaKatanToTree(estado);
      case 'mispar-gadol':
        return adaptMisparGadolToTree(estado);
      case 'mispar-siduri':
        return adaptMisparSiduriToTree(estado);
      case 'milui':
        return adaptMiluiToTree(estado);
      case 'atbash':
        return adaptAtbashToTree(estado);
      case 'albam':
        return adaptAlbamToTree(estado);
      case 'avgad':
        return adaptAvgadToTree(estado);
      case 'temurah':
        return adaptTemurahToTree(estado);
      case 'notarikon':
        return adaptNotarikonToTree(estado);
      default:
        return null;
    }
  }

  async function applyTreeState(treeState: TreeStructuralState, methodId?: string) {
    try {
      const analyzed = await analyzeTreeViaApi(treeState);
      setTreeStructuralState(analyzed.treeState);
      setTreeAnalysis(analyzed.analysis);
      if (methodId) {
        setSelectedMethod(methodId);
      }
      return analyzed;
    } catch (apiErr) {
      console.warn('Analyze API no disponible, usando motor local:', apiErr);
      const analysis = analyzeTreeState(treeState);
      setTreeStructuralState(treeState);
      setTreeAnalysis(analysis);
      if (methodId) {
        setSelectedMethod(methodId);
      }
      return { treeState, analysis };
    }
  }

  async function runSelectedMethodForPatient() {
    setExecuteError(null);
    setSaveHistoryWarning(null);

    let profile = patientProfile;
    const needsProfileRefresh =
      activePatientId &&
      (!resolvePatientDisplayName(profile, consultante?.nombre_completo, getActivePatientName()) ||
        !resolvePatientBirthDate(profile, consultante?.fecha_nacimiento));
    if (needsProfileRefresh) {
      try {
        profile = await getPatientProfileSummary(activePatientId);
        setPatientProfile(profile);
      } catch {
        // keep best-effort fallbacks below
      }
    }

    const patientName = resolvePatientDisplayName(
      profile,
      consultante?.nombre_completo,
      getActivePatientName(),
    );
    const patientBirthDate = resolvePatientBirthDate(
      profile,
      consultante?.fecha_nacimiento,
    );
    const birthParts = patientBirthDate ? parseBirthDateParts(patientBirthDate) : null;

    if (!patientName || !birthParts) {
      setExecuteError(
        !patientName
          ? 'Paciente sin nombre (usa full_name o legal_full_name en el perfil).'
          : 'Paciente sin fecha de nacimiento válida.',
      );
      return;
    }

    const method = METHODS.find((m: { id: string }) => m.id === selectedMethod);
    if (!method) {
      setExecuteError('Método no disponible.');
      return;
    }

    setExecuteLoading(true);
    try {
      const input = {
        nombreCompleto: patientName,
        fechaNacimiento: birthParts,
      };

      const estado = method.run(input);
      setMethodSymbolicState(estado as Record<string, unknown>);
      setPitagorasState(selectedMethod === 'pitagoras' ? (estado as PitagorasSymbolicState) : null);

      const treeState = adaptMethodStateToTree(selectedMethod, estado);
      if (!treeState) {
        throw new Error('No se pudo adaptar el método al Árbol.');
      }

      const analyzed = await applyTreeState(treeState);
      onSectionChange?.('synthesis');

      if (activePatientId) {
        try {
          const briefForRecord: Record<string, unknown> | null = (() => {
            try {
              const ctx = methodContextFromSymbolicState(
                estado as Parameters<typeof methodContextFromSymbolicState>[0],
              );
              const brief = buildFormativeBrief(treeState, analyzed.analysis, ctx, undefined);
              return brief as unknown as Record<string, unknown>;
            } catch {
              return null;
            }
          })();

          const res = await saveCabalaAplicadaMethodRecord(activePatientId, {
            method_id: selectedMethod,
            method_name: method.name ?? null,
            input: input as unknown as Record<string, unknown>,
            method_output: (estado as unknown as Record<string, unknown>) ?? null,
            tree_state: (treeState as unknown as Record<string, unknown>) ?? null,
            backend_structural_state: {
              source: 'symbolic-api-v1',
              analysis: analyzed.analysis,
            },
            symbolic_interpretation: null,
            formative_brief: briefForRecord,
          });
          if (res.id) {
            onSnapshotSaved?.(res.id);
          }
          dispatchCabalaAplicadaRecordSaved(activePatientId);
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : 'No se pudo guardar en el historial.';
          setSaveHistoryWarning(
            `El método se ejecutó correctamente, pero no se pudo guardar en el historial: ${msg}`,
          );
        }
      }
    } catch (err) {
      console.error('Error ejecutando método simbólico:', err);
      setExecuteError(
        err instanceof Error ? err.message : 'Error al ejecutar el método simbólico.',
      );
      setTreeStructuralState(null);
      setTreeAnalysis(null);
      setMethodSymbolicState(null);
    } finally {
      setExecuteLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const loadPatient = async () => {
      const patientId = getActivePatientId();
      if (!isMounted) return;
      setPatientLoading(true);
      setPatientLoadError(null);
      setActivePatientId(patientId ?? null);
      if (!patientId) {
        setPatientProfile(null);
        setClinicalContext(null);
        setPatientLoading(false);
        return;
      }
      try {
        const profile = await getPatientProfileSummary(patientId);
        if (isMounted) {
          setPatientProfile(profile);
          const resolvedName = resolvePatientDisplayName(profile);
          if (resolvedName) {
            persistActivePatientId(patientId, resolvedName);
          }
        }
      } catch {
        if (isMounted) {
          setPatientProfile(null);
          setPatientLoadError('No se pudo cargar el perfil del consultante activo.');
        }
      } finally {
        if (isMounted) {
          setPatientLoading(false);
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

  // Fetch clinical context from active CabalaSession (if any)
  useEffect(() => {
    let isMounted = true;
    
    const fetchClinicalContext = async () => {
      if (!activePatientId) {
        setClinicalContext(null);
        return;
      }
      
      try {
        // Fetch clinical context summary from backend
        // This endpoint should be implemented in swm/cabala/views.py
        const response = await fetch(`/api/swm/cabala/clinical-summary/${activePatientId}/`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });
        
        if (response.ok && isMounted) {
          const data = await response.json();
          setClinicalContext(data);
        } else if (isMounted) {
          // If endpoint doesn't exist yet, try to construct from patient test results
          setClinicalContext(null);
        }
      } catch (error) {
        console.warn('Could not fetch clinical context (endpoint may not exist yet):', error);
        if (isMounted) {
          setClinicalContext(null);
        }
      }
    };
    
    fetchClinicalContext();
    
    return () => {
      isMounted = false;
    };
  }, [activePatientId]);

  useEffect(() => {
    if (!activePatientId) {
      setTreeStructuralState(null);
      setTreeAnalysis(null);
      setMethodSymbolicState(null);
      return;
    }

    let cancelled = false;

    const restoreLastExecution = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/analysis-records/?patient_id=${encodeURIComponent(String(activePatientId))}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          },
        );
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as { results?: Array<{ computed_result?: unknown }> };
        const results = Array.isArray(data.results) ? data.results : [];
        const latest = results.find((record) => {
          const cr = record.computed_result as { cabala_aplicada?: { tree_state?: unknown } } | null;
          return Boolean(cr?.cabala_aplicada?.tree_state);
        });
        if (!latest || cancelled) return;

        const cabala = (latest.computed_result as { cabala_aplicada?: Record<string, unknown> })
          ?.cabala_aplicada;
        const savedTree = cabala?.tree_state as TreeStructuralState | undefined;
        const savedMethodId =
          typeof cabala?.method_id === 'string' ? cabala.method_id : undefined;

        if (savedTree?.sefirot?.length) {
          await applyTreeState(savedTree, savedMethodId);
        }
      } catch (error) {
        console.warn('No se pudo restaurar la última ejecución de Cabala Aplicada:', error);
      }
    };

    void restoreLastExecution();

    return () => {
      cancelled = true;
    };
  }, [activePatientId]);

  const pdfSummary = useMemo(
    () => buildPdfSummaryFromAnalysis(treeAnalysis, treeStructuralState),
    [treeAnalysis, treeStructuralState],
  );

  const gematriaInterpretacion = useMemo(
    () => extractGematriaInterpretacion(methodSymbolicState),
    [methodSymbolicState],
  );

  const formativeBrief: FormativeBrief | null = useMemo(() => {
    if (!treeAnalysis || !treeStructuralState) return null;
    const ctx = methodSymbolicState
      ? methodContextFromSymbolicState(methodSymbolicState as Parameters<typeof methodContextFromSymbolicState>[0])
      : undefined;
    const clinicalCtx = clinicalContext
      ? {
          ritmoState: clinicalContext.ritmo_state,
          mundoPredominante: clinicalContext.mundo_predominante,
          harmonyIndex: clinicalContext.harmony_index,
          illuminatedSefirot: clinicalContext.illuminated_sefirot?.map((s) => s.name),
        }
      : undefined;
    return buildFormativeBrief(treeStructuralState, treeAnalysis, ctx, clinicalCtx);
  }, [treeAnalysis, treeStructuralState, methodSymbolicState, clinicalContext]);

  useEffect(() => {
    onWorkspaceStateChange?.({
      patientId: activePatientId ?? null,
      patientName: resolvePatientDisplayName(
        patientProfile,
        consultante?.nombre_completo,
        getActivePatientName(),
      ),
      patientBirthDate: resolvePatientBirthDate(
        patientProfile,
        consultante?.fecha_nacimiento,
      ),
      selectedMethodId: selectedMethod ?? null,
      treeState: treeStructuralState ?? null,
      backendStructuralState: treeAnalysis
        ? ({ source: 'symbolic-api-v1', analysis: treeAnalysis } as Record<string, unknown>)
        : null,
      pdfSummary,
    });
  }, [
    activePatientId,
    patientProfile?.legal_full_name,
    patientProfile?.birth_date,
    consultante?.nombre_completo,
    consultante?.fecha_nacimiento,
    selectedMethod,
    treeStructuralState,
    treeAnalysis,
    pdfSummary,
    onWorkspaceStateChange,
  ]);

  const sectionMeta = SECTION_META[activeSection];

  const methodRunner = activePatientId ? (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="sr-only">Método cabalístico</label>
      <select
        value={selectedMethod}
        onChange={(e) => setSelectedMethod(e.target.value)}
        className="rounded-md border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
      >
        {METHODS.map((m: { id: string; name: string }) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        onClick={() => void runSelectedMethodForPatient()}
        disabled={executeLoading}
        aria-busy={executeLoading}
        aria-label={executeLoading ? 'Ejecutando método cabalístico' : 'Ejecutar método cabalístico'}
      >
        {executeLoading ? 'Ejecutando…' : 'Ejecutar'}
      </button>

      <span className="text-xs text-gray-500">
        Tras ejecutar, abre la pestaña <strong>Síntesis</strong> para la lectura terapéutica.
      </span>
    </div>
  ) : null;

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{sectionMeta.title}</h3>
          <p className="text-xs text-gray-500">{sectionMeta.subtitle}</p>
        </div>
      </div>
      {activeSection === 'tree' && <TreeVisualPlaceholder />}
      {patientLoading ? (
        <div
          className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando consultante activo…
        </div>
      ) : patientLoadError ? (
        <GuidedBlock
          variant="missing"
          role="therapist"
          title="Error cargando consultante"
          description={patientLoadError}
          actions={[{ label: 'Ir a consultantes', href: '/dashboard/therapist/patients' }]}
          compact
          className="mt-6"
        />
      ) : !activePatientId ? (
        <GuidedBlock
          variant="info"
          role="therapist"
          title="Sin consultante activo"
          description="Selecciona un consultante para ejecutar métodos simbólicos y ver síntesis."
          steps={[
            { label: 'Selecciona un consultante en el indicador superior' },
            { label: 'O elige desde la lista de consultantes' },
          ]}
          actions={[{ label: 'Elegir consultante', href: '/dashboard/therapist/patients' }]}
          className="mt-6"
        />
      ) : (
        <>
          <ClinicalContextBadges context={clinicalContext} />

          {executeError && (
            <GuidedBlock
              variant="missing"
              role="therapist"
              title="Error al ejecutar método"
              description={executeError}
              actions={[{ label: 'Reintentar', onClick: () => setExecuteError(null), variant: 'secondary' }]}
              compact
              className="mt-4"
            />
          )}

          {saveHistoryWarning && (
            <div
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              role="status"
              aria-live="polite"
            >
              <p>{saveHistoryWarning}</p>
              <button
                type="button"
                onClick={() => setSaveHistoryWarning(null)}
                className="mt-2 text-xs font-medium text-amber-800 underline hover:text-amber-950"
              >
                Entendido
              </button>
            </div>
          )}

          {activeSection === 'synthesis' && (
            <div className="mt-4 space-y-6">
              {methodRunner}
              {gematriaInterpretacion && (
                <GematriaInterpretacionPanel interpretacion={gematriaInterpretacion} />
              )}
              <FormativeReadingPanel brief={formativeBrief} loading={executeLoading} />
            </div>
          )}

          {activeSection === 'gematria' && (
            <div className="mt-4 space-y-4">
              {methodRunner}
              {pitagorasState ? (
                <PitagorasReport pitagorasState={pitagorasState} />
              ) : gematriaInterpretacion ? (
                <GematriaInterpretacionPanel interpretacion={gematriaInterpretacion} />
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  Ejecuta un método de gematría para ver la interpretación simbólica, o{' '}
                  <strong>Pitágoras</strong> para gráficos numéricos.
                </div>
              )}
            </div>
          )}

          {activeSection === 'resources' && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Material de apoyo en preparación. Usa la pestaña Síntesis para la lectura formativa del caso activo.
            </div>
          )}

          {activeSection === 'tree' && (
          <div id="cabala-aplicada-export-visual" className="mt-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div id="cabala-aplicada-export-tree" className="relative w-full h-72">
                {executeLoading ? (
                  <div
                    className="flex h-full items-center justify-center text-sm text-gray-500"
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    Analizando estructura simbólica…
                  </div>
                ) : treeStructuralState ? (
                  <TreeWithFlows
                    treeState={treeStructuralState}
                    size="responsive"
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <div
                    className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-gray-500"
                    role="status"
                  >
                    <p>Aún no hay análisis en el Árbol.</p>
                    <p className="text-xs text-gray-400">
                      Elige un método y pulsa <strong>Ejecutar</strong> para generar la estructura simbólica.
                    </p>
                  </div>
                )}
              </div>
            </div>
          {methodRunner}

          {formativeBrief && (
            <button
              type="button"
              onClick={() => onSectionChange?.('synthesis')}
              className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-left text-sm text-indigo-900 hover:bg-indigo-100"
            >
              <span className="font-semibold">Síntesis disponible</span>
              <span className="block text-xs text-indigo-700 mt-1">{formativeBrief.headline}</span>
            </button>
          )}

          <details className="rounded-lg border border-slate-200 bg-slate-50/80">
            <summary className="cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Datos estructurales (avanzado)
            </summary>
          <div className="grid gap-4 md:grid-cols-2 p-4 pt-0">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Sefirot activas</div>
              <div className="mt-2 text-xs">
                {executeLoading ? (
                  <span>Cargando...</span>
                ) : treeAnalysis?.graph.activeNodes.length ? (
                  <span>
                    {treeAnalysis.graph.activeNodes
                      .map((id) => {
                        const rank = treeAnalysis.ranking.find((r) => r.id === id);
                        return `${id} (${rank?.role ?? '-'}, ${rank?.activation.toFixed(2) ?? '-'})`;
                      })
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
                {executeLoading ? (
                  <span>Cargando...</span>
                ) : treeAnalysis?.graph.activePaths.length ? (
                  <span>{treeAnalysis.graph.activePaths.join(', ')}</span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500">Intensidad relativa</div>
              <div className="mt-2 text-xs">
                {executeLoading ? (
                  <span>Cargando...</span>
                ) : pdfSummary.repeticiones.length ? (
                  <span>
                    {pdfSummary.repeticiones
                      .map((item) => `${item.id} (${item.veces ?? '-'})`)
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
                {executeLoading ? (
                  <span>Cargando...</span>
                ) : treeAnalysis ? (
                  <span>
                    {Object.entries(treeAnalysis.pillarBalance)
                      .map(([key, value]) => `${key} (${value.toFixed(2)})`)
                      .join(', ')}
                  </span>
                ) : (
                  <span>No disponible</span>
                )}
              </div>
            </div>
          </div>
          <div className="mx-4 mb-4 rounded-lg border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-500">
            <span className="font-medium">Ejes:</span>{' '}
            {treeAnalysis ? (
              <>
                Severidad {treeAnalysis.pillarBalance.severity.toFixed(2)} · Misericordia{' '}
                {treeAnalysis.pillarBalance.mercy.toFixed(2)} · Equilibrio{' '}
                {treeAnalysis.pillarBalance.equilibrium.toFixed(2)}
              </>
            ) : (
              'No disponible'
            )}
            {' · '}
            <span className="font-medium">Polaridades:</span>{' '}
            {treeAnalysis ? (
              <>
                Armónica {treeAnalysis.polarityDistribution.harmonic.toFixed(2)} · Integrativa{' '}
                {treeAnalysis.polarityDistribution.integrative.toFixed(2)} · Tensional{' '}
                {treeAnalysis.polarityDistribution.tensional.toFixed(2)}
              </>
            ) : (
              'No disponible'
            )}
            {' · '}
            <span className="font-medium">Fuentes:</span>{' '}
            {treeStructuralState?.source.method
              ? `${treeStructuralState.source.method} (${treeStructuralState.source.mode})`
              : 'No disponible'}
          </div>
          </details>
          </div>
          )}
        </>
      )}

      {activeSection !== 'tree' && treeStructuralState && (
        <div
          className="pointer-events-none fixed left-[-99999px] top-0 z-[-1] h-72 w-[640px] overflow-hidden"
          aria-hidden="true"
        >
          <div id="cabala-aplicada-export-tree" className="relative h-full w-full">
            <TreeWithFlows
              treeState={treeStructuralState}
              size="responsive"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
