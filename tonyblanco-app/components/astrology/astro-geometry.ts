export type HouseCusps = number[]; // length 12, degrees 0..360
export type PlanetPoint = {
  key: string;           // "sun", "moon", ...
  glyph: string;         // "☉", "☽", ...
  degree: number;        // 0..360 absolute ecliptic longitude
  label?: string;        // "17°♎"
};

export type AspectLine = {
  p1Key: string;
  p2Key: string;
  kind: "CONJ" | "SEXT" | "SQR" | "TRI" | "OPP";
  orb: number;           // abs(angle - exact)
  angle: number;         // normalized 0..180
};

export type WheelLayoutMode = 'single' | 'double';

export type WheelOptions = {
  size: number;                 // svg width/height
  ascendantDeg: number;         // 0..360
  zodiacGlyphs: string[];       // 12 glyphs, Aries..Pisces
  showDegreeTicks?: boolean;
  majorTickEveryDeg?: number;   // e.g. 10
  minorTickEveryDeg?: number;   // e.g. 1
  layoutMode?: WheelLayoutMode; // 'double' reserva banda exterior para overlay
};

export type WheelRings = {
  outer: number;
  degreeTicksOuter: number;
  zodiacGlyphRing: number;
  houseOuter: number;
  houseInner: number;
  planetRing: number;
  asteroidRing: number;
  aspectRing: number;
  centerHole: number;
};

export type WheelGeometry = {
  center: number;
  rings: WheelRings;
  rotationDeg: number; // applied to keep ASC fixed
};

export function normalizeDeg(d: number): number {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

export function shortestAngle(a: number, b: number): number {
  // returns 0..180
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return diff > 180 ? 360 - diff : diff;
}

export function degToPoint(
  deg: number,
  radius: number,
  center: number
): { x: number; y: number } {
  // 0° at top, clockwise
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

export function buildDefaultRings(size: number, layoutMode: WheelLayoutMode = 'single'): WheelRings {
  // Proporción clásica, compacta, “tipo Astro”
  const center = size / 2;
  // En doble rueda, contraemos el núcleo natal para dejar ~52px de banda exterior visible.
  const edgeReserve = layoutMode === 'double' ? 56 : 24;
  const outer = center - edgeReserve;

  return {
    outer,
    degreeTicksOuter: outer - 8,
    zodiacGlyphRing: outer - 26,
    houseOuter: outer - 52,
    houseInner: outer - 92,
    planetRing: outer - 140,
    asteroidRing: outer - 116,
    aspectRing: outer - 160,
    centerHole: Math.max(110, outer - 300),
  };
}

export function createWheelGeometry(opts: WheelOptions): WheelGeometry {
  const center = opts.size / 2;
  const rings = buildDefaultRings(opts.size, opts.layoutMode ?? 'single');

  // Rotación: queremos que ASC quede “a la izquierda” (como muchas cartas) o a 9h.
  // En Astro.com suele quedar en horizontal izquierda (ASC), DC a la derecha.
  // En nuestro sistema 0° arriba, así que colocamos ASC en 180° (izquierda).
  // rotationDeg se aplica al grupo SVG.
  const targetAsc = 180;
  const rotationDeg = targetAsc - normalizeDeg(opts.ascendantDeg);

  return { center, rings, rotationDeg };
}

export function computeAspects(
  planets: PlanetPoint[],
  orbDeg = 6
): AspectLine[] {
  const aspectDefs: Array<{
    kind: AspectLine["kind"];
    exact: number;
    priority: number;
  }> = [
    { kind: "CONJ", exact: 0, priority: 5 },
    { kind: "OPP", exact: 180, priority: 4 },
    { kind: "SQR", exact: 90, priority: 3 },
    { kind: "TRI", exact: 120, priority: 2 },
    { kind: "SEXT", exact: 60, priority: 1 },
  ];

  const out: AspectLine[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i].degree;
      const b = planets[j].degree;
      const angle = shortestAngle(a, b);

      let best: { def: typeof aspectDefs[number]; orb: number } | null = null;
      for (const def of aspectDefs) {
        const orb = Math.abs(angle - def.exact);
        if (orb <= orbDeg) {
          if (!best) best = { def, orb };
          else if (def.priority > best.def.priority) best = { def, orb };
          else if (def.priority === best.def.priority && orb < best.orb) best = { def, orb };
        }
      }

      if (best) {
        out.push({
          p1Key: planets[i].key,
          p2Key: planets[j].key,
          kind: best.def.kind,
          orb: best.orb,
          angle,
        });
      }
    }
  }
  return out;
}

export function aspectStyle(aspect: AspectLine): { stroke: string; width: number; opacity: number } {
  // Jerarquía visual real + peso por orbe
  // (sin “paleta chillona”: tono clásico)
  const base = (() => {
    switch (aspect.kind) {
      case "CONJ": return { stroke: "#8a6a00", w: 2.6 }; // conj (dorado sobrio)
      case "OPP":  return { stroke: "#b40000", w: 2.2 }; // rojo sobrio
      case "SQR":  return { stroke: "#b40000", w: 2.0 };
      case "TRI":  return { stroke: "#007a2f", w: 1.8 }; // verde sobrio
      case "SEXT": return { stroke: "#0b4aa6", w: 1.6 }; // azul sobrio
      default:     return { stroke: "#444", w: 1.2 };
    }
  })();

  // Peso: mejor orbe => más grueso + más opaco
  const w = Math.max(1.0, base.w - aspect.orb * 0.12);
  const opacity = Math.min(0.75, Math.max(0.25, 0.65 - aspect.orb * 0.06));
  return { stroke: base.stroke, width: w, opacity };
}

export type SynastryAspect = {
  p1Key: string;
  p2Key: string;
  kind: AspectLine['kind'];
  orb: number;
  angle: number;
};

export function computeSynastryAspects(
  planetsA: PlanetPoint[],
  planetsB: PlanetPoint[],
  luminariaOrb = 8,
  otherOrb = 6
): SynastryAspect[] {
  const aspectDefs: Array<{ kind: SynastryAspect['kind']; exact: number; priority: number }> = [
    { kind: 'CONJ', exact: 0, priority: 5 },
    { kind: 'OPP', exact: 180, priority: 4 },
    { kind: 'SQR', exact: 90, priority: 3 },
    { kind: 'TRI', exact: 120, priority: 2 },
    { kind: 'SEXT', exact: 60, priority: 1 },
  ];

  function isLuminaria(key: string) {
    const k = String(key || '').toLowerCase();
    return k.includes('sun') || k === 'sol' || k.includes('moon') || k === 'luna';
  }

  const out: SynastryAspect[] = [];
  for (let i = 0; i < planetsA.length; i++) {
    for (let j = 0; j < planetsB.length; j++) {
      const a = planetsA[i].degree;
      const b = planetsB[j].degree;
      const angle = shortestAngle(a, b);

      const orbLimit = (isLuminaria(planetsA[i].key) || isLuminaria(planetsB[j].key)) ? luminariaOrb : otherOrb;

      let best: { def: typeof aspectDefs[number]; orb: number } | null = null;
      for (const def of aspectDefs) {
        const orb = Math.abs(angle - def.exact);
        if (orb <= orbLimit) {
          if (!best) best = { def, orb };
          else if (def.priority > best.def.priority) best = { def, orb };
          else if (def.priority === best.def.priority && orb < best.orb) best = { def, orb };
        }
      }

      if (best) {
        out.push({
          p1Key: planetsA[i].key,
          p2Key: planetsB[j].key,
          kind: best.def.kind,
          orb: best.orb,
          angle,
        });
      }
    }
  }

  return out;
}
