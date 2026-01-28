/**
 * TarotHolisticConsentBanner
 * 
 * Componente de consentimiento para interpretaciones holísticas de Tarot con IA.
 * Muestra disclaimer, lista de providers disponibles y botones de acción.
 * 
 * IMPORTANTE: Este componente es 100% HOLÍSTICO, NO CLÍNICO.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Info, 
  ExternalLink,
  Cpu,
  Cloud,
  Server,
} from 'lucide-react';
import { tarotHolisticApi, type TarotProvider } from '@/lib/api/tarot-holistic-client';

// =============================================================================
// TYPES
// =============================================================================

interface TarotHolisticConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

// =============================================================================
// PROVIDER ICON COMPONENT
// =============================================================================

function ProviderIcon({ provider }: { provider: string }) {
  switch (provider) {
    case 'groq':
      return <Cpu className="h-4 w-4" />;
    case 'ollama':
      return <Server className="h-4 w-4" />;
    case 'gemini':
      return <Cloud className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TarotHolisticConsentBanner({
  onAccept,
  onDecline,
  className = '',
}: TarotHolisticConsentBannerProps) {
  const [providers, setProviders] = useState<TarotProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Load provider status on mount
  useEffect(() => {
    async function loadProviders() {
      try {
        const schema = await tarotHolisticApi.getSchema();
        setProviders(schema.providers);
        setAiEnabled(schema.ai_enabled);
      } catch (error) {
        console.error('Error loading providers:', error);
        // Fallback providers
        setProviders([
          { id: 'groq', name: 'Groq AI', model: 'llama-3.3-70b-versatile', available: false, priority: 1, rate_limit: '30 req/min' },
          { id: 'ollama', name: 'Ollama', model: 'llama3.2', available: false, priority: 2, rate_limit: 'unlimited' },
          { id: 'gemini', name: 'Gemini', model: 'gemini-2.5-flash', available: false, priority: 3, rate_limit: '15 req/min' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadProviders();
  }, []);

  const availableProviders = providers.filter(p => p.available);

  return (
    <div className={`border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 rounded-r-lg shadow-sm ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            Interpretaciones Simbólicas Holísticas con IA
            {!aiEnabled && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                No disponible
              </span>
            )}
          </h3>
          
          {/* Disclaimer */}
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2 leading-relaxed">
            Las interpretaciones generadas por IA son <strong>educativas y exploratorias</strong>. 
            No constituyen consejo profesional de salud mental, médico o legal.
            Para acompañamiento profesional, consulte a un especialista certificado.
          </p>
          
          {/* Provider Status */}
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Info className="h-3 w-3" />
              {showDetails ? 'Ocultar detalles' : 'Ver providers IA disponibles'}
            </button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Sistema Multi-Provider (auto-selección con fallback):
                </p>
                <ul className="space-y-2">
                  {providers.map((provider) => (
                    <li 
                      key={provider.id}
                      className={`flex items-center gap-2 text-sm ${
                        provider.available 
                          ? 'text-green-700 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <ProviderIcon provider={provider.id} />
                      <span className="font-medium">{provider.name}</span>
                      <span className="text-xs opacity-75">({provider.model})</span>
                      {provider.available ? (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 ml-auto" />
                      )}
                    </li>
                  ))}
                </ul>
                {availableProviders.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Provider activo: <strong>{availableProviders[0]?.name}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onAccept}
              disabled={!aiEnabled || isLoading}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${aiEnabled && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }
              `}
            >
              {isLoading ? (
                'Cargando...'
              ) : aiEnabled ? (
                'Acepto y comprendo (uso holístico-educativo)'
              ) : (
                'IA no disponible'
              )}
            </button>
            
            <button
              onClick={onDecline}
              className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              No usar IA
            </button>
            
            <a
              href="/policies/holistic-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Leer política holística completa
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TarotHolisticConsentBanner;
