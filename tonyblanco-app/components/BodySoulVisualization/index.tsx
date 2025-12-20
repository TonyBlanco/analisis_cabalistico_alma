'use client';

import { useEffect, useState } from 'react';
import BodyMap from './BodyMap';
import LayerControls from './LayerControls';
import SefirotInteractive from './SefirotInteractive';
import TherapistNotesPanel from './TherapistNotesPanel';
import { bodyRegions } from './data/bodyRegions';
import { sefirotBodyCorrespondences, sefirotDefinitions } from './data/sefirotCorrespondences';
import { useVisualizationLayers } from './hooks/useVisualizationLayers';
import type { VisualizationState } from './types';

interface BodySoulVisualizationProps {
  onStateChange?: (state: VisualizationState) => void;
}

export default function BodySoulVisualization({ onStateChange }: BodySoulVisualizationProps) {
  const {
    state,
    derived,
    toggleLayer,
    setSide,
    selectSefirah,
    selectBodyRegion,
    getNoteForTarget,
    upsertNote,
  } = useVisualizationLayers();

  const [hoveredSefirah, setHoveredSefirah] = useState<string | null>(null);

  const selectedSefirah =
    sefirotDefinitions.find((item) => item.id === state.selectedSefirahId) || null;
  const selectedBodyRegion =
    bodyRegions.find((item) => item.id === state.selectedBodyRegionId) || null;

  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange, state]);

  const handleSefirahClick = (sefirahId: string) => {
    selectSefirah(state.selectedSefirahId === sefirahId ? null : sefirahId);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <LayerControls
          activeLayers={state.activeLayers}
          side={state.side}
          onToggleLayer={toggleLayer}
          onSideChange={setSide}
        />
      </div>

      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="text-sm text-slate-500">
            Vista {state.side === 'front' ? 'frente' : 'espalda'} (P1)
          </div>
          <div className="text-sm text-slate-400">
            {selectedSefirah
              ? selectedSefirah.spanishName
              : selectedBodyRegion
                ? selectedBodyRegion.label
                : 'Seleccion neutral'}
          </div>
        </div>
        <div className="p-4">
          <div className="w-full aspect-[2/3] rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            {!derived.showBody && !derived.showSefirot ? (
              <div className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
                Activa una capa para iniciar la visualizacion consultiva.
              </div>
            ) : (
              <div className="relative w-full h-full max-w-[720px]">
                {derived.showSefirot && (
                  <div className="absolute inset-0 w-full h-full">
                    <SefirotInteractive
                      selectedId={state.selectedSefirahId}
                      hoveredId={hoveredSefirah}
                      onSelect={handleSefirahClick}
                      onHover={setHoveredSefirah}
                    />
                  </div>
                )}
                {derived.showBody && (
                  <BodyMap
                    regions={bodyRegions}
                    selectedRegionId={state.selectedBodyRegionId}
                    side={state.side}
                    onSelectRegion={selectBodyRegion}
                    className={
                      derived.showSefirot
                        ? 'absolute inset-0 w-full h-full opacity-70'
                        : 'relative w-full h-full'
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TherapistNotesPanel
        selectedSefirah={selectedSefirah}
        selectedBodyRegion={selectedBodyRegion}
        correspondences={sefirotBodyCorrespondences}
        getNoteForTarget={getNoteForTarget}
        onSaveNote={upsertNote}
      />
    </div>
  );
}
