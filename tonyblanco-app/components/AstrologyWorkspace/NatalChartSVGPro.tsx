"use client";

import React from 'react';
import type { NatalChartPayload } from '@/hooks/useNatalChart';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';

interface Props {
  chart: NatalChartPayload;
  consultante?: ActiveConsultante;
  width?: number | string;
  height?: number | string;
  visiblePlanets?: Record<string, boolean>;
  visibleAspects?: Record<string, boolean>;
  orbDegrees?: number;
  className?: string;
  onSelectPlanet?: (planet: string) => void;
}

const VIEWBOX_SIZE = 1000;
const CENTER_X = VIEWBOX_SIZE / 2;
const CENTER_Y = VIEWBOX_SIZE / 2;
const OUTER_RADIUS = 450;
const INNER_RADIUS = 350;
const HOUSE_RADIUS = 400;
const PLANET_RADIUS = 300;
const SIGN_RADIUS = 425;

const ZODIAC_SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];

// Professional color palette for planets and aspects
const PLANET_COLORS: Record<string, string> = {
  sun: '#f59e0b', // amber
  moon: '#3b82f6', // blue
  mercury: '#6b7280', // gray
  venus: '#ec4899', // rose
  mars: '#ef4444', // red
  jupiter: '#7c3aed', // violet
  saturn: '#334155', // slate
  uranus: '#06b6d4', // teal/cyan
  neptune: '#0ea5e9', // light blue
  pluto: '#6d28d9', // deep purple
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#111827',
  opposition: '#ef4444',
  trine: '#10b981',
  square: '#f97316',
  sextile: '#3b82f6',
  quincunx: '#8b5cf6',
};

function getPlanetColor(name: string) {
  const key = String(name).toLowerCase().trim();
  return PLANET_COLORS[key] || '#1f2937';
}

function getAspectColor(tipo: string) {
  return ASPECT_COLORS[String(tipo).toLowerCase()] || '#64748b';
}

function getAngle(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  };
}

function normalizePlanetName(name: string): string {
  return name.toLowerCase().trim();
}

export default function NatalChartSVGPro({
  chart,
  width = '100%',
  height = 520,
  visiblePlanets = {},
  visibleAspects = {},
  orbDegrees = 6,
  className = '',
  onSelectPlanet,
}: Props) {
  const planetas = chart.planetas || [];
  const casas = chart.casas || [];
  const aspectos = chart.aspectos || [];

  // Filter planets
  const filteredPlanets = planetas.filter(p => visiblePlanets[normalizePlanetName(p.nombre)] !== false);

  // Filter aspects
  const filteredAspects = aspectos.filter(a => {
    const key = `${normalizePlanetName(a.planeta1)}-${normalizePlanetName(a.planeta2)}-${a.tipo}`;
    return visibleAspects[key] !== false && Math.abs(a.orbe || 0) <= orbDegrees;
  });

  // Planet positions
  const planetPositions: Record<string, { x: number; y: number; planet: any }> = {};
  filteredPlanets.forEach(p => {
    const angle = getAngle(p.longitud_ecliptica);
    const pos = polarToCartesian(angle, PLANET_RADIUS);
    planetPositions[normalizePlanetName(p.nombre)] = { ...pos, planet: p };
  });

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
        style={{ maxWidth: '720px', height: 'auto' }}
      >
        {/* Outer circle */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={OUTER_RADIUS}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Inner circle */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={INNER_RADIUS}
          fill="none"
          stroke="#6b7280"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* House cusps */}
        {casas.map((c) => {
          const angle = getAngle(c.cuspide_longitud || 0);
          const pos = polarToCartesian(angle, HOUSE_RADIUS);
          const isAsc = Number(c.numero) === 1;
          const isMc = Number(c.numero) === 10;
          const strokeW = isAsc || isMc ? 2.4 : 1;
          return (
            <g key={`house-${c.numero}`}>
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={pos.x}
                y2={pos.y}
                stroke="#9ca3af"
                strokeWidth={strokeW}
                vectorEffect="non-scaling-stroke"
              />
              {/* house number label */}
              <text
                x={polarToCartesian(angle, HOUSE_RADIUS + 28).x}
                y={polarToCartesian(angle, HOUSE_RADIUS + 28).y}
                fontSize="18"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6b7280"
                fontFamily="ui-sans-serif, system-ui"
                fontWeight={600}
              >
                {String(c.numero)}
              </text>
            </g>
          );
        })}

        {/* Zodiac signs */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = i * 30 + 15; // Center of each 30° segment
          const pos = polarToCartesian(angle, SIGN_RADIUS);
          return (
            <text
              key={`sign-${i}`}
              x={pos.x}
              y={pos.y}
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6b7280"
              fontFamily="ui-sans-serif, system-ui"
            >
              {sign}
            </text>
          );
        })}

        {/* Planets */}
        {Object.entries(planetPositions).map(([name, { x, y, planet }]) => (
          <g key={`planet-${name}`}>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill={getPlanetColor(String(name))}
              stroke="#ffffff"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              style={{ cursor: onSelectPlanet ? 'pointer' : 'default' }}
              onClick={() => onSelectPlanet?.(name)}
            />
            <text
              x={x}
              y={y + 14}
              fontSize="12"
              textAnchor="middle"
              fill="#111827"
              fontFamily="ui-sans-serif, system-ui"
              fontWeight="600"
            >
              {String(name).toUpperCase().slice(0, 3)}
            </text>
          </g>
        ))}

        {/* Aspects */}
        {filteredAspects.map((a, idx) => {
          const p1 = planetPositions[normalizePlanetName(a.planeta1)];
          const p2 = planetPositions[normalizePlanetName(a.planeta2)];
          if (!p1 || !p2) return null;
          const color = getAspectColor(String(a.tipo));
          return (
            <line
              key={`aspect-${idx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={color}
              strokeWidth={1.8}
              strokeDasharray={String(a.tipo).toLowerCase() === 'conjunction' ? undefined : '4 3'}
              vectorEffect="non-scaling-stroke"
              opacity={0.95}
            />
          );
        })}
      </svg>
    </div>
  );
}