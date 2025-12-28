"use client";

import React, { useMemo } from 'react';
import type { AdvancedChartInput } from './chartTypes';
import { buildAdvancedInputFromPayload, layoutPlanets, polarToXY, lonToDeg } from './chartLayoutEngine';
import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface Props {
  chart: NatalChartPayload;
  maxHeight?: number; // px
}

const ASPECT_COLORS: Record<string,string> = {
  trine: '#2b8aef', // blue
  sextile: '#2b8aef',
  square: '#e02424',
  opposition: '#e02424',
  quincunx: '#16a34a',
  conjunction: '#6b7280',
  other: '#9ca3af'
};

export default function NatalChartSVGAdvanced({ chart, maxHeight = 560 }: Props) {
  const advanced = useMemo(() => buildAdvancedInputFromPayload(chart), [chart]);
  if (!advanced) return null;

  const viewSize = 1000;
  const center = viewSize/2;
  const outerRadius = 420;
  const degreeRing = 380;
  const houseRadius = 320;
  const planetBaseRadius = 260;

  const placedPlanets = useMemo(() => layoutPlanets(advanced.planets, planetBaseRadius, 6), [advanced.planets]);

  return (
    <div style={{ maxHeight: maxHeight, overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" height={maxHeight} role="img" aria-label="Carta natal profesional">
        <defs>
          <style>{`.small{font-size:12px;fill:#374151}.sign{font-size:28px;fill:#111827}.planet{font-size:20px;fill:#0f172a}`}</style>
        </defs>

        {/* Outer zodiac circle */}
        <circle cx={center} cy={center} r={outerRadius} fill="#fff" stroke="#e5e7eb" strokeWidth={2} />

        {/* Degree ticks */}
        <g>
          {Array.from({length:360}).map((_,i) => {
            const angle = i;
            const inner = polarToXY(angle, outerRadius-6);
            const outer = polarToXY(angle, outerRadius);
            const isMajor = i % 10 === 0;
            const stroke = isMajor ? 1.6 : (i % 5 === 0 ? 1 : 0.6);
            return <line key={`tick-${i}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#111827" strokeWidth={stroke} opacity={isMajor?0.85:0.25} />;
          })}
        </g>

        {/* Zodiac sectors and sign glyphs */}
        <g>
          {Array.from({length:12}).map((_,i) => {
            const start = i*30;
            const mid = start + 15;
            const signGlyph = advanced.planets && advanced.planets.length ? (advanced.planets.find(p=>Math.floor((p.lon%360)/30)===i)?.signGlyph ?? '') : '';
            const labelPos = polarToXY(mid, outerRadius-36);
            return (
              <g key={`sign-${i}`}>
                {/* sector line */}
                <line x1={center} y1={center} x2={polarToXY(start, outerRadius).x} y2={polarToXY(start, outerRadius).y} stroke="#e5e7eb" strokeWidth={2} />
                <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central" className="sign">{signGlyph}</text>
              </g>
            );
          })}
        </g>

        {/* Houses cusps */}
        <g>
          {(advanced.houses || []).map((h) => {
            const angle = lonToDeg(h.cuspLon);
            const p1 = polarToXY(angle, houseRadius+20);
            const p2 = polarToXY(angle, houseRadius-80);
            const labelPos = polarToXY(angle+4, houseRadius-28);
            return (
              <g key={`house-${h.number}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#9ca3af" strokeWidth={2} />
                <text x={labelPos.x} y={labelPos.y} className="small" textAnchor="middle">{h.number}</text>
              </g>
            );
          })}
        </g>

        {/* Aspect lines (interior) */}
        <g>
          {(advanced.aspects || []).map((asp,idx) => {
            const pa = placedPlanets.find(p=>p.planet.key===asp.a);
            const pb = placedPlanets.find(p=>p.planet.key===asp.b);
            if (!pa || !pb) return null;
            const color = ASPECT_COLORS[asp.type] || ASPECT_COLORS.other;
            const width = asp.exact ? 2.4 : Math.max(0.6, 2 - Math.min(asp.orb/3,1.8));
            return <line key={`asp-${idx}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={width} opacity={0.9} />;
          })}
        </g>

        {/* Planets */}
        <g>
          {placedPlanets.map((pp, i) => {
            const p = pp.planet;
            const label = `${Math.floor(p.deg)}°${String(p.min ?? 0).padStart(2,'0')}'`;
            return (
              <g key={`pl-${i}`} transform={`translate(${pp.x},${pp.y})`}>
                <text className="planet" x={0} y={0} textAnchor="middle" dominantBaseline="central">{p.glyph}</text>
                <text className="small" x={18} y={4}>{label} {p.signGlyph}</text>
                {p.retro && <text className="small" x={-18} y={14}>℞</text>}
              </g>
            );
          })}
        </g>

        {/* Center inner circle */}
        <circle cx={center} cy={center} r={120} fill="#fff" stroke="#e5e7eb" strokeWidth={1} />

      </svg>
    </div>
  );
}
