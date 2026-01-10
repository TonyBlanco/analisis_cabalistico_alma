import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  X, 
  FileJson, 
  Activity,
  Calendar,
  Tag
} from 'lucide-react';

export type ReadableResultProps = {
  resultData: any;
  showRaw?: boolean;
  testName?: string;
  testCode?: string;
  date?: string;
  executionMode?: string;
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
  showRaw = true,
  testName,
  testCode,
  date,
  executionMode,
  onClose
}: ReadableResultProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  
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
  
  // Extract flags
  const flags = payload.flags && typeof payload.flags === 'object' ? payload.flags : {};
  const activeFlags = Object.entries(flags)
    .filter(([_, val]) => val === true)
    .map(([key]) => key);

  const domains = payload.puntuaciones?.dominios && typeof payload.puntuaciones.dominios === 'object'
    ? payload.puntuaciones.dominios
    : null;

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

  // Fallback for completely empty content
  if (!hasContent && !showTechnical && !testName) {
    // Force technical view if no content is available
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">Sin datos estructurados</span>
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

        {/* 3. Detalle Organizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
