"use client";

import React from 'react';
import type { PlanetPoint } from './astro-geometry';
import { createWheelGeometry, degToPoint, aspectStyle, computeSynastryAspects } from './astro-geometry';
import AstroWheelAdvanced from './AstroWheelAdvanced';

interface Props {
  size?: number;
  baseAscDeg: number;
  baseHouses: number[];
  basePlanets: PlanetPoint[];
  comparedAscDeg: number;
  comparedPlanets: PlanetPoint[];
  comparedHouses?: number[] | null;
  showAsteroids?: boolean;
  asteroidsBase?: PlanetPoint[];
  asteroidsCompared?: PlanetPoint[];
  orbDeg?: number;
}

const ASPECT_COLORS: Record<string, string> = {
  CONJ: '#8a6a00', // gold
  OPP: '#b40000',
  SQR: '#b40000',
  TRI: '#007a2f',
  SEXT: '#0b4aa6',
};

export default function AstroDoubleWheelAdvanced({ size = 920, baseAscDeg, baseHouses, basePlanets, comparedAscDeg, comparedPlanets, showAsteroids = false, asteroidsBase = [], asteroidsCompared = [], orbDeg = 6 }: Props) {
  const geo = createWheelGeometry({ size, ascendantDeg: baseAscDeg, zodiacGlyphs: [] as any });
  const synastry = computeSynastryAspects(basePlanets || [], comparedPlanets || [], 8, orbDeg);

  // For overlay drawing we compute points using same geometry (rotation + center)
  function canvasPoint(deg: number, radius: number) {
    // apply rotation so deg is transformed same way AstroWheelAdvanced does
    return degToPoint(deg, radius, geo.center);
  }

  const innerRadius = geo.rings.planetRing;
  const outerRadius = geo.rings.asteroidRing;

  return (
    <div className="relative w-full" style={{ height: size }}>
      {/* behind wheel (compared) */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        <AstroWheelAdvanced size={size} ascendantDeg={comparedAscDeg} houses={baseHouses} planets={comparedPlanets} asteroids={showAsteroids ? asteroidsCompared : []} showAspects={false} orbDeg={orbDeg} />
      </div>

      {/* front wheel (base) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AstroWheelAdvanced size={size} ascendantDeg={baseAscDeg} houses={baseHouses} planets={basePlanets} asteroids={showAsteroids ? asteroidsBase : []} showAspects={false} orbDeg={orbDeg} />
      </div>

      {/* SVG overlay for inter-wheel aspects (absolute overlay) */}
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`rotate(${geo.rotationDeg} ${geo.center} ${geo.center})`}>
          {synastry.map((s, idx) => {
            const pA = basePlanets.find((p) => p.key === s.p1Key);
            const pB = comparedPlanets.find((p) => p.key === s.p2Key);
            if (!pA || !pB) return null;
            const ptA = canvasPoint(pA.degree, innerRadius);
            const ptB = canvasPoint(pB.degree, outerRadius);
            const st = aspectStyle({ p1Key: s.p1Key, p2Key: s.p2Key, kind: s.kind, orb: s.orb, angle: s.angle });
            const color = ASPECT_COLORS[s.kind] || st.stroke;
            return (
              <line key={`syn-${idx}`} x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y} stroke={color} strokeWidth={Math.max(0.8, st.width * 0.9)} strokeOpacity={Math.min(0.95, st.opacity + 0.05)} />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
