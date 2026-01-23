'use client';

import { useState, useMemo } from 'react';
import type { BodyAnatomy, RegionIntensity, HeatmapConfig, EmotionType } from './types';
import { anatomicalRegions, getRegionPath } from './data/anatomicalRegions';
import { getColorWithOpacity } from './heatmap-colors';

interface BodyVisualization2DProps {
  anatomy: BodyAnatomy;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled?: boolean;
  // Heatmap props (PROMPT #6)
  heatmapData?: RegionIntensity[];
  heatmapConfig?: HeatmapConfig;
  onIntensityChange?: (regionId: string, intensity: number, emotionType: EmotionType) => void;
}

const anatomyLabel: Record<BodyAnatomy, string> = {
  male: 'Anatomía masculina',
  female: 'Anatomía femenina',
  intersex: 'Anatomía intersexual',
  unknown: 'Anatomía neutral',
};

export default function BodyVisualization2D({
  anatomy,
  selectedRegionId,
  onRegionSelect,
  disabled = false,
  heatmapData,
  heatmapConfig,
}: BodyVisualization2DProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Memoize heatmap lookup for performance
  const heatmapLookup = useMemo(() => {
    if (!heatmapData) return new Map<string, RegionIntensity>();
    return new Map(heatmapData.map((d) => [d.regionId, d]));
  }, [heatmapData]);

  const handleRegionClick = (regionId: string) => {
    if (disabled) return;
    // Toggle selection: if already selected, deselect
    onRegionSelect(selectedRegionId === regionId ? null : regionId);
  };

  const handleRegionHover = (regionId: string | null) => {
    if (disabled) return;
    setHoveredRegionId(regionId);
  };

  // Render heatmap overlay layer
  const renderHeatmap = () => {
    if (!heatmapConfig?.enabled || !heatmapData || heatmapData.length === 0) {
      return null;
    }

    return (
      <g className="heatmap-layer">
        {anatomicalRegions.map((region) => {
          const intensityData = heatmapLookup.get(region.id);

          if (!intensityData || intensityData.intensity === 0) {
            return null;
          }

          const path = getRegionPath(region.id, anatomy);
          const fillColor = getColorWithOpacity(
            intensityData.emotionType,
            intensityData.intensity,
            heatmapConfig.opacity
          );

          return (
            <g key={`heatmap-${region.id}`}>
              {/* Heatmap overlay */}
              <path
                d={path}
                fill={fillColor}
                stroke="none"
                className="transition-all duration-300"
                style={{
                  pointerEvents: 'none',
                }}
              />

              {/* Intensity label (if enabled) */}
              {heatmapConfig.showLabels && intensityData.intensity > 0 && (
                <text
                  x={(region.hotspot.x / 100) * 200}
                  y={(region.hotspot.y / 100) * 320}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none font-bold"
                  style={{
                    fontSize: '9px',
                    fill: intensityData.intensity > 50 ? '#ffffff' : '#374151',
                    textShadow: '0 0 3px rgba(0,0,0,0.5)',
                  }}
                >
                  {intensityData.intensity}%
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Body SVG */}
      <div className="relative">
        <svg
          viewBox="0 0 200 320"
          className="h-[480px] w-auto"
          role="img"
          aria-label={anatomyLabel[anatomy]}
        >
          {/* Base body outline - neutral, non-medical */}
          <g className="body-outline" stroke="#9CA3AF" strokeWidth="2" fill="none">
            {/* Head */}
            <circle cx="100" cy="35" r="18" />
            
            {/* Neck */}
            <line x1="100" y1="53" x2="100" y2="65" />
            
            {/* Torso */}
            <path d="M 75 75 Q 70 95 70 130 Q 70 180 78 210 L 88 240 M 125 75 Q 130 95 130 130 Q 130 180 122 210 L 112 240" />
            <line x1="75" y1="75" x2="125" y2="75" />
            
            {/* Arms */}
            <path d="M 75 75 Q 60 80 55 100 L 55 145" />
            <path d="M 125 75 Q 140 80 145 100 L 145 145" />
            
            {/* Legs */}
            <path d="M 88 240 L 85 280 L 85 300" />
            <path d="M 112 240 L 115 280 L 115 300" />
          </g>

          {/* Interactive anatomical regions */}
          {anatomicalRegions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegionId === region.id;
            const path = getRegionPath(region.id, anatomy);

            return (
              <g key={region.id}>
                {/* Region path - clickable area */}
                <path
                  d={path}
                  fill={
                    isSelected
                      ? 'rgba(147, 197, 253, 0.3)' // Soft blue when selected
                      : isHovered
                      ? 'rgba(209, 213, 219, 0.2)' // Light gray when hovered
                      : 'transparent'
                  }
                  stroke={
                    isSelected
                      ? '#3B82F6' // Blue border when selected
                      : isHovered
                      ? '#9CA3AF' // Gray border when hovered
                      : 'transparent'
                  }
                  strokeWidth={isSelected ? 2 : 1}
                  className={`transition-all duration-200 ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => handleRegionHover(region.id)}
                  onMouseLeave={() => handleRegionHover(null)}
                  style={{
                    pointerEvents: disabled ? 'none' : 'auto',
                  }}
                />

                {/* Hotspot indicator - small circle for better targeting */}
                <circle
                  cx={(region.hotspot.x / 100) * 200}
                  cy={(region.hotspot.y / 100) * 320}
                  r={region.hotspot.r}
                  fill={
                    isSelected
                      ? 'rgba(59, 130, 246, 0.4)'
                      : isHovered
                      ? 'rgba(156, 163, 175, 0.3)'
                      : 'transparent'
                  }
                  className={`transition-all duration-200 ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => handleRegionHover(region.id)}
                  onMouseLeave={() => handleRegionHover(null)}
                  style={{
                    pointerEvents: disabled ? 'none' : 'auto',
                  }}
                />

                {/* Region label on hover */}
                {isHovered && (
                  <text
                    x={(region.hotspot.x / 100) * 200}
                    y={(region.hotspot.y / 100) * 320 - region.hotspot.r - 5}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                    style={{ fontSize: '10px' }}
                  >
                    {region.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Heatmap layer (rendered on top) */}
          {renderHeatmap()}
        </svg>
      </div>

      {/* Info footer */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-800">{anatomyLabel[anatomy]}</p>
        <p className="text-xs text-gray-500">
          Selección basada en sexo biológico. Identidad de género no altera esta vista.
        </p>
        {disabled && (
          <p className="text-xs text-amber-600 font-medium">
            Selección deshabilitada en este estado
          </p>
        )}
        {!disabled && !selectedRegionId && (
          <p className="text-xs text-gray-600">
            Haz clic en una región para observar
          </p>
        )}
      </div>
    </div>
  );
}
