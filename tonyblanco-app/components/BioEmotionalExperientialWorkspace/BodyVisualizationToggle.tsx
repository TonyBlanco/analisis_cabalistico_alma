'use client';

import { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { BodyAnatomy, RegionIntensity, HeatmapConfig } from './types';
import BodyVisualization2D from './BodyVisualization2D';

// ============================================
// BODY VISUALIZATION TOGGLE
// Wrapper component for 2D/3D switching
// ============================================

interface BodyVisualizationToggleProps {
  anatomy: BodyAnatomy;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled?: boolean;
  heatmapData?: RegionIntensity[];
  heatmapConfig?: HeatmapConfig;
  // Mode control
  initialMode?: '2d' | '3d' | 'auto';
  allowModeSwitch?: boolean;
  // 3D specific
  cameraPosition?: [number, number, number];
  allowOrbit?: boolean;
  autoRotate?: boolean;
}

// Lazy load 3D component to reduce initial bundle
const BodyVisualization3D = dynamic(
  () => import('./BodyVisualization3D'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[480px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando vista 3D...</p>
        </div>
      </div>
    ),
  }
);

// WebGL detection
function hasWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Local storage key for preference
const MODE_STORAGE_KEY = 'bioemotional-body-view-mode';

export default function BodyVisualizationToggle({
  anatomy,
  selectedRegionId,
  onRegionSelect,
  disabled = false,
  heatmapData,
  heatmapConfig,
  initialMode = 'auto',
  allowModeSwitch = true,
  cameraPosition = [0, 1, 3],
  allowOrbit = true,
  autoRotate = false,
}: BodyVisualizationToggleProps) {
  // Determine initial mode
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check WebGL support on mount
  useEffect(() => {
    const supported = hasWebGLSupport();
    setWebglSupported(supported);

    // Determine initial mode
    let effectiveMode: '2d' | '3d' = '2d';

    if (initialMode === 'auto') {
      // Check saved preference
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      if (saved === '3d' && supported) {
        effectiveMode = '3d';
      } else if (saved === '2d') {
        effectiveMode = '2d';
      } else {
        // Default to 3D if supported, otherwise 2D
        effectiveMode = supported ? '3d' : '2d';
      }
    } else {
      effectiveMode = initialMode === '3d' && supported ? '3d' : '2d';
    }

    setMode(effectiveMode);
  }, [initialMode]);

  // Handle mode switch with transition
  const handleModeSwitch = useCallback((newMode: '2d' | '3d') => {
    if (newMode === '3d' && !webglSupported) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
      setIsTransitioning(false);
    }, 150);
  }, [webglSupported]);

  // Mode toggle button
  const ModeToggle = useMemo(() => {
    if (!allowModeSwitch || webglSupported === null) return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-gray-500">Vista:</span>
        <div className="inline-flex rounded-lg border border-gray-300 p-0.5">
          <button
            type="button"
            onClick={() => handleModeSwitch('2d')}
            className={`
              px-3 py-1 text-xs font-medium rounded-md transition-all
              ${mode === '2d'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('3d')}
            disabled={!webglSupported}
            title={!webglSupported ? 'WebGL no soportado en este navegador' : 'Vista 3D interactiva'}
            className={`
              px-3 py-1 text-xs font-medium rounded-md transition-all
              ${mode === '3d'
                ? 'bg-indigo-600 text-white'
                : webglSupported
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            3D {!webglSupported && '⚠️'}
          </button>
        </div>
      </div>
    );
  }, [allowModeSwitch, webglSupported, mode, handleModeSwitch]);

  // Render appropriate component
  return (
    <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {ModeToggle}

      {mode === '2d' ? (
        <BodyVisualization2D
          anatomy={anatomy}
          selectedRegionId={selectedRegionId}
          onRegionSelect={onRegionSelect}
          disabled={disabled}
          heatmapData={heatmapData}
          heatmapConfig={heatmapConfig}
        />
      ) : (
        <BodyVisualization3D
          anatomy={anatomy}
          selectedRegionId={selectedRegionId}
          onRegionSelect={onRegionSelect}
          disabled={disabled}
          heatmapData={heatmapData}
          heatmapConfig={heatmapConfig}
          cameraPosition={cameraPosition}
          allowOrbit={allowOrbit}
          autoRotate={autoRotate}
        />
      )}

      {/* WebGL warning for 3D mode */}
      {mode === '3d' && webglSupported === false && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 text-center">
          ⚠️ Tu navegador no soporta WebGL. Usando vista 2D como fallback.
        </div>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { BodyVisualizationToggleProps };
