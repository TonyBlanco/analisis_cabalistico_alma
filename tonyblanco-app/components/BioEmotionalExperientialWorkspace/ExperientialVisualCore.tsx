'use client';

import { useState, useCallback } from 'react';
import BodyVisualization2D from './BodyVisualization2D';
import RegionDetailPanel from './RegionDetailPanel';
import HeatmapControls from './HeatmapControls';
import type { BodyAnatomy, WorkspaceState, RegionIntensity, HeatmapConfig, EmotionType } from './types';

interface ExperientialVisualCoreProps {
  anatomy: BodyAnatomy;
  state: WorkspaceState;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  selectedRegion: any;
  onClearSelection: () => void;
}

const stateLabels: Record<WorkspaceState, string> = {
  observation: 'Observación',
  analysis: 'Análisis',
  synthesis: 'Síntesis',
  closure: 'Cierre',
};

export default function ExperientialVisualCore({
  anatomy,
  state,
  selectedRegionId,
  onRegionSelect,
  selectedRegion,
  onClearSelection,
}: ExperientialVisualCoreProps) {
  // Disable selection in closure state (following UX criteria)
  const isSelectionDisabled = state === 'closure';

  // Heatmap state (PROMPT #6)
  const [heatmapData, setHeatmapData] = useState<RegionIntensity[]>([]);
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>({
    enabled: false,
    showLabels: true,
    opacity: 0.6,
    colorScheme: 'default',
  });

  // Handle intensity updates
  const handleIntensityUpdate = useCallback((regionId: string, intensity: number, emotionType: EmotionType) => {
    setHeatmapData((prev) => {
      const existing = prev.find((d) => d.regionId === regionId);

      if (intensity === 0) {
        // Remove if intensity is 0
        return prev.filter((d) => d.regionId !== regionId);
      }

      if (existing) {
        return prev.map((d) =>
          d.regionId === regionId
            ? { ...d, intensity, emotionType, lastUpdated: new Date() }
            : d
        );
      } else {
        return [
          ...prev,
          {
            regionId,
            intensity,
            emotionType,
            lastUpdated: new Date(),
          },
        ];
      }
    });
  }, []);

  // Get current intensity for selected region
  const currentIntensity = selectedRegionId
    ? heatmapData.find((d) => d.regionId === selectedRegionId)
    : undefined;

  return (
    <section className="w-full space-y-4">
      {/* Header */}
      <div className="bio-card-glass rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🧘 Cuerpo experiencial
            </h3>
            <p className="text-xs text-gray-500">
              Vista 2D consultiva. No diagnostica ni automatiza conclusiones.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Estado del workspace</p>
            <p className="text-sm font-medium text-gray-800">{stateLabels[state]}</p>
          </div>
        </div>
      </div>

      {/* Body Visualization with Heatmap */}
      <div className="bio-card-glass rounded-2xl p-6">
        <BodyVisualization2D
          anatomy={anatomy}
          selectedRegionId={selectedRegionId}
          onRegionSelect={onRegionSelect}
          disabled={isSelectionDisabled}
          heatmapData={heatmapData}
          heatmapConfig={heatmapConfig}
        />
      </div>

      {/* Region Detail Panel */}
      <RegionDetailPanel region={selectedRegion} onClear={onClearSelection} />

      {/* Heatmap Controls (PROMPT #6) */}
      <HeatmapControls
        config={heatmapConfig}
        onConfigChange={setHeatmapConfig}
        selectedRegionId={selectedRegionId}
        selectedRegionLabel={selectedRegion?.label}
        currentIntensity={currentIntensity}
        onIntensityUpdate={(intensity, emotionType) => {
          if (selectedRegionId) {
            handleIntensityUpdate(selectedRegionId, intensity, emotionType);
          }
        }}
        isReadOnly={state === 'closure'}
      />
    </section>
  );
}
