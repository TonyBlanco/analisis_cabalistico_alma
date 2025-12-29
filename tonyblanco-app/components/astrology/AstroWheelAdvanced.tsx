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
  computeSynastryAspects,
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
  visualStyle?: "classic" | "huber";
  temporalLayers?: Array<{
    key: "transits" | "progressions" | "solarArc";
    label?: string;
  }>;
  symbolicDoubleWheel?: boolean;
  annualLayers?: Array<{
    key: "solarReturn" | "solarReturnA" | "solarReturnB" | "lunarReturn";
    label?: string;
  }>;
  secondaryLayer?: {
    key: "transits" | "progressions" | "solarArc" | "return_solar" | "return_lunar";
    label: string;
    mode?: "symbolic" | "real";
  } | null;
  secondaryPlanets?: PlanetPoint[];
  crossAspectNatalKeys?: Set<string>;
  crossAspectSecondaryKeys?: Set<string>;
  symbolicPlanetaryLayer?: boolean;
  harmonicOrder?: 5 | 7 | 9;
  personaMode?: boolean | "off" | "social" | "professional" | "intimate";
  relocation?: { city: string; offsetDeg: number };
  showMathPoints?: boolean;
  comparisonWheel?: {
    enabled: boolean;
    planets: PlanetPoint[];
    label: string;
  };
  showComparisonAspects?: boolean;
};

const DEFAULT_ZODIAC = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

export const AstroWheelAdvanced: React.FC<Props> = ({
  size = 920,
  ascendantDeg,
  houses,
  planets,
  transitPlanets,
  // optional asteroids layer
  asteroids = [],
  showAspects = true,
  orbDeg = 6,
  titleRight,
  visualMode = "normal",
  visualStyle = "classic",
  temporalLayers = [],
  symbolicDoubleWheel = false,
  annualLayers = [],
  secondaryLayer = null,
  secondaryPlanets,
  crossAspectNatalKeys,
  crossAspectSecondaryKeys,
  symbolicPlanetaryLayer = false,
  harmonicOrder,
  personaMode = false,
  relocation,
  showMathPoints = false,
  comparisonWheel,
  showComparisonAspects = true,
}) => {
  const isPlaceholder = visualMode === "placeholder";
  const isHuber = visualStyle === "huber";
  const persona = (typeof personaMode === "string") ? personaMode : (personaMode ? "social" : "off");
  const comparisonEnabled = Boolean(comparisonWheel?.enabled);
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

  const harmonicHighlight = useMemo(() => {
    if (!harmonicOrder) return null;

    const count = Math.max(3, Math.min(12, harmonicOrder));
    const label = `H${count}`;

    const hashKey = (key: string) => {
      const s = String(key || '');
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const sectorForPlanet = (p: PlanetPoint) => {
      const deg = (Number.isFinite(p.degree) && !isPlaceholder)
        ? normalizeDeg(p.degree)
        : normalizeDeg((hashKey(p.key) * 137 + count * 17) % 360);
      const sectorSize = 360 / count;
      return Math.max(0, Math.min(count - 1, Math.floor(deg / sectorSize)));
    };

    const collectAligned = (pts: PlanetPoint[]) => {
      const sectors = new Map<number, string[]>();
      for (const p of pts) {
        const idx = sectorForPlanet(p);
        const arr = sectors.get(idx) ?? [];
        arr.push(p.key);
        sectors.set(idx, arr);
      }
      const aligned = new Set<string>();
      sectors.forEach((keys) => {
        if (keys.length >= 2) keys.forEach((k) => aligned.add(k));
      });
      return aligned;
    };

    const secondaryPts = (secondaryPlanets && secondaryPlanets.length > 0)
      ? secondaryPlanets
      : ((transitPlanets && transitPlanets.length > 0) ? transitPlanets : []);

    return {
      count,
      label,
      natalKeys: collectAligned(planets),
      secondaryKeys: collectAligned(secondaryPts),
    };
  }, [harmonicOrder, planets, secondaryPlanets, transitPlanets, isPlaceholder]);

  const huberAspectStyle = (kind: "CONJ" | "SEXT" | "SQR" | "TRI" | "OPP") => {
    // semantic palette: tension vs harmonic vs neutral (Huber-style emphasis)
    switch (kind) {
      case "SQR": return { stroke: "#dc2626", width: 3.2, opacity: 0.38 }; // tensión
      case "OPP": return { stroke: "#ef4444", width: 3.2, opacity: 0.34 }; // polaridad
      case "TRI": return { stroke: "#16a34a", width: 3.0, opacity: 0.34 }; // armónico
      case "SEXT": return { stroke: "#0ea5e9", width: 2.8, opacity: 0.32 }; // armónico suave
      case "CONJ": return { stroke: "#7c3aed", width: 3.0, opacity: 0.3 }; // foco
      default: return { stroke: "#64748b", width: 2.6, opacity: 0.28 };
    }
  };

  const huberHouseBands = useMemo(() => {
    if (!isHuber) return null;
    if (!houses || houses.length !== 12) return null;

    const outerR = rings.houseOuter;
    const innerR = rings.houseInner - 18; // wider radial band inward
    const fillA = isPlaceholder ? "rgba(148,163,184,0.10)" : "rgba(99,102,241,0.08)";
    const fillB = isPlaceholder ? "rgba(148,163,184,0.06)" : "rgba(124,58,237,0.06)";

    const donutSeg = (startDeg: number, endDeg: number) => {
      const a0 = normalizeDeg(startDeg);
      const a1 = normalizeDeg(endDeg);
      const delta = (a1 - a0 + 360) % 360;
      const largeArc = delta > 180 ? 1 : 0;

      const p0o = degToPoint(a0, outerR, cx);
      const p1o = degToPoint(a1, outerR, cx);
      const p1i = degToPoint(a1, innerR, cx);
      const p0i = degToPoint(a0, innerR, cx);

      return `M ${p0o.x} ${p0o.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1o.x} ${p1o.y} L ${p1i.x} ${p1i.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p0i.x} ${p0i.y} Z`;
    };

    return (
      <g>
        {houses.map((cusp, idx) => {
          const next = houses[(idx + 1) % 12];
          const d = donutSeg(cusp, next);
          return (
            <path
              key={`huber-house-band-${idx}`}
              d={d}
              fill={idx % 2 === 0 ? fillA : fillB}
              stroke="none"
            />
          );
        })}
        <circle cx={cx} cy={cx} r={outerR} fill="none" stroke={isPlaceholder ? "#94a3b8" : "#6366f1"} opacity={isPlaceholder ? 0.22 : 0.18} strokeWidth={2} />
        <circle cx={cx} cy={cx} r={innerR} fill="none" stroke={isPlaceholder ? "#94a3b8" : "#7c3aed"} opacity={isPlaceholder ? 0.18 : 0.14} strokeWidth={1.6} />
      </g>
    );
  }, [isHuber, houses, rings.houseOuter, rings.houseInner, cx, isPlaceholder]);

  const huberCentersOfGravity = useMemo(() => {
    if (!isHuber) return null;
    if (!planets || planets.length === 0) return null;

    const pick = (pts: PlanetPoint[]) => {
      const valid = pts.filter((p) => Number.isFinite(p.degree));
      if (valid.length === 0) return null;
      let sx = 0;
      let sy = 0;
      for (const p of valid) {
        const rad = (normalizeDeg(p.degree) * Math.PI) / 180;
        sx += Math.cos(rad);
        sy += Math.sin(rad);
      }
      const ang = Math.atan2(sy, sx);
      return normalizeDeg((ang * 180) / Math.PI);
    };

    const personalKeys = new Set(["sun", "moon", "mercury", "venus", "mars"]);
    const natalPersonal = planets.filter((p) => personalKeys.has(String(p.key).toLowerCase()));
    const natalDeg = pick(natalPersonal.length > 0 ? natalPersonal : planets);

    const secondaryDeg = secondaryPlanets && secondaryPlanets.length > 0 ? pick(secondaryPlanets) : null;
    const r = Math.max(22, rings.centerHole - 26);
    const tooltip = "Centro de gravedad (lectura psicológica simbólica). No corresponde a un cálculo astronómico nuevo.";

    const node = (deg: number, label: string, stroke: string, fill: string) => {
      const p = degToPoint(deg, r, cx);
      return (
        <g>
          <circle cx={p.x} cy={p.y} r={10} fill={fill} stroke={stroke} strokeWidth={2} opacity={0.85}>
            <title>{tooltip}</title>
          </circle>
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} fill="#111827" opacity={0.9} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
            {label}
            <title>{tooltip}</title>
          </text>
        </g>
      );
    };

    return (
      <g>
        {natalDeg !== null ? node(natalDeg, "CG", "#7c3aed", "rgba(124,58,237,0.12)") : null}
        {secondaryDeg !== null ? node(secondaryDeg, "cg", "#0ea5e9", "rgba(14,165,233,0.10)") : null}
      </g>
    );
  }, [isHuber, planets, secondaryPlanets, rings.centerHole, cx]);

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

    const order: Array<"solarReturn" | "solarReturnA" | "solarReturnB" | "lunarReturn"> = ["solarReturn", "solarReturnA", "solarReturnB", "lunarReturn"];
    const byKey = new Map(annualLayers.map((l) => [l.key, l]));
    const tooltipBase = 'Capa simbólica activa — sin recalcular carta base. No corresponde a un cálculo astronómico real.';
    const tooltipSolar = 'Campo simbólico del año. Indica áreas de énfasis y aprendizaje.';
    const tooltipLunar = 'Ritmo emocional mensual. Cambios internos y reacciones.';

    const maxR = cx - 6;
    const baseOuter = rings.outer + 34;
    const outerLimit = Math.min(maxR, baseOuter + 34);

    const styles: Record<string, { stroke: string; opacity: number; width: number; dash: string; offset: number }> = {
      // Retorno Solar: cálido (ámbar/dorado), no invasivo
      solarReturn: { stroke: "#f59e0b", opacity: 0.42, width: 2.4, dash: "", offset: 10 }, // annual
      solarReturnA: { stroke: "#f59e0b", opacity: 0.46, width: 2.5, dash: "", offset: 10 }, // annual (A)
      solarReturnB: { stroke: "#d97706", opacity: 0.36, width: 2.4, dash: "6 6", offset: 18 }, // annual (B)
      // Retorno Lunar: frío (azul/plateado) + pulso suave
      lunarReturn: { stroke: "#60a5fa", opacity: 0.40, width: 2.0, dash: "3 7", offset: 26 }, // monthly
    };

    const pickHouseEmphasis = (seed: number, count: number) => {
      const out: number[] = [];
      const next = (s: number) => (s * 1103515245 + 12345) >>> 0;
      let s = seed >>> 0;
      while (out.length < count) {
        s = next(s);
        const idx = s % 12;
        if (!out.includes(idx)) out.push(idx);
      }
      return out;
    };

    const parseYearFromLabel = (label?: string) => {
      const m = String(label || '').match(/\b(19\d{2}|20\d{2}|21\d{2})\b/);
      return m ? Number(m[1]) : null;
    };

    const parseMonthFromLabel = (label?: string) => {
      const m = String(label || '').match(/\b(19\d{2}|20\d{2}|21\d{2})-(\d{2})\b/);
      if (!m) return null;
      const month = Number(m[2]);
      if (!Number.isFinite(month) || month < 1 || month > 12) return null;
      return month;
    };

    const arcAtRadius = (startDeg: number, endDeg: number, r: number) => {
      const a0 = normalizeDeg(startDeg);
      const a1 = normalizeDeg(endDeg);
      const delta = (a1 - a0 + 360) % 360;
      const largeArc = delta > 180 ? 1 : 0;
      const p0 = degToPoint(a0, r, cx);
      const p1 = degToPoint(a1, r, cx);
      return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
    };

    const items: React.ReactNode[] = [];
    for (const key of order) {
      if (!byKey.has(key)) continue;
      const layer = byKey.get(key);
      const st = styles[key];
      const r = Math.min(outerLimit - 6, baseOuter + st.offset);
      const isSolar = key === "solarReturn" || key === "solarReturnA" || key === "solarReturnB";
      const isLunar = key === "lunarReturn";
      const tooltip = isSolar ? `${tooltipSolar} · ${tooltipBase}` : isLunar ? `${tooltipLunar} · ${tooltipBase}` : tooltipBase;

      const emphasis = (() => {
        if (!houses || houses.length !== 12) return null;
        if (!isSolar && !isLunar) return null;

        const year = parseYearFromLabel(layer?.label ?? '') ?? new Date().getFullYear();
        const month = parseMonthFromLabel(layer?.label ?? '') ?? (new Date().getMonth() + 1);
        const seed = isSolar ? year : (year * 100 + month);

        const count = isSolar ? 3 : 2;
        const picks = pickHouseEmphasis(seed, count);
        const arcR = Math.max(rings.houseOuter + 6, r - 10);
        const width = isSolar ? 5.0 : 3.2;
        const opacity = isSolar ? 0.16 : 0.14;

        return (
          <g>
            {picks.map((idx) => {
              const start = houses[idx];
              const end = houses[(idx + 1) % 12];
              return (
                <path
                  key={`ret-emph-${key}-${idx}`}
                  d={arcAtRadius(start, end, arcR)}
                  fill="none"
                  stroke={st.stroke}
                  strokeWidth={width}
                  strokeLinecap="round"
                  opacity={opacity}
                />
              );
            })}
          </g>
        );
      })();

      items.push(
        <g key={`al-${key}`}>
          <title>{layer?.label ? `${tooltip} · ${layer.label}` : tooltip}</title>
          {emphasis}
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
          >
            {isLunar ? (
              <animate
                attributeName="stroke-opacity"
                values={`${Math.max(0.12, st.opacity - 0.18)};${Math.min(0.65, st.opacity + 0.22)};${Math.max(0.12, st.opacity - 0.18)}`}
                dur="2.4s"
                repeatCount="indefinite"
              />
            ) : null}
          </circle>
        </g>
      );
    }

    return <g>{items}</g>;
  };

  const renderPlanetaryLayer = () => {
    if (!symbolicPlanetaryLayer) return null;
    const tooltip = 'Capa planetaria simbólica activa. No predictiva. No corresponde a un cálculo astronómico real.';
    const r = Math.min(cx - 8, rings.outer + 6);
    return (
      <g>
        <title>{tooltip}</title>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#64748b"
          strokeWidth={1.2}
          opacity={0.22}
          strokeDasharray="2 6"
          style={{ pointerEvents: "stroke" }}
        />
      </g>
    );
  };

  const renderHarmonicOverlay = () => {
    if (!harmonicOrder) return null;
    const tooltip = `Armónicos (modo simbólico): patrones de resonancia psicológica (${harmonicOrder}º). No son cálculos astronómicos.`;
    const lines: React.ReactNode[] = [];
    const nodes: React.ReactNode[] = [];
    const count = Math.max(3, Math.min(12, harmonicOrder));
    for (let i = 0; i < count; i++) {
      const deg = (360 / count) * i;
      const a = degToPoint(deg, rings.centerHole + 8, cx);
      const b = degToPoint(deg, rings.degreeTicksOuter - 8, cx);
      lines.push(
        <line
          key={`harm-${count}-${i}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke="#0f172a"
          strokeWidth={1.1}
          opacity={isHuber ? 0.06 : 0.1}
        />
      );

      const radii = [
        rings.centerHole + 18,
        (rings.centerHole + rings.houseInner) / 2,
        rings.houseInner - 10,
        rings.degreeTicksOuter - 16,
      ].filter((r) => r > 0);

      radii.forEach((r, idx2) => {
        const p = degToPoint(deg, r, cx);
        nodes.push(
          <circle
            key={`harm-node-${count}-${i}-${idx2}`}
            cx={p.x}
            cy={p.y}
            r={1.8}
            fill="#0f172a"
            opacity={isHuber ? 0.06 : 0.1}
          />
        );
      });
    }
    return (
      <g>
        <title>{tooltip}</title>
        {lines}
        {nodes}
      </g>
    );
  };

  const renderRelocationOverlay = () => {
    if (!relocation) return null;
    const tooltip = `Relocación simbólica (no astronómica) · ${relocation.city}. No recalcula ni cambia coordenadas reales.`;
    const lines: React.ReactNode[] = [];
    const base = relocation.offsetDeg || 0;
    for (let i = 0; i < 12; i++) {
      const deg = base + i * 30;
      const a = degToPoint(deg, rings.houseInner, cx);
      const b = degToPoint(deg, rings.houseOuter, cx);
      lines.push(
        <line
          key={`rel-house-${i}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke="#14b8a6"
          strokeWidth={1.2}
          opacity={0.22}
          strokeDasharray="5 7"
        />
      );
    }
    // symbolic axes markers
    const axis = (deg: number, key: string) => {
      const a = degToPoint(base + deg, rings.centerHole, cx);
      const b = degToPoint(base + deg, rings.outer, cx);
      return (
        <line
          key={key}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke="#14b8a6"
          strokeWidth={1.4}
          opacity={0.18}
          strokeDasharray="10 8"
        />
      );
    };

    return (
      <g>
        <title>{tooltip}</title>
        {axis(0, "rel-axis-asc")}
        {axis(90, "rel-axis-mc")}
        {lines}
      </g>
    );
  };

  const renderMathPoints = () => {
    if (!showMathPoints) return null;
    const tooltip = 'Puntos matemáticos (lectura simbólica). Posiciones placeholder, sin grados ni cálculo astronómico real.';
    const r = rings.zodiacGlyphRing;
    const node = (deg: number, glyph: string, key: string) => {
      const p = degToPoint(deg, r, cx);
      return (
        <g key={key}>
          <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#64748b" strokeWidth={1.4} opacity={0.28} />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#64748b" opacity={0.6} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
            {glyph}
          </text>
        </g>
      );
    };
    return (
      <g>
        <title>{tooltip}</title>
        {node(0, "☊", "math-nn")}
        {node(180, "☋", "math-sn")}
      </g>
    );
  };

  const renderSecondaryWheel = () => {
    if (!secondaryLayer) return null;

    const tooltip = `Modo Doble Rueda activo — Natal + ${secondaryLayer.label}. La rueda externa representa una capa simbólica sin cálculo astronómico real.`;
    const maxR = cx - 8 - (comparisonEnabled ? 46 : 0);
    const innerR = Math.min(maxR - 22, rings.outer + 18);
    const outerR = Math.min(maxR, innerR + 26);
    const glyphR = Math.min(maxR - 10, outerR - 10);

    const styles: Record<string, { stroke: string; opacity: number; width: number; dash?: string; glyphSize: number }> = {
      transits: { stroke: "#94a3b8", opacity: 0.55, width: 1.5, dash: "7 6", glyphSize: 14 },
      progressions: { stroke: "#64748b", opacity: 0.5, width: 1.6, glyphSize: 14 },
      solarArc: { stroke: "#475569", opacity: 0.46, width: 1.6, dash: "1 6", glyphSize: 14 },
      return_solar: { stroke: "#a78bfa", opacity: 0.48, width: 1.8, glyphSize: 14 },
      return_lunar: { stroke: "#f59e0b", opacity: 0.46, width: 1.7, dash: "4 6", glyphSize: 14 },
    };

    const st = styles[secondaryLayer.key] ?? styles.transits;
    const pts = (secondaryPlanets && secondaryPlanets.length > 0) ? secondaryPlanets : (transitPlanets && transitPlanets.length > 0 ? transitPlanets : []);

    const renderPlanetsSecondary = () => {
      if (!pts || pts.length === 0) return null;
      const priority = new Set(["sun", "moon", "mercury", "venus", "mars"]);
      return (
        <g>
          {pts
            .filter((p) => priority.has(String(p.key).toLowerCase()))
            .map((p) => {
              const pt = degToPoint(p.degree, glyphR, cx);
              return (
                <g key={`sec-pl-${p.key}`}>
                  {harmonicHighlight && harmonicHighlight.secondaryKeys.has(p.key) ? (
                    <>
                      <circle cx={pt.x} cy={pt.y} r={18} fill="none" stroke={st.stroke} strokeWidth={2} opacity={0.12} />
                      <text x={pt.x - 14} y={pt.y + 18} fontSize={8} fill={st.stroke} opacity={0.45} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
                        {harmonicHighlight.label}
                      </text>
                    </>
                  ) : null}
                  {isHuber ? (
                    <circle cx={pt.x} cy={pt.y} r={14} fill="rgba(255,255,255,0.88)" stroke={st.stroke} strokeWidth={1.3} opacity={0.75} />
                  ) : null}
                  {crossAspectSecondaryKeys && crossAspectSecondaryKeys.has(p.key) ? (
                    <>
                      <circle cx={pt.x} cy={pt.y} r={12} fill="none" stroke={st.stroke} strokeWidth={2} opacity={0.22} />
                      <text x={pt.x + 12} y={pt.y - 10} fontSize={9} fill={st.stroke} opacity={0.65} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>AS</text>
                    </>
                  ) : null}
                  <text
                    x={pt.x}
                    y={pt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isHuber ? st.glyphSize + 2 : st.glyphSize}
                    fill={st.stroke}
                    opacity={Math.min(0.85, st.opacity + 0.25)}
                    style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
                  >
                    {p.glyph}
                  </text>
                </g>
              );
            })}
        </g>
      );
    };

    const marker = (deg: number, id: string) => {
      const a = degToPoint(deg, outerR - 4, cx);
      const b = degToPoint(deg, outerR + 4, cx);
      return (
        <line
          key={`sec-${id}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke={st.stroke}
          strokeWidth={1.1}
          opacity={Math.min(0.7, st.opacity + 0.12)}
        />
      );
    };

    return (
      <g>
        <title>{tooltip}</title>
        <circle cx={cx} cy={cx} r={innerR} fill="none" stroke="#e5e7eb" strokeWidth={1.1} opacity={0.9} />
        <circle cx={cx} cy={cx} r={outerR} fill="none" stroke={st.stroke} strokeWidth={st.width} opacity={st.opacity} strokeDasharray={st.dash || undefined} />
        {marker(0, "north")}
        {marker(90, "east")}
        {marker(180, "south")}
        {marker(270, "west")}
        {renderPlanetsSecondary()}
      </g>
    );
  };

  const renderComparisonWheel = () => {
    if (!comparisonEnabled || !comparisonWheel?.planets || comparisonWheel.planets.length === 0) return null;
    const tooltip = `${comparisonWheel.label} — lectura simbólica.`;

    const maxR = cx - 8;
    const outerR = maxR;
    const innerR = Math.max(rings.outer + 24, outerR - 26);
    const glyphR = innerR + 10;
    const personal = new Set(["sun", "moon", "mercury", "venus", "mars"]);

    return (
      <g>
        <title>{tooltip}</title>
        <circle cx={cx} cy={cx} r={innerR} fill="none" stroke="#e5e7eb" strokeWidth={1.1} opacity={0.85} />
        <circle cx={cx} cy={cx} r={outerR} fill="none" stroke="#94a3b8" strokeWidth={1.5} opacity={0.42} strokeDasharray="5 7" />
        {comparisonWheel.planets
          .filter((p) => personal.has(String(p.key).toLowerCase()))
          .map((p) => {
            const pt = degToPoint(p.degree, glyphR, cx);
            return (
              <text
                key={`cmp-pl-${p.key}`}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fill="#64748b"
                opacity={0.62}
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
              >
                {p.glyph}
              </text>
            );
          })}
      </g>
    );
  };

  const renderComparisonAspects = () => {
    if (!comparisonEnabled || !showComparisonAspects || !comparisonWheel?.planets || comparisonWheel.planets.length === 0) return null;

    const tooltip = 'Aspecto simbólico (no matemático)';
    const personal = new Set(["sun", "moon", "mercury", "venus", "mars"]);
    const natalCandidates = planets.filter((p) => personal.has(String(p.key).toLowerCase()));
    const comparedCandidates = comparisonWheel.planets.filter((p) => personal.has(String(p.key).toLowerCase()));
    if (natalCandidates.length === 0 || comparedCandidates.length === 0) return null;

    const aspects = computeSynastryAspects(natalCandidates, comparedCandidates, 8, 6).slice(0, 18);

    const maxR = cx - 8;
    const outerR = maxR - 12;
    const innerR = rings.planetRing;

    const styleByKind: Record<string, { stroke: string; opacity: number; width: number }> = isHuber ? {
      TRI: huberAspectStyle("TRI"),
      SEXT: huberAspectStyle("SEXT"),
      SQR: huberAspectStyle("SQR"),
      OPP: huberAspectStyle("OPP"),
      CONJ: huberAspectStyle("CONJ"),
    } : {
      TRI: { stroke: "#16a34a", opacity: 0.22, width: 1.6 },  // armónico
      SEXT: { stroke: "#0ea5e9", opacity: 0.2, width: 1.5 },  // armónico suave
      SQR: { stroke: "#dc2626", opacity: 0.22, width: 1.6 },  // tensión
      OPP: { stroke: "#dc2626", opacity: 0.2, width: 1.6 },   // tensión
      CONJ: { stroke: "#64748b", opacity: 0.18, width: 1.4 }, // neutral
    };

    return (
      <g>
        {aspects.map((a, idx) => {
          const p1 = natalCandidates.find((p) => p.key === a.p1Key);
          const p2 = comparedCandidates.find((p) => p.key === a.p2Key);
          if (!p1 || !p2) return null;
          const A = degToPoint(p1.degree, innerR, cx);
          const B = degToPoint(p2.degree, outerR, cx);
          const st = styleByKind[a.kind] ?? styleByKind.CONJ;
          return (
            <line
              key={`cmp-asp-${idx}-${a.p1Key}-${a.p2Key}-${a.kind}`}
              x1={A.x} y1={A.y}
              x2={B.x} y2={B.y}
              stroke={st.stroke}
              strokeWidth={st.width}
              opacity={st.opacity}
              strokeDasharray={isHuber ? "2 6" : "3 8"}
            >
              <title>{tooltip}</title>
            </line>
          );
        })}
      </g>
    );
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
              {harmonicHighlight && harmonicHighlight.natalKeys.has(p.key) ? (
                <>
                  <circle cx={pt.x} cy={pt.y} r={isHuber ? 22 : 18} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.16} />
                  <text x={pt.x - 14} y={pt.y + 18} fontSize={8.5} fill="#6366f1" opacity={0.6} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
                    {harmonicHighlight.label}
                  </text>
                </>
              ) : null}
              {isHuber ? (
                <circle cx={pt.x} cy={pt.y} r={16} fill="rgba(255,255,255,0.92)" stroke="#111827" strokeWidth={1.4} opacity={isPlaceholder ? 0.75 : 0.9} />
              ) : null}
              {persona !== "off" && new Set(['sun','moon','mercury','venus','mars']).has(String(p.key).toLowerCase()) ? (
                <circle cx={pt.x} cy={pt.y} r={14} fill="none" stroke={persona === "intimate" ? "#f59e0b" : "#a78bfa"} strokeWidth={2} opacity={persona === "professional" ? 0.2 : 0.16} />
              ) : null}
              {crossAspectNatalKeys && crossAspectNatalKeys.has(p.key) ? (
                <>
                  <circle cx={pt.x} cy={pt.y} r={13} fill="none" stroke="#60a5fa" strokeWidth={2} opacity={0.22} />
                  <text x={pt.x + 12} y={pt.y - 10} fontSize={9} fill="#60a5fa" opacity={0.7} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>AS</text>
                </>
              ) : null}
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
                  fontSize={isHuber ? 20 : 18}
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

  const renderPersonaOverlay = () => {
    if (persona === "off") return null;

    const tooltipBase = 'Persona Chart (simbólico): representa la identidad que el individuo muestra o utiliza en un contexto específico. No es una carta astronómica.';
    const tooltipMode = persona === "social"
      ? 'Social: “Cómo me ven”'
      : persona === "professional"
        ? 'Profesional: “Cómo actúo”'
        : 'Íntimo: “Cómo me muestro cuando confío”';
    const tooltip = `${tooltipBase} · ${tooltipMode}`;

    const color = persona === "social"
      ? "#94a3b8"    // gris perla
      : persona === "professional"
        ? "#a78bfa"  // violeta tenue
        : "#f59e0b"; // cálido tenue

    const opacity = persona === "social" ? 0.55 : persona === "professional" ? 0.5 : 0.42;
    const glyphSize = persona === "professional" ? 15 : 14;
    const r = rings.planetRing + 12;

    const inArc = (deg: number, start: number, end: number) => {
      const d = normalizeDeg(deg);
      const a = normalizeDeg(start);
      const b = normalizeDeg(end);
      if (a <= b) return d >= a && d < b;
      return d >= a || d < b;
    };

    const houseIndexOfDegree = (deg: number) => {
      if (!houses || houses.length !== 12) return null;
      for (let i = 0; i < 12; i++) {
        const a = houses[i];
        const b = houses[(i + 1) % 12];
        if (inArc(deg, a, b)) return i + 1;
      }
      return null;
    };

    const hashKey = (key: string) => {
      const s = String(key || '');
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const shiftFor = (p: PlanetPoint) => {
      const personal = new Set(["sun", "moon", "mercury", "venus", "mars"]);
      const k = String(p.key).toLowerCase();
      const isPersonal = personal.has(k);

      const baseDeg = (Number.isFinite(p.degree) ? normalizeDeg(p.degree) : normalizeDeg(hashKey(p.key) % 360));
      const h = houseIndexOfDegree(baseDeg);

      const jitter = ((hashKey(p.key) % 5) - 2); // -2..+2
      if (persona === "social") {
        const extra = (h === 1 || h === 3 || h === 7) ? 3 : 0;
        return (isPersonal ? (8 + extra) : 4) + jitter * 0.6;
      }
      if (persona === "professional") {
        const extra = (h === 6 || h === 10) ? 5 : 0;
        return (isPersonal ? (7 + extra) : 4) + jitter * 0.4;
      }
      // intimate
      return (isPersonal ? 4 : 3) + jitter * 0.3;
    };

    // Placeholder fallback: show a subtle ring + markers even if no planet data yet
    if (!planets || planets.length === 0) {
      const rr = rings.planetRing + 18;
      return (
        <g>
          <title>{tooltip}</title>
          <circle cx={cx} cy={cx} r={rr} fill="none" stroke={color} strokeWidth={2} opacity={0.22} strokeDasharray="2 8" />
          {[0, 72, 144, 216, 288].map((deg) => {
            const p = degToPoint(deg, rr, cx);
            return <circle key={`persona-ph-${deg}`} cx={p.x} cy={p.y} r={2.2} fill={color} opacity={0.25} />;
          })}
        </g>
      );
    }

    const personalKeys = new Set(["sun", "moon", "mercury", "venus", "mars"]);
    const pts = planets.filter((p) => personalKeys.has(String(p.key).toLowerCase()));
    const draws = pts.length > 0 ? pts : planets.slice(0, Math.min(8, planets.length));

    return (
      <g>
        <title>{tooltip}</title>
        {draws.map((p) => {
          const deg = normalizeDeg(p.degree + shiftFor(p));
          const pt = degToPoint(deg, r, cx);
          const base = degToPoint(p.degree, rings.planetRing, cx);

          return (
            <g key={`persona-${p.key}`} opacity={opacity}>
              {persona === "professional" ? (
                <line x1={base.x} y1={base.y} x2={pt.x} y2={pt.y} stroke={color} strokeWidth={1.2} opacity={0.22} />
              ) : null}
              <circle cx={pt.x} cy={pt.y} r={10} fill="rgba(255,255,255,0.85)" stroke={color} strokeWidth={1.2} opacity={0.6} />
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={glyphSize}
                fill={color}
                opacity={opacity}
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
              >
                {p.glyph}
              </text>
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
      const st = isHuber ? huberAspectStyle(asp.kind) : aspectStyle(asp);

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
              {renderComparisonAspects()}
              {renderSecondaryWheel()}
              {renderTemporalLayers()}
              {renderAnnualLayers()}
              {renderComparisonWheel()}
              {renderPlanetaryLayer()}
              {renderBaseRings()}
              {renderDegreeTicks()}
              {renderZodiac()}
              {huberHouseBands}
                {renderHouseLines()}
                {renderHouseNumbers()}
                {renderRelocationOverlay()}
                {renderHarmonicOverlay()}
              {renderMathPoints()}
              {huberCentersOfGravity}
                {renderAspects()}
                {renderAsteroids()}
                {renderPersonaOverlay()}
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
