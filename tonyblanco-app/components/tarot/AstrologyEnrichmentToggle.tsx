'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Moon, Sun, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Astrology Enrichment Options
 * Controls what astrology data to include in Tarot/Oracle readings
 */
export interface AstrologyEnrichmentOptions {
  enabled: boolean;
  includeTransits: boolean;
  includeProgressions: boolean;
  includeSolarReturn: boolean;
}

export interface AstrologyEnrichmentToggleProps {
  /** Whether the patient has a natal chart available */
  hasNatalChart: boolean;
  /** Current enrichment options */
  value: AstrologyEnrichmentOptions;
  /** Callback when options change */
  onChange: (options: AstrologyEnrichmentOptions) => void;
  /** Whether loading natal chart status */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Compact mode for smaller layouts */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

const DEFAULT_OPTIONS: AstrologyEnrichmentOptions = {
  enabled: false,
  includeTransits: true,
  includeProgressions: true,
  includeSolarReturn: false,
};

/**
 * AstrologyEnrichmentToggle Component
 * 
 * Provides granular control over astrology data enrichment for Tarot/Oracle readings.
 * Shows natal chart availability and allows toggling individual enrichment options.
 */
export function AstrologyEnrichmentToggle({
  hasNatalChart,
  value,
  onChange,
  isLoading = false,
  error = null,
  compact = false,
  disabled = false,
}: AstrologyEnrichmentToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset enabled state if natal chart becomes unavailable
  useEffect(() => {
    if (!hasNatalChart && value.enabled) {
      onChange({ ...value, enabled: false });
    }
  }, [hasNatalChart, value, onChange]);

  const handleToggleEnabled = useCallback(() => {
    if (!hasNatalChart || disabled) return;
    const newEnabled = !value.enabled;
    onChange({
      ...value,
      enabled: newEnabled,
      // Reset to defaults when enabling
      ...(newEnabled ? {
        includeTransits: true,
        includeProgressions: true,
        includeSolarReturn: false,
      } : {}),
    });
  }, [hasNatalChart, disabled, value, onChange]);

  const handleOptionChange = useCallback((key: keyof AstrologyEnrichmentOptions) => {
    if (!value.enabled || disabled) return;
    onChange({
      ...value,
      [key]: !value[key],
    });
  }, [value, disabled, onChange]);

  // Compact view
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleEnabled}
          disabled={!hasNatalChart || disabled || isLoading}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium
            transition-colors duration-200
            ${value.enabled
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }
            ${!hasNatalChart || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-200 dark:hover:bg-indigo-800/40'}
          `}
          title={!hasNatalChart ? 'Requiere carta natal calculada' : 'Enriquecer con datos astrológicos'}
        >
          {isLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Star className={`w-4 h-4 ${value.enabled ? 'fill-current' : ''}`} />
          )}
          <span className="hidden sm:inline">Astro</span>
        </button>
        {!hasNatalChart && !isLoading && (
          <span className="text-xs text-gray-400" title="No hay carta natal disponible">
            <Info className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className={`
      border rounded-lg overflow-hidden
      ${value.enabled 
        ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20' 
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
      }
      ${disabled ? 'opacity-60' : ''}
    `}>
      {/* Header / Main Toggle */}
      <div
        className={`
          flex items-center justify-between p-3 cursor-pointer
          ${!hasNatalChart || disabled ? 'cursor-not-allowed' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30'}
        `}
        onClick={hasNatalChart && !disabled ? handleToggleEnabled : undefined}
      >
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-full
            ${value.enabled 
              ? 'bg-indigo-100 dark:bg-indigo-900/50' 
              : 'bg-gray-100 dark:bg-gray-700'
            }
          `}>
            <Star className={`
              w-5 h-5
              ${value.enabled 
                ? 'text-indigo-600 dark:text-indigo-400 fill-current' 
                : 'text-gray-400 dark:text-gray-500'
              }
            `} />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              Enriquecer con datos astrológicos
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading 
                ? 'Verificando carta natal...'
                : hasNatalChart 
                  ? 'Carta natal disponible' 
                  : 'Requiere carta natal calculada'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          {!isLoading && (
            hasNatalChart ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )
          )}

          {/* Toggle switch */}
          <div className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${value.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}
            ${!hasNatalChart || disabled ? 'opacity-50' : ''}
          `}>
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
              ${value.enabled ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        </div>
      )}

      {/* Expandable options */}
      {value.enabled && hasNatalChart && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 
                       border-t border-indigo-100 dark:border-indigo-900/50
                       hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30
                       flex items-center justify-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Ocultar opciones
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Configurar opciones
              </>
            )}
          </button>

          {isExpanded && (
            <div className="px-3 py-3 space-y-3 border-t border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-gray-900/30">
              {/* Transits option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.includeTransits}
                  onChange={() => handleOptionChange('includeTransits')}
                  disabled={disabled}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 
                             focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Incluir tránsitos actuales
                    </span>
                    <p className="text-xs text-gray-400">
                      Planetas en tránsito sobre carta natal
                    </p>
                  </div>
                </div>
              </label>

              {/* Progressions option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.includeProgressions}
                  onChange={() => handleOptionChange('includeProgressions')}
                  disabled={disabled}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 
                             focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-500" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Incluir progresiones
                    </span>
                    <p className="text-xs text-gray-400">
                      Luna y Sol progresados, fase lunar
                    </p>
                  </div>
                </div>
              </label>

              {/* Solar Return option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.includeSolarReturn}
                  onChange={() => handleOptionChange('includeSolarReturn')}
                  disabled={disabled}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 
                             focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Incluir revolución solar
                    </span>
                    <p className="text-xs text-gray-400">
                      Temas del año actual (más lento)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}
        </>
      )}

      {/* Info for users without natal chart */}
      {!hasNatalChart && !isLoading && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            💡 Calcula la carta natal del consultante para habilitar el enriquecimiento astrológico.
          </p>
        </div>
      )}
    </div>
  );
}

// Default export
export default AstrologyEnrichmentToggle;

// Export default options for convenience
export { DEFAULT_OPTIONS as DEFAULT_ASTROLOGY_OPTIONS };
