'use client';

import BodyVisualization2D from './BodyVisualization2D';
import RegionDetailPanel from './RegionDetailPanel';
import type { BodyAnatomy, WorkspaceState } from './types';

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

  return (
    <section className="w-full space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cuerpo experiencial</h3>
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

      {/* Body Visualization */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <BodyVisualization2D
          anatomy={anatomy}
          selectedRegionId={selectedRegionId}
          onRegionSelect={onRegionSelect}
          disabled={isSelectionDisabled}
        />
      </div>

      {/* Region Detail Panel */}
      <RegionDetailPanel region={selectedRegion} onClear={onClearSelection} />
    </section>
  );
}
