'use client';

/**
 * GenericAIAssistantPanel.tsx
 * 
 * Panel de IA genérico y reutilizable para workspaces SWM.
 * Basado en el patrón de CabalaAIAssistant.tsx con validaciones éticas.
 * 
 * @author Sistema Holístico
 * @date 2026-02-01
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Shield,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export type AIModuleType = 'tarot' | 'sha' | 'transgenerational' | 'trabajo-sombras' | 'astrologia' | 'resonancia-ancestral' | 'bioemocional' | 'holistica' | 'generic';

interface AIResponse {
  data?: Record<string, unknown>;
  interpretation?: string;
  suggestions?: string[];
  reflection_questions?: string[];
  disclaimer?: string;
  requires_review?: boolean;
  error?: string;
}

interface GenericAIAssistantPanelProps {
  moduleType: AIModuleType;
  moduleTitle: string;
  context?: Record<string, unknown>;
  consultanteId?: number | string;
  className?: string;
  onInterpretationGenerated?: (data: AIResponse) => void;
}

// ============================================================================
// MODULE CONFIG
// ============================================================================

const MODULE_CONFIG: Record<AIModuleType, {
  endpoint: string;
  promptContext: string;
  icon: string;
  features: string[];
}> = {
  tarot: {
    endpoint: 'ai/tarot/interpretSpread',
    promptContext: 'Interpretación simbólica de cartas del Tarot para exploración interior',
    icon: '🎴',
    features: ['Interpretación de tirada', 'Síntesis simbólica', 'Preguntas reflexivas'],
  },
  sha: {
    endpoint: 'ai-engine/interpret-symbolic',
    promptContext: 'Análisis de armonía sefirótica para equilibrio interior',
    icon: '✡️',
    features: ['Balance sefirótico', 'Patrones de armonía', 'Recomendaciones prácticas'],
  },
  transgenerational: {
    endpoint: 'ai/transgenerational/interpret',
    promptContext: 'Exploración de patrones transgeneracionales y sabiduría ancestral',
    icon: '🌳',
    features: ['Patrones familiares', 'Herencias simbólicas', 'Integración generacional'],
  },
  'trabajo-sombras': {
    endpoint: 'ai/shadow-work/interpret',
    promptContext: 'Exploración consciente de aspectos sombríos para integración',
    icon: '🌙',
    features: ['Análisis Qliphoth', 'Integración de sombra', 'Preguntas de exploración'],
  },
  astrologia: {
    endpoint: 'ai/astrology/interpret',
    promptContext: 'Interpretación astrológica simbólica para autoconocimiento',
    icon: '⭐',
    features: ['Análisis natal', 'Tránsitos actuales', 'Ciclos personales'],
  },
  'resonancia-ancestral': {
    endpoint: 'ai/resonancia/interpret',
    promptContext: 'Exploración de resonancias y ecos transgeneracionales del sistema familiar',
    icon: '🧬',
    features: ['Mapeo de resonancias', 'Ejes ancestrales', 'Patrones sistémicos'],
  },
  bioemocional: {
    endpoint: 'ai/bioemotional/interpret',
    promptContext: 'Análisis de correspondencias bio-emocionales y somatizaciones simbólicas',
    icon: '💫',
    features: ['Mapeo corporal', 'Correspondencias emocionales', 'Síntesis somática'],
  },
  holistica: {
    endpoint: 'ai/holistica/interpret',
    promptContext: 'Síntesis holística integrando múltiples dimensiones del ser',
    icon: '🌀',
    features: ['Integración multidimensional', 'Síntesis global', 'Visión unificada'],
  },
  generic: {
    endpoint: 'ai-engine/interpret-symbolic',
    promptContext: 'Exploración simbólica holística',
    icon: '🔮',
    features: ['Interpretación simbólica', 'Síntesis reflexiva', 'Preguntas exploratorias'],
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GenericAIAssistantPanel({
  moduleType,
  moduleTitle,
  context,
  consultanteId,
  className = '',
  onInterpretationGenerated,
}: GenericAIAssistantPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const config = MODULE_CONFIG[moduleType] || MODULE_CONFIG.generic;

  const generateInterpretation = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('No autenticado. Por favor, inicia sesión.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/${config.endpoint}/`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          context: context || {},
          consultante_id: consultanteId,
          module_type: moduleType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Error del servidor');
      }

      const aiResponse: AIResponse = {
        data: data,
        interpretation: data.interpretation || data.narrative?.summary,
        suggestions: data.suggestions || data.key_insights,
        reflection_questions: data.reflection_questions || [],
        disclaimer: data.disclaimer || 'Este contenido es orientativo y requiere validación del terapeuta.',
        requires_review: true,
      };

      setResponse(aiResponse);
      onInterpretationGenerated?.(aiResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, context, consultanteId, moduleType, onInterpretationGenerated]);

  const copyToClipboard = useCallback(async () => {
    if (!response?.interpretation) return;
    
    try {
      await navigator.clipboard.writeText(response.interpretation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Error copiando al portapapeles');
    }
  }, [response]);

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 rounded-xl ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Asistente IA - {moduleTitle}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {config.promptContext}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Ethical Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                Gobernanza Ética IA
              </span>
            </div>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• La IA es únicamente <strong>asistiva</strong> - no diagnostica ni interpreta almas.</li>
              <li>• Todas las salidas son <strong>borradores</strong> que requieren validación del terapeuta.</li>
              <li>• El terapeuta tiene <strong>soberanía total</strong> sobre el contenido final.</li>
            </ul>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {config.features.map((feature, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Generate Button */}
          {!response && !loading && (
            <button
              onClick={generateInterpretation}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generar Interpretación IA
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Generando interpretación...</p>
              <p className="text-xs text-gray-400 mt-1">Analizando contexto simbólico...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Error</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={generateInterpretation}
                className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Response */}
          {response && !loading && (
            <div className="space-y-4">
              {/* Interpretation */}
              {response.interpretation && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Interpretación</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Copiar"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={generateInterpretation}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Regenerar"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {response.interpretation}
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {response.suggestions && response.suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sugerencias</h4>
                  <ul className="space-y-2">
                    {response.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-purple-600">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reflection Questions */}
              {response.reflection_questions && response.reflection_questions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preguntas Reflexivas</h4>
                  <ul className="space-y-2">
                    {response.reflection_questions.map((question, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-indigo-600">?</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              {response.disclaimer && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    ⚠️ {response.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
