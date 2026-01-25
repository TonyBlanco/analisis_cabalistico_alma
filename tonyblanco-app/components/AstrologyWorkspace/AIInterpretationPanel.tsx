'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { getApiBaseUrl, getAuthToken } from '@/lib/api-utils';

type InterpretationLayer = 'natal' | 'transits' | 'progressions' | 'solar_return';

interface LayerConfig {
  key: InterpretationLayer;
  label: string;
  description: string;
  endpoint: string;
  icon: string;
}

const LAYER_CONFIGS: LayerConfig[] = [
  {
    key: 'natal',
    label: 'Carta Natal',
    description: 'Síntesis de personalidad y patrones energéticos',
    endpoint: '/api/astrology/interpret/natal/',
    icon: '🌟',
  },
  {
    key: 'transits',
    label: 'Tránsitos',
    description: 'Clima energético actual y oportunidades',
    endpoint: '/api/astrology/interpret/transits/',
    icon: '🔄',
  },
  {
    key: 'progressions',
    label: 'Progresiones',
    description: 'Ciclo evolutivo y temas de desarrollo',
    endpoint: '/api/astrology/interpret/progressions/',
    icon: '📈',
  },
  {
    key: 'solar_return',
    label: 'Retorno Solar',
    description: 'Tema del año y áreas de enfoque',
    endpoint: '/api/astrology/interpret/solar-return/',
    icon: '☀️',
  },
];

interface InterpretationResult {
  layer: InterpretationLayer;
  content: string;
  timestamp: string;
  loading: boolean;
  error?: string;
}

interface Props {
  patientId: number | null;
  hasChart: boolean;
  hasTransits?: boolean;
  hasProgressions?: boolean;
  hasSolarReturn?: boolean;
}

export default function AIInterpretationPanel({
  patientId,
  hasChart,
  hasTransits = false,
  hasProgressions = false,
  hasSolarReturn = false,
}: Props) {
  const [interpretations, setInterpretations] = useState<Record<InterpretationLayer, InterpretationResult | null>>({
    natal: null,
    transits: null,
    progressions: null,
    solar_return: null,
  });
  const [expandedLayers, setExpandedLayers] = useState<Set<InterpretationLayer>>(new Set());
  const [copiedLayer, setCopiedLayer] = useState<InterpretationLayer | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  const apiURL = getApiBaseUrl();

  // Check AI status on mount
  React.useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        
        const response = await fetch(`${apiURL}/astrology/ai-status/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiEnabled(data.enabled);
        }
      } catch {
        setAiEnabled(false);
      }
    };
    
    checkAIStatus();
  }, [apiURL]);

  const isLayerAvailable = useCallback((layer: InterpretationLayer): boolean => {
    if (!hasChart) return false;
    
    switch (layer) {
      case 'natal':
        return true;
      case 'transits':
        return hasTransits;
      case 'progressions':
        return hasProgressions;
      case 'solar_return':
        return hasSolarReturn;
      default:
        return false;
    }
  }, [hasChart, hasTransits, hasProgressions, hasSolarReturn]);

  const requestInterpretation = useCallback(async (layer: InterpretationLayer) => {
    if (!patientId || !isLayerAvailable(layer)) return;

    const config = LAYER_CONFIGS.find((c) => c.key === layer);
    if (!config) return;

    // Set loading state
    setInterpretations((prev) => ({
      ...prev,
      [layer]: {
        layer,
        content: '',
        timestamp: new Date().toISOString(),
        loading: true,
      },
    }));

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${apiURL}${config.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patient_id: patientId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la interpretación');
      }

      setInterpretations((prev) => ({
        ...prev,
        [layer]: {
          layer,
          content: data.interpretation,
          timestamp: new Date().toISOString(),
          loading: false,
        },
      }));

      // Auto-expand the layer
      setExpandedLayers((prev) => new Set([...prev, layer]));

    } catch (err) {
      setInterpretations((prev) => ({
        ...prev,
        [layer]: {
          layer,
          content: '',
          timestamp: new Date().toISOString(),
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        },
      }));
    }
  }, [patientId, apiURL, isLayerAvailable]);

  const toggleExpand = useCallback((layer: InterpretationLayer) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(async (layer: InterpretationLayer, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedLayer(layer);
      setTimeout(() => setCopiedLayer(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLayer(layer);
      setTimeout(() => setCopiedLayer(null), 2000);
    }
  }, []);

  if (aiEnabled === false) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Servicio AI no disponible</span>
        </div>
        <p className="mt-2 text-sm text-amber-700">
          El servicio de interpretación AI no está configurado. Contacta al administrador.
        </p>
      </div>
    );
  }

  if (!hasChart) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Interpretación AI</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Calcula la carta natal para habilitar las interpretaciones AI.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">Interpretación AI</h3>
        <span className="ml-auto text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded">
          Gemini
        </span>
      </div>

      {/* Layer Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {LAYER_CONFIGS.map((config) => {
          const available = isLayerAvailable(config.key);
          const interpretation = interpretations[config.key];
          const isLoading = interpretation?.loading;
          const hasContent = interpretation?.content && !interpretation?.error;

          return (
            <button
              key={config.key}
              onClick={() => requestInterpretation(config.key)}
              disabled={!available || isLoading}
              className={`
                flex items-center gap-2 p-3 rounded-lg text-left transition-all
                ${available
                  ? 'bg-white hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-400'
                  : 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60'
                }
                ${hasContent ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
              `}
              title={available ? config.description : 'Capa no disponible'}
            >
              <span className="text-xl">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {config.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {isLoading ? 'Generando...' : hasContent ? 'Disponible' : 'Interpretar'}
                </div>
              </div>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
            </button>
          );
        })}
      </div>

      {/* Interpretations Display */}
      <div className="space-y-3">
        {LAYER_CONFIGS.map((config) => {
          const interpretation = interpretations[config.key];
          if (!interpretation || interpretation.loading) return null;

          const isExpanded = expandedLayers.has(config.key);

          return (
            <div
              key={config.key}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Interpretation Header */}
              <button
                onClick={() => toggleExpand(config.key)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span className="font-medium text-gray-900">{config.label}</span>
                  {interpretation.error && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {/* Interpretation Content */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  {interpretation.error ? (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      {interpretation.error}
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {interpretation.content}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Generado: {new Date(interpretation.timestamp).toLocaleString('es-ES')}
                        </span>
                        <button
                          onClick={() => copyToClipboard(config.key, interpretation.content)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                        >
                          {copiedLayer === config.key ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-500 italic">
        * Lectura simbólica orientativa generada por IA. No constituye diagnóstico.
      </div>
    </div>
  );
}
