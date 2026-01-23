import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileJson,
  Activity,
  Calendar,
  Tag,
  X
} from 'lucide-react';
import ExplorationSuggestionModal from '@/components/ExplorationSuggestionModal';
import ResultSuggestionsCard, { Suggestion } from './ResultSuggestionsCard';
import { ResponseDetail } from '@/lib/test-types';

export type ReadableResultProps = {
  resultData: any;
  resultId?: number | string;
  showRaw?: boolean;
  testName?: string;
  testCode?: string;
  date?: string;
  isTherapist?: boolean;
  executionMode?: string;
  // For mcmi4-signal: detailed responses with item texts
  responsesDetail?: ResponseDetail[];
  therapistSuggestion?: {
    current_world?: string | null;
    next_world?: string | null;
    suggested_test_code?: string | null;
    suggested_test_name?: string | null;
    secondary_suggestions?: Array<{ code?: string | null; name?: string | null }>;
  };
  onClose?: () => void;
};

function normalizeList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v));
  return [String(value)];
}

function titleize(key: string): string {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

const DEFAULT_DISCLAIMER =
  'Este resultado es orientativo y no constituye un diagnóstico. Su interpretación corresponde al acompañamiento profesional.';

const normalizePercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.max(0, Math.min(100, numeric));
};

const getIntensityDescriptor = (value: number | null) => {
  if (value === null) return 'Nivel en movimiento';
  if (value >= 70) return 'Impulso vibrante';
  if (value >= 40) return 'Flujo armónico';
  return 'Susurro sereno';
};

const ReferenceBadge = ({ value }: { value: number | null }) => {
  if (value === null) return null;
  return (
    <span
      title={`Referencia técnica: ${value}`}
      className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-2 py-0.5 border border-slate-200 rounded-full"
    >
      Referencia técnica
    </span>
  );
};

const getDomainPercent = (domainValue: any) => {
  if (domainValue && typeof domainValue === 'object') {
    const raw = domainValue.percent_0_100 ?? domainValue.percent ?? domainValue.value;
    return normalizePercent(raw);
  }
  if (typeof domainValue === 'number') {
    return normalizePercent(domainValue);
  }
  return null;
};

const getDomainDescriptor = (domainValue: any) => {
  const percent = getDomainPercent(domainValue);
  if (percent !== null) {
    return getIntensityDescriptor(percent);
  }
  const avg = domainValue?.avg_0_4 ?? domainValue?.avg ?? null;
  const normalizedAvg = normalizePercent(avg && (avg / 4) * 100);
  if (normalizedAvg !== null) {
    return getIntensityDescriptor(normalizedAvg);
  }
  return 'Ritmo simbólico';
};

export default function ReadableResult({
  resultData,
  resultId: propResultId,
  showRaw = false,
  testName,
  testCode,
  date,
  isTherapist: propsIsTherapist,
  executionMode,
  responsesDetail,
  therapistSuggestion,
  onClose
}: ReadableResultProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showResponses, setShowResponses] = useState(false);


  const payload: any = resultData?.result ?? resultData ?? {};
  const puntuaciones = payload?.puntuaciones || {};

  const index =
    payload.index ??
    puntuaciones.indice_0_100 ??
    puntuaciones.indice_bienestar_0_100 ??
    puntuaciones.indice_malestar_0_100 ??
    null;
  const level = payload.level ?? puntuaciones.nivel ?? null;

  const totalScore = payload.total_score ?? payload.score ?? null;
  const activationGrade =
    payload.activation_grade ??
    payload.grado_activacion ??
    payload.severity_label ??
    payload.clinical_diagnosis ??
    level ??
    null;
  const intensityReference = normalizePercent(totalScore ?? index);
  const intensityLabel =
    activationGrade || (intensityReference !== null ? getIntensityDescriptor(intensityReference) : 'Nivel en movimiento');

  const summary = payload.summary_text ?? payload.interpretacion?.resumen ?? payload.resumen ?? null;
  const strengths = normalizeList(payload.map?.strengths ?? payload.interpretacion?.fortalezas);
  const focusAreas = normalizeList(payload.map?.focus_areas ?? payload.interpretacion?.areas_enfoque);
  const recommendations = normalizeList(payload.suggested_steps ?? payload.recomendaciones);
  const disclaimer = payload.disclaimer ?? payload.alertas?.nota ?? payload.alerta ?? null;

  const structuredData = payload?.structured_data ?? null;
  const rhythmState = structuredData?.rhythm_state ?? null;
  const rhythmStateLabelMap: Record<string, string> = {
    anchored: 'Anclado',
    fluctuating: 'Fluctuante',
    fragmented: 'Fragmentado',
  };
  const rhythmStateLabel = rhythmState ? (rhythmStateLabelMap[rhythmState] || rhythmState) : null;

  // Safe checks for rendering

  // Extract flags
  const flags = payload.flags && typeof payload.flags === 'object' ? payload.flags : {};
  const activeFlags = Object.entries(flags)
    .filter(([_, val]) => val === true)
    .map(([key]) => key);

  const domains = payload.puntuaciones?.dominios && typeof payload.puntuaciones.dominios === 'object'
    ? payload.puntuaciones.dominios
    : null;

  // Effective therapist suggestion: prefer explicit prop, fallback to payload key
  const therapistSuggestionEffective =
    therapistSuggestion || payload?.therapist_next_exploration_suggestion || null;
  // DEBUG: log incoming therapist suggestion
  // eslint-disable-next-line no-console
  console.log('DEBUG ReadableResult - therapistSuggestion (effective):', therapistSuggestionEffective);

  // Determine therapist role: prefer explicit prop, fallback to executionMode heuristic
  const isTherapist = typeof propsIsTherapist !== 'undefined' ? propsIsTherapist : (executionMode && executionMode !== 'patient_self');

  // result id to key sessionStorage
  const resultId = propResultId ?? payload?.id ?? payload?.result?.id ?? null;
  const sessionKey = resultId ? `suggestion_seen_${resultId}` : null;
  const autoOpenedRef = React.useRef(false);

  // DEBUG: quick state dump to help trace why auto-open may not run
  // eslint-disable-next-line no-console
  console.log('[DEBUG]', {
    isTherapist,
    resultId,
    hasSuggestion: Boolean(payload?.therapist_next_exploration_suggestion),
    suggestion: payload?.therapist_next_exploration_suggestion,
  });

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[DEBUG useEffect fired]');
    if (!sessionKey) return;
    if (!isTherapist) return;
    if (!therapistSuggestionEffective) return;
    try {
      const seen = sessionStorage.getItem(sessionKey);
      if (!seen && !autoOpenedRef.current) {
        setShowSuggestionModal(true);
        autoOpenedRef.current = true;
        // do not mark as seen here; mark on close to allow manual re-open before closing
      }
    } catch (e) {
      // sessionStorage may be unavailable; ignore
    }
  }, [sessionKey, isTherapist, therapistSuggestionEffective]);

  const handleSuggestionModalClose = () => {
    setShowSuggestionModal(false);
    if (!sessionKey) return;
    try {
      sessionStorage.setItem(sessionKey, 'true');
    } catch (e) {
      // ignore
    }
  };

  const primarySuggestion =
    therapistSuggestionEffective?.suggested_test_name || therapistSuggestionEffective?.suggested_test_code || null;
  const secondarySuggestions =
    therapistSuggestionEffective?.secondary_suggestions
      ?.map((item: { name?: string | null; code?: string | null }) => item?.name || item?.code)
      .filter(Boolean) || [];
  const hasTherapistSuggestion = Boolean(
    primarySuggestion || secondarySuggestions.length || therapistSuggestionEffective?.current_world || therapistSuggestionEffective?.next_world
  );
  const formatWorld = (world?: string | null) =>
    world ? `${world.charAt(0).toUpperCase()}${world.slice(1)}` : null;
  const currentWorld = formatWorld(therapistSuggestionEffective?.current_world);
  const nextWorld = formatWorld(therapistSuggestionEffective?.next_world);
  const worldBridge =
    currentWorld && nextWorld ? `De ${currentWorld} a ${nextWorld}` : null;

  // Safe checks for rendering
  const hasContent =
    summary ||
    strengths.length ||
    focusAreas.length ||
    recommendations.length ||
    disclaimer ||
    index !== null ||
    totalScore !== null ||
    activationGrade ||
    domains ||
    activeFlags.length > 0;

  // (B) Check for normalized mcmi4-signal schema
  const isMCMI4Signal = payload?.schema_version === 'mcmi4-signal:v1' || testCode === 'mcmi4-signal';
  const signalData = isMCMI4Signal ? {
    total_items: payload?.total_items ?? 0,
    scale: payload?.scale ?? 'unknown',
    timestamp: payload?.timestamp ?? date,
    mean: payload?.responses_summary?.mean ?? null,
    stdev: payload?.responses_summary?.stdev ?? null,
    counts: payload?.responses_summary?.counts ?? {},
  } : null;

  // Render mcmi4-signal schema
  if (isMCMI4Signal && signalData) {
    const meanPercent = signalData.mean !== null ? Math.round(signalData.mean * 100) : null;
    const stdevPercent = signalData.stdev !== null ? Math.round(signalData.stdev * 100) : null;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {testName || 'SWM MCMI-4 SIGNAL'}
              {testCode && <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">{testCode}</span>}
            </h3>
            {signalData.timestamp && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{new Date(signalData.timestamp).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Activity size={16} />
            <span className="font-medium text-sm">Señal registrada</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Items totales:</strong> {signalData.total_items}</p>
            <p><strong>Escala:</strong> {signalData.scale}</p>
            {meanPercent !== null && <p><strong>Media normalizada:</strong> {meanPercent}%</p>}
            {stdevPercent !== null && <p><strong>Desviación estándar:</strong> {stdevPercent}%</p>}
            {signalData.counts && Object.keys(signalData.counts).length > 0 && (
              <div>
                <strong>Distribución de respuestas:</strong>
                <div className="flex gap-2 mt-1">
                  {Object.entries(signalData.counts).map(([key, count]) => (
                    <span key={key} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">
                      {key}: {String(count)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tus respuestas - item-level detail */}
        {responsesDetail && responsesDetail.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowResponses(!showResponses)}
              className="flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900 transition-colors"
            >
              {showResponses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>Tus respuestas ({responsesDetail.length} ítems)</span>
            </button>
            
            {showResponses && (
              <div className="mt-3 space-y-2 bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs text-violet-600 mb-2">
                  Estas fueron tus respuestas a cada afirmación de la evaluación:
                </p>
                {responsesDetail.map((item) => (
                  <div 
                    key={item.position} 
                    className="flex items-start gap-3 text-sm bg-white rounded-md p-3 border border-violet-100"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                      {item.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 leading-snug">{item.item_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-800 bg-violet-100 px-2 py-0.5 rounded">
                          {item.response_value !== null ? (
                            <>
                              <span className="font-bold">{item.response_value}</span>
                              <span className="text-violet-600">— {item.response_label}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Sin respuesta</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <summary className="cursor-pointer text-sm text-gray-600 font-medium flex items-center gap-2">
            <FileJson size={14} />
            Ver datos completos (JSON)
          </summary>
          <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 mt-3 font-mono bg-white p-2 rounded border border-gray-100">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  // Fallback for completely empty content
  if (!hasContent && !showTechnical && !testName) {
    // Force technical view if no content is available
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">
            {isMCMI4Signal ? 'Resultado recibido, pendiente de normalización' : 'Sin datos estructurados'}
          </span>
        </div>
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <summary className="cursor-pointer text-sm text-gray-600 font-medium flex items-center gap-2">
            <FileJson size={14} />
            Ver datos completos (JSON)
          </summary>
          <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 mt-3 font-mono bg-white p-2 rounded border border-gray-100">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* 1. Header (Optional) */}
      {(testName || date || onClose) && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
          <div>
            {testName && (
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {testName}
                {testCode && <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">{testCode}</span>}
              </h3>
            )}
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              {date && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{date}</span>
                </div>
              )}
              {executionMode && (
                <div className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>
                    {executionMode === 'patient_self'
                      ? 'Reportado por el consultante'
                      : 'Lectura profesional'}
                  </span>
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* 2. Resumen Visual */}
        {(totalScore !== null || activationGrade || index !== null || activeFlags.length > 0) && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Nivel de intensidad
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-3xl font-bold leading-none text-slate-900">{intensityLabel}</span>
                  <ReferenceBadge value={intensityReference} />
                </div>
              </div>

              {/* Badges de Áreas de atención */}
              {activeFlags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFlags.map(flag => (
                    <div
                      key={flag}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold animate-pulse"
                    >
                      <AlertTriangle size={14} />
                      <span className="whitespace-nowrap">
                        Área de atención · {titleize(flag)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Definitive Suggestions Card (visible to therapists when suggestion exists) */}
        {hasTherapistSuggestion && therapistSuggestionEffective && isTherapist && (
          <div className="mt-4">
            <ResultSuggestionsCard
              suggestion={therapistSuggestionEffective as Suggestion}
              onViewReason={() => setShowSuggestionModal(true)}
              onAssign={undefined}
              onDiscard={() => {
                if (!sessionKey) return;
                try {
                  sessionStorage.setItem(sessionKey, 'true');
                } catch (e) {
                  // ignore
                }
              }}
            />
          </div>
        )}

        {hasTherapistSuggestion && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-emerald-900">Exploración sugerida</h4>
                  <button
                    type="button"
                    onClick={() => setShowSuggestionModal(true)}
                    className="text-emerald-700 hover:text-emerald-900"
                    aria-label="Abrir explicacion de exploracion sugerida"
                  >
                    <HelpCircle size={16} />
                  </button>

                </div>
                {worldBridge && (
                  <p className="text-xs text-emerald-700 mt-1">{worldBridge}</p>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm text-emerald-900">
              {primarySuggestion && (
                <div>
                  <span className="font-medium">Principal:</span> {primarySuggestion}
                </div>
              )}
              {secondarySuggestions.length > 0 && (
                <div>
                  <span className="font-medium">Secundaria:</span> {secondarySuggestions.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Detalle Organizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rhythmStateLabel && (
            <div className="md:col-span-2 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">
                Estado del Ritmo Esencial
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-lg font-semibold text-emerald-900">{rhythmStateLabel}</span>
                {structuredData?.score_total !== undefined && structuredData?.score_total !== null && (
                  <span className="text-sm text-emerald-800">Score: {structuredData.score_total}</span>
                )}
              </div>
              {/* Transition Suggestion */}
              {structuredData?.transition_suggestion && (
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                    Sugerencia de Transición
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-800">
                      Mundo sugerido: <span className="font-semibold capitalize">{structuredData.transition_suggestion}</span>
                    </p>
                    {isTherapist && (
                      <button
                        type="button"
                        onClick={() => setShowSuggestionModal(true)}
                        className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors font-medium"
                      >
                        Ver motivo
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Atzilut Level */}
              {structuredData?.atzilut_level && (
                <div className="mt-2">
                  <span className="text-xs text-emerald-600">
                    Nivel Atzilut: <span className="capitalize">{structuredData.atzilut_level}</span>
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Summary Text */}
          {summary && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Resumen Interpretativo
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                {summary}
              </p>
            </div>
          )}

          {/* Strengths & Focus */}
          {(strengths.length > 0 || focusAreas.length > 0) && (
            <div className="space-y-4">
              {strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Fortalezas
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 pl-1">
                    {strengths.map((s, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-400 mt-1">•</span>{s}</li>)}
                  </ul>
                </div>
              )}
              {focusAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Activity size={16} className="text-orange-500" />
                    Áreas de Enfoque
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 pl-1">
                    {focusAreas.map((f, i) => <li key={i} className="flex items-start gap-2"><span className="text-orange-400 mt-1">•</span>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Domains / Scores */}
          {domains && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 h-fit">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Rangos simbólicos por dominio
              </h4>
              <div className="space-y-3">
                {Object.entries(domains).map(([key, value]) => {
                  const percent = getDomainPercent(value);
                  const descriptor = getDomainDescriptor(value);
                  return (
                    <div key={key}>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{titleize(key)}</span>
                          <span className="text-[11px] uppercase tracking-wider text-gray-500">
                            {descriptor}
                          </span>
                        </div>
                        {percent !== null && (
                          <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-[width] duration-500 ease-out"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        )}
                        {percent !== null && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            <span title={`Referencia técnica: ${percent}`}>Referencia técnica</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Sugerencias simbólicas</h4>
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer / Context */}
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-4 mt-4 italic">
          <p>{disclaimer || DEFAULT_DISCLAIMER}</p>
        </div>

        {/* 4. Technical View (Hidden by default) */}
        {showRaw && (
          <div className="pt-2">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FileJson size={14} />
              {showTechnical ? 'Ocultar vista técnica (JSON)' : 'Ver vista técnica (JSON)'}
              {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTechnical && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-900 rounded-lg p-4 overflow-hidden shadow-inner">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs text-slate-400 font-mono">raw_payload.json</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(resultData, null, 2))}
                      className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider"
                    >
                      Copiar
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar">
                    {JSON.stringify(resultData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ExplorationSuggestionModal
        open={showSuggestionModal}
        onClose={handleSuggestionModalClose}
        currentWorld={therapistSuggestionEffective?.current_world || structuredData?.current_world}
        nextWorld={therapistSuggestionEffective?.next_world || structuredData?.transition_suggestion}
        atzilutLevel={structuredData?.atzilut_level}
        rhythmState={structuredData?.rhythm_state}
      />

    </div>
  );
}
