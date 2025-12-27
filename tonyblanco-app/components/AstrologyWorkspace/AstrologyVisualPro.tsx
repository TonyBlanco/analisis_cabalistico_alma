'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';
import AstrologyHolisticDisclaimer from './AstrologyHolisticDisclaimer';
import { useAstrologyMode } from '@/components/AstrologyMode/AstrologyModeContext';

type AspectEntry = NonNullable<NatalChartPayload['aspectos']>[number];

const PLANET_LABELS: Record<string, string> = {
  sun: 'Sol',
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
  pluto: 'Plutón',
  north_node: 'Nodo Norte',
  south_node: 'Nodo Sur',
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Conjunción',
  opposition: 'Oposición',
  trine: 'Trígono',
  square: 'Cuadratura',
  sextile: 'Sextil',
  quincunx: 'Quincuncio',
  semisextile: 'Semisextil',
  semisquare: 'Semicuadratura',
  sesquiquadrate: 'Sesquicuadratura',
};

const DEFAULT_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const DEFAULT_ASPECT_TYPES = ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'];

type VisualProState = {
  layers: {
    natal: boolean;
    transits: boolean;
    solarReturn: boolean;
    progressions: boolean;
  };
  planets: Record<string, boolean>;
  aspects: Record<string, boolean>;
  orb: number;
};

type UsageMode = 'PROFESSIONAL' | 'TRAINING';

function formatAspect(aspect: AspectEntry) {
  const p1 = PLANET_LABELS[aspect.planeta1] || aspect.planeta1;
  const p2 = PLANET_LABELS[aspect.planeta2] || aspect.planeta2;
  const t = ASPECT_LABELS[aspect.tipo] || aspect.tipo;
  const orb = typeof aspect.orbe === 'number' ? `${aspect.orbe.toFixed(2)}°` : String(aspect.orbe ?? '-');
  return { p1, p2, t, orb };
}

interface AstrologyVisualProProps {
  chart: NatalChartPayload;
  analysisResult?: MultiTechAnalysisResult | null;
  hasRealConsultante?: boolean;
}

export default function AstrologyVisualPro({ chart, analysisResult, hasRealConsultante = false }: AstrologyVisualProProps) {
  const { mode } = useAstrologyMode();
  const analysis = analysisResult ?? null;
  const natalChart = analysis?.natal || chart;
  const transitsChart = analysis?.transits || null;
  const solarReturnChart = analysis?.solarReturn?.chart || null;
  const progressionsChart = analysis?.progressions?.chart || null;

  const usageMode: UsageMode = mode === 'TRAINING' ? 'TRAINING' : 'PROFESSIONAL';

  const hasNatal = Boolean(chart);
  const hasTransits = Boolean(analysisResult?.transits);
  const hasSolarReturn = Boolean(analysisResult?.solarReturn);
  const hasProgressions = Boolean(analysisResult?.progressions);

  const overlayAvailable = {
    natal: hasNatal,
    transits: hasTransits,
    solarReturn: hasSolarReturn,
    progressions: hasProgressions,
  };

  const [visualState, setVisualState] = useState<VisualProState>(() => ({
    layers: {
      natal: true,
      transits: overlayAvailable.transits,
      solarReturn: overlayAvailable.solarReturn,
      progressions: overlayAvailable.progressions,
    },
    planets: DEFAULT_PLANETS.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>),
    aspects: DEFAULT_ASPECT_TYPES.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>),
    orb: 6,
  }));
  const [selectedAspectIndex, setSelectedAspectIndex] = useState<number | null>(null);

  const lastAvailability = useRef(overlayAvailable);
  useEffect(() => {
    const prev = lastAvailability.current;
    lastAvailability.current = overlayAvailable;
    setVisualState((prevState) => {
      const nextLayers = { ...prevState.layers };
      (['transits', 'solarReturn', 'progressions'] as const).forEach((layer) => {
        if (!overlayAvailable[layer]) {
          nextLayers[layer] = false;
          return;
        }
        if (!prev[layer] && overlayAvailable[layer]) {
          nextLayers[layer] = true;
        }
      });
      nextLayers.natal = true;
      const changed =
        nextLayers.natal !== prevState.layers.natal ||
        nextLayers.transits !== prevState.layers.transits ||
        nextLayers.solarReturn !== prevState.layers.solarReturn ||
        nextLayers.progressions !== prevState.layers.progressions;
      return changed ? { ...prevState, layers: nextLayers } : prevState;
    });
  }, [overlayAvailable.natal, overlayAvailable.transits, overlayAvailable.solarReturn, overlayAvailable.progressions]);

  const activeCharts = useMemo(() => {
    const layers = [
      { id: 'natal' as const, chart: natalChart },
      { id: 'transits' as const, chart: transitsChart },
      { id: 'solarReturn' as const, chart: solarReturnChart },
      { id: 'progressions' as const, chart: progressionsChart },
    ];
    return layers.filter((layer) => visualState.layers[layer.id] && layer.chart);
  }, [natalChart, transitsChart, solarReturnChart, progressionsChart, visualState.layers]);

  const aspects: AspectEntry[] = useMemo(() => {
    return activeCharts.flatMap((layer) => {
      const layerAspects = Array.isArray(layer.chart?.aspectos) ? layer.chart!.aspectos : [];
      return layerAspects.map((a) => ({ ...a, _layer: layer.id }));
    });
  }, [activeCharts]);

  const filteredAspects = useMemo(() => {
    return aspects
      .map((a, idx) => ({ ...a, _idx: idx }))
      .filter((a) => {
        const orbOk = typeof a.orbe === 'number' ? Math.abs(a.orbe) <= visualState.orb : true;
        const planet1Ok = visualState.planets[a.planeta1] !== false;
        const planet2Ok = visualState.planets[a.planeta2] !== false;
        const typeOk = visualState.aspects[a.tipo] !== false;
        return orbOk && planet1Ok && planet2Ok && typeOk;
      })
      .sort((a, b) => {
        const oa = typeof a.orbe === 'number' ? a.orbe : Number.MAX_VALUE;
        const ob = typeof b.orbe === 'number' ? b.orbe : Number.MAX_VALUE;
        return oa - ob;
      });
  }, [aspects, visualState]);

  const handlePlanetToggle = (key: string) => {
    setVisualState((prev) => ({
      ...prev,
      planets: { ...prev.planets, [key]: !prev.planets[key] },
    }));
  };

  const handleAspectTypeToggle = (key: string) => {
    setVisualState((prev) => ({
      ...prev,
      aspects: { ...prev.aspects, [key]: !prev.aspects[key] },
    }));
  };

  const handleOverlayToggle = (key: 'natal' | 'transits' | 'solarReturn' | 'progressions') => {
    setVisualState((prev) => ({
      ...prev,
      layers: { ...prev.layers, [key]: !prev.layers[key] },
    }));
  };

  const selectedAspect =
    selectedAspectIndex != null ? filteredAspects.find((a) => a._idx === selectedAspectIndex) : undefined;

  const meta = natalChart.metadatos || {};
  const showSimulationBanner = !hasRealConsultante;

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Visual Pro</p>
          <h3 className="text-lg font-semibold text-gray-900">Carta + Overlays (solo visual)</h3>
          <p className="text-xs text-gray-600 mt-1">
            No se recalcula nada. Los controles filtran visibilidad; los datos permanecen idénticos al resultado original.
          </p>
          {showSimulationBanner ? (
            <p className="text-xs text-gray-600 mt-1">
              🟡 Simulacion academica — Study / Lab (sin consultantes reales)
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-1">
              🟢 Datos reales del consultante — visualizacion profesional (solo lectura)
            </p>
          )}
          {usageMode === 'TRAINING' ? (
            <p className="text-[11px] text-amber-700 mt-1">
              Modo training: ayudas educativas activas. El modo no oculta datos reales.
            </p>
          ) : null}
        </div>
        <div className="text-[11px] text-gray-500">
          <p>House: {meta.sistema_casas || '-'}</p>
          <p>Zodiaco: {meta.zodiac_type || '-'}</p>
          <p>Engine: {meta.fuente || meta.source || 'kerykeion/swisseph'}</p>
        </div>
      </div>
      <div className="px-4 pt-4">
        <AstrologyHolisticDisclaimer compact />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4">
        {/* Overlays */}
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">Capas</p>
          <div className="space-y-2 text-sm">
            {(['natal', 'transits', 'solarReturn', 'progressions'] as const).map((key) => {
              const labelMap = {
                natal: 'Natal (base)',
                transits: 'Tránsitos',
                solarReturn: 'Retorno Solar',
                progressions: 'Progresiones',
              };
              const available = overlayAvailable[key];
              const showComingSoon = !available;
              return (
                <label key={key} className={`flex items-center justify-between rounded-md px-2 py-2 ${available ? 'bg-gray-50' : 'bg-gray-100'}`}>
                  <span className="text-gray-800">{labelMap[key]}</span>
                  <div className="flex items-center gap-2">
                    {showComingSoon && <span className="text-[11px] text-gray-500">Próximamente</span>}
                    <input
                      type="checkbox"
                      checked={visualState.layers[key]}
                      disabled={!available || key === 'natal'}
                      onChange={() => handleOverlayToggle(key)}
                      className="h-4 w-4"
                    />
                  </div>
                </label>
              );
            })}
            <p className="text-[11px] text-gray-500">Las capas no recalculan datos; solo controlan visibilidad.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-lg border border-gray-200 p-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Orbe (solo visual)</p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={visualState.orb}
                onChange={(e) => setVisualState((prev) => ({ ...prev, orb: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm text-gray-800 w-12 text-right">{visualState.orb.toFixed(1)}°</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">El orbe afecta solo a la visualización.</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Planetas/Puntos</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DEFAULT_PLANETS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={visualState.planets[p]}
                    onChange={() => handlePlanetToggle(p)}
                    className="h-4 w-4"
                  />
                  {PLANET_LABELS[p] || p}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Aspectos</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DEFAULT_ASPECT_TYPES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={visualState.aspects[a]}
                    onChange={() => handleAspectTypeToggle(a)}
                    className="h-4 w-4"
                  />
                  {ASPECT_LABELS[a] || a}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect list + audit */}
        <div className="rounded-lg border border-gray-200 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Aspectos visibles</p>
            <span className="text-xs text-gray-500">{filteredAspects.length} / {aspects.length}</span>
          </div>
          <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-100">
            {filteredAspects.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Sin aspectos en rango de orbe/filtros.</div>
            ) : (
              filteredAspects.map((a) => {
                const formatted = formatAspect(a);
                const isActive = selectedAspectIndex === a._idx;
                return (
                  <button
                    key={a._idx}
                    type="button"
                    onClick={() => setSelectedAspectIndex(a._idx)}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      isActive ? 'bg-blue-50 border-l-2 border-blue-400' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{formatted.p1} – {formatted.p2}</span>
                      <span className="text-xs text-gray-500">{formatted.orb}</span>
                    </div>
                    <div className="text-xs text-gray-600">{formatted.t}</div>
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Auditoría visual</p>
            <p>Tipo: Carta natal (visual)</p>
            <p>Sistema de casas: {meta.sistema_casas || '-'}</p>
            <p>Zodiaco: {meta.zodiac_type || '-'}</p>
            <p>Engine: {meta.fuente || meta.source || 'kerykeion/swisseph'}</p>
            <p>Versión engine: {meta.version_engine || '-'}</p>
            <p>Ephemeris: {meta.ephemeris_path || meta.ayanamsha || 'No declarado (solo lectura)'}</p>
          </div>
        </div>
      </div>

      {selectedAspect && (
        <div className="border-t border-gray-200 px-4 py-3 bg-blue-50 text-sm text-blue-900">
          <span className="font-semibold">Aspecto resaltado:</span>{' '}
          {formatAspect(selectedAspect).p1} – {formatAspect(selectedAspect).p2} ({formatAspect(selectedAspect).t}) ·{' '}
          orbe {formatAspect(selectedAspect).orb}
        </div>
      )}
    </section>
  );
}
