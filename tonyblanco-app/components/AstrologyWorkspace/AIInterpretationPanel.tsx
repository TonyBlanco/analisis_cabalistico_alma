'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp, Copy, Check, Save, Share2, History } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/auth';
import InfoTooltip from '../common/InfoTooltip';

type InterpretationLayer = 'natal' | 'transits' | 'progressions' | 'solar_return';

interface LayerConfig {
  key: InterpretationLayer;
  label: string;
  description: string;
  tooltip: {
    title: string;
    description: string;
    examples: string[];
  };
  endpoint: string;
  icon: string;
}

const LAYER_CONFIGS: LayerConfig[] = [
  {
    key: 'natal',
    label: 'Carta Natal',
    description: 'Síntesis de personalidad y patrones energéticos',
    tooltip: {
      title: 'Carta Natal - Mapa del Alma',
      description: 'La Carta Natal es una fotografía del cielo en el momento exacto del nacimiento. Revela la estructura psicológica profunda, talentos naturales, desafíos kármicos y el propósito del alma.',
      examples: [
        'Sol en Casa 10: Vocación de liderazgo público',
        'Luna en Cáncer: Necesidad de seguridad emocional',
        'Saturno en Casa 7: Aprendizaje en relaciones'
      ]
    },
    endpoint: '/astrology/interpret/natal/',
    icon: '🌟',
  },
  {
    key: 'transits',
    label: 'Tránsitos',
    description: 'Clima energético actual y oportunidades',
    tooltip: {
      title: 'Tránsitos - El Clima del Momento',
      description: 'Los Tránsitos muestran cómo los planetas actuales activan tu carta natal. Son el "tiempo meteorológico" de tu vida: oportunidades, desafíos y momentos clave para actuar.',
      examples: [
        'Júpiter transitando tu Casa 2: Expansión financiera',
        'Saturno opuesto tu Sol: Momento de maduración',
        'Plutón en tu Casa 4: Transformación familiar'
      ]
    },
    endpoint: '/astrology/interpret/transits/',
    icon: '🔄',
  },
  {
    key: 'progressions',
    label: 'Progresiones',
    description: 'Ciclo evolutivo y temas de desarrollo',
    tooltip: {
      title: 'Progresiones - Tu Evolución Interior',
      description: 'Las Progresiones simbolizan tu maduración psicológica. Cada año de vida corresponde a un día simbólico. Muestran temas internos que se desarrollan lentamente.',
      examples: [
        'Sol progresado cambia de signo: Nueva etapa vital',
        'Luna progresada cada 2.5 años: Ciclo emocional',
        'Ascendente progresado: Cambio en autopercepción'
      ]
    },
    endpoint: '/astrology/interpret/progressions/',
    icon: '📈',
  },
  {
    key: 'solar_return',
    label: 'Retorno Solar',
    description: 'Tema del año y áreas de enfoque',
    tooltip: {
      title: 'Retorno Solar - Tu Año Personal',
      description: 'El Retorno Solar es la carta del momento exacto en que el Sol vuelve a su posición natal (tu cumpleaños). Define el tema principal del año desde cumpleaños a cumpleaños.',
      examples: [
        'Ascendente en Casa 10: Año de carrera profesional',
        'Luna en Casa 4: Año de asuntos familiares',
        'Stellium en Casa 7: Año de relaciones importantes'
      ]
    },
    endpoint: '/astrology/interpret/solar-return/',
    icon: '☀️',
  },
];

interface InterpretationResult {
  layer: InterpretationLayer;
  content: string;
  timestamp: string;
  loading: boolean;
  error?: string;
  cached?: boolean;
  interpretation_id?: number;
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
  const [savingLayer, setSavingLayer] = useState<InterpretationLayer | null>(null);
  const [sharingLayer, setSharingLayer] = useState<InterpretationLayer | null>(null);
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
          cached: data.cached || false,
          interpretation_id: data.interpretation_id,
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

  const shareWithPatient = useCallback(async (interpretationId: number, layer: InterpretationLayer) => {
    if (!interpretationId) {
      console.error('No interpretation ID to share');
      return;
    }

    setSharingLayer(layer);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${apiURL}/astrology/interpretations/${interpretationId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ share_with_patient: true }),
      });

      if (!response.ok) {
        throw new Error('Error al compartir interpretación');
      }

      // TODO: Show success notification
      console.log('Interpretation shared successfully');

    } catch (err) {
      console.error('Error sharing interpretation:', err);
      // TODO: Show error notification
    } finally {
      setSharingLayer(null);
    }
  }, [apiURL]);

  const viewHistory = useCallback(async (layer: InterpretationLayer) => {
    if (!patientId) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(
        `${apiURL}/astrology/interpretations/?patient_id=${patientId}&interpretation_type=${layer}&limit=5`,
        {
          headers: { 'Authorization': `Token ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar historial');
      }

      const data = await response.json();
      console.log('Interpretation history:', data);
      // TODO: Show history modal with data.interpretations

    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, [patientId, apiURL]);

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
        <InfoTooltip
          title="Interpretaciones Astrológicas AI"
          description="El sistema AI analiza tu carta natal y genera interpretaciones holísticas basadas en astrología psicológica y simbólica. Cada capa ofrece una perspectiva diferente de tu mapa astral."
          examples={[
            'Carta Natal: Tu estructura psicológica base',
            'Tránsitos: Oportunidades actuales',
            'Progresiones: Evolución interna',
            'Retorno Solar: Tema de tu año personal'
          ]}
        />
        <span className="ml-auto text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded">
          Gemini 2.5
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
            <div key={config.key} className="relative">
              <button
                onClick={() => requestInterpretation(config.key)}
                disabled={!available || isLoading}
                className={`
                  w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all
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
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {config.label}
                    </span>
                    <InfoTooltip
                      title={config.tooltip.title}
                      description={config.tooltip.description}
                      examples={config.tooltip.examples}
                      position="top"
                      className="ml-auto"
                    />
                  </div>
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                    {isLoading ? (
                      'Generando...'
                    ) : hasContent ? (
                      <>
                        {interpretation?.cached && (
                          <span className="text-green-600">✓ Guardada</span>
                        )}
                        {!interpretation?.cached && 'Disponible'}
                      </>
                    ) : (
                      'Interpretar'
                    )}
                  </div>
                </div>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
              </button>
            </div>
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
                      
                      {/* Actions Bar */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        {/* Timestamp and cached indicator */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {new Date(interpretation.timestamp).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                          {interpretation.cached && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                              <Save className="h-3 w-3" />
                              Guardada
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {/* Copy button */}
                          <button
                            onClick={() => copyToClipboard(config.key, interpretation.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                            title="Copiar al portapapeles"
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

                          {/* Share button */}
                          {interpretation.interpretation_id && (
                            <button
                              onClick={() => shareWithPatient(interpretation.interpretation_id!, config.key)}
                              disabled={sharingLayer === config.key}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                              title="Compartir con consultante"
                            >
                              {sharingLayer === config.key ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Compartiendo...
                                </>
                              ) : (
                                <>
                                  <Share2 className="h-3 w-3" />
                                  Compartir
                                </>
                              )}
                            </button>
                          )}

                          {/* History button */}
                          <button
                            onClick={() => viewHistory(config.key)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                            title="Ver historial de interpretaciones"
                          >
                            <History className="h-3 w-3" />
                            Historial
                          </button>
                        </div>
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
