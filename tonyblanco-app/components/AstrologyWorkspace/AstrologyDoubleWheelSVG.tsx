"use client";

import React from 'react';
import type { NatalChartPayload } from '@/hooks/useNatalChart';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';

interface Props {
  natal: NatalChartPayload;
  overlay?: NatalChartPayload | null;
  overlayLabel?: string;
  consultante?: ActiveConsultante;
  width?: number | string;
  height?: number | string;
  orbDegrees?: number;
}

const VIEWBOX = 1000;
const CX = VIEWBOX / 2;
const CY = VIEWBOX / 2;

function angleOf(lon: number) {
  return ((lon % 360) + 360) % 360;
}

function polar(angle: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function renderPlanets(planets: any[], radius: number, size = 6, labelOffset = 14) {
  return planets.map((p: any) => {
    const a = angleOf(p.longitud_ecliptica || p.grados || 0);
    const pos = polar(a, radius);
    const key = `${String(p.nombre)}-${String(p.longitud_ecliptica)}`;
    return (
      <g key={key}>
        <circle cx={pos.x} cy={pos.y} r={size} fill="#111827" />
        <text x={pos.x} y={pos.y + labelOffset} fontSize={12} textAnchor="middle" fill="#111827" fontWeight={600}>
          {String(p.nombre).slice(0,3).toUpperCase()}
        </text>
      </g>
    );
  });
}

export default function AstrologyDoubleWheelSVG({ natal, overlay, overlayLabel = '', width = '100%', height = 560, orbDegrees = 6 }: Props) {
  const natalPlanets = natal.planetas || [];
  const overlayPlanets = overlay?.planetas || [];

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} width={width} height={height} preserveAspectRatio="xMidYMid meet" className="border border-gray-200 rounded-lg bg-white shadow-sm" style={{ maxWidth: '720px' }}>
        {/* Outer ring for overlay */}
        <circle cx={CX} cy={CY} r={440} fill="none" stroke="#374151" strokeWidth={2} vectorEffect="non-scaling-stroke" />

        {/* Inner natal ring */}
        <circle cx={CX} cy={CY} r={320} fill="none" stroke="#6b7280" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />

        {/* Natal planets (inner) */}
        <g id="natal-planets">{renderPlanets(natalPlanets, 260, 7, 16)}</g>

        {/* Overlay planets (outer) */}
        {overlay && (
          <g id="overlay-planets">
            <text x={CX} y={CY - 470} fontSize={14} textAnchor="middle" fill="#374151" fontWeight={700}>{overlayLabel}</text>
            {renderPlanets(overlayPlanets, 360, 5, 10)}
          </g>
        )}
      </svg>
    </div>
  );
}
