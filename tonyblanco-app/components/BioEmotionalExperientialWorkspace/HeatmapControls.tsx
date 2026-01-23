'use client';

import { useState, useEffect } from 'react';
import type { HeatmapConfig, EmotionType, RegionIntensity } from './types';
import { emotionColors, emotionIcons, emotionLabels } from './heatmap-colors';

interface HeatmapControlsProps {
  config: HeatmapConfig;
  onConfigChange: (config: HeatmapConfig) => void;
  selectedRegionId: string | null;
  selectedRegionLabel?: string;
  currentIntensity?: RegionIntensity;
  onIntensityUpdate: (intensity: number, emotionType: EmotionType) => void;
  isReadOnly?: boolean;
}

const emotionTypes: EmotionType[] = ['neutral', 'tension', 'pain', 'blocked', 'flow', 'warmth'];

export default function HeatmapControls({
  config,
  onConfigChange,
  selectedRegionId,
  selectedRegionLabel,
  currentIntensity,
  onIntensityUpdate,
  isReadOnly = false,
}: HeatmapControlsProps) {
  const [intensity, setIntensity] = useState(currentIntensity?.intensity || 0);
  const [emotionType, setEmotionType] = useState<EmotionType>(
    currentIntensity?.emotionType || 'neutral'
  );

  // Sync with current intensity when region changes
  useEffect(() => {
    if (currentIntensity) {
      setIntensity(currentIntensity.intensity);
      setEmotionType(currentIntensity.emotionType);
    } else {
      setIntensity(0);
      setEmotionType('neutral');
    }
  }, [currentIntensity, selectedRegionId]);

  const handleSave = () => {
    if (!isReadOnly && selectedRegionId) {
      onIntensityUpdate(intensity, emotionType);
    }
  };

  const handleClear = () => {
    setIntensity(0);
    setEmotionType('neutral');
    if (!isReadOnly && selectedRegionId) {
      onIntensityUpdate(0, 'neutral');
    }
  };

  return (
    <div className="bio-card-glass rounded-2xl p-6 space-y-4 bio-animate-slide-in-up">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
          🌡️ Mapa de Calor Emocional
        </h4>
        <p className="text-xs text-gray-600">
          Visualiza la intensidad de síntomas y emociones por región corporal
        </p>
      </div>

      {/* Toggle Heatmap */}
      <div className="flex items-center justify-between bio-glass rounded-lg px-3 py-2">
        <label className="text-sm font-medium text-gray-700">
          Activar Mapa de Calor
        </label>
        <button
          type="button"
          onClick={() => onConfigChange({ ...config, enabled: !config.enabled })}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${config.enabled ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-300'}
          `}
          aria-pressed={config.enabled}
          aria-label="Activar mapa de calor"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform
              ${config.enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Show Labels Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 flex items-center gap-2">
              <span>📊</span> Mostrar Porcentajes
            </label>
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={(e) =>
                onConfigChange({ ...config, showLabels: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* Opacity Slider */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>👁️</span> Opacidad
              </span>
              <span className="bio-badge bio-badge-info">
                {Math.round(config.opacity * 100)}%
              </span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={config.opacity * 100}
              onChange={(e) =>
                onConfigChange({ ...config, opacity: Number(e.target.value) / 100 })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Region Intensity Editor (if region selected) */}
          {selectedRegionId && (
            <div className="pt-4 border-t border-gray-200/50 space-y-3 bio-animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  🎯 Editar Región
                </p>
                {selectedRegionLabel && (
                  <span className="bio-badge bio-badge-info">{selectedRegionLabel}</span>
                )}
              </div>

              {/* Emotion Type Selector */}
              <div>
                <label className="text-xs text-gray-600 mb-2 block">
                  Tipo de Sensación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {emotionTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmotionType(type)}
                      disabled={isReadOnly}
                      className={`
                        px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          emotionType === type
                            ? 'border-indigo-500 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      style={{
                        backgroundColor:
                          emotionType === type
                            ? emotionColors[type].light
                            : undefined,
                      }}
                    >
                      {emotionIcons[type]} {emotionLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600 flex items-center justify-between">
                  <span>Intensidad</span>
                  <span 
                    className="font-bold px-2 py-0.5 rounded text-white text-xs"
                    style={{ backgroundColor: emotionColors[emotionType].medium }}
                  >
                    {intensity}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    accentColor: emotionColors[emotionType].medium,
                  }}
                />
                {/* Intensity visual preview */}
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, ${emotionColors[emotionType].light}, ${emotionColors[emotionType].medium}, ${emotionColors[emotionType].dark})`,
                    clipPath: `inset(0 ${100 - intensity}% 0 0)`,
                  }}
                />
              </div>

              {/* Save & Clear Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isReadOnly}
                  className="flex-1 bio-btn bio-btn-primary disabled:opacity-50"
                >
                  💾 Guardar
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isReadOnly || intensity === 0}
                  className="bio-btn bio-btn-ghost disabled:opacity-50"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          )}

          {/* No region selected hint */}
          {!selectedRegionId && (
            <div className="bio-glass rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">
                👆 Selecciona una región corporal para editar su intensidad
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 border-t border-gray-200/50">
            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
              📋 Leyenda de Sensaciones
            </p>
            <div className="grid grid-cols-2 gap-2">
              {emotionTypes.map((type) => (
                <div 
                  key={type} 
                  className="flex items-center gap-2 bio-animate-fade-in"
                  style={{ animationDelay: `${emotionTypes.indexOf(type) * 50}ms` }}
                >
                  <div
                    className="w-4 h-4 rounded shadow-sm"
                    style={{ backgroundColor: emotionColors[type].medium }}
                  />
                  <span className="text-xs text-gray-600">
                    {emotionIcons[type]} {emotionLabels[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="pt-3 border-t border-gray-200/50">
        <p className="text-[11px] text-gray-500 italic">
          ⚠️ Este mapa es una herramienta consultiva de observación, no diagnóstica.
        </p>
      </div>
    </div>
  );
}
