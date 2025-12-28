import React, { useMemo } from "react";
import {
  PlanetPoint,
  HouseCusps,
  WheelOptions,
  createWheelGeometry,
  degToPoint,
  normalizeDeg,
  computeAspects,
  aspectStyle,
} from "./astro-geometry";

type Props = {
  size?: number;
  ascendantDeg: number;
  houses: HouseCusps;            // 12 cusp degrees
  planets: PlanetPoint[];        // ecliptic longitudes
  showAspects?: boolean;
  orbDeg?: number;
  titleRight?: string;           // "placidus · tropical"
};

const DEFAULT_ZODIAC = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

export const AstroWheelAdvanced: React.FC<Props> = ({
  size = 920,
  ascendantDeg,
  houses,
  planets,
  showAspects = true,
  orbDeg = 6,
  titleRight,
}) => {
  const opts: WheelOptions = useMemo(() => ({
    size,
    ascendantDeg: normalizeDeg(ascendantDeg),
    zodiacGlyphs: DEFAULT_ZODIAC,
    showDegreeTicks: true,
    majorTickEveryDeg: 10,
    minorTickEveryDeg: 1,
  }), [size, ascendantDeg]);

  const geo = useMemo(() => createWheelGeometry(opts), [opts]);

  const aspects = useMemo(() => computeAspects(planets, orbDeg), [planets, orbDeg]);

  const planetByKey = useMemo(() => {
    const m = new Map<string, PlanetPoint>();
    planets.forEach(p => m.set(p.key, p));
    return m;
  }, [planets]);

  const cx = geo.center;
  const { rings } = geo;

  const renderDegreeTicks = () => {
    if (!opts.showDegreeTicks) return null;

    const minorEvery = opts.minorTickEveryDeg ?? 1;
    const majorEvery = opts.majorTickEveryDeg ?? 10;

    const lines: React.ReactNode[] = [];
    for (let d = 0; d < 360; d += minorEvery) {
      const isMajor = d % majorEvery === 0;
      const r1 = rings.degreeTicksOuter;
      const r2 = isMajor ? rings.degreeTicksOuter - 10 : rings.degreeTicksOuter - 6;

      const p1 = degToPoint(d, r1, cx);
      const p2 = degToPoint(d, r2, cx);

      lines.push(
        <line
          key={`tick-${d}`}
          x1={p1.x} y1={p1.y}
          x2={p2.x} y2={p2.y}
          stroke={isMajor ? "#777" : "#bbb"}
          strokeWidth={isMajor ? 1.2 : 0.8}
          opacity={isMajor ? 0.9 : 0.7}
        />
      );
    }
    return <g>{lines}</g>;
  };

  const renderZodiac = () => {
    // 12 sectores de 30°, glifo al centro de cada sector
    return (
      <g>
        {opts.zodiacGlyphs.map((g, i) => {
          const sectorStart = i * 30;
          const mid = sectorStart + 15;

          // divisoria signo
          const s1 = degToPoint(sectorStart, rings.outer, cx);
          const s2 = degToPoint(sectorStart, rings.zodiacGlyphRing - 18, cx);

          // glifo
          const pt = degToPoint(mid, rings.zodiacGlyphRing, cx);

          return (
            <g key={`z-${i}`}>
              <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke="#d0d0d0" strokeWidth={1} />
              <text
                x={pt.x} y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={22}
                fill="#444"
              >
                {g}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderHouseLines = () => {
    // casas: líneas desde houseInner -> houseOuter; cada 4 (angles) más fuerte
    return (
      <g>
        {houses.map((deg, idx) => {
          const p1 = degToPoint(deg, rings.houseInner, cx);
          const p2 = degToPoint(deg, rings.houseOuter, cx);
          const strong = idx % 3 === 0; // 1/4/7/10 aprox según sistema
          return (
            <line
              key={`hline-${idx}`}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={strong ? "#333" : "#888"}
              strokeWidth={strong ? 2.2 : 1.2}
              opacity={strong ? 0.9 : 0.75}
            />
          );
        })}
        {/* círculo houseOuter e houseInner */}
        <circle cx={cx} cy={cx} r={rings.houseOuter} fill="none" stroke="#333" strokeWidth={1.4} opacity={0.8} />
        <circle cx={cx} cy={cx} r={rings.houseInner} fill="none" stroke="#333" strokeWidth={1.2} opacity={0.5} />
      </g>
    );
  };

  const renderHouseNumbers = () => {
    // número de casa al centro del sector (entre cusp i y cusp i+1)
    const nums: React.ReactNode[] = [];
    for (let i = 0; i < 12; i++) {
      const a = normalizeDeg(houses[i]);
      const b = normalizeDeg(houses[(i + 1) % 12]);
      const span = b >= a ? (b - a) : (360 - a + b);
      const mid = normalizeDeg(a + span / 2);
      const pt = degToPoint(mid, (rings.houseInner + rings.houseOuter) / 2, cx);

      nums.push(
        <text
          key={`hnum-${i}`}
          x={pt.x} y={pt.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#555"
        >
          {i + 1}
        </text>
      );
    }
    return <g>{nums}</g>;
  };

  const renderAnglesLabels = () => {
    // ASC / DSC / MC / IC desde cusps 1 y 10 etc (aprox: cusp[0]=ASC, cusp[6]=DSC, cusp[9]=MC, cusp[3]=IC)
    const asc = normalizeDeg(houses[0]);
    const dsc = normalizeDeg(houses[6]);
    const mc  = normalizeDeg(houses[9]);
    const ic  = normalizeDeg(houses[3]);

    const tag = (label: string, deg: number) => {
      const pt = degToPoint(deg, rings.houseOuter + 16, cx);
      return (
        <text
          key={`ang-${label}`}
          x={pt.x} y={pt.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
          fill="#111"
          fontWeight={600}
        >
          {label}
        </text>
      );
    };

    return <g>{tag("ASC", asc)}{tag("DSC", dsc)}{tag("MC", mc)}{tag("IC", ic)}</g>;
  };

  const renderPlanets = () => {
    // Glifo + label sin “botón”
    return (
      <g>
        {planets.map((p) => {
          const pt = degToPoint(p.degree, rings.planetRing, cx);

          // etiqueta un poco “hacia afuera”
          const labelPt = degToPoint(p.degree, rings.planetRing + 18, cx);

          return (
            <g key={`pl-${p.key}`}>
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fill="#111"
              >
                {p.glyph}
              </text>

              {p.label ? (
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10.5}
                  fill="#333"
                >
                  {p.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    );
  };

  const renderAspects = () => {
    if (!showAspects) return null;

    const lines: React.ReactNode[] = [];
    for (const asp of aspects) {
      const p1 = planetByKey.get(asp.p1Key);
      const p2 = planetByKey.get(asp.p2Key);
      if (!p1 || !p2) continue;

      const a = degToPoint(p1.degree, rings.aspectRing, cx);
      const b = degToPoint(p2.degree, rings.aspectRing, cx);
      const st = aspectStyle(asp);

      lines.push(
        <line
          key={`asp-${asp.p1Key}-${asp.p2Key}-${asp.kind}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke={st.stroke}
          strokeWidth={st.width}
          opacity={st.opacity}
        />
      );
    }

    return <g>{lines}</g>;
  };

  const renderBaseRings = () => (
    <g>
      <circle cx={cx} cy={cx} r={rings.outer} fill="none" stroke="#222" strokeWidth={1.6} opacity={0.9} />
      <circle cx={cx} cy={cx} r={rings.degreeTicksOuter} fill="none" stroke="#999" strokeWidth={0.8} opacity={0.55} />
      <circle cx={cx} cy={cx} r={rings.centerHole} fill="none" stroke="#999" strokeWidth={0.8} opacity={0.35} />
    </g>
  );

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <div className="text-sm text-gray-500">Carta natal — visualización profesional</div>
          <div className="text-lg font-semibold text-gray-900">Rueda avanzada (SVG) — solo lectura</div>
        </div>
        {titleRight ? <div className="text-sm text-gray-500">{titleRight}</div> : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="w-full overflow-auto">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Rotación global por ASC */}
            <g transform={`rotate(${geo.rotationDeg} ${cx} ${cx})`}>
              {renderBaseRings()}
              {renderDegreeTicks()}
              {renderZodiac()}
              {renderHouseLines()}
              {renderHouseNumbers()}
              {renderAspects()}
              {renderPlanets()}
              {renderAnglesLabels()}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AstroWheelAdvanced;
