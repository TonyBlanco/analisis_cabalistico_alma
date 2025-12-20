'use client';

import { useEffect } from 'react';
import BodyMap from './BodyMap';
import LayerControls from './LayerControls';
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
    selectBodyRegion,
    getNoteForTarget,
    upsertNote,
  } = useVisualizationLayers();

  const selectedSefirah =
    sefirotDefinitions.find((item) => item.id === state.selectedSefirahId) || null;
  const selectedBodyRegion =
    bodyRegions.find((item) => item.id === state.selectedBodyRegionId) || null;

  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange, state]);

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
          <div className="text-sm text-slate-500">Vista frente (P1)</div>
          <div className="text-sm text-slate-400">Seleccion neutral</div>
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
                  <div
                    className="absolute inset-0 w-full h-full"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: sefirotStandaloneSvg }}
                  />
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

const sefirotStandaloneSvg = `<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .path { stroke: #cbd5e1; stroke-width: 1.5; fill: none; opacity: 0.7; }
      .sefira { stroke-width: 2.5; cursor: pointer; transition: all 0.3s; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
      .sefira:hover { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1); }
      .label { font-family: 'Georgia', serif; font-size: 14px; font-weight: 600; text-anchor: middle; }
      .hebrew { font-family: 'Times New Roman', serif; font-size: 11px; text-anchor: middle; opacity: 0.7; }
      .meaning { font-family: 'Arial', sans-serif; font-size: 10px; text-anchor: middle; opacity: 0.6; font-style: italic; }
      .pillar-label { font-family: 'Arial', sans-serif; font-size: 9px; font-weight: 600; fill: #64748b; text-anchor: middle; }
    </style>
    
    <radialGradient id="grad-keter">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-chokmah">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7dd3fc;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-binah">
      <stop offset="0%" style="stop-color:#4338ca;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#312e81;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-chesed">
      <stop offset="0%" style="stop-color:#93c5fd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-gevurah">
      <stop offset="0%" style="stop-color:#fca5a5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-tiferet">
      <stop offset="0%" style="stop-color:#fef08a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#facc15;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-netzach">
      <stop offset="0%" style="stop-color:#86efac;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-hod">
      <stop offset="0%" style="stop-color:#fdba74;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-yesod">
      <stop offset="0%" style="stop-color:#e9d5ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="grad-malkuth">
      <stop offset="0%" style="stop-color:#d9f99d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#65a30d;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <rect width="400" height="600" fill="#f8fafc"/>
  
  <text x="100" y="20" class="pillar-label">PILAR DE LA SEVERIDAD</text>
  <text x="200" y="20" class="pillar-label">PILAR DEL EQUILIBRIO</text>
  <text x="300" y="20" class="pillar-label">PILAR DE LA MISERICORDIA</text>
  
  <line x1="100" y1="25" x2="100" y2="540" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3"/>
  <line x1="200" y1="25" x2="200" y2="540" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3"/>
  <line x1="300" y1="25" x2="300" y2="540" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3"/>
  
  <g>
    <line class="path" x1="200" y1="60" x2="200" y2="270"/>
    <line class="path" x1="200" y1="270" x2="200" y2="450"/>
    <line class="path" x1="200" y1="450" x2="200" y2="540"/>
    
    <line class="path" x1="300" y1="132" x2="300" y2="240"/>
    <line class="path" x1="300" y1="240" x2="300" y2="390"/>
    
    <line class="path" x1="100" y1="132" x2="100" y2="240"/>
    <line class="path" x1="100" y1="240" x2="100" y2="390"/>
    
    <line class="path" x1="200" y1="60" x2="300" y2="132"/>
    <line class="path" x1="200" y1="60" x2="100" y2="132"/>
    <line class="path" x1="300" y1="132" x2="100" y2="132"/>
    
    <line class="path" x1="300" y1="132" x2="200" y2="270"/>
    <line class="path" x1="100" y1="132" x2="200" y2="270"/>
    <line class="path" x1="300" y1="132" x2="100" y2="240"/>
    <line class="path" x1="100" y1="132" x2="300" y2="240"/>
    
    <line class="path" x1="300" y1="240" x2="200" y2="270"/>
    <line class="path" x1="100" y1="240" x2="200" y2="270"/>
    <line class="path" x1="300" y1="240" x2="100" y2="240"/>
    
    <line class="path" x1="300" y1="240" x2="100" y2="390"/>
    <line class="path" x1="100" y1="240" x2="300" y2="390"/>
    <line class="path" x1="200" y1="270" x2="300" y2="390"/>
    <line class="path" x1="200" y1="270" x2="100" y2="390"/>
    
    <line class="path" x1="300" y1="390" x2="200" y2="450"/>
    <line class="path" x1="100" y1="390" x2="200" y2="450"/>
    <line class="path" x1="300" y1="390" x2="100" y2="390"/>
    
    <line class="path" x1="300" y1="390" x2="200" y2="540"/>
    <line class="path" x1="100" y1="390" x2="200" y2="540"/>
  </g>
  
  <g>
    <circle class="sefira" cx="200" cy="60" r="30" fill="url(#grad-keter)" stroke="#94a3b8"/>
    <text class="hebrew" x="200" y="54" fill="#1e293b">???</text>
    <text class="label" x="200" y="66" fill="#1e293b">Keter</text>
    <text class="meaning" x="200" y="105" fill="#64748b">Corona</text>
  </g>
  
  <g>
    <circle class="sefira" cx="300" cy="132" r="26" fill="url(#grad-chokmah)" stroke="#0ea5e9"/>
    <text class="hebrew" x="300" y="127" fill="#0c4a6e">????</text>
    <text class="label" x="300" y="138" fill="#0c4a6e">Chokmah</text>
    <text class="meaning" x="300" y="172" fill="#075985">Sabidur¡a</text>
  </g>
  
  <g>
    <circle class="sefira" cx="100" cy="132" r="26" fill="url(#grad-binah)" stroke="#4338ca"/>
    <text class="hebrew" x="100" y="127" fill="#e0e7ff">????</text>
    <text class="label" x="100" y="138" fill="#e0e7ff">Binah</text>
    <text class="meaning" x="100" y="172" fill="#4338ca">Entendimiento</text>
  </g>
  
  <g>
    <circle class="sefira" cx="300" cy="240" r="26" fill="url(#grad-chesed)" stroke="#2563eb"/>
    <text class="hebrew" x="300" y="235" fill="#1e3a8a">???</text>
    <text class="label" x="300" y="246" fill="#eff6ff">Chesed</text>
    <text class="meaning" x="300" y="280" fill="#1e40af">Misericordia</text>
  </g>
  
  <g>
    <circle class="sefira" cx="100" cy="240" r="26" fill="url(#grad-gevurah)" stroke="#dc2626"/>
    <text class="hebrew" x="100" y="235" fill="#7f1d1d">?????</text>
    <text class="label" x="100" y="246" fill="#fef2f2">Gevurah</text>
    <text class="meaning" x="100" y="280" fill="#991b1b">Rigor</text>
  </g>
  
  <g>
    <circle class="sefira" cx="200" cy="270" r="28" fill="url(#grad-tiferet)" stroke="#ca8a04"/>
    <text class="hebrew" x="200" y="264" fill="#713f12">?????</text>
    <text class="label" x="200" y="276" fill="#422006">Tiferet</text>
    <text class="meaning" x="200" y="312" fill="#854d0e">Belleza</text>
  </g>
  
  <g>
    <circle class="sefira" cx="300" cy="390" r="26" fill="url(#grad-netzach)" stroke="#16a34a"/>
    <text class="hebrew" x="300" y="385" fill="#14532d">???</text>
    <text class="label" x="300" y="396" fill="#f0fdf4">Netzach</text>
    <text class="meaning" x="300" y="430" fill="#166534">Victoria</text>
  </g>
  
  <g>
    <circle class="sefira" cx="100" cy="390" r="26" fill="url(#grad-hod)" stroke="#ea580c"/>
    <text class="hebrew" x="100" y="385" fill="#7c2d12">???</text>
    <text class="label" x="100" y="396" fill="#fff7ed">Hod</text>
    <text class="meaning" x="100" y="430" fill="#9a3412">Esplendor</text>
  </g>
  
  <g>
    <circle class="sefira" cx="200" cy="450" r="26" fill="url(#grad-yesod)" stroke="#a855f7"/>
    <text class="hebrew" x="200" y="445" fill="#581c87">????</text>
    <text class="label" x="200" y="456" fill="#faf5ff">Yesod</text>
    <text class="meaning" x="200" y="490" fill="#7e22ce">Fundamento</text>
  </g>
  
  <g>
    <circle class="sefira" cx="200" cy="540" r="30" fill="url(#grad-malkuth)" stroke="#65a30d"/>
    <text class="hebrew" x="200" y="534" fill="#365314">?????</text>
    <text class="label" x="200" y="546" fill="#365314">Malkuth</text>
    <text class="meaning" x="200" y="585" fill="#4d7c0f">Reino</text>
  </g>
</svg>`;
