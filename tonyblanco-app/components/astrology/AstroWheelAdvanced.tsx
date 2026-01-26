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
  harmonicOrder?: 5 | 7 | 9 | 11 | 13 | 16;
  personaMode?: boolean | "off" | "social" | "professional" | "intimate";
  relocation?: { city: string; offsetDeg: number; mode?: "home" | "work" | "travel" | "abroad"; rotationDeg?: number };
  showMathPoints?: boolean;
  advancedObjects?: { nodes: boolean; fortune: boolean; symbolicPoints: boolean };
  fixedStars?: { primary: boolean; secondary: boolean };
  relationshipMode?: "off" | "couple" | "family" | "work" | "social";
  relationshipRole?: "active" | "reactive";
  developmentStage?: "off" | "early_childhood" | "childhood_early" | "childhood_middle" | "adolescence" | "young_adult";
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
  advancedObjects,
  fixedStars,
  relationshipMode = "off",
  relationshipRole = "active",
  developmentStage = "off",
  comparisonWheel,
  showComparisonAspects = true,
}) => {
  const isPlaceholder = visualMode === "placeholder";
  const isHuber = visualStyle === "huber";
  const persona = (typeof personaMode === "string") ? personaMode : (personaMode ? "social" : "off");
  const relocationRotation = relocation?.rotationDeg ?? 0;
  const advObjects = advancedObjects ?? { nodes: showMathPoints, fortune: false, symbolicPoints: showMathPoints };
  const stars = fixedStars ?? { primary: false, secondary: false };
  const relMode = relationshipMode;
  const relRole = relationshipRole;
  const devStage = developmentStage;
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

    const count = Math.max(3, Math.min(24, harmonicOrder));
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
    const count = Math.max(3, Math.min(24, harmonicOrder));
    const baseOpacity = count >= 13 ? 0.06 : 0.1;
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
          opacity={isHuber ? Math.min(0.06, baseOpacity) : baseOpacity}
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
            opacity={isHuber ? Math.min(0.06, baseOpacity) : baseOpacity}
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

    const tooltipBase = 'Relocación simbólica: describe cómo el entorno influye en la experiencia vital. No es una carta astronómica relocada.';
    const tooltipMode = (() => {
      switch (relocation.mode) {
        case "home": return 'Hogar: “Dónde me siento contenido”';
        case "work": return 'Trabajo: “Dónde me organizo y produzco”';
        case "travel": return 'Viaje: “Dónde exploro y aprendo”';
        case "abroad": return 'Extranjero: “Dónde me transformo”';
        default: return relocation.city ? `Entorno: ${relocation.city}` : 'Entorno simbólico';
      }
    })();
    const tooltip = `${tooltipBase} · ${tooltipMode}`;

    const base = relocation.offsetDeg || 0;
    const lines: React.ReactNode[] = [];

    const theme = (() => {
      switch (relocation.mode) {
        case "home": return { stroke: "#f59e0b", fill: "rgba(245,158,11,0.06)", opacity: 0.22, dash: "6 6" }; // cálido
        case "work": return { stroke: "#111827", fill: "rgba(17,24,39,0.05)", opacity: 0.24, dash: "" }; // contraste/recto
        case "travel": return { stroke: "#0ea5e9", fill: "rgba(14,165,233,0.05)", opacity: 0.22, dash: "3 7" }; // movimiento
        case "abroad": return { stroke: "#64748b", fill: "rgba(100,116,139,0.04)", opacity: 0.18, dash: "2 10" }; // distancia
        default: return { stroke: "#14b8a6", fill: "rgba(20,184,166,0.04)", opacity: 0.2, dash: "5 7" };
      }
    })();

    const targetHouses = (() => {
      switch (relocation.mode) {
        case "home": return [4, 1];
        case "work": return [6, 10];
        case "travel": return [3, 9];
        case "abroad": return [9, 10, 11, 12];
        default: return [];
      }
    })();

    for (let i = 0; i < 12; i++) {
      const deg = base + i * 30;
      const a = degToPoint(deg, rings.houseInner, cx);
      const b = degToPoint(deg, rings.houseOuter, cx);
      lines.push(
        <line
          key={`rel-house-${i}`}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke={theme.stroke}
          strokeWidth={relocation.mode === "work" ? 1.6 : 1.2}
          opacity={theme.opacity}
          strokeDasharray={theme.dash || undefined}
        >
          {relocation.mode === "travel" ? (
            <animate attributeName="stroke-dashoffset" values="0;20" dur="2.4s" repeatCount="indefinite" />
          ) : null}
        </line>
      );
    }

    const donutSeg = (startDeg: number, endDeg: number, outerR: number, innerR: number) => {
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

    const emphasis = (() => {
      if (!houses || houses.length !== 12 || targetHouses.length === 0) return null;
      const outerR = rings.houseOuter;
      const innerR = rings.houseInner;
      return (
        <g>
          {targetHouses.map((h) => {
            const idx = Math.max(1, Math.min(12, h)) - 1;
            const start = houses[idx];
            const end = houses[(idx + 1) % 12];
            return (
              <path
                key={`rel-emph-${relocation.mode}-${h}`}
                d={donutSeg(start, end, outerR, innerR)}
                fill={theme.fill}
                stroke="none"
                opacity={relocation.mode === "abroad" ? 0.55 : 1}
              />
            );
          })}
        </g>
      );
    })();

    const axis = (deg: number, key: string) => {
      const a = degToPoint(base + deg, rings.centerHole, cx);
      const b = degToPoint(base + deg, rings.outer, cx);
      return (
        <line
          key={key}
          x1={a.x} y1={a.y}
          x2={b.x} y2={b.y}
          stroke={theme.stroke}
          strokeWidth={relocation.mode === "work" ? 1.8 : 1.3}
          opacity={relocation.mode === "abroad" ? 0.16 : 0.22}
          strokeDasharray={relocation.mode === "work" ? undefined : "6 6"}
        />
      );
    };

    const wash = relocation.mode === "abroad"
      ? <circle cx={cx} cy={cx} r={rings.outer + 18} fill="rgba(15,23,42,0.03)" />
      : relocation.mode === "home"
        ? <circle cx={cx} cy={cx} r={rings.outer + 18} fill="rgba(245,158,11,0.02)" />
        : null;

    return (
      <g>
        <title>{tooltip}</title>
        {wash}
        {emphasis}
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

  const renderAdvancedObjects = () => {
    if (!advObjects.nodes && !advObjects.fortune && !advObjects.symbolicPoints) return null;

    const r = Math.min(rings.zodiacGlyphRing - 10, rings.houseOuter + 18);

    const hash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const byKey = new Map<string, PlanetPoint>();
    planets.forEach((p) => byKey.set(String(p.key).toLowerCase(), p));
    const sun = byKey.get("sun");
    const moon = byKey.get("moon");

    const baseAsc = normalizeDeg((houses && houses.length === 12) ? houses[0] : 0);
    const baseSeed = normalizeDeg((Number.isFinite(ascendantDeg) ? ascendantDeg : baseAsc) + (planets.length > 0 ? hash(planets[0].key) % 360 : 0));

    const vecAvgDeg = (a: number, b: number) => {
      const ra = (normalizeDeg(a) * Math.PI) / 180;
      const rb = (normalizeDeg(b) * Math.PI) / 180;
      const x = Math.cos(ra) + Math.cos(rb);
      const y = Math.sin(ra) + Math.sin(rb);
      return normalizeDeg((Math.atan2(y, x) * 180) / Math.PI);
    };

    const midArcDeg = (startDeg: number, endDeg: number) => {
      const a0 = normalizeDeg(startDeg);
      const a1 = normalizeDeg(endDeg);
      const span = (a1 - a0 + 360) % 360;
      return normalizeDeg(a0 + span / 2);
    };

    const sunDeg = sun ? normalizeDeg(sun.degree) : null;
    const moonDeg = moon ? normalizeDeg(moon.degree) : null;

    const northNodeDeg = normalizeDeg((sunDeg ?? baseAsc) + 95);
    const southNodeDeg = normalizeDeg(northNodeDeg + 180);
    const fortunaDeg = (sunDeg !== null && moonDeg !== null)
      ? vecAvgDeg(sunDeg, moonDeg)
      : normalizeDeg((sunDeg ?? baseSeed) + 45);

    const symbolicPointsDeg = (() => {
      if (!houses || houses.length !== 12) return [60, 150, 240, 330];
      const idx = [2, 5, 8, 11]; // casas 3/6/9/12
      return idx.map((i) => midArcDeg(houses[i], houses[(i + 1) % 12]));
    })();

    const tooltipNodesN = "Dirección simbólica de desarrollo y aprendizaje.";
    const tooltipNodesS = "Zona conocida, hábitos y memoria psicológica.";
    const tooltipFortune = "Área de fluidez y facilidad experiencial.";
    const tooltipPoints = "Marcadores de enfoque psicológico (no astronómicos).";

    const nodeNorth = () => {
      const p = degToPoint(northNodeDeg, r, cx);
      const tip = degToPoint(northNodeDeg, r - 12, cx);
      return (
        <g>
          <title>{tooltipNodesN}</title>
          <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#8b5cf6" strokeWidth={1.6} opacity={0.55} />
          <line x1={p.x} y1={p.y} x2={tip.x} y2={tip.y} stroke="#8b5cf6" strokeWidth={1.6} opacity={0.45} />
        </g>
      );
    };

    const nodeSouth = () => {
      const p = degToPoint(southNodeDeg, r, cx);
      return (
        <g>
          <title>{tooltipNodesS}</title>
          <circle cx={p.x} cy={p.y} r={6.5} fill="rgba(139,92,246,0.18)" stroke="#8b5cf6" strokeWidth={1.4} opacity={0.5} />
        </g>
      );
    };

    const fortuna = () => {
      const p = degToPoint(fortunaDeg, r, cx);
      return (
        <g>
          <title>{tooltipFortune}</title>
          <circle cx={p.x} cy={p.y} r={10} fill="rgba(245,158,11,0.10)" stroke="none" opacity={0.8} />
          <circle cx={p.x} cy={p.y} r={4.2} fill="#f59e0b" opacity={0.55} />
        </g>
      );
    };

    const points = () => {
      const color = "#64748b";
      return (
        <g>
          <title>{tooltipPoints}</title>
          {symbolicPointsDeg.map((deg, idx) => {
            const p = degToPoint(deg, r, cx);
            if (idx === 0) {
              return <polygon key={`sp-${idx}`} points={`${p.x},${p.y - 5} ${p.x - 4.5},${p.y + 4.5} ${p.x + 4.5},${p.y + 4.5}`} fill={color} opacity={0.22} />;
            }
            if (idx === 1) {
              return <rect key={`sp-${idx}`} x={p.x - 4} y={p.y - 4} width={8} height={8} fill={color} opacity={0.18} />;
            }
            if (idx === 2) {
              return <polygon key={`sp-${idx}`} points={`${p.x},${p.y - 5.5} ${p.x + 5.5},${p.y} ${p.x},${p.y + 5.5} ${p.x - 5.5},${p.y}`} fill={color} opacity={0.18} />;
            }
            return <circle key={`sp-${idx}`} cx={p.x} cy={p.y} r={3.5} fill={color} opacity={0.16} />;
          })}
        </g>
      );
    };

    return (
      <g>
        {advObjects.nodes ? (
          <g>
            {nodeNorth()}
            {nodeSouth()}
          </g>
        ) : null}
        {advObjects.fortune ? fortuna() : null}
        {advObjects.symbolicPoints ? points() : null}
      </g>
    );
  };

  const renderFixedStars = () => {
    if (!stars.primary && !stars.secondary) return null;

    const tooltipGeneral = 'Estrellas fijas (modo simbólico): arquetipos culturales utilizados como referencias psicológicas. No son predicciones.';

    const byKey = new Map<string, PlanetPoint>();
    planets.forEach((p) => byKey.set(String(p.key).toLowerCase(), p));
    const sun = byKey.get("sun");

    const asc = normalizeDeg((houses && houses.length === 12) ? houses[0] : (sun ? sun.degree : 0));
    const mc = normalizeDeg((houses && houses.length === 12) ? houses[9] : (asc + 90));

    const baseRef = sun ? normalizeDeg(sun.degree) : asc;

    // Estrellas primarias (tradicionales)
    const primaryDefs: Array<{ key: string; name: string; angle: number; tooltip: string; isPrimary: true }> = [
      { key: 'regulus', name: 'Regulus', angle: normalizeDeg(mc - 8), tooltip: 'Regulus: arquetipo de liderazgo y responsabilidad del corazón.', isPrimary: true },
      { key: 'spica', name: 'Spica', angle: normalizeDeg(baseRef + 150), tooltip: 'Spica: arquetipo de talento y protección simbólica.', isPrimary: true },
      { key: 'aldebaran', name: 'Aldebarán', angle: normalizeDeg(baseRef + 60), tooltip: 'Aldebarán: arquetipo de visión y desafío ético.', isPrimary: true },
      { key: 'antares', name: 'Antares', angle: normalizeDeg(baseRef + 210), tooltip: 'Antares: arquetipo de intensidad y confrontación consciente.', isPrimary: true },
      { key: 'fomalhaut', name: 'Fomalhaut', angle: normalizeDeg(baseRef + 300), tooltip: 'Fomalhaut: arquetipo de ideal e inspiración.', isPrimary: true },
    ];

    // Estrellas secundarias (magnitud 0-2, complementarias)
    const secondaryDefs: Array<{ key: string; name: string; angle: number; tooltip: string; isPrimary: false }> = [
      { key: 'achernar', name: 'Achernar', angle: normalizeDeg(baseRef + 345), tooltip: 'Achernar: transformación, flujo, adaptación (final del río).', isPrimary: false },
      { key: 'hamal', name: 'Hamal', angle: normalizeDeg(baseRef + 37), tooltip: 'Hamal: iniciativa, impulso, liderazgo (carnero).', isPrimary: false },
      { key: 'polaris', name: 'Polaris', angle: normalizeDeg(mc + 28), tooltip: 'Polaris: guía, dirección, propósito (Estrella del Norte).', isPrimary: false },
      { key: 'deneb', name: 'Deneb', angle: normalizeDeg(baseRef + 335), tooltip: 'Deneb: transformación, elevación espiritual (cola del cisne).', isPrimary: false },
      { key: 'betelgeuse', name: 'Betelgeuse', angle: normalizeDeg(baseRef + 88), tooltip: 'Betelgeuse: fuerza, acción, valentía (hombro del cazador).', isPrimary: false },
      { key: 'rigel', name: 'Rigel', angle: normalizeDeg(baseRef + 76), tooltip: 'Rigel: fundamento, estabilidad, base (pie del cazador).', isPrimary: false },
      { key: 'procyon', name: 'Procyon', angle: normalizeDeg(baseRef + 115), tooltip: 'Procyon: anticipación, alerta, intuición (antes del perro).', isPrimary: false },
      { key: 'capella', name: 'Capella', angle: normalizeDeg(baseRef + 81), tooltip: 'Capella: nutrición, cuidado, protección materna (cabra).', isPrimary: false },
      { key: 'vega', name: 'Vega', angle: normalizeDeg(baseRef + 285), tooltip: 'Vega: armonía, música, belleza, creatividad artística (lira).', isPrimary: false },
      { key: 'arcturus', name: 'Arcturus', angle: normalizeDeg(baseRef + 204), tooltip: 'Arcturus: protección, vigilancia, guía (guardián de la osa).', isPrimary: false },
    ];

    // Combinar según configuración
    const allStars: Array<{ key: string; name: string; angle: number; tooltip: string; isPrimary: boolean }> = [];
    if (stars.primary) allStars.push(...primaryDefs);
    if (stars.secondary) allStars.push(...secondaryDefs);

    const rStarPrimary = Math.min(cx - 10, rings.outer + 22);
    const rStarSecondary = Math.min(cx - 10, rings.outer + 36); // Un poco más afuera para secundarias
    
    // Colores diferenciados
    const primaryStarColor = "#fbbf24"; // Dorado brillante
    const secondaryStarColor = "#d4a574"; // Dorado tenue/ambar
    
    const primaryStarOpacity = isHuber ? 0.22 : 0.28;
    const secondaryStarOpacity = isHuber ? 0.16 : 0.22;

    const planetDeg = (p: PlanetPoint) => {
      if (Number.isFinite(p.degree)) return normalizeDeg(p.degree);
      return 0;
    };

    const nearestPlanet = (deg: number) => {
      if (!planets || planets.length === 0) return null;
      let best: { p: PlanetPoint; d: number } | null = null;
      for (const p of planets) {
        const d = shortestAngle(deg, planetDeg(p));
        if (best === null || d < best.d) best = { p, d };
      }
      if (!best) return null;
      return best.d <= 12 ? best : null;
    };

    return (
      <g>
        <title>{tooltipGeneral}</title>
        {allStars.map((s) => {
          const rStar = s.isPrimary ? rStarPrimary : rStarSecondary;
          const starColor = s.isPrimary ? primaryStarColor : secondaryStarColor;
          const starOpacity = s.isPrimary ? primaryStarOpacity : secondaryStarOpacity;
          const starSize = s.isPrimary ? 8 : 6; // Primarias más grandes
          const fontSize = s.isPrimary ? 12 : 10;
          const starGlyph = s.isPrimary ? '✶' : '☆'; // Diferente glifo

          const pt = degToPoint(s.angle, rStar, cx);
          const near = nearestPlanet(s.angle);
          const planetPt = near ? degToPoint(planetDeg(near.p), rings.planetRing, cx) : null;
          const typeLabel = s.isPrimary ? 'Principal' : 'Secundaria';
          const lineTooltip = near 
            ? `${s.name} (${typeLabel}) — ${s.tooltip} Activado a través de ${String(near.p.key)} (simbólico).` 
            : `${s.name} (${typeLabel}) — ${s.tooltip}`;

          return (
            <g key={`fs-${s.key}`} opacity={starOpacity}>
              <title>{lineTooltip}</title>
              {planetPt ? (
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={planetPt.x}
                  y2={planetPt.y}
                  stroke={starColor}
                  strokeWidth={s.isPrimary ? 1 : 0.75}
                  opacity={s.isPrimary ? 0.12 : 0.08}
                  strokeDasharray={s.isPrimary ? "2 10" : "1 8"}
                />
              ) : null}
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={starSize} 
                fill={s.isPrimary ? "rgba(251,191,36,0.06)" : "rgba(212,165,116,0.04)"} 
                stroke="none" 
                opacity={0.55} 
              />
              <text 
                x={pt.x} 
                y={pt.y} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize={fontSize} 
                fill={starColor} 
                opacity={s.isPrimary ? 0.45 : 0.35} 
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
              >
                {starGlyph}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderRelationshipsOverlay = () => {
    if (relMode === "off") return null;

    const tooltipGeneral = "Relaciones (modo simbólico): muestra dinámicas psicológicas del vínculo. No evalúa compatibilidad ni predice resultados.";

    const asc = normalizeDeg((houses && houses.length === 12) ? houses[0] : (Number.isFinite(ascendantDeg) ? ascendantDeg : 0));
    const desc = normalizeDeg(asc + 180);
    const mc = normalizeDeg((houses && houses.length === 12) ? houses[9] : (asc + 90));
    const ic = normalizeDeg(mc + 180);

    const alpha = isHuber ? 0.75 : 1;
    const strokeBase =
      relMode === "couple" ? "#a78bfa" :
        relMode === "family" ? "#f59e0b" :
          relMode === "work" ? "#60a5fa" :
            relMode === "social" ? "#34d399" :
              "#94a3b8";

    const fillBase =
      relMode === "couple" ? "rgba(167,139,250,0.08)" :
        relMode === "family" ? "rgba(245,158,11,0.08)" :
          relMode === "work" ? "rgba(96,165,250,0.08)" :
            relMode === "social" ? "rgba(52,211,153,0.07)" :
              "rgba(148,163,184,0.06)";

    const bandOuter = Math.max(rings.houseInner + 18, rings.houseOuter - 3);
    const bandInner = Math.min(bandOuter - 18, rings.houseInner + 4);

    const donutSeg = (startDeg: number, endDeg: number) => {
      const a0 = normalizeDeg(startDeg);
      const a1 = normalizeDeg(endDeg);
      const delta = (a1 - a0 + 360) % 360;
      const largeArc = delta > 180 ? 1 : 0;

      const p0o = degToPoint(a0, bandOuter, cx);
      const p1o = degToPoint(a1, bandOuter, cx);
      const p1i = degToPoint(a1, bandInner, cx);
      const p0i = degToPoint(a0, bandInner, cx);

      return `M ${p0o.x} ${p0o.y} A ${bandOuter} ${bandOuter} 0 ${largeArc} 1 ${p1o.x} ${p1o.y} L ${p1i.x} ${p1i.y} A ${bandInner} ${bandInner} 0 ${largeArc} 0 ${p0i.x} ${p0i.y} Z`;
    };

    const axis = (deg: number, key: string, labelA: string, labelB: string) => {
      const pA = degToPoint(deg, bandOuter + 10, cx);
      const pB = degToPoint(normalizeDeg(deg + 180), bandOuter + 10, cx);
      const lA = degToPoint(deg, bandOuter, cx);
      const lB = degToPoint(normalizeDeg(deg + 180), bandOuter, cx);
      return (
        <g key={key} opacity={0.65 * alpha}>
          <line
            x1={lA.x} y1={lA.y}
            x2={lB.x} y2={lB.y}
            stroke={strokeBase}
            strokeWidth={1.2}
            opacity={0.22}
            strokeDasharray="6 10"
          />
          <text x={pA.x} y={pA.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={strokeBase} opacity={0.55} style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
            {labelA}
          </text>
          <text x={pB.x} y={pB.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={strokeBase} opacity={0.55} style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
            {labelB}
          </text>
        </g>
      );
    };

    const segAround = (centerDeg: number, widthDeg: number) => {
      const start = normalizeDeg(centerDeg - widthDeg / 2);
      const end = normalizeDeg(centerDeg + widthDeg / 2);
      return donutSeg(start, end);
    };

    const fieldSegs: Array<{ key: string; d: string; title: string }> = (() => {
      if (relMode === "couple") {
        return [
          { key: "couple-asc", d: segAround(asc, 70), title: "Pareja: eje Yo–Otro (simbólico). Encuentro, espejo y aprendizaje mutuo." },
          { key: "couple-desc", d: segAround(desc, 70), title: "Pareja: zona de espejo (simbólico). No predice resultados." },
        ];
      }
      if (relMode === "family") {
        return [
          { key: "family-ic", d: segAround(ic, 90), title: "Familia: pertenencia y raíces (simbólico). Roles, herencia y vínculo." },
          { key: "family-mc", d: segAround(mc, 90), title: "Familia: rol y responsabilidad (simbólico). No es determinista." },
        ];
      }
      if (relMode === "work") {
        return [
          { key: "work-mc", d: segAround(normalizeDeg(mc + 45), 90), title: "Trabajo: cooperación y función (simbólico). Autoridad y organización." },
        ];
      }
      if (relMode === "social") {
        return [
          { key: "social-net", d: segAround(normalizeDeg(asc + 30), 120), title: "Social: intercambio y adaptación (simbólico). Red de contactos." },
        ];
      }
      return [];
    })();

    const hashKey = (key: string) => {
      const s = String(key || "");
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const planetDeg = (p: PlanetPoint) => {
      if (Number.isFinite(p.degree) && !isPlaceholder) return normalizeDeg(p.degree);
      return normalizeDeg((hashKey(p.key) * 137 + 23) % 360);
    };

    const keyLabel = (k: string) => String(k || "").toLowerCase();
    const priority = new Set(["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]);
    const ptsForPairs = planets.filter((p) => priority.has(keyLabel(p.key))).slice(0, 10);

    const pairs: Array<{ a: PlanetPoint; b: PlanetPoint; kind: "projection" | "shadow" | "complement" }> = [];
    for (let i = 0; i < ptsForPairs.length; i++) {
      for (let j = i + 1; j < ptsForPairs.length; j++) {
        const a = ptsForPairs[i];
        const b = ptsForPairs[j];
        const d = shortestAngle(planetDeg(a), planetDeg(b));
        if (Math.abs(d - 180) <= 12) {
          const kind: "projection" | "shadow" | "complement" =
            relRole === "reactive" ? "shadow" :
              relMode === "couple" ? "projection" :
                relMode === "family" ? "shadow" :
                  "complement";
          pairs.push({ a, b, kind });
          if (pairs.length >= 10) break;
        }
      }
      if (pairs.length >= 10) break;
    }

    const kindLabel = (k: "projection" | "shadow" | "complement") =>
      k === "projection" ? "Dinámica de proyección" : (k === "shadow" ? "Sombra" : "Complemento");

    const kindTooltip = (k: "projection" | "shadow" | "complement") =>
      k === "projection"
        ? "Dinámica de proyección: lo no integrado se busca en el otro (simbólico)."
        : (k === "shadow"
          ? "Dinámica de sombra: contenido no reconocido pide integración (simbólico)."
          : "Dinámica de complemento: complementariedad creativa (simbólico).");

    const crossLines = pairs.map((p, idx) => {
      const aDeg = planetDeg(p.a);
      const bDeg = planetDeg(p.b);
      const aPt = degToPoint(aDeg, rings.planetRing, cx);
      const bPt = degToPoint(bDeg, rings.planetRing, cx);
      const tt = `${kindLabel(p.kind)} — ${String(p.a.key)} ↔ ${String(p.b.key)}. ${kindTooltip(p.kind)} No es predictivo.`;
      return (
        <g key={`rel-cross-${idx}`} opacity={0.6 * alpha}>
          <title>{tt}</title>
          <line
            x1={aPt.x} y1={aPt.y}
            x2={bPt.x} y2={bPt.y}
            stroke={strokeBase}
            strokeWidth={1.1}
            opacity={0.14}
            strokeDasharray="3 10"
          />
        </g>
      );
    });

    const doubleWheelLinks = (() => {
      if (!secondaryLayer) return null;
      const pts = (secondaryPlanets && secondaryPlanets.length > 0) ? secondaryPlanets : (transitPlanets && transitPlanets.length > 0 ? transitPlanets : []);
      if (!pts || pts.length === 0) return null;

      const maxR = cx - 8 - (comparisonEnabled ? 46 : 0);
      const outerR = Math.min(maxR, Math.min(maxR - 22, rings.outer + 18) + 26);
      const glyphR = Math.min(maxR - 10, outerR - 10);

      const byKey = new Map<string, PlanetPoint>();
      pts.forEach((p) => byKey.set(keyLabel(p.key), p));

      const lines: React.ReactNode[] = [];
      for (const p of planets.filter((x) => priority.has(keyLabel(x.key))).slice(0, 6)) {
        const other = byKey.get(keyLabel(p.key));
        if (!other) continue;

        const aPt = degToPoint(planetDeg(p), rings.planetRing, cx);
        const bPt = degToPoint(planetDeg(other), glyphR, cx);
        const tt = `Vínculo simbólico (doble rueda): ${String(p.key)} ↔ ${String(other.key)}. No es un aspecto matemático.`;
        lines.push(
          <g key={`rel-dw-${p.key}`} opacity={0.55 * alpha}>
            <title>{tt}</title>
            <line
              x1={aPt.x} y1={aPt.y}
              x2={bPt.x} y2={bPt.y}
              stroke={strokeBase}
              strokeWidth={1.1}
              opacity={0.1}
              strokeDasharray="2 12"
            />
          </g>
        );
      }
      return <g>{lines}</g>;
    })();

    const socialNodes = (() => {
      if (relMode !== "social") return null;
      const base = normalizeDeg(asc + (hashKey(planets[0]?.key ?? "x") % 360));
      const nodes = Array.from({ length: Math.min(10, Math.max(6, planets.length)) }, (_, i) => {
        const deg = normalizeDeg(base + i * 33 + (hashKey(planets[i]?.key ?? `n${i}`) % 17));
        const pt = degToPoint(deg, bandOuter + 14, cx);
        return (
          <circle key={`rel-node-${i}`} cx={pt.x} cy={pt.y} r={3.2} fill={strokeBase} opacity={0.18} />
        );
      });
      return <g opacity={0.9 * alpha}>{nodes}</g>;
    })();

    return (
      <g>
        <title>{tooltipGeneral}</title>
        {axis(asc, "rel-axis-yo-otro", "Yo", "Otro")}
        {axis(mc, "rel-axis-proj-int", "Proyección", "Integración")}
        {fieldSegs.map((s) => (
          <path key={s.key} d={s.d} fill={fillBase} stroke="none" opacity={0.9 * alpha}>
            <title>{s.title}</title>
          </path>
        ))}
        {socialNodes}
        {crossLines}
        {doubleWheelLinks}
      </g>
    );
  };

  const renderDevelopmentOverlay = () => {
    if (devStage === "off") return null;

    const tooltipGeneral = "Desarrollo (modo simbólico): acompaña ritmos de crecimiento y aprendizaje. No diagnostica ni predice.";

    const stageLabel =
      devStage === "early_childhood" ? "Primera infancia (0–3)" :
        devStage === "childhood_early" ? "Infancia temprana (4–7)" :
          devStage === "childhood_middle" ? "Infancia media (8–11)" :
            devStage === "adolescence" ? "Adolescencia (12–18)" :
              devStage === "young_adult" ? "Juventud temprana (18–25)" :
                "Etapa";

    const alpha = isHuber ? 0.75 : 1;
    const strokeBase =
      devStage === "early_childhood" ? "#fb923c" :
        devStage === "childhood_early" ? "#f97316" :
          devStage === "childhood_middle" ? "#f59e0b" :
            devStage === "adolescence" ? "#a78bfa" :
              devStage === "young_adult" ? "#60a5fa" :
                "#94a3b8";

    const fillA =
      devStage === "early_childhood" ? "rgba(251,146,60,0.10)" :
        devStage === "childhood_early" ? "rgba(249,115,22,0.10)" :
          devStage === "childhood_middle" ? "rgba(245,158,11,0.10)" :
            devStage === "adolescence" ? "rgba(167,139,250,0.10)" :
              devStage === "young_adult" ? "rgba(96,165,250,0.10)" :
                "rgba(148,163,184,0.08)";

    const fillB =
      devStage === "early_childhood" ? "rgba(251,146,60,0.04)" :
        devStage === "childhood_early" ? "rgba(249,115,22,0.04)" :
          devStage === "childhood_middle" ? "rgba(245,158,11,0.04)" :
            devStage === "adolescence" ? "rgba(167,139,250,0.04)" :
              devStage === "young_adult" ? "rgba(96,165,250,0.04)" :
                "rgba(148,163,184,0.03)";

    const cusps = (houses && houses.length === 12) ? houses.map((d) => normalizeDeg(d)) : Array.from({ length: 12 }, (_, i) => i * 30);
    const cusp = (i: number) => cusps[(i + 12) % 12];

    const bandOuter = Math.max(rings.houseInner + 22, rings.houseOuter - 2);
    const bandInner = Math.min(bandOuter - 20, rings.houseInner + 6);

    const donutSeg = (startDeg: number, endDeg: number) => {
      const a0 = normalizeDeg(startDeg);
      const a1 = normalizeDeg(endDeg);
      const delta = (a1 - a0 + 360) % 360;
      const largeArc = delta > 180 ? 1 : 0;

      const p0o = degToPoint(a0, bandOuter, cx);
      const p1o = degToPoint(a1, bandOuter, cx);
      const p1i = degToPoint(a1, bandInner, cx);
      const p0i = degToPoint(a0, bandInner, cx);

      return `M ${p0o.x} ${p0o.y} A ${bandOuter} ${bandOuter} 0 ${largeArc} 1 ${p1o.x} ${p1o.y} L ${p1i.x} ${p1i.y} A ${bandInner} ${bandInner} 0 ${largeArc} 0 ${p0i.x} ${p0i.y} Z`;
    };

    const segByHouseRange = (fromHouseIdx0: number, toHouseIdx0: number) => {
      // inclusive [from..to] in 0-based house index
      const start = cusp(fromHouseIdx0);
      const end = cusp(toHouseIdx0 + 1);
      return donutSeg(start, end);
    };

    const segments: Array<{ key: string; d: string; title: string }> = (() => {
      if (devStage === "early_childhood") {
        return [{ key: "dev-0-3", d: segByHouseRange(0, 3), title: "Primera infancia: contención, seguridad y vínculo (simbólico). Enfoque en necesidades evolutivas." }];
      }
      if (devStage === "childhood_early") {
        return [{ key: "dev-4-7", d: segByHouseRange(2, 4), title: "Infancia temprana: curiosidad, juego y expresión (simbólico). Acompañamiento educativo." }];
      }
      if (devStage === "childhood_middle") {
        return [{ key: "dev-8-11", d: segByHouseRange(2, 5), title: "Infancia media: aprendizaje, hábitos y cooperación (simbólico). No diagnóstico." }];
      }
      if (devStage === "adolescence") {
        return [
          { key: "dev-12-18-a", d: segByHouseRange(4, 7), title: "Adolescencia: identidad, pertenencia y cambio (simbólico). Ritmos y foco evolutivo." },
          { key: "dev-12-18-b", d: segByHouseRange(10, 10), title: "Adolescencia: grupo y proyecto (simbólico). Acompañamiento, no determinismo." },
        ];
      }
      if (devStage === "young_adult") {
        return [{ key: "dev-18-25", d: segByHouseRange(8, 9), title: "Juventud temprana: dirección, propósito y consolidación (simbólico)." }];
      }
      return [];
    })();

    const guideKeys: string[] = (() => {
      if (devStage === "early_childhood") return ["moon"];
      if (devStage === "childhood_early") return ["mercury", "venus"];
      if (devStage === "childhood_middle") return ["mercury", "jupiter"];
      if (devStage === "adolescence") return ["sun", "mars"];
      if (devStage === "young_adult") return ["sun", "saturn"];
      return ["sun"];
    })();

    const hashKey = (key: string) => {
      const s = String(key || "");
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const planetDeg = (p: PlanetPoint | undefined) => {
      if (p && Number.isFinite(p.degree) && !isPlaceholder) return normalizeDeg(p.degree);
      return normalizeDeg((hashKey(p?.key ?? "x") * 137 + 29) % 360);
    };

    const planetByKeyLower = new Map<string, PlanetPoint>();
    planets.forEach((p) => planetByKeyLower.set(String(p.key).toLowerCase(), p));

    const guides = guideKeys
      .map((k) => ({ key: k, p: planetByKeyLower.get(k) }))
      .filter((x) => x.p || true);

    const guideNodes = guides.map((g) => {
      const deg = planetDeg(g.p);
      const pt = degToPoint(deg, rings.planetRing, cx);
      const label = g.p ? String(g.p.key) : g.key;
      const tip = `Guía de etapa: ${label}. Planeta resaltado como foco de aprendizaje (lectura simbólica). No diagnóstico ni predicción.`;
      return (
        <g key={`dev-guide-${g.key}`} opacity={0.95 * alpha}>
          <title>{tip}</title>
          <circle cx={pt.x} cy={pt.y} r={22} fill="none" stroke={strokeBase} strokeWidth={2.2} opacity={0.12} />
          <circle cx={pt.x} cy={pt.y} r={16} fill="none" stroke={strokeBase} strokeWidth={1.6} opacity={0.10} />
        </g>
      );
    });

    const gradId = `dev-grad-${devStage}`;

    return (
      <g>
        <title>{`${tooltipGeneral} Etapa: ${stageLabel}.`}</title>
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={fillA} />
            <stop offset="100%" stopColor={fillB} />
          </radialGradient>
        </defs>
        {segments.map((s) => (
          <path key={s.key} d={s.d} fill={`url(#${gradId})`} stroke="none" opacity={0.95 * alpha}>
            <title>{s.title}</title>
          </path>
        ))}
        <circle cx={cx} cy={cx} r={bandOuter} fill="none" stroke={strokeBase} strokeWidth={1.1} opacity={0.12 * alpha} />
        <circle cx={cx} cy={cx} r={bandInner} fill="none" stroke={strokeBase} strokeWidth={1.0} opacity={0.10 * alpha} />
        {guideNodes}
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
            <g transform={`rotate(${geo.rotationDeg + relocationRotation} ${cx} ${cx})`}>
              {renderComparisonAspects()}
              {renderSecondaryWheel()}
              {renderTemporalLayers()}
              {renderAnnualLayers()}
              {renderComparisonWheel()}
              {renderPlanetaryLayer()}
              {renderBaseRings()}
              {renderDegreeTicks()}
              {renderZodiac()}
              {renderRelocationOverlay()}
              {renderAdvancedObjects()}
              {renderFixedStars()}
              {renderRelationshipsOverlay()}
              {renderDevelopmentOverlay()}
              {huberHouseBands}
                {renderHouseLines()}
                {renderHouseNumbers()}
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
