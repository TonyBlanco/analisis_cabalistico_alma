/**
 * Symbolic Interpretation Panel — AI-Assisted Symbolic Reading UI
 * 
 * SAFETY-FIRST DESIGN:
 * - Prominent disclaimer always visible
 * - Clear separation from Tree visualization
 * - Explicit opt-in (disabled by default)
 * - Educational language only
 */

'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, Info, BookOpen, X } from 'lucide-react';
import type { SymbolicInterpretation } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import { SYMBOLIC_INTERPRETER_META } from '@holistica/symbolic/tree/symbolic-interpreter.types';

interface SymbolicInterpretationPanelProps {
  interpretation: SymbolicInterpretation | null;
  isLoading: boolean;
  onRequestInterpretation: () => void;
  onClose?: () => void;
  consentState?: { mode: string; acceptedAt: string; version: string };
}

const CONSENT_MODE_LABELS: Record<string, string> = {
  no_store: 'sin almacenar',
  store_anonymized: 'anon.',
  store_with_consent: 'con consentimiento',
};

export function SymbolicInterpretationPanel({
  interpretation,
  isLoading,
  onRequestInterpretation,
  onClose,
  consentState,
}: SymbolicInterpretationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div
      className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 shadow-lg"
      aria-labelledby="symbolic-interpretation-title"
    >
      {/* Header with disclaimer */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 id="symbolic-interpretation-title" className="text-lg font-semibold text-purple-900">
              Lectura Simbólica Asistida (IA)
            </h3>
          </div>
          
          {/* Prominent disclaimer */}
          <div
            className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-300 px-3 py-2"
            role="note"
            aria-label="Aviso de seguridad"
          >
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-amber-800 leading-relaxed">
              {SYMBOLIC_INTERPRETER_META.disclaimerText}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Action button */}
      {!interpretation && !isLoading && (
        <div className="space-y-3">
          <button
            onClick={onRequestInterpretation}
            disabled={isLoading}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generar Lectura Simbólica con IA
          </button>
          
          {/* Educational info */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              La IA analizará el patrón estructural del Árbol y generará observaciones simbólicas
              educativas sin interpretación clínica.
            </p>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-8 space-y-3"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
            aria-hidden="true"
          />
          <p className="text-sm text-purple-700 font-medium">
            Generando lectura simbólica…
          </p>
        </div>
      )}

      {!interpretation && !isLoading && (
        <div className="sr-only" role="status">
          Aún no hay lectura simbólica generada.
        </div>
      )}
      
      {/* Interpretation results */}
      {interpretation && !isLoading && (
        <div className="space-y-4 mt-4">
          {/* Safety validation warnings */}
          {interpretation.safetyValidation.warnings.length > 0 && (
            <div
              className="rounded-lg bg-red-50 border border-red-300 px-3 py-2"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-xs font-medium text-red-800 mb-1">
                Advertencias de seguridad:
              </p>
              <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                {interpretation.safetyValidation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Observations */}
          <div className="space-y-3">
            {interpretation.observations.map((obs, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-purple-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-purple-900">
                    {obs.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed ml-6">
                  {obs.content}
                </p>
                <div className="mt-2 ml-6">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                    {obs.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Educational context */}
          {interpretation.educationalContext && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2">
              <p className="text-xs text-indigo-800 leading-relaxed">
                <strong>Contexto educativo:</strong> {interpretation.educationalContext}
              </p>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-200">
            <span>
              Método: {interpretation.sourceState.source.method}
            </span>
            <span>
              {new Date(interpretation.timestamp).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {/* SWM v3 consent traceability badge */}
          {consentState && (
            <div className="flex items-center gap-1.5 rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] text-emerald-700">
              <span className="font-medium">SWM v3</span>
              <span>·</span>
              <span>{CONSENT_MODE_LABELS[consentState.mode] ?? consentState.mode}</span>
              <span>·</span>
              <span>{consentState.version}</span>
              <span>·</span>
              <span>{new Date(consentState.acceptedAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          
          {/* Action to regenerate */}
          <button
            onClick={onRequestInterpretation}
            disabled={isLoading}
            className="w-full rounded-lg bg-purple-100 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3 w-3" />
            Regenerar Lectura Simbólica
          </button>
        </div>
      )}
      
      {/* Safety rules toggle */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="symbolic-safety-rules"
          className="flex items-center gap-2 text-xs font-medium text-purple-700 hover:text-purple-900 transition-colors"
        >
          <Info className="h-3 w-3" aria-hidden="true" />
          {isExpanded ? 'Ocultar' : 'Ver'} reglas de seguridad ({SYMBOLIC_INTERPRETER_META.safetyRules.length})
        </button>
        
        {isExpanded && (
          <ul
            id="symbolic-safety-rules"
            className="mt-2 space-y-1 text-[11px] text-purple-600 ml-5 list-disc"
          >
            {SYMBOLIC_INTERPRETER_META.safetyRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
