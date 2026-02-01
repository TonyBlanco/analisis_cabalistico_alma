'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Hash, Sparkles, Activity, Sun, Scale, Info } from 'lucide-react';
import type { CabalSectionId } from './types';
import { getActivePatientId } from '@/lib/active-patient';
import { getPatientProfileSummary, resolveConsultanteUuid, type PatientProfileSummary } from '@/lib/patient-api';
import { useTreeStructuralState } from '@/lib/tree-structural-state';
import TreeOfLifeSVG from '@/components/Tree/TreeOfLifeSVG';
import { TreeWithFlows } from '@/components/Tree';
import TreeVisualPlaceholder from './TreeVisualPlaceholder';
import { NarrativeIntegrationPanel } from './NarrativeIntegration';
import { CabalaAIAssistant } from './CabalaAIAssistant';
import GematriaReadingsPanel from './GematriaReadingsPanel';
import ResourcesPanel from './ResourcesPanel';
import { ejecutarMetodoPitagorico } from '@holistica/symbolic/methods/pitagoras';
import type { PitagorasSymbolicState, PitagorasNumberMeaning } from '@holistica/symbolic/methods/pitagoras/pitagoras.types';
import { adaptPitagorasToTree, type TreeStructuralState } from '@holistica/symbolic/tree';

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
import { saveCabalaAplicadaMethodRecord } from '@/lib/cabala-aplicada-api';

// P1/P2 New Section Components
import SoulMapVisualizer from './SoulMapVisualizer';
import CyclesTimeline from './CyclesTimeline';

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

// ============================================================================
// METHOD RESULTS PANEL - Muestra resultados detallados con interpretación
// ============================================================================

const METHOD_INTERPRETATIONS: Record<string, {
  title: string;
  description: string;
  tradition: string;
  usage: string;
}> = {
  'pitagoras': {
    title: 'Numerología Pitagórica',
    description: 'Sistema occidental basado en la reducción numérica del nombre y fecha de nacimiento.',
    tradition: 'Tradición greco-occidental adaptada a la Cábala práctica.',
    usage: 'Identifica números fundamentales (Esencia, Expresión, Herencia, Camino de Vida) y patrones de frecuencia.',
  },
  'gematria-standard': {
    title: 'Gematría Estándar (Mispar Hechrachi)',
    description: 'Sistema tradicional hebreo donde cada letra tiene un valor numérico fijo.',
    tradition: 'Base de toda la Gematría cabalística. Usada en Zohar y textos clásicos.',
    usage: 'Revela conexiones numéricas entre palabras, permite encontrar equivalencias y correspondencias.',
  },
  'gematria-katan': {
    title: 'Gematría Katan (Pequeña)',
    description: 'Reduce cada valor a un solo dígito (1-9), simplificando para análisis esencial.',
    tradition: 'Usado para revelar la esencia más profunda de un nombre o palabra.',
    usage: 'Ideal para comparaciones rápidas y encontrar la "raíz" numérica.',
  },
  'mispar-gadol': {
    title: 'Mispar Gadol (Grande)',
    description: 'Las letras finales (sofit) reciben valores mayores: ך=500, ם=600, ן=700, ף=800, ץ=900.',
    tradition: 'Representa el potencial oculto y la manifestación plena.',
    usage: 'Revela significados expandidos cuando las finales aparecen en posiciones clave.',
  },
  'mispar-siduri': {
    title: 'Mispar Siduri (Ordinal)',
    description: 'Usa la posición en el alfabeto: א=1, ב=2, ... ת=22.',
    tradition: 'Conecta con el orden de la creación y el proceso de emanación.',
    usage: 'Útil para análisis de secuencia y orden inherente en los nombres.',
  },
  'milui': {
    title: 'Milui (Expansión/Relleno)',
    description: 'Cada letra se expande a su nombre completo: א→אלף, ב→בית.',
    tradition: 'Revela el significado interno y potencial de cada letra.',
    usage: 'Descubre capas más profundas de significado al "desplegar" cada letra.',
  },
  'atbash': {
    title: 'Atbash',
    description: 'Cifrado por inversión del alfabeto: א↔ת, ב↔ש.',
    tradition: 'Mencionado en la Biblia (Jeremías 25:26, 51:41). Uno de los cifrados más antiguos.',
    usage: 'Revela significados ocultos o "invertidos", polaridades complementarias.',
  },
  'albam': {
    title: 'Albam',
    description: 'Intercambio entre mitades del alfabeto: א↔ל, ב↔מ (offset de 11).',
    tradition: 'Usado para revelar conexiones entre conceptos aparentemente distantes.',
    usage: 'Descubre relaciones complementarias y balances energéticos.',
  },
  'avgad': {
    title: 'Avgad',
    description: 'Cada letra avanza una posición: א→ב, ב→ג, ת→א.',
    tradition: 'Representa evolución, progreso y transformación.',
    usage: 'Muestra el potencial de desarrollo o "siguiente paso" de un concepto.',
  },
  'temurah': {
    title: 'Temurah (Permutación)',
    description: 'Sistema completo de transformaciones incluyendo Atbash, Albam, Avgad y Ayak Bakar.',
    tradition: 'Una de las tres técnicas principales de la Cábala junto con Gematría y Notarikón.',
    usage: 'Revela múltiples capas de significado oculto mediante diferentes cifrados.',
  },
  'notarikon': {
    title: 'Notarikón',
    description: 'Extracción de acrósticos (iniciales, finales, medias) de frases o nombres.',
    tradition: 'Técnica talmúdica usada para descifrar significados condensados.',
    usage: 'Encuentra mensajes ocultos en las iniciales, identifica correspondencias simbólicas.',
  },
};

// Interpretaciones detalladas para cada número 1-9 y maestros
const NUMBER_INTERPRETATIONS: Record<number, {
  essence: string;
  archetype: string;
  light: string;
  shadow: string;
  sefira: string;
  planet: string;
}> = {
  1: {
    essence: 'Unidad, origen, liderazgo, independencia',
    archetype: 'El Pionero, El Iniciador',
    light: 'Creatividad, originalidad, determinación, coraje',
    shadow: 'Egoísmo, aislamiento, terquedad',
    sefira: 'Keter (Corona)',
    planet: 'Sol',
  },
  2: {
    essence: 'Dualidad, cooperación, receptividad, equilibrio',
    archetype: 'El Mediador, El Diplomático',
    light: 'Sensibilidad, intuición, armonía, paciencia',
    shadow: 'Indecisión, dependencia, pasividad',
    sefira: 'Chokmah (Sabiduría)',
    planet: 'Luna',
  },
  3: {
    essence: 'Expresión, creatividad, comunicación, alegría',
    archetype: 'El Comunicador, El Artista',
    light: 'Optimismo, sociabilidad, inspiración, imaginación',
    shadow: 'Dispersión, superficialidad, exageración',
    sefira: 'Binah (Entendimiento)',
    planet: 'Júpiter',
  },
  4: {
    essence: 'Estructura, estabilidad, trabajo, fundamento',
    archetype: 'El Constructor, El Organizador',
    light: 'Disciplina, practicidad, lealtad, perseverancia',
    shadow: 'Rigidez, limitación, terquedad',
    sefira: 'Chesed (Misericordia)',
    planet: 'Urano',
  },
  5: {
    essence: 'Cambio, libertad, aventura, versatilidad',
    archetype: 'El Aventurero, El Liberador',
    light: 'Adaptabilidad, curiosidad, progreso, dinamismo',
    shadow: 'Inestabilidad, excesos, irresponsabilidad',
    sefira: 'Gevurah (Rigor)',
    planet: 'Mercurio',
  },
  6: {
    essence: 'Amor, responsabilidad, hogar, armonía',
    archetype: 'El Cuidador, El Maestro',
    light: 'Compasión, servicio, belleza, equilibrio',
    shadow: 'Perfeccionismo, sacrificio excesivo, control',
    sefira: 'Tiferet (Belleza)',
    planet: 'Venus',
  },
  7: {
    essence: 'Introspección, sabiduría, espiritualidad, análisis',
    archetype: 'El Buscador, El Místico',
    light: 'Profundidad, intuición, fe, perfección interior',
    shadow: 'Aislamiento, frialdad, escepticismo',
    sefira: 'Netzach (Victoria)',
    planet: 'Neptuno',
  },
  8: {
    essence: 'Poder, abundancia, manifestación, karma',
    archetype: 'El Ejecutivo, El Manifestador',
    light: 'Autoridad, éxito material, visión, eficiencia',
    shadow: 'Materialismo, dominación, ambición desmedida',
    sefira: 'Hod (Gloria)',
    planet: 'Saturno',
  },
  9: {
    essence: 'Culminación, humanitarismo, sabiduría universal',
    archetype: 'El Sabio, El Humanitario',
    light: 'Compasión universal, generosidad, inspiración',
    shadow: 'Dispersión, pérdidas, desapego excesivo',
    sefira: 'Yesod (Fundamento)',
    planet: 'Marte',
  },
  11: {
    essence: 'Número Maestro: Iluminación, intuición superior, visión',
    archetype: 'El Visionario, El Iluminador',
    light: 'Inspiración espiritual, liderazgo carismático, canal',
    shadow: 'Tensión nerviosa, hipersensibilidad, fanatismo',
    sefira: 'Daath (Conocimiento Oculto)',
    planet: 'Plutón',
  },
  22: {
    essence: 'Número Maestro: Constructor de lo imposible, visión práctica',
    archetype: 'El Maestro Constructor',
    light: 'Capacidad de manifestar grandes visiones, poder práctico',
    shadow: 'Presión autoimpuesta, frustración, tiranía',
    sefira: 'Malkuth elevado',
    planet: 'Urano superior',
  },
  33: {
    essence: 'Número Maestro: Maestro sanador, amor incondicional',
    archetype: 'El Maestro Espiritual',
    light: 'Compasión suprema, servicio desinteresado, curación',
    shadow: 'Martirio, abnegación excesiva',
    sefira: 'Keter inferior (manifestado)',
    planet: 'Neptuno superior',
  },
};

function getNumberInterpretation(num: number): typeof NUMBER_INTERPRETATIONS[1] | null {
  if (NUMBER_INTERPRETATIONS[num]) return NUMBER_INTERPRETATIONS[num];
  // Para números maestros que no están definidos, usar el reducido
  return null;
}

function MethodResultsPanel({ 
  methodId, 
  rawData 
}: { 
  methodId: string; 
  rawData: any; 
}) {
  const [expanded, setExpanded] = useState(true); // Abierto por defecto
  const methodInfo = METHOD_INTERPRETATIONS[methodId];
  
  if (!methodInfo || !rawData) return null;
  
  // Extraer datos calculados - buscar en rawData o directamente
  const rawDataInner = rawData.rawData || rawData;
  const calculo = rawDataInner.calculo;
  const correspondencia = rawDataInner.correspondencia;
  const numeros = rawDataInner.numeros;
  const identidad = rawDataInner.identidad;
  const casasInclusion = rawDataInner.casasInclusion;
  
  // Obtener interpretaciones para los números calculados
  const esenciaInterp = numeros?.esencia?.reducido ? getNumberInterpretation(numeros.esencia.reducido) : null;
  const expresionInterp = numeros?.expresion?.reducido ? getNumberInterpretation(numeros.expresion.reducido) : null;
  const herenciaInterp = numeros?.herencia?.reducido ? getNumberInterpretation(numeros.herencia.reducido) : null;
  const caminoVidaInterp = numeros?.caminoVida?.reducido ? getNumberInterpretation(numeros.caminoVida.reducido) : null;
  
  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm overflow-hidden">
      {/* Header - siempre visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">{methodInfo.title}</h4>
            <p className="text-xs text-gray-500">{methodInfo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Método Activo
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="border-t border-indigo-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Contexto del Método */}
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-indigo-700 mb-1">📜 Tradición</p>
                <p className="text-sm text-gray-700">{methodInfo.tradition}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-700 mb-1">🔮 Aplicación</p>
                <p className="text-sm text-gray-700">{methodInfo.usage}</p>
              </div>
            </div>
          </div>
          
          {/* Datos del Consultante con transliteración */}
          {identidad && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-3">👤 Análisis del Nombre</p>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="font-semibold text-gray-900">{identidad.nombreCompleto}</span>
                </div>
                {(identidad.hebrewTransliteration || identidad.hebrewOriginal) && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Transliteración hebrea:</span>
                    <span className="text-2xl font-bold text-indigo-700 tracking-wider">
                      {identidad.hebrewTransliteration || identidad.hebrewOriginal}
                    </span>
                  </div>
                )}
                {identidad.hebrewTransformed && identidad.hebrewTransformed !== identidad.hebrewOriginal && (
                  <div className="flex items-center gap-4 bg-purple-50 rounded p-2">
                    <span className="text-sm text-gray-600">Transformado ({methodId}):</span>
                    <span className="text-2xl font-bold text-purple-700 tracking-wider">
                      {identidad.hebrewTransformed}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Resultados Principales del Cálculo */}
          {calculo && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-3">📊 Resultados del Cálculo</p>
              
              {calculo.explicacion && (
                <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 p-2 rounded">{calculo.explicacion}</p>
              )}
              
              {/* Valores principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {calculo.valorTotal !== undefined && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 text-center">
                    <span className="text-xs text-indigo-600 block">Valor Total</span>
                    <span className="text-3xl font-bold text-indigo-700">{calculo.valorTotal}</span>
                  </div>
                )}
                {calculo.valorReducido?.reduced !== undefined && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                    <span className="text-xs text-purple-600 block">Reducido</span>
                    <span className="text-3xl font-bold text-purple-700">{calculo.valorReducido.reduced}</span>
                    {calculo.valorReducido.isMaster && (
                      <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1 rounded block mt-1">MAESTRO</span>
                    )}
                  </div>
                )}
                {calculo.valorOriginal !== undefined && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-600 block">Original</span>
                    <span className="text-3xl font-bold text-gray-700">{calculo.valorOriginal}</span>
                  </div>
                )}
                {calculo.valorTransformado !== undefined && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 text-center">
                    <span className="text-xs text-amber-600 block">Transformado</span>
                    <span className="text-3xl font-bold text-amber-700">{calculo.valorTransformado}</span>
                  </div>
                )}
              </div>
              
              {/* Palabras relacionadas */}
              {calculo.palabrasRelacionadas && calculo.palabrasRelacionadas.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">✨ Palabras con mismo valor numérico:</p>
                  <p className="text-lg font-bold text-yellow-800">
                    {calculo.palabrasRelacionadas.join(' • ')}
                  </p>
                  <p className="text-[10px] text-yellow-600 mt-1">
                    Estas palabras comparten resonancia numérica según la tradición cabalística.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Desglose por Palabra */}
          {calculo?.palabras && calculo.palabras.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-3">📝 Desglose por Palabra</p>
              <div className="space-y-2">
                {calculo.palabras.map((w: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{w.original}</span>
                      {(w.hebrew || w.hebrewOriginal) && (
                        <span className="text-xl text-indigo-600 font-bold">{w.hebrew || w.hebrewOriginal}</span>
                      )}
                      {w.hebrewTransformed && w.hebrewTransformed !== w.hebrewOriginal && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-xl text-purple-600 font-bold">{w.hebrewTransformed}</span>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800">
                        {w.value ?? w.valueKatan ?? w.valueGadol ?? w.valueSiduri ?? w.valueMilui ?? w.originalValue ?? '—'}
                      </span>
                      {w.reduced?.reduced && (
                        <span className="text-xs text-gray-500 ml-2">→ {w.reduced.reduced}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Transformaciones Temurah (solo para método temurah) */}
          {calculo?.transformaciones && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-3">🔄 Transformaciones Temurah</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(calculo.transformaciones)
                  .filter(([k]) => k !== 'original')
                  .map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 text-center border border-indigo-100">
                    <span className="text-[10px] text-indigo-600 block uppercase tracking-wide">{key}</span>
                    <span className="text-xl font-bold text-indigo-800 block my-1">{val.text}</span>
                    <span className="text-sm text-gray-600">= {val.value}</span>
                    <p className="text-[9px] text-gray-500 mt-1">{val.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* NÚMEROS FUNDAMENTALES CON INTERPRETACIONES */}
          {numeros && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-3">🔢 Números Fundamentales e Interpretación</p>
              
              <div className="space-y-4">
                {/* Esencia */}
                {numeros.esencia && (
                  <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-rose-600 uppercase">Esencia</span>
                          <span className="text-3xl font-bold text-rose-700">{numeros.esencia.reducido}</span>
                          <span className="text-xs text-rose-400">({numeros.esencia.original})</span>
                          {numeros.esencia.esMaestro && (
                            <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">MAESTRO</span>
                          )}
                        </div>
                        {esenciaInterp && (
                          <div className="space-y-1 text-xs">
                            <p className="text-rose-800"><strong>Arquetipo:</strong> {esenciaInterp.archetype}</p>
                            <p className="text-rose-700"><strong>Esencia:</strong> {esenciaInterp.essence}</p>
                            <p className="text-green-700"><strong>Luz:</strong> {esenciaInterp.light}</p>
                            <p className="text-amber-700"><strong>Sombra:</strong> {esenciaInterp.shadow}</p>
                            <p className="text-indigo-600"><strong>Sefirá:</strong> {esenciaInterp.sefira} • <strong>Planeta:</strong> {esenciaInterp.planet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Expresión */}
                {numeros.expresion && (
                  <div className="bg-gradient-to-r from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-sky-600 uppercase">Expresión</span>
                          <span className="text-3xl font-bold text-sky-700">{numeros.expresion.reducido}</span>
                          <span className="text-xs text-sky-400">({numeros.expresion.original})</span>
                        </div>
                        {expresionInterp && (
                          <div className="space-y-1 text-xs">
                            <p className="text-sky-800"><strong>Arquetipo:</strong> {expresionInterp.archetype}</p>
                            <p className="text-sky-700"><strong>Esencia:</strong> {expresionInterp.essence}</p>
                            <p className="text-green-700"><strong>Luz:</strong> {expresionInterp.light}</p>
                            <p className="text-amber-700"><strong>Sombra:</strong> {expresionInterp.shadow}</p>
                            <p className="text-indigo-600"><strong>Sefirá:</strong> {expresionInterp.sefira} • <strong>Planeta:</strong> {expresionInterp.planet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Herencia */}
                {numeros.herencia && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-amber-600 uppercase">Herencia</span>
                          <span className="text-3xl font-bold text-amber-700">{numeros.herencia.reducido}</span>
                          <span className="text-xs text-amber-400">({numeros.herencia.original})</span>
                        </div>
                        {herenciaInterp && (
                          <div className="space-y-1 text-xs">
                            <p className="text-amber-800"><strong>Arquetipo:</strong> {herenciaInterp.archetype}</p>
                            <p className="text-amber-700"><strong>Esencia:</strong> {herenciaInterp.essence}</p>
                            <p className="text-green-700"><strong>Luz:</strong> {herenciaInterp.light}</p>
                            <p className="text-red-700"><strong>Sombra:</strong> {herenciaInterp.shadow}</p>
                            <p className="text-indigo-600"><strong>Sefirá:</strong> {herenciaInterp.sefira} • <strong>Planeta:</strong> {herenciaInterp.planet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Camino de Vida */}
                {numeros.caminoVida && (
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-emerald-600 uppercase">Camino de Vida</span>
                          <span className="text-3xl font-bold text-emerald-700">{numeros.caminoVida.reducido}</span>
                          <span className="text-xs text-emerald-400">({numeros.caminoVida.original})</span>
                          {numeros.caminoVida.esMaestro && (
                            <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">MAESTRO</span>
                          )}
                        </div>
                        {caminoVidaInterp && (
                          <div className="space-y-1 text-xs">
                            <p className="text-emerald-800"><strong>Arquetipo:</strong> {caminoVidaInterp.archetype}</p>
                            <p className="text-emerald-700"><strong>Esencia:</strong> {caminoVidaInterp.essence}</p>
                            <p className="text-green-700"><strong>Luz:</strong> {caminoVidaInterp.light}</p>
                            <p className="text-amber-700"><strong>Sombra:</strong> {caminoVidaInterp.shadow}</p>
                            <p className="text-indigo-600"><strong>Sefirá:</strong> {caminoVidaInterp.sefira} • <strong>Planeta:</strong> {caminoVidaInterp.planet}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Correspondencia Sefirótica */}
          {correspondencia && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs font-semibold text-amber-700 mb-3">🌳 Correspondencia Sefirótica</p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Sefirá Principal</span>
                  <span className="text-2xl font-bold text-amber-700">{correspondencia.sefira || correspondencia.sefiraOriginal}</span>
                  {correspondencia.sefirahHebrew && (
                    <span className="text-3xl block">{correspondencia.sefirahHebrew}</span>
                  )}
                  {correspondencia.sefirahMeaning && (
                    <span className="text-xs text-gray-600 block">({correspondencia.sefirahMeaning})</span>
                  )}
                </div>
                {correspondencia.sefiraTransformada && correspondencia.sefiraTransformada !== (correspondencia.sefira || correspondencia.sefiraOriginal) && (
                  <>
                    <span className="text-2xl text-gray-400">→</span>
                    <div className="text-center">
                      <span className="text-xs text-gray-500 block">Transformada</span>
                      <span className="text-2xl font-bold text-purple-700">{correspondencia.sefiraTransformada}</span>
                    </div>
                  </>
                )}
              </div>
              {correspondencia.cambioEnergetico && correspondencia.cambioEnergetico !== 'Sin cambio de correspondencia' && (
                <p className="mt-3 text-sm text-amber-700 bg-amber-100 p-2 rounded">
                  <strong>Cambio energético:</strong> {correspondencia.cambioEnergetico}
                </p>
              )}
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-700">
                <strong>Nota formativa:</strong> Estos cálculos son herramientas de exploración simbólica y autoconocimiento. 
                No constituyen diagnóstico ni recomendación terapéutica. La interpretación requiere contexto profesional.
              </p>
            </div>
          </div>
        </div>
      )}
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
  const [consultantUuid, setConsultantUuid] = useState<string | null>(null);  // UUID para APIs de consultante
  const [patientProfile, setPatientProfile] = useState<PatientProfileSummary | null>(null);
  const [pitagorasState, setPitagorasState] = useState<PitagorasSymbolicState | null>(null);
  const [treeStructuralState, setTreeStructuralState] = useState<TreeStructuralState | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('pitagoras');
  const [clinicalContext, setClinicalContext] = useState<ClinicalContextSummary | null>(null);

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
        setConsultantUuid(null);
        setClinicalContext(null);
        return;
      }
      try {
        const profile = await getPatientProfileSummary(patientId);
        if (isMounted) {
          setPatientProfile(profile);
        }
        // Resolver UUID del consultante para APIs de innovaciones
        const uuid = await resolveConsultanteUuid(patientId);
        if (isMounted) {
          setConsultantUuid(uuid);
        }
      } catch (error) {
        if (isMounted) {
          setPatientProfile(null);
          setConsultantUuid(null);
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
        const token = localStorage.getItem('authToken') || '';
        const response = await fetch(`/api/swm/cabala/clinical-summary/${activePatientId}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
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

  // ============================================================================
  // SECTION TITLE MAPPING
  // ============================================================================
  const sectionTitles: Record<string, { title: string; description: string }> = {
    'tree': { title: 'Árbol de la Vida', description: 'Estado estructural observacional (v0.1).' },
    'gematria': { title: 'Gematría', description: 'Espacio observacional de valores numéricos.' },
    'soul-map': { title: 'Mapa del Alma', description: 'Mapa simbólico de resonancias sefiróticas.' },
    'cycles': { title: 'Ciclos Tikún', description: 'Línea temporal de ciclos evolutivos.' },
    'notarikon': { title: 'Notarikón', description: 'Análisis de acrónimos y síntesis.' },
    'shadow-work': { title: 'Trabajo de Sombras', description: 'Qliphoth, polaridades y sombras numéricas.' },
    'sefirot-radar': { title: 'Radar de Desequilibrios', description: 'Visualización integrando tests clínicos, biografía y cálculos cabalísticos.' },
    'multi-system': { title: 'Integración Multi-Sistema', description: 'Diálogo simbólico entre Cábala, Tarot, Astrología, Bio-Emociones y Transgeneracional.' },
    'synthesis': { title: 'Síntesis', description: 'Notas humanas de integración.' },
    'ai-assistant': { title: 'IA Asistida', description: 'Asistente ético de exploración textual.' },
    'resources': { title: 'Recursos', description: 'Material consultivo de apoyo.' },
  };

  const currentSection = sectionTitles[activeSection] || sectionTitles['tree'];

  // ============================================================================
  // CONDITIONAL SECTION RENDERING
  // ============================================================================
  
  // Soul Map Section
  if (activeSection === 'soul-map') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentSection.title}</h3>
            <p className="text-xs text-gray-500">{currentSection.description}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            Sección activa: <span className="font-medium text-indigo-600">{currentSection.title}</span>
          </div>
        </div>
        {!activePatientId ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Seleccione un consultante para ver el Mapa del Alma.
          </div>
        ) : (
          <SoulMapVisualizer
            consultanteId={activePatientId}
            consultanteName={patientProfile?.legal_full_name || null}
            birthDate={patientProfile?.birth_date || null}
          />
        )}
      </section>
    );
  }

  // Cycles Section
  if (activeSection === 'cycles') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentSection.title}</h3>
            <p className="text-xs text-gray-500">{currentSection.description}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            Sección activa: <span className="font-medium text-indigo-600">{currentSection.title}</span>
          </div>
        </div>
        {!activePatientId ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Seleccione un consultante para ver los Ciclos Tikún.
          </div>
        ) : (
          <CyclesTimeline
            consultanteId={activePatientId}
            birthDate={patientProfile?.birth_date || null}
          />
        )}
      </section>
    );
  }

  // Notarikon Section (uses tree view with notarikon method pre-selected)
  if (activeSection === 'notarikon') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentSection.title}</h3>
            <p className="text-xs text-gray-500">{currentSection.description}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            Sección activa: <span className="font-medium text-indigo-600">{currentSection.title}</span>
          </div>
        </div>
        {!activePatientId ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Seleccione un consultante para aplicar el método Notarikón.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Árbol de la Vida con estado estructural */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div id="notarikon-tree-visual" className="relative w-full h-72">
                {treeStructuralState ? (
                  <TreeWithFlows
                    treeState={treeStructuralState}
                    size="responsive"
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
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

            {/* Panel de Notarikón */}
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm text-indigo-700 font-medium">
                Método Notarikón
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Extrae las iniciales del nombre completo para formar acrónimos cabalísticos.
              </p>
              {patientProfile?.legal_full_name && (() => {
                const initials = patientProfile.legal_full_name.split(/\s+/).map(w => w[0]?.toUpperCase()).filter(Boolean);
                const acronym = initials.join('');
                
                // Diccionario de correspondencias simbólicas por letra latina
                const letterSymbology: Record<string, { hebrew: string; sefira: string; meaning: string; archetype: string }> = {
                  'A': { hebrew: 'א (Aleph)', sefira: 'Keter', meaning: 'Aliento divino, inicio, unidad primordial', archetype: 'El principio creador' },
                  'B': { hebrew: 'ב (Bet)', sefira: 'Chokmah', meaning: 'Casa, recipiente, morada interior', archetype: 'El constructor' },
                  'C': { hebrew: 'כ (Kaf)', sefira: 'Chesed', meaning: 'Palma de la mano, capacidad de dar', archetype: 'El que bendice' },
                  'D': { hebrew: 'ד (Dalet)', sefira: 'Malkuth', meaning: 'Puerta, portal, acceso', archetype: 'El umbral' },
                  'E': { hebrew: 'ה (He)', sefira: 'Binah', meaning: 'Ventana, revelación, insight', archetype: 'La comprensión' },
                  'F': { hebrew: 'פ (Pe)', sefira: 'Netzach', meaning: 'Boca, expresión, manifestación', archetype: 'La voz creativa' },
                  'G': { hebrew: 'ג (Gimel)', sefira: 'Chesed', meaning: 'Camello, movimiento, generosidad', archetype: 'El benefactor' },
                  'H': { hebrew: 'ח (Chet)', sefira: 'Binah', meaning: 'Cerca, protección, límite sagrado', archetype: 'El guardián' },
                  'I': { hebrew: 'י (Yod)', sefira: 'Chokmah', meaning: 'Mano, chispa divina, potencial', archetype: 'La semilla' },
                  'J': { hebrew: 'י (Yod)', sefira: 'Chokmah', meaning: 'Mano creadora, punto de origen', archetype: 'El iniciador' },
                  'K': { hebrew: 'כ (Kaf)', sefira: 'Chesed', meaning: 'Corona, capacidad receptiva', archetype: 'El receptor' },
                  'L': { hebrew: 'ל (Lamed)', sefira: 'Tiferet', meaning: 'Aguijón, aprendizaje, enseñanza', archetype: 'El maestro' },
                  'M': { hebrew: 'מ (Mem)', sefira: 'Chesed', meaning: 'Agua, flujo, emociones', archetype: 'Las aguas primordiales' },
                  'N': { hebrew: 'נ (Nun)', sefira: 'Netzach', meaning: 'Pez, continuidad, descendencia', archetype: 'La perseverancia' },
                  'O': { hebrew: 'ע (Ayin)', sefira: 'Tiferet', meaning: 'Ojo, visión interior, percepción', archetype: 'El vidente' },
                  'P': { hebrew: 'פ (Pe)', sefira: 'Netzach', meaning: 'Boca, palabra, poder del habla', archetype: 'El orador' },
                  'Q': { hebrew: 'ק (Qof)', sefira: 'Netzach', meaning: 'Ojo de aguja, transformación', archetype: 'El transformador' },
                  'R': { hebrew: 'ר (Resh)', sefira: 'Hod', meaning: 'Cabeza, mente, pensamiento', archetype: 'El pensador' },
                  'S': { hebrew: 'ס (Samekh)', sefira: 'Yesod', meaning: 'Apoyo, sostén, fundamento', archetype: 'El pilar' },
                  'T': { hebrew: 'ת (Tav)', sefira: 'Malkuth', meaning: 'Marca, sello, completitud', archetype: 'El sello final' },
                  'U': { hebrew: 'ו (Vav)', sefira: 'Tiferet', meaning: 'Gancho, conexión, unión', archetype: 'El conector' },
                  'V': { hebrew: 'ו (Vav)', sefira: 'Tiferet', meaning: 'Columna, enlace cielo-tierra', archetype: 'El puente' },
                  'W': { hebrew: 'ו (Vav doble)', sefira: 'Tiferet', meaning: 'Doble conexión, armonía', archetype: 'El equilibrador' },
                  'X': { hebrew: 'צ (Tzadi)', sefira: 'Yesod', meaning: 'Anzuelo, justicia, rectitud', archetype: 'El justo' },
                  'Y': { hebrew: 'י (Yod)', sefira: 'Chokmah', meaning: 'Mano divina, punto creativo', archetype: 'La chispa' },
                  'Z': { hebrew: 'ז (Zayin)', sefira: 'Geburah', meaning: 'Espada, discernimiento, corte', archetype: 'El guerrero espiritual' },
                };
                
                return (
                  <div className="mt-3 space-y-4">
                    {/* Resumen básico */}
                    <div className="p-3 bg-white rounded-md border border-indigo-200">
                      <p className="text-xs text-gray-500">Nombre analizado:</p>
                      <p className="text-sm font-medium text-gray-900">{patientProfile.legal_full_name}</p>
                      <p className="text-xs text-gray-500 mt-2">Iniciales:</p>
                      <p className="text-lg font-bold text-indigo-700 tracking-wider">{acronym}</p>
                    </div>
                    
                    {/* Interpretación simbólica de cada letra */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        <p className="text-sm font-semibold text-amber-900">
                          Correspondencias Simbólicas (Educativo)
                        </p>
                      </div>
                      <div className="space-y-3">
                        {initials.map((letter, idx) => {
                          const word = (patientProfile.legal_full_name || '').split(/\s+/)[idx] || '';
                          const symbolData = letterSymbology[letter] || { 
                            hebrew: '—', sefira: '—', meaning: 'Sin correspondencia directa', archetype: '—' 
                          };
                          return (
                            <div key={idx} className="p-3 bg-white rounded-md border border-amber-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-indigo-700">{letter}</span>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">{word}</span>
                                    <span className="text-gray-400 mx-2">→</span>
                                    <span className="text-amber-700 font-medium">{symbolData.hebrew}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Sefirá: <span className="text-indigo-600 font-medium">{symbolData.sefira}</span>
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-amber-800 mt-2 italic">
                                "{symbolData.meaning}"
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                Arquetipo: {symbolData.archetype}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-amber-200 text-[10px] text-amber-600">
                        ⚠ Este contenido es puramente simbólico y formativo. La interpretación final 
                        corresponde al terapeuta en contexto de la sesión.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Selector de método y ejecución */}
            <div className="flex items-center gap-3">
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
              <span className="text-xs text-gray-500">Ejecutar método seleccionado (observacional)</span>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Synthesis Section - P2.3 Narrative Integration
  if (activeSection === 'synthesis') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <NarrativeIntegrationPanel
          consultanteId={activePatientId}
          consultanteName={patientProfile?.legal_full_name || null}
          activeSefira={highlightedSefirot[0] as string | undefined}
          activeMethod={selectedMethod}
        />
      </section>
    );
  }

  // AI Assistant Section (P3 - IA Asistida)
  if (activeSection === 'ai-assistant') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <CabalaAIAssistant
          consultanteId={activePatientId ?? undefined}
          selectedSefira={highlightedSefirot[0] as string | undefined}
          workspaceNotes={[]} // TODO: Integrate with NarrativeIntegration notes
        />
      </section>
    );
  }

  // Shadow Work Section (Qliphoth & Polarities)
  if (activeSection === 'shadow-work') {
    // Extract active sefirot and missing numbers from pitagoras state
    const activeSefirot: string[] = [];
    
    // Get ausencias from rawData within pitagorasState
    const pitagorasRawData = pitagorasState?.rawData;
    const ausencias = pitagorasRawData?.inclusion?.ausencias || [];
    const dominantes = pitagorasRawData?.inclusion?.dominantes || [];
    const caminoVida = pitagorasRawData?.numeros?.caminoVida?.reducido;
    
    // Get sefirot from highlighted or derive from inclusion map
    if (highlightedSefirot && highlightedSefirot.length > 0) {
      activeSefirot.push(...(highlightedSefirot as string[]));
    } else if (pitagorasState?.inclusionMap) {
      // Derive from pitagoras state - numbers present indicate active sefirot
      const numberToSefira: Record<number, string> = {
        1: 'keter', 2: 'chokmah', 3: 'binah',
        4: 'chesed', 5: 'gevurah', 6: 'tiferet',
        7: 'netzach', 8: 'hod', 9: 'yesod',
      };
      
      // Mark sefirot as active if their number is dominant (not absent)
      Object.entries(pitagorasState.inclusionMap).forEach(([numStr, data]) => {
        const num = parseInt(numStr);
        if (!data.isAbsent && numberToSefira[num]) {
          activeSefirot.push(numberToSefira[num]);
        }
      });
    }

    // Dynamic import of ShadowWorkPanel
    const ShadowWorkPanel = require('./ShadowWorkPanel').default;
    
    return (
      <section className="flex-1">
        <ShadowWorkPanel
          activeSefirot={activeSefirot}
          missingNumbers={ausencias}
          dominantNumber={caminoVida}
          ausencias={ausencias}
          sobrantes={dominantes}
        />
      </section>
    );
  }

  // Sefirot Radar Section (Desequilibrios)
  if (activeSection === 'sefirot-radar') {
    // Dynamic import of SefirotRadarPanel
    const SefirotRadarPanel = require('./SefirotRadarPanel').default;
    
    // Extract pitagoras data from current state
    const pitagorasRawData = pitagorasState?.rawData;
    const pitagorasData = pitagorasRawData ? {
      ausencias: pitagorasRawData?.inclusion?.ausencias || [],
      dominantes: pitagorasRawData?.inclusion?.dominantes || [],
      caminoVida: pitagorasRawData?.numeros?.caminoVida?.reducido,
    } : undefined;
    
    return (
      <section className="flex-1">
        <SefirotRadarPanel
          consultantId={activePatientId ?? undefined}
          pitagorasData={pitagorasData}
          onRadarGenerated={(result: unknown) => {
            console.log('[CabalAppliedVisualCore] Sefirot Radar generated:', result);
          }}
        />
      </section>
    );
  }

  // Multi-System Integration Section
  if (activeSection === 'multi-system') {
    // Dynamic import of MultiSystemIntegrationPanel
    const MultiSystemIntegrationPanel = require('./MultiSystemIntegrationPanel').default;
    
    return (
      <section className="flex-1">
        <MultiSystemIntegrationPanel
          consultantId={activePatientId ?? undefined}
          consultantBirthDate={patientProfile?.birth_date ? new Date(patientProfile.birth_date) : undefined}
          onSaveReport={(report: unknown) => {
            console.log('[CabalAppliedVisualCore] Integration report generated:', report);
            // TODO: Save report to backend or state
          }}
        />
      </section>
    );
  }

  // ============================================================================
  // INNOVACIONES TERAPÉUTICAS (4 nuevos módulos)
  // ============================================================================

  // Sincronías Biográficas Section
  if (activeSection === 'sincronias') {
    const SincroniasPanel = require('./SincroniasPanel').default;
    
    return (
      <section className="flex-1">
        <SincroniasPanel
          birthDate={patientProfile?.birth_date || ''}
          consultantUuid={consultantUuid || undefined}
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          onSincroniasLoaded={(result: unknown) => {
            console.log('[CabalAppliedVisualCore] Sincronías detected:', result);
          }}
        />
        {!patientProfile?.birth_date && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm">
            ⚠️ Selecciona un consultante con fecha de nacimiento para detectar sincronías.
          </div>
        )}
      </section>
    );
  }

  // Alertas Preventivas Section
  if (activeSection === 'alertas-preventivas') {
    const AlertasPreventivasPanel = require('./AlertasPreventivasPanel').default;
    
    return (
      <section className="flex-1">
        <AlertasPreventivasPanel
          birthDate={patientProfile?.birth_date || ''}
          consultantUuid={consultantUuid || undefined}
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          monthsAhead={3}
          onAlertsLoaded={(result: unknown) => {
            console.log('[CabalAppliedVisualCore] Alertas generated:', result);
          }}
        />
        {!patientProfile?.birth_date && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            ⚠️ Selecciona un consultante con fecha de nacimiento para generar alertas.
          </div>
        )}
      </section>
    );
  }

  // Exportación Narrativa Section
  if (activeSection === 'exportacion-narrativa') {
    const ExportacionNarrativaPanel = require('./ExportacionNarrativaPanel').default;
    
    // Preparar datos del viaje terapéutico
    const journeyData = {
      events: [] as Array<{date: string; type: string; description: string}>,
      insights: [] as string[],
      transformations: [] as string[],
      current_sefira: pitagorasState?.primaryNumbers?.[0]?.meaning?.titulo || undefined,
    };
    
    return (
      <section className="flex-1">
        <ExportacionNarrativaPanel
          birthDate={patientProfile?.birth_date || ''}
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          consultanteUuid={consultantUuid || undefined}
          journeyData={journeyData}
          onExportGenerated={(doc: unknown) => {
            console.log('[CabalAppliedVisualCore] Export generated:', doc);
          }}
        />
        {!patientProfile?.birth_date && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            ⚠️ Selecciona un consultante con fecha de nacimiento para generar exportaciones.
          </div>
        )}
      </section>
    );
  }

  // Calendario Cósmico Section
  if (activeSection === 'calendario-cosmico') {
    const CalendarioCosmicPanel = require('./CalendarioCosmicPanel').default;
    
    return (
      <section className="flex-1">
        <CalendarioCosmicPanel
          birthDate={patientProfile?.birth_date || undefined}
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          onContextLoaded={(context: unknown) => {
            console.log('[CabalAppliedVisualCore] Cosmic context loaded:', context);
          }}
        />
      </section>
    );
  }

  // INNOVACIÓN 4: Laboratorio de Nombres (Gematría Relacional Familiar)
  if (activeSection === 'laboratorio-nombres') {
    const LaboratorioNombresPanel = require('./LaboratorioNombresPanel').default;
    
    return (
      <section className="flex-1">
        <LaboratorioNombresPanel
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || ''}
          onAnalysisComplete={(analysis: unknown) => {
            console.log('[CabalAppliedVisualCore] Name analysis completed:', analysis);
          }}
        />
      </section>
    );
  }

  // INNOVACIÓN 5: Meditaciones Personalizadas por Sefirá
  if (activeSection === 'meditaciones') {
    const MeditacionesPersonalizadasPanel = require('./MeditacionesPersonalizadasPanel').default;
    
    return (
      <section className="flex-1">
        <MeditacionesPersonalizadasPanel
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          onMeditationGenerated={(meditation: unknown) => {
            console.log('[CabalAppliedVisualCore] Meditation generated:', meditation);
          }}
        />
      </section>
    );
  }

  // INNOVACIÓN 13: Árbol Vivo (Gamificación)
  if (activeSection === 'arbol-vivo') {
    const ArbolVivoPanel = require('./ArbolVivoPanel').default;
    
    return (
      <section className="flex-1">
        <ArbolVivoPanel
          consultanteUuid={consultantUuid || undefined}
          consultantName={patientProfile?.full_name || patientProfile?.legal_full_name || 'Consultante'}
          onProgressUpdated={(progress: unknown) => {
            console.log('[CabalAppliedVisualCore] Arbol Vivo progress updated:', progress);
          }}
        />
      </section>
    );
  }

  // Resources Section
  if (activeSection === 'resources') {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
        <ResourcesPanel />
      </section>
    );
  }

  // DEFAULT: Tree/Gematria Section (original content)
  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{currentSection.title}</h3>
          <p className="text-xs text-gray-500">{currentSection.description}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Sección activa: <span className="font-medium text-indigo-600">{currentSection.title}</span>
        </div>
      </div>
      <TreeVisualPlaceholder />
      {!activePatientId ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Seleccione un consultante para ver el Árbol de la Vida.
        </div>
      ) : (
        <>
          {/* Clinical Context Integration Badges */}
          <ClinicalContextBadges context={clinicalContext} />
          
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

          {/* Method Results Panel - Muestra detalles con interpretación (ANTES del Informe Pitagórico) */}
          {pitagorasState && selectedMethod && (
            <MethodResultsPanel
              methodId={selectedMethod}
              rawData={pitagorasState}
            />
          )}

          {/* Pitagoras Professional Report (solo UI, no persistencia) */}
          {pitagorasState && (
            <PitagorasReport
              pitagorasState={pitagorasState}
              treeState={state}
              treeLoading={loading}
            />
          )}
          
          {/* Gematria Readings Panel - Guardar lecturas y generar síntesis */}
          {activePatientId && patientProfile && (
            <div className="mt-6">
              <GematriaReadingsPanel
                patientId={activePatientId}
                patientName={patientProfile.legal_full_name || 'Consultante'}
                currentReading={pitagorasState ? {
                  method: selectedMethod,
                  methodDisplay: METHODS.find((m: any) => m.id === selectedMethod)?.name || selectedMethod,
                  inputName: patientProfile.legal_full_name || '',
                  inputBirthDate: patientProfile.birth_date || undefined,
                  hebrewTransliteration: (pitagorasState.rawData as any)?.identidad?.hebrewTransliteration || '',
                  calculatedNumbers: (pitagorasState.rawData as any)?.numeros || {},
                  calculationDetails: (pitagorasState.rawData as any)?.calculo || {},
                  sefirotCorrespondence: (pitagorasState.rawData as any)?.correspondencia || {},
                  numberInterpretations: {},
                  methodInterpretation: '',
                } : null}
                onSaveSuccess={() => {
                  // Optional: refresh or show feedback
                }}
              />
            </div>
          )}
          </div>
        </>
      )}
    </section>
  );
}
