import type { PlanetPoint, HouseCusps } from "./astro-geometry";

const PLANET_GLYPHS: Record<string,string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', northnode: '☊', southnode: '☋'
};

const ZODIAC_GLYPHS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

function normalizeName(n:any){ if(!n) return String(n ?? '').toLowerCase(); return String(n).toLowerCase().trim(); }
function toNumber(v:any){ const n = Number(v); return Number.isFinite(n) ? n : NaN; }

export type WheelNormalized = {
  ascendantDeg: number | null;
  houses: HouseCusps;
  planets: PlanetPoint[];
  asteroids?: PlanetPoint[];
  angles?: { asc?: number; mc?: number; dsc?: number; ic?: number } | null;
};

export function normalizeNatalForWheel(natal:any): WheelNormalized {
  if (!natal) return { ascendantDeg: null, houses: [], planets: [], angles: null };

  // Houses
  let housesRaw: any[] = [];
  if (Array.isArray(natal.casas) && natal.casas.length >= 12) housesRaw = natal.casas;
  else if (Array.isArray(natal.houses) && natal.houses.length >= 12) housesRaw = natal.houses;
  else if (Array.isArray(natal.cusps) && natal.cusps.length >= 12) housesRaw = natal.cusps;

  const houses: HouseCusps = housesRaw.map((h:any) => {
    if (typeof h === 'number') return normalizeDeg(h);
    return normalizeDeg(toNumber(h.cuspide_longitud ?? h.cuspide_lon ?? h.cusp ?? h.longitud ?? h.lon ?? h));
  }).slice(0,12);

  // Angles / Ascendant
  const inputSnap = natal.metadatos?.input_snapshot ?? natal.input_snapshot ?? natal.angles ?? null;
  const ascFromSnap = inputSnap ? (toNumber(inputSnap.ascLongitude ?? inputSnap.asc_lon ?? inputSnap.asc ?? inputSnap.ascendant ?? inputSnap.ascendente) ) : NaN;
  const mcFromSnap = inputSnap ? (toNumber(inputSnap.mcLongitude ?? inputSnap.mc_lon ?? inputSnap.mc ?? inputSnap.mc_longitude) ) : NaN;

  const ascendantDeg = Number.isFinite(ascFromSnap) ? normalizeDeg(ascFromSnap) : (houses.length===12 ? normalizeDeg(houses[0]) : null);

  const angles = (Number.isFinite(ascFromSnap) || Number.isFinite(mcFromSnap)) ? {
    asc: Number.isFinite(ascFromSnap) ? normalizeDeg(ascFromSnap) : undefined,
    mc: Number.isFinite(mcFromSnap) ? normalizeDeg(mcFromSnap) : undefined,
    dsc: Number.isFinite(ascFromSnap) ? normalizeDeg((ascFromSnap + 180) % 360) : undefined,
    ic: Number.isFinite(mcFromSnap) ? normalizeDeg((mcFromSnap + 180) % 360) : undefined,
  } : null;

  // Planets
  const planetsRaw: any[] = Array.isArray(natal.planetas) ? natal.planetas : (Array.isArray(natal.planets) ? natal.planets : []);

  const planets: PlanetPoint[] = planetsRaw.map((p:any) => {
    const name = normalizeName(p.nombre ?? p.name ?? p.key ?? p.id);
    const lon = toNumber(p.longitud_ecliptica ?? p.longitud ?? p.lon ?? p.longitude ?? p.lon_ecl ?? p.lon_ecliptica ?? p.long ?? p.longitud_ecl);
    const lonValid = Number.isFinite(lon) ? normalizeDeg(lon) : NaN;

    // label: prefer provided label, else compute as degrees+glyph
    let label = p.label || p.etiqueta || null;
    if (!label && Number.isFinite(lonValid)) {
      const degInside = Math.floor(lonValid % 30);
      const signIndex = Math.floor(lonValid / 30) % 12;
      label = `${degInside}° ${ZODIAC_GLYPHS[signIndex]}`;
    }

    return {
      key: name || String(p.nombre ?? p.name ?? 'p').toLowerCase(),
      glyph: PLANET_GLYPHS[name] || String(p.glyph || p.simbolo || (PLANET_GLYPHS[name])) || (String(p.nombre || p.name || '').charAt(0) || '?'),
      degree: Number.isFinite(lonValid) ? lonValid : 0,
      label: label || undefined,
    } as PlanetPoint;
  }).filter(Boolean);

  // Asteroids: look for explicit arrays or deduplicate from planets list
  const asteroidNames = ['ceres','pallas','juno','vesta'];
  let asteroidsRaw: any[] = Array.isArray(natal.asteroides) ? natal.asteroides : (Array.isArray(natal.asteroids) ? natal.asteroids : []);

  if (!asteroidsRaw.length) {
    // attempt to find asteroids among planet list
    asteroidsRaw = (planetsRaw || []).filter((p:any) => {
      const n = normalizeName(p.nombre ?? p.name ?? p.key ?? p.id);
      return asteroidNames.includes(n);
    });
  }

  const asteroids: PlanetPoint[] = asteroidsRaw.map((p:any) => {
    const name = normalizeName(p.nombre ?? p.name ?? p.key ?? p.id);
    const lon = toNumber(p.longitud_ecliptica ?? p.longitud ?? p.lon ?? p.longitude ?? p.long ?? p.longitud_ecl);
    const lonValid = Number.isFinite(lon) ? normalizeDeg(lon) : NaN;
    const glyph = ({ ceres: '⚳', pallas: '⚴', juno: '⚵', vesta: '⚶' } as Record<string,string>)[name] || '◦';
    return { key: name, glyph, degree: Number.isFinite(lonValid) ? lonValid : 0, label: undefined } as PlanetPoint;
  }).filter(Boolean);

  return { ascendantDeg: ascendantDeg === null ? null : ascendantDeg, houses, planets, asteroids, angles };
}

function normalizeDeg(d:number){ const x = d % 360; return x < 0 ? x + 360 : x; }
