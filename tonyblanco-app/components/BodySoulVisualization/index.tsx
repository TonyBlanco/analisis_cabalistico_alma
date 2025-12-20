'use client';

import { useEffect } from 'react';
import BodyMap from './BodyMap';
import LayerControls from './LayerControls';
import SefirotOverlay from './SefirotOverlay';
import TherapistNotesPanel from './TherapistNotesPanel';
import { bodyRegions } from './data/bodyRegions';
import { sefirotBodyCorrespondences, sefirotConnections, sefirotDefinitions } from './data/sefirotCorrespondences';
import { useVisualizationLayers } from './hooks/useVisualizationLayers';
import type { VisualizationState } from './types';

interface BodySoulVisualizationProps {
  onStateChange?: (state: VisualizationState) => void;
}

export default function BodySoulVisualization({ onStateChange }: BodySoulVisualizationProps) {
  const { state, derived, toggleLayer, setSide, selectBodyRegion, selectSefirah, getNoteForTarget, upsertNote } =
    useVisualizationLayers();

  const selectedSefirah = sefirotDefinitions.find((item) => item.id === state.selectedSefirahId) || null;
  const selectedBodyRegion = bodyRegions.find((item) => item.id === state.selectedBodyRegionId) || null;

  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange, state]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <LayerControls
            activeLayers={state.activeLayers}
            side={state.side}
            onToggleLayer={toggleLayer}
            onSideChange={setSide}
          />
          <TherapistNotesPanel
            selectedSefirah={selectedSefirah}
            selectedBodyRegion={selectedBodyRegion}
            correspondences={sefirotBodyCorrespondences}
            getNoteForTarget={getNoteForTarget}
            onSaveNote={upsertNote}
          />
        </div>
        <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Vista {state.side === 'front' ? 'front' : 'back'} (P1)</span>
            <span>Seleccion neutral</span>
          </div>
          <div className="mt-3 flex items-center justify-center">
            {!derived.showBody && !derived.showSefirot ? (
              <div className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
                Activa una capa para iniciar la visualizacion consultive.
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                {derived.showBody && (
                  <BodyMap
                    regions={bodyRegions}
                    selectedRegionId={state.selectedBodyRegionId}
                    side={state.side}
                    onSelectRegion={selectBodyRegion}
                    className="relative w-full h-auto"
                  />
                )}
                {derived.showSefirot && (
                  <SefirotOverlay
                    sefirot={sefirotDefinitions}
                    connections={sefirotConnections}
                    selectedSefirahId={state.selectedSefirahId}
                    onSelectSefirah={selectSefirah}
                    className={
                      derived.showBody
                        ? 'absolute inset-0 w-full h-auto'
                        : 'relative w-full h-auto'
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Consultive visualization. No clinical conclusions or automated interpretation.
      </p>
    </div>
  );
}
