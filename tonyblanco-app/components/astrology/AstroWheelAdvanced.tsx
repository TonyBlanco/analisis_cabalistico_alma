import React, { useMemo, useState } from "react";
import {
  PlanetPoint,
  HouseCusps,
  WheelOptions,
  createWheelGeometry,
  degToPoint,
  normalizeDeg,
  shortestAngle,
  computeAspects,
  aspectStyle,
} from "./astro-geometry";

type Props = {
  size?: number;
  ascendantDeg: number;
  houses: HouseCusps;            // 12 cusp degrees
  planets: PlanetPoint[];        // ecliptic longitudes
  transitPlanets?: PlanetPoint[];
  asteroids?: PlanetPoint[];
  showAspects?: boolean;
  orbDeg?: number;
  titleRight?: string;           // "placidus · tropical"
  visualMode?: "normal" | "placeholder";
  temporalLayers?: Array<{
    key: "transits" | "progressions" | "solarArc";
    label?: string;
  }>;
  symbolicDoubleWheel?: boolean;
  annualLayers?: Array<{
    key: "solarReturn" | "lunarReturn";
    label?: string;
  }>;
};

const DEFAULT_ZODIAC = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

export const AstroWheelAdvanced: React.FC<Props> = ({
  size = 920,
  ascendantDeg,
  houses,
  planets,
  // optional asteroids layer
  asteroids = [],
  showAspects = true,
  orbDeg = 6,
  titleRight,
  visualMode = "normal",
  temporalLayers = [],
  symbolicDoubleWheel = false,
  annualLayers = [],
}) => {
  const isPlaceholder = visualMode === "placeholder";
  const opts: WheelOptions = useMemo(() => ({
    size,
    ascendantDeg: normalizeDeg(ascendantDeg),
    zodiacGlyphs: DEFAULT_ZODIAC,
    showDegreeTicks: !isPlaceholder,
    majorTickEveryDeg: 10,
    minorTickEveryDeg: 1,
  }), [size, ascendantDeg, isPlaceholder]);

  const geo = useMemo(() => createWheelGeometry(opts), [opts]);

  const aspects = useMemo(() => computeAspects(planets, orbDeg), [planets, orbDeg]);

  const asteroidByKey = useMemo(() => {
    const m = new Map<string, PlanetPoint>();
    (asteroids || []).forEach(p => m.set(p.key, p));
    return m;
  }, [asteroids]);

  const planetByKey = useMemo(() => {
    const m = new Map<string, PlanetPoint>();
    planets.forEach(p => m.set(p.key, p));
    return m;
  }, [planets]);

  const cx = geo.center;
  const { rings } = geo;
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  // stacking radial offsets to avoid glyph collisions (preserve real angle)
  const planetPositions = useMemo(() => {
    const spacing = 20; // px radial step between stacked glyphs
    const sepDeg = 6; // consider planets within 6° as cluster
    const items = planets.map(p => ({ ...p, deg: normalizeDeg(p.degree) }));

    // build groups by proximity
    const assigned = new Set<string>();
    const groups: PlanetPoint[][] = [];
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      if (assigned.has(a.key)) continue;
      const group = [a];
      assigned.add(a.key);
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        if (assigned.has(b.key)) continue;
        if (shortestAngle(a.degree, b.degree) <= sepDeg) {
          group.push(b);
          assigned.add(b.key);
        }
      }
      groups.push(group);
    }

    const map = new Map<string, { x: number; y: number; radius: number }>();
    for (const g of groups) {
      const n = g.length;
      for (let k = 0; k < n; k++) {
        const p = g[k];
        // center around base ring; symmetric offsets
        const offset = rings.planetRing + (k - (n - 1) / 2) * spacing;
        const pt = degToPoint(p.degree, offset, cx);
        map.set(p.key, { x: pt.x, y: pt.y, radius: offset });
      }
    }
    return map;
  }, [planets, rings.planetRing, cx]);

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

          return (
            <g key={`z-${i}`}>
              <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke={isPlaceholder ? "#cbd5e1" : "#d0d0d0"} strokeWidth={1} opacity={isPlaceholder ? 0.75 : 1} />
              {!isPlaceholder ? (
                <text
                  x={degToPoint(mid, rings.zodiacGlyphRing, cx).x}
                  y={degToPoint(mid, rings.zodiacGlyphRing, cx).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={22}
                  fill="#444"
                >
                  {g}
                </text>
              ) : null}
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
              stroke={strong ? (isPlaceholder ? "#6b7280" : "#333") : (isPlaceholder ? "#9ca3af" : "#888")}
              strokeWidth={strong ? (isPlaceholder ? 1.8 : 2.2) : 1.2}
              opacity={strong ? (isPlaceholder ? 0.55 : 0.9) : (isPlaceholder ? 0.42 : 0.75)}
            />
          );
        })}
        {/* círculo houseOuter e houseInner */}
        <circle cx={cx} cy={cx} r={rings.houseOuter} fill="none" stroke={isPlaceholder ? "#6b7280" : "#333"} strokeWidth={isPlaceholder ? 1.2 : 1.4} opacity={isPlaceholder ? 0.5 : 0.8} />
        <circle cx={cx} cy={cx} r={rings.houseInner} fill="none" stroke={isPlaceholder ? "#6b7280" : "#333"} strokeWidth={isPlaceholder ? 1.1 : 1.2} opacity={isPlaceholder ? 0.32 : 0.5} />
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
          fill={isPlaceholder ? "#6b7280" : "#555"}
          opacity={isPlaceholder ? 0.65 : 1}
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
          fill={isPlaceholder ? "#374151" : "#111"}
          fontWeight={600}
          opacity={isPlaceholder ? 0.7 : 1}
        >
          {label}
        </text>
      );
    };

    const axisLine = (deg: number, key: string) => {
      const a = degToPoint(deg, rings.centerHole, cx);
      const b = degToPoint(deg, rings.outer, cx);
      return (
        <line
          key={key}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke="#9ca3af"
          strokeWidth={1.2}
          opacity={0.55}
          strokeDasharray="6 6"
        />
      );
    };

    return (
      <g>
        {isPlaceholder ? axisLine(asc, "axis-asc") : null}
        {isPlaceholder ? axisLine(mc, "axis-mc") : null}
        {tag("ASC", asc)}{tag("DSC", dsc)}{tag("MC", mc)}{tag("IC", ic)}
      </g>
    );
  };

  const renderTemporalLayers = () => {
    if (!temporalLayers || temporalLayers.length === 0) return null;

    const byKey = new Map(temporalLayers.map((l) => [l.key, l]));
    const order: Array<"transits" | "progressions" | "solarArc"> = ["transits", "progressions", "solarArc"];
    const symbolicTooltip = 'Capa simbólica activa. No corresponde a un cálculo astronómico real.';
    const doubleWheelTooltip = 'Doble rueda simbólica. La rueda externa representa capas temporales sin cálculo astronómico real.';

    const styles: Record<string, { stroke: string; opacity: number; width: number; dash: string; dashOffset?: number; offset: number }> = {
      transits: { stroke: "#94a3b8", opacity: 0.62, width: 1.3, dash: "7 6", offset: 6 },
      progressions: { stroke: "#64748b", opacity: 0.56, width: 1.4, dash: "", offset: 14 },
      solarArc: { stroke: "#475569", opacity: 0.52, width: 1.4, dash: "1 6", dashOffset: 4, offset: 22 },
    };

    const maxR = cx - 6;
    const wantSymbolicDoubleWheel = Boolean(symbolicDoubleWheel);
    const frameOuterR = Math.min(maxR, rings.outer + Math.max(32, Math.round(rings.outer * 0.1)));
    const frameInnerR = Math.min(frameOuterR - 26, rings.outer + 4);
    const canDrawFrame = wantSymbolicDoubleWheel && frameOuterR > frameInnerR + 10 && frameOuterR > rings.outer + 18;
    const baseR = canDrawFrame ? frameInnerR + 6 : rings.outer;

    const items: React.ReactNode[] = [];
    for (const key of order) {
      if (!byKey.has(key)) continue;
      const st = styles[key];
      const r = canDrawFrame ? Math.min(frameOuterR - 6, baseR + st.offset) : (rings.outer + st.offset);

      // subtle markers at ASC/MC axes (purely visual, non-predictive)
      const marker = (deg: number, id: string) => {
        const a = degToPoint(deg, r - 4, cx);
        const b = degToPoint(deg, r + 4, cx);
        return (
          <line
            key={id}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke={st.stroke}
            strokeWidth={1.2}
            opacity={Math.min(0.7, st.opacity + 0.08)}
          />
        );
      };

      const solarArcArrow = () => {
        if (key !== "solarArc") return null;
        const tip = degToPoint(0, r + 8, cx);
        const left = degToPoint(-7, r + 1, cx);
        const right = degToPoint(7, r + 1, cx);
        const points = `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
        return (
          <polygon
            points={points}
            fill={st.stroke}
            opacity={Math.min(0.65, st.opacity + 0.08)}
          />
        );
      };

      items.push(
        <g key={`tl-${key}`}>
          <title>{symbolicTooltip}</title>
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={st.stroke}
            strokeWidth={st.width}
            opacity={st.opacity}
            strokeDasharray={st.dash || undefined}
            strokeDashoffset={st.dashOffset}
            style={{ pointerEvents: "stroke" }}
          />
          {solarArcArrow()}
          {marker(0, "north")}
          {marker(90, "east")}
          {marker(180, "south")}
          {marker(270, "west")}
        </g>
      );
    }

    if (!canDrawFrame) return <g>{items}</g>;

    return (
      <g>
        <title>{doubleWheelTooltip}</title>
        <circle cx={cx} cy={cx} r={frameInnerR} fill="none" stroke="#e5e7eb" strokeWidth={1.2} opacity={0.95} />
        <circle cx={cx} cy={cx} r={frameOuterR} fill="none" stroke="#cbd5e1" strokeWidth={1.4} opacity={0.7} />
        {items}
      </g>
    );
  };

  const renderAnnualLayers = () => {
    if (!annualLayers || annualLayers.length === 0) return null;

    const order: Array<"solarReturn" | "lunarReturn"> = ["solarReturn", "lunarReturn"];
    const byKey = new Map(annualLayers.map((l) => [l.key, l]));
    const tooltip = 'Capa anual/mensual simbólica activa — sin recalcular carta base. No corresponde a un cálculo astronómico real.';

    const maxR = cx - 6;
    const baseOuter = rings.outer + 34;
    const outerLimit = Math.min(maxR, baseOuter + 34);

    const styles: Record<string, { stroke: string; opacity: number; width: number; dash: string; offset: number }> = {
      solarReturn: { stroke: "#a78bfa", opacity: 0.45, width: 2.0, dash: "", offset: 10 }, // annual
      lunarReturn: { stroke: "#f59e0b", opacity: 0.42, width: 1.8, dash: "4 6", offset: 22 }, // monthly
    };

    const items: React.ReactNode[] = [];
    for (const key of order) {
      if (!byKey.has(key)) continue;
      const st = styles[key];
      const r = Math.min(outerLimit - 6, baseOuter + st.offset);
      items.push(
        <g key={`al-${key}`}>
          <title>{tooltip}</title>
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={st.stroke}
            strokeWidth={st.width}
            opacity={st.opacity}
            strokeDasharray={st.dash || undefined}
            style={{ pointerEvents: "stroke" }}
          />
        </g>
      );
    }

    return <g>{items}</g>;
  };

  const renderPlanets = () => {
    // Glifo + label sin “botón”
    return (
      <g>
        {planets.map((p) => {
          const pos = planetPositions.get(p.key);
          const basePt = degToPoint(p.degree, rings.planetRing, cx);
          const pt = pos ? { x: pos.x, y: pos.y } : basePt;

          // etiqueta un poco “hacia afuera”
          const labelPt = degToPoint(p.degree, (pos ? pos.radius : rings.planetRing) + 18, cx);

          const priority = new Set(['sun','moon','mercury','venus','mars']);
          const showLabel = hoverKey === p.key || priority.has(String(p.key).toLowerCase());

          return (
            <g key={`pl-${p.key}`}>
              {/* optional guide from base ring to stacked glyph */}
              { (pos && Math.abs((pos.radius || 0) - rings.planetRing) > 2) ? (
                <line x1={basePt.x} y1={basePt.y} x2={pt.x} y2={pt.y} stroke="#d0d0d0" strokeWidth={0.8} opacity={0.6} />
              ) : null }

              <g onMouseEnter={() => setHoverKey(p.key)} onMouseLeave={() => setHoverKey(null)}>
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={18}
                  fill="#111"
                  style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
                >
                  {p.glyph}
                </text>
              </g>

              {p.label ? (
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10.5}
                  fill="#333"
                  opacity={showLabel ? 1 : 0.26}
                  style={{ transition: 'opacity 120ms linear', fontFamily: 'Inter, ui-sans-serif, system-ui' }}
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

  const renderAsteroids = () => {
    if (!asteroids || asteroids.length === 0) return null;
    return (
      <g>
        {asteroids.map((a) => {
          const basePt = degToPoint(a.degree, rings.asteroidRing, cx);
          const labelPt = degToPoint(a.degree, rings.asteroidRing + 12, cx);
          return (
            <g key={`ast-${a.key}`}>
              <text x={basePt.x} y={basePt.y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#4b4f58" opacity={0.95}>
                {a.glyph}
              </text>
              {a.label ? (
                <text x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#5a5f6a" opacity={0.66}>
                  {a.label}
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
      <circle cx={cx} cy={cx} r={rings.outer} fill="none" stroke={isPlaceholder ? "#6b7280" : "#222"} strokeWidth={isPlaceholder ? 1.4 : 1.6} opacity={isPlaceholder ? 0.55 : 0.9} />
      <circle cx={cx} cy={cx} r={rings.degreeTicksOuter} fill="none" stroke={isPlaceholder ? "#9ca3af" : "#999"} strokeWidth={0.8} opacity={isPlaceholder ? 0.3 : 0.55} />
      <circle cx={cx} cy={cx} r={rings.centerHole} fill="none" stroke={isPlaceholder ? "#9ca3af" : "#999"} strokeWidth={0.8} opacity={isPlaceholder ? 0.25 : 0.35} />
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
                {renderTemporalLayers()}
                {renderAnnualLayers()}
                {renderBaseRings()}
                {renderDegreeTicks()}
                {renderZodiac()}
                {renderHouseLines()}
                {renderHouseNumbers()}
              {renderAspects()}
              {renderAsteroids()}
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
