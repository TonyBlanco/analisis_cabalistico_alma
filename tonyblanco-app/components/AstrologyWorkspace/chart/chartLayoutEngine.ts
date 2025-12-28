import type { AdvancedChartInput, ChartPlanet } from './chartTypes';
import type { NatalChartPayload } from '@/hooks/useNatalChart';

// Basic glyph maps (Unicode as fallback)
const PLANET_GLYPHS: Record<string,string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', nodal: '☊'
};

const SIGN_GLYPHS: Record<string,string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
};

function normalizePlanetName(n:any): string {
  if (!n) return String(n ?? '').toLowerCase();
  return String(n).toLowerCase().trim();
}

export function lonToDeg(lon:number) {
  const normalized = ((lon % 360) + 360) % 360;
  return normalized;
}

export function lonToSector(lon:number) {
  const deg = lonToDeg(lon);
  return Math.floor(deg / 30); // 0..11
}

// simple polar conversion for viewBox 1000x1000, center (500,500)
export function polarToXY(angleDeg:number, radius:number, cx=500, cy=500) {
  const rad = (angleDeg - 90) * (Math.PI/180);
  const x = cx + Math.cos(rad) * radius;
  const y = cy + Math.sin(rad) * radius;
  return { x, y };
}

// Build AdvancedChartInput from backend payload
export function buildAdvancedInputFromPayload(payload: NatalChartPayload | null): AdvancedChartInput | null {
  if (!payload) return null;
  const planets = (payload.planetas || []).map((p:any) => {
    const name = normalizePlanetName(p.nombre);
    const lon = Number(p.longitud_ecliptica ?? p.longitud ?? p.lon ?? 0);
    const degRaw = ((lon % 30) + 30) % 30;
    const deg = Math.floor(degRaw);
    const min = Math.round((degRaw - deg) * 60);
    return {
      key: name,
      glyph: PLANET_GLYPHS[name] || String(p.nombre).charAt(0),
      lon: lon,
      sign: p.signo || p.sign || ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][lonToSector(lon)] || '',
      signGlyph: SIGN_GLYPHS[String(p.signo).toLowerCase()] || SIGN_GLYPHS[['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'][lonToSector(lon)]] || '',
      deg: Number((degRaw)),
      min: min,
      house: Number(p.casa ?? p.house ?? p.house_number ?? 0) || 0,
      retro: Boolean(p.es_retrogrado || p.retro || p.retrogrado),
    } as ChartPlanet;
  });

  const houses = (payload.casas || []).map((h:any) => ({ number: Number(h.numero ?? h.number ?? 0), cuspLon: Number(h.cuspide_longitud ?? h.cuspide_lon ?? h.cusp ?? 0) }));

  const aspects = (payload.aspectos || []).map((a:any) => ({ a: normalizePlanetName(a.planeta1 || a.a), b: normalizePlanetName(a.planeta2 || a.b), type: String(a.tipo || a.type || '').toLowerCase() as any, orb: Number(a.orbe ?? a.orb ?? 0), exact: Boolean(a.exact) }));

  const inputSnap = payload.metadatos?.input_snapshot ?? null;
  const angles = inputSnap ? {
    ascLon: Number(inputSnap.ascLongitude ?? inputSnap.asc_lon ?? 0),
    mcLon: Number(inputSnap.mcLongitude ?? inputSnap.mc_lon ?? 0),
    dscLon: Number(((inputSnap.ascLongitude ?? inputSnap.asc_lon ?? 0) + 180) % 360),
    icLon: Number(((inputSnap.mcLongitude ?? inputSnap.mc_lon ?? 0) + 180) % 360),
  } : null;

  return {
    planets,
    houses,
    aspects,
    angles,
    zodiacType: payload.metadatos?.zodiac_type ?? 'tropical',
    houseSystem: payload.metadatos?.sistema_casas ?? 'placidus',
  };
}

// Layout planets: avoid collisions by radial stacking when degrees within threshold
export function layoutPlanets(planets: ChartPlanet[], baseRadius=360, minSeparationDeg=6) {
  // produce positions with increased radius if close
  const placed: Array<{ planet: ChartPlanet; radius:number; angle:number; x:number; y:number }> = [];

  planets.forEach((pl) => {
    const angle = lonToDeg(pl.lon);
    // count how many already placed within minSeparationDeg
    const closeCount = placed.filter(p => Math.abs(((p.planet.lon - pl.lon + 540) % 360) - 180) < minSeparationDeg).length;
    const radius = baseRadius + closeCount * 18; // nudge outward by 18px per collision
    const { x, y } = polarToXY(angle, radius);
    placed.push({ planet: pl, radius, angle, x, y });
  });

  return placed;
}
