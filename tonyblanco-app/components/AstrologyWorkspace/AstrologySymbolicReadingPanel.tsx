"use client";

import React, { useMemo } from 'react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';

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
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Conjunción',
  opposition: 'Oposición',
  trine: 'Trígono',
  square: 'Cuadratura',
  sextile: 'Sextil',
  quincunx: 'Quincuncio',
};

function formatDegrees(value: unknown) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}°`;
}

function safeText(v: unknown) {
  if (v == null) return '-';
  return String(v);
}

interface Props {
  chart: NatalChartPayload | null;
  analysis_result?: MultiTechAnalysisResult | null;
  activeLayers?: Set<string> | null;
}

export default function AstrologySymbolicReadingPanel({ chart, analysis_result, activeLayers }: Props) {
  const layerMap = useMemo(() => ({
    natal: analysis_result?.natal ?? chart ?? null,
    transits: analysis_result?.transits ?? null,
    solarReturn: analysis_result?.solarReturn?.chart ?? null,
    progressions: analysis_result?.progressions?.chart ?? null,
  }), [chart, analysis_result]);

  const active = activeLayers ?? new Set(Object.keys(layerMap).filter((k) => Boolean((layerMap as any)[k])));

  const layersToShow = Array.from(active).filter((k) => Boolean((layerMap as any)[k]));
  if (layersToShow.length === 0) return null;

  return (
    <aside className="col-span-1 rounded-lg border border-gray-100 p-3">
      <h3 className="text-sm font-semibold mb-2">Lectura simbólica (panel profesional)</h3>

      <details className="mb-3" open>
        <summary className="cursor-pointer font-medium">Capas activas</summary>
        <div className="mt-2 text-sm text-gray-700">
          {layersToShow.map((l) => (
            <div key={l} className="py-1">• {l}</div>
          ))}
        </div>
      </details>

      <details className="mb-3" open>
        <summary className="cursor-pointer font-medium">Posiciones</summary>
        <div className="mt-2 space-y-2 text-sm text-gray-800">
          {layersToShow.map((layerKey) => {
            const layerChart: NatalChartPayload | null = (layerMap as any)[layerKey];
            if (!layerChart || !Array.isArray(layerChart.planetas) || layerChart.planetas.length === 0) return null;
            return (
              <div key={layerKey} className="pb-2">
                <div className="text-xs text-gray-600 mb-1">Capa: {layerKey}</div>
                <div className="space-y-1">
                  {layerChart.planetas.map((p) => (
                    <div key={`${layerKey}-${String(p.nombre)}`} className="text-sm">
                      Se observa <span className="font-medium">{PLANET_LABELS[String(p.nombre)] || String(p.nombre)}</span> →{' '}
                      <span className="italic">{safeText(p.signo)}</span> → Casa {safeText(p.casa)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <details className="mb-3">
        <summary className="cursor-pointer font-medium">Aspectos</summary>
        <div className="mt-2 space-y-2 text-sm text-gray-800">
          {layersToShow.map((layerKey) => {
            const layerChart: NatalChartPayload | null = (layerMap as any)[layerKey];
            if (!layerChart || !Array.isArray(layerChart.aspectos) || layerChart.aspectos.length === 0) return null;
            return (
              <div key={`aspects-${layerKey}`} className="pb-2">
                <div className="text-xs text-gray-600 mb-1">Capa: {layerKey}</div>
                <div className="space-y-1">
                  {layerChart.aspectos.map((a, i) => (
                    <div key={`aspect-${layerKey}-${i}`} className="text-sm">
                      Se observa <span className="font-medium">{PLANET_LABELS[a.planeta1] || a.planeta1}</span> —
                      <span className="mx-1">{ASPECT_LABELS[a.tipo] || a.tipo}</span> — <span className="font-medium">{PLANET_LABELS[a.planeta2] || a.planeta2}</span>
                      {' '}
                      (<span className="text-gray-600">orbe {formatDegrees(a.orbe)}</span>)
                      <div className="text-xs text-gray-600 mt-0.5">Indica una dinámica de relación entre estos factores; descripción neutral, sin predicción.</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </aside>
  );
}
