/**
 * SymbolicAIPanel - Collapsible AI assistant panel for Workspace phases
 * 
 * RESTRICTIONS (from AUDITORIA_INTEGRACION_IA_MCMI4.md):
 * - READ-ONLY mode: never modifies core artifacts
 * - Shows disclaimer at all times
 * - ON/OFF toggle with session persistence
 * - Only generates symbolic questions and reflections
 */

'use client';

import { useState, useCallback } from 'react';
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon, XCircleIcon } from '@heroicons/react/24/outline';
import {
  generateSymbolicSuggestion,
  isAIAssistantEnabled,
  setAIAssistantEnabled,
  type SymbolicContext,
  type AIAssistantResponse,
} from '@/lib/swm-mcmi4/symbolic-ai-assistant';
import type { PhaseName } from '@/lib/swm-mcmi4/phase-guides.config';

interface SymbolicAIPanelProps {
  phase: PhaseName;
  dominantWorld: string;
  shadowWorld: string;
  symbolicTensions: string[];
  therapistText?: string;
  apiKey?: string;
}

const SUGGESTION_TYPE_LABELS: Record<string, string> = {
  question: 'Pregunta exploratoria',
  reflection: 'Reflejo simbólico',
  reformulation: 'Reformulación',
};

export default function SymbolicAIPanel({
  phase,
  dominantWorld,
  shadowWorld,
  symbolicTensions,
  therapistText,
  apiKey,
}: SymbolicAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => isAIAssistantEnabled());
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AIAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleEnabled = useCallback(() => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    setAIAssistantEnabled(newValue);
    if (!newValue) {
      setSuggestion(null);
      setError(null);
    }
  }, [isEnabled]);

  const handleGenerateSuggestion = useCallback(async () => {
    if (!isEnabled) return;

    setIsLoading(true);
    setError(null);

    const context: SymbolicContext = {
      phase,
      dominantWorld,
      shadowWorld,
      symbolicTensions,
      therapistText,
    };

    try {
      const result = await generateSymbolicSuggestion(context, apiKey);
      
      if (result.blocked) {
        setError(result.blockReason || 'Respuesta bloqueada por seguridad');
        setSuggestion(null);
      } else {
        setSuggestion(result);
      }
    } catch (err) {
      console.error('[SymbolicAIPanel] Error:', err);
      setError('Error al generar sugerencia. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, phase, dominantWorld, shadowWorld, symbolicTensions, therapistText, apiKey]);

  // Don't render if completely disabled via env
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DISABLE_SYMBOLIC_AI === 'true') {
    return null;
  }

  return (
    <div className="border border-purple-200 rounded-lg bg-purple-50/30 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-purple-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Asistente Simbólico</span>
          {!isEnabled && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">OFF</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-purple-600" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-purple-600" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Disclaimer - ALWAYS VISIBLE */}
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Asistente simbólico. No diagnóstico. No conclusivo.</strong>
              <br />
              <span className="text-amber-700">
                Las sugerencias son exploratorias. El terapeuta toma todas las decisiones.
              </span>
            </p>
          </div>

          {/* ON/OFF Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Activar asistente</span>
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isEnabled && (
            <>
              {/* Context Info */}
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Fase:</strong> {phase}</p>
                <p><strong>Mundo dominante:</strong> {dominantWorld || 'No definido'}</p>
                <p><strong>Mundo sombra:</strong> {shadowWorld || 'No definido'}</p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateSuggestion}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generando...
                  </span>
                ) : (
                  'Generar sugerencia'
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Suggestion Display */}
              {suggestion && !error && (
                <div className="p-3 bg-white border border-purple-200 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      {SUGGESTION_TYPE_LABELS[suggestion.type] || suggestion.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {suggestion.suggestion}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Esta es una sugerencia exploratoria. Puedes usarla, adaptarla o ignorarla.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
