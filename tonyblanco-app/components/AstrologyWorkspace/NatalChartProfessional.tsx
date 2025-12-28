"use client";

import React from 'react';
import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface Props {
  planetas: NatalChartPayload['planetas'];
  casas: NatalChartPayload['casas'];
  aspectos: NatalChartPayload['aspectos'];
  orb: number;
}

function normalizePlanetLongitudes(planets: any[]) {
  const clusters: Record<string, any[]> = {};
  planets.forEach((p) => {
    const key = (Math.round((p.longitud_ecliptica || 0) * 100) / 100).toFixed(2);
    clusters[key] = clusters[key] || [];
    clusters[key].push(p);
  });
  const adjusted: any[] = [];
  Object.keys(clusters).forEach((k) => {
    const group = clusters[k];
    const base = group[0].longitud_ecliptica || 0;
    if (group.length === 1) adjusted.push({ ...group[0], _display_longitude: base });
    else {
      const spreadDeg = 0.6;
      const step = spreadDeg / Math.max(1, group.length - 1);
      const start = -spreadDeg / 2;
      group.forEach((p, i) => adjusted.push({ ...p, _display_longitude: base + start + i * step }));
    }
  });
  return adjusted;
}

function getPlanetPos(longitude: number) {
  const radius = 65;
  const centerX = 100;
  const centerY = 100;
  const lon = ((longitude % 360) + 360) % 360;
  const angle = (lon - 90) * (Math.PI / 180);
  return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
}

export default function NatalChartProfessional({ planetas, casas, aspectos, orb }: Props) {
  const displayedPlanets = normalizePlanetLongitudes(planetas || []);

  const planetIndex: Record<string, any> = {};
  displayedPlanets.forEach((p) => {
    planetIndex[String(p.nombre)] = p;
  });

  const aspectLines = (aspectos || []).filter((a) => Math.abs(Number(a.orbe || 0)) <= orb).map((a) => {
    const p1 = planetIndex[String(a.planeta1)];
    const p2 = planetIndex[String(a.planeta2)];
    if (!p1 || !p2) return null;
    const pos1 = getPlanetPos(p1._display_longitude ?? p1.longitud_ecliptica);
    const pos2 = getPlanetPos(p2._display_longitude ?? p2.longitud_ecliptica);
    return { pos1, pos2, tipo: a.tipo };
  }).filter(Boolean) as Array<{ pos1: { x: number; y: number }; pos2: { x: number; y: number }; tipo: string }>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h4 className="text-lg font-semibold mb-2">Carta natal — Visualización profesional (solo lectura)</h4>
      <p className="text-xs text-gray-500 mb-4">Basada en efemérides reales (Swiss Ephemeris). Sin automatización ni diagnóstico.</p>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-lg h-auto">
          {/* Houses */}
          {casas.map((c) => {
            const lon = c.cuspide_longitud || 0;
            const angle = ((lon % 360) + 360) % 360;
            const rad = (angle - 90) * (Math.PI / 180);
            const x2 = 100 + 85 * Math.cos(rad);
            const y2 = 100 + 85 * Math.sin(rad);
            return (
              <line key={`hp-${c.numero}`} x1={100} y1={100} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />
            );
          })}

          {/* Aspect lines */}
          {aspectLines.map((ln, i) => (
            <line key={`asp-${i}`} x1={ln.pos1.x} y1={ln.pos1.y} x2={ln.pos2.x} y2={ln.pos2.y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          ))}

          {/* Planets */}
          {displayedPlanets.map((p) => {
            const lon = p._display_longitude ?? p.longitud_ecliptica;
            const pos = getPlanetPos(lon);
            return (
              <g key={`pp-${String(p.nombre)}-${String(p.longitud_ecliptica)}`}>
                <circle cx={pos.x} cy={pos.y} r={4} fill="#1f2937" />
                <text x={pos.x} y={pos.y + 10} fontSize={10} textAnchor="middle" fill="#1f2937" fontWeight={600}>
                  {String(p.nombre).slice(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 text-xs text-gray-600">Representación observacional — solo lectura. El orbe controla visibilidad de aspectos.</div>
    </div>
  );
}
