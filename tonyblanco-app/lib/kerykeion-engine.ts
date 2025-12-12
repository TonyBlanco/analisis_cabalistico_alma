/**
 * MOTOR DE CÁLCULO: ASTROLOGÍA TÉCNICA (KERYKEION)
 * 
 * Este módulo NO interpreta el alma: construye el mapa exacto para que la conciencia pueda leerlo.
 * 
 * Kerykeion es un sistema de astrología técnica que se enfoca en:
 * - Cálculos matemáticos precisos de posiciones planetarias
 * - Aspectos exactos entre planetas
 * - Casas astrológicas calculadas con precisión
 * - Coordenadas eclípticas y ecuatoriales
 * - Sin interpretación narrativa, solo datos técnicos
 */

import { Body, Observer, Equator, Ecliptic, Horizon } from 'astronomy-engine';

// --- Tipos e Interfaces ---

export interface PlanetPosition {
  planet: string;
  longitude: number;        // Longitud eclíptica (0-360)
  latitude: number;         // Latitud eclíptica (-90 a 90)
  distance: number;         // Distancia en UA
  sign: string;            // Signo zodiacal
  degree: number;          // Grado dentro del signo (0-29.99)
  house?: number;           // Casa astrológica (1-12)
  declination: number;      // Declinación ecuatorial
  rightAscension: number;  // Ascensión recta
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile' | 'quincunx' | 'semisextile';
  angle: number;           // Ángulo exacto entre planetas
  orb: number;             // Orbe (diferencia con el aspecto exacto)
  exact: boolean;          // Si el aspecto es exacto (orb < 1°)
}

export interface HouseCusp {
  house: number;           // 1-12
  longitude: number;       // Longitud eclíptica del cúspide
  sign: string;           // Signo del cúspide
  degree: number;         // Grado dentro del signo
}

export interface SefirotMapping {
  sefira: string;          // ID de la Sefirá (ej: "keter", "tiferet")
  sefiraName: string;      // Nombre en español (ej: "Corona", "Belleza")
  sefiraNumber: number;    // Número de la Sefirá (1-10)
  arcangel?: string;       // Arcángel asociado
  planetName: string;      // Nombre del planeta
}

export interface PathMapping {
  pathNumber: number;      // Número del sendero (11-32)
  pathName: string;        // Nombre del sendero (ej: "Kéter - Jojmá")
  hebrewLetter: string;    // Letra hebrea
  tarotArcana?: number;    // Arcano del Tarot correspondiente
  regent: string;          // Regente (planeta o elemento)
}

// --- Estructura de Entrada (Kerykeion Standard) ---

export interface KerykeionInput {
  birth_date: string;           // "YYYY-MM-DD"
  birth_time: string;            // "HH:MM"
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    timezone: string;
  };
  house_system?: 'placidus' | 'equal' | 'koch' | 'whole_sign' | 'regiomontanus' | 'campanus';
  zodiac_system?: 'tropical' | 'sidereal';
  engine: 'kerykeion';
  engine_version?: string;
}

export interface KerykeionResult {
  // Datos de entrada (estructura estándar)
  input: KerykeionInput;
  
  // Datos de entrada (legacy - para compatibilidad)
  birthData: {
    date: string;          // ISO string
    latitude: number;
    longitude: number;
    timezone: string;
  };
  
  // Posiciones planetarias (técnicas)
  planets: Record<string, PlanetPosition>;
  
  // Casas astrológicas
  houses: HouseCusp[];
  
  // Aspectos calculados
  aspects: Aspect[];
  
  // Puntos especiales
  specialPoints: {
    ascendant: PlanetPosition;    // ASC
    midheaven: PlanetPosition;     // MC
    descendant: PlanetPosition;    // DSC
    imumCoeli: PlanetPosition;     // IC
  };
  
  // Mapeo Cabalístico (TÉCNICO - Sin interpretación)
  cabalisticMapping: {
    planetsToSefirot: Record<string, SefirotMapping>;
    planetsToPaths: Record<string, PathMapping[]>;
    housesToSefirot?: Record<number, SefirotMapping>; // Opcional: casas a Sefirot
  };
  
  // Datos técnicos adicionales
  technical: {
    siderealTime: number;          // Tiempo sidéreo local
    obliquity: number;             // Oblicuidad de la eclíptica
    localMeanTime: number;         // Tiempo medio local
  };
  
  // SVG de la carta (string base64 o SVG directo)
  chartSvg?: string;
}

// --- Constantes ---

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer',
  'Leo', 'Virgo', 'Libra', 'Escorpio',
  'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
  semisextile: 30,
};

// --- Mapeo Planetas a Sefirot (Técnico - Sin Interpretación) ---

const PLANET_TO_SEFIROT: Record<string, SefirotMapping> = {
  'Sun': {
    sefira: 'tiferet',
    sefiraName: 'Belleza',
    sefiraNumber: 6,
    arcangel: 'Rafael',
    planetName: 'Sol'
  },
  'Moon': {
    sefira: 'yesod',
    sefiraName: 'Fundamento',
    sefiraNumber: 9,
    arcangel: 'Gabriel',
    planetName: 'Luna'
  },
  'Mercury': {
    sefira: 'hod',
    sefiraName: 'Gloria',
    sefiraNumber: 8,
    arcangel: 'Miguel',
    planetName: 'Mercurio'
  },
  'Venus': {
    sefira: 'netzach',
    sefiraName: 'Victoria',
    sefiraNumber: 7,
    arcangel: 'Haniel',
    planetName: 'Venus'
  },
  'Mars': {
    sefira: 'gevurah',
    sefiraName: 'Rigor',
    sefiraNumber: 5,
    arcangel: 'Kamael',
    planetName: 'Marte'
  },
  'Jupiter': {
    sefira: 'chesed',
    sefiraName: 'Misericordia',
    sefiraNumber: 4,
    arcangel: 'Tzadkiel',
    planetName: 'Júpiter'
  },
  'Saturn': {
    sefira: 'binah',
    sefiraName: 'Comprensión',
    sefiraNumber: 3,
    arcangel: 'Tzaphkiel',
    planetName: 'Saturno'
  },
  'Uranus': {
    sefira: 'chochmah',
    sefiraName: 'Sabiduría',
    sefiraNumber: 2,
    arcangel: 'Raziel',
    planetName: 'Urano'
  },
  'Neptune': {
    sefira: 'keter',
    sefiraName: 'Corona',
    sefiraNumber: 1,
    arcangel: 'Metatron',
    planetName: 'Neptuno'
  },
  'Pluto': {
    sefira: 'daat',
    sefiraName: 'Conocimiento',
    sefiraNumber: 11,
    arcangel: 'Uriel',
    planetName: 'Plutón'
  }
};

// --- Mapeo Signos a Senderos (Técnico) ---
// Los signos zodiacales se mapean a senderos según su correspondencia tradicional

const SIGN_TO_PATHS: Record<string, PathMapping[]> = {
  'Aries': [
    { pathNumber: 15, pathName: 'Jojmá - Tiféret', hebrewLetter: 'He', tarotArcana: 4, regent: 'Aries' }
  ],
  'Tauro': [
    { pathNumber: 16, pathName: 'Jojmá - Jésed', hebrewLetter: 'Vav', tarotArcana: 5, regent: 'Tauro' }
  ],
  'Géminis': [
    { pathNumber: 17, pathName: 'Biná - Tiféret', hebrewLetter: 'Zayin', tarotArcana: 6, regent: 'Géminis' }
  ],
  'Cáncer': [
    { pathNumber: 18, pathName: 'Biná - Guevurá', hebrewLetter: 'Het', tarotArcana: 7, regent: 'Cáncer' }
  ],
  'Leo': [
    { pathNumber: 19, pathName: 'Jésed - Guevurá', hebrewLetter: 'Tet', tarotArcana: 8, regent: 'Leo' }
  ],
  'Virgo': [
    { pathNumber: 20, pathName: 'Jésed - Tiféret', hebrewLetter: 'Yod', tarotArcana: 9, regent: 'Virgo' }
  ],
  'Libra': [
    { pathNumber: 22, pathName: 'Guevurá - Tiféret', hebrewLetter: 'Lamed', tarotArcana: 11, regent: 'Libra' }
  ],
  'Escorpio': [
    { pathNumber: 24, pathName: 'Tiféret - Nétsaj', hebrewLetter: 'Nun', tarotArcana: 13, regent: 'Escorpio' }
  ],
  'Sagitario': [
    { pathNumber: 25, pathName: 'Tiféret - Yesod', hebrewLetter: 'Samekh', tarotArcana: 14, regent: 'Sagitario' }
  ],
  'Capricornio': [
    { pathNumber: 26, pathName: 'Tiféret - Hod', hebrewLetter: 'Ayin', tarotArcana: 15, regent: 'Capricornio' }
  ],
  'Acuario': [
    { pathNumber: 11, pathName: 'Jésed - Nétsaj', hebrewLetter: 'Kaf', tarotArcana: 10, regent: 'Acuario' }
  ],
  'Piscis': [
    { pathNumber: 23, pathName: 'Guevurá - Hod', hebrewLetter: 'Mem', tarotArcana: 12, regent: 'Piscis' }
  ]
};

// --- Funciones de Utilidad ---

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function getSignFromLongitude(longitude: number): { sign: string; degree: number } {
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: parseFloat(degree.toFixed(2))
  };
}

function calculateAspect(angle1: number, angle2: number): Aspect | null {
  const diff = Math.abs(normalizeAngle(angle1 - angle2));
  const complement = 360 - diff;
  const minDiff = Math.min(diff, complement);
  
  for (const [aspectType, aspectAngle] of Object.entries(ASPECT_ANGLES)) {
    const orb = Math.abs(minDiff - aspectAngle);
    if (orb <= 8) { // Orbe máximo de 8 grados
      return {
        planet1: '', // Se llenará después
        planet2: '',
        type: aspectType as Aspect['type'],
        angle: minDiff,
        orb: parseFloat(orb.toFixed(2)),
        exact: orb < 1
      };
    }
  }
  
  return null;
}

// --- Función Principal de Cálculo ---

export function calculateKerykeionChart(
  input: KerykeionInput
): KerykeionResult {
  // Extraer datos de entrada
  const { birth_date, birth_time, location, house_system = 'placidus', zodiac_system = 'tropical' } = input;
  
  // Construir fecha completa ISO
  const birthDateTime = `${birth_date}T${birth_time}:00`;
  const birthDateObj = new Date(birthDateTime);
  
  // Validar fecha
  if (isNaN(birthDateObj.getTime())) {
    throw new Error('Fecha de nacimiento inválida');
  }
  
  const latitude = location.lat;
  const longitude = location.lng;
  const timezone = location.timezone;
  
  // Crear observador
  const observer = new Observer(latitude, longitude, 0);
  
  // Calcular posiciones planetarias
  const planets: Record<string, PlanetPosition> = {};
  
  const planetMap: Record<string, Body> = {
    'Sun': Body.Sun,
    'Moon': Body.Moon,
    'Mercury': Body.Mercury,
    'Venus': Body.Venus,
    'Mars': Body.Mars,
    'Jupiter': Body.Jupiter,
    'Saturn': Body.Saturn,
    'Uranus': Body.Uranus,
    'Neptune': Body.Neptune,
    'Pluto': Body.Pluto,
  };
  
  for (const [planetName, body] of Object.entries(planetMap)) {
    try {
      // Calcular posición eclíptica
      const ecliptic = Ecliptic(body, birthDateObj, observer);
      
      if (ecliptic && ecliptic.lon !== undefined && ecliptic.lat !== undefined) {
        const longitude = normalizeAngle(ecliptic.lon);
        const { sign, degree } = getSignFromLongitude(longitude);
        
        // Calcular posición ecuatorial
        const equator = Equator(body, birthDateObj, observer, true, true);
        
        planets[planetName] = {
          planet: planetName,
          longitude: parseFloat(longitude.toFixed(4)),
          latitude: parseFloat(ecliptic.lat.toFixed(4)),
          distance: ecliptic.dist || 0,
          sign,
          degree: parseFloat(degree.toFixed(2)),
          declination: equator?.dec ? parseFloat(equator.dec.toFixed(4)) : 0,
          rightAscension: equator?.ra ? parseFloat(equator.ra.toFixed(4)) : 0,
        };
      }
    } catch (error) {
      console.warn(`Error calculando ${planetName}:`, error);
      // Continuar con otros planetas
    }
  }
  
  // Calcular casas astrológicas (método Placidus simplificado)
  // Nota: Para un cálculo completo de casas se necesita una librería especializada
  // Aquí usamos una aproximación basada en el ASC y MC
  const houses: HouseCusp[] = [];
  
  // Calcular ASC y MC
  const horizon = Horizon(birthDateObj, observer, true, true);
  const ascendantLongitude = horizon.ra_uri !== undefined 
    ? normalizeAngle(horizon.ra_uri * 15) // Convertir horas a grados
    : planets.Sun?.longitude || 0;
  
  const { sign: ascSign, degree: ascDegree } = getSignFromLongitude(ascendantLongitude);
  
  // MC aproximado (90 grados desde ASC)
  const mcLongitude = normalizeAngle(ascendantLongitude + 90);
  const { sign: mcSign, degree: mcDegree } = getSignFromLongitude(mcLongitude);
  
  // Crear cúspides de casas (simplificado: casas iguales de 30°)
  for (let i = 1; i <= 12; i++) {
    const houseLongitude = normalizeAngle(ascendantLongitude + (i - 1) * 30);
    const { sign, degree } = getSignFromLongitude(houseLongitude);
    houses.push({
      house: i,
      longitude: parseFloat(houseLongitude.toFixed(4)),
      sign,
      degree: parseFloat(degree.toFixed(2))
    });
  }
  
  // Calcular aspectos entre planetas
  const aspects: Aspect[] = [];
  const planetNames = Object.keys(planets);
  
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      const pos1 = planets[planet1];
      const pos2 = planets[planet2];
      
      if (pos1 && pos2) {
        const aspect = calculateAspect(pos1.longitude, pos2.longitude);
        if (aspect) {
          aspects.push({
            ...aspect,
            planet1,
            planet2
          });
        }
      }
    }
  }
  
  // Ordenar aspectos por orbe (más exactos primero)
  aspects.sort((a, b) => a.orb - b.orb);
  
  // Puntos especiales
  const ascendant: PlanetPosition = {
    planet: 'ASC',
    longitude: parseFloat(ascendantLongitude.toFixed(4)),
    latitude: 0,
    distance: 0,
    sign: ascSign,
    degree: parseFloat(ascDegree.toFixed(2)),
    house: 1,
    declination: 0,
    rightAscension: 0
  };
  
  const midheaven: PlanetPosition = {
    planet: 'MC',
    longitude: parseFloat(mcLongitude.toFixed(4)),
    latitude: 0,
    distance: 0,
    sign: mcSign,
    degree: parseFloat(mcDegree.toFixed(2)),
    house: 10,
    declination: 0,
    rightAscension: 0
  };
  
  const descendant: PlanetPosition = {
    planet: 'DSC',
    longitude: parseFloat(normalizeAngle(ascendantLongitude + 180).toFixed(4)),
    latitude: 0,
    distance: 0,
    sign: getSignFromLongitude(normalizeAngle(ascendantLongitude + 180)).sign,
    degree: parseFloat(getSignFromLongitude(normalizeAngle(ascendantLongitude + 180)).degree.toFixed(2)),
    house: 7,
    declination: 0,
    rightAscension: 0
  };
  
  const imumCoeli: PlanetPosition = {
    planet: 'IC',
    longitude: parseFloat(normalizeAngle(ascendantLongitude + 270).toFixed(4)),
    latitude: 0,
    distance: 0,
    sign: getSignFromLongitude(normalizeAngle(ascendantLongitude + 270)).sign,
    degree: parseFloat(getSignFromLongitude(normalizeAngle(ascendantLongitude + 270)).degree.toFixed(2)),
    house: 4,
    declination: 0,
    rightAscension: 0
  };
  
  // Tiempo sidéreo local (aproximado)
  const hours = birthDateObj.getUTCHours() + birthDateObj.getUTCMinutes() / 60;
  const daysSinceJ2000 = (birthDateObj.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
  const siderealTime = (18.697374558 + 24.06570982441908 * daysSinceJ2000 + hours) % 24;
  
  // --- Mapeo Cabalístico (TÉCNICO - Sin Interpretación) ---
  
  // Mapear planetas a Sefirot
  const planetsToSefirot: Record<string, SefirotMapping> = {};
  for (const [planetName, position] of Object.entries(planets)) {
    const mapping = PLANET_TO_SEFIROT[planetName];
    if (mapping) {
      planetsToSefirot[planetName] = mapping;
    }
  }
  
  // Mapear planetas a Senderos (basado en el signo donde está cada planeta)
  const planetsToPaths: Record<string, PathMapping[]> = {};
  for (const [planetName, position] of Object.entries(planets)) {
    const paths = SIGN_TO_PATHS[position.sign] || [];
    if (paths.length > 0) {
      planetsToPaths[planetName] = paths;
    }
  }
  
  // Generar SVG de la carta (función separada)
  const chartSvg = generateChartSvg(planets, houses, aspects, specialPoints);
  
  // Convertir planetas a formato de salida simplificado
  const planetsOutput: Record<string, PlanetOutput> = {};
  for (const [planetName, position] of Object.entries(planets)) {
    planetsOutput[planetName] = {
      sign: position.sign,
      degree: position.degree
    };
  }
  
  // Convertir casas a formato de salida (indexadas por número como string)
  const housesOutput: Record<string, HouseOutput> = {};
  for (const house of houses) {
    housesOutput[house.house.toString()] = {
      sign: house.sign,
      degree: house.degree
    };
  }
  
  // Convertir aspectos a formato de salida
  const aspectsOutput: AspectOutput[] = aspects.map(aspect => ({
    from: aspect.planet1,
    to: aspect.planet2,
    type: aspect.type,
    orb: aspect.orb
  }));
  
  // Construir mapeo cabalístico simplificado
  const cabalisticMappingOutput: Record<string, CabalisticMappingOutput> = {};
  
  // Mapeo de IDs de Sefirot a nombres estándar
  const SEFIROT_NAME_MAP: Record<string, string> = {
    'keter': 'Keter',
    'chochmah': 'Chochmah',
    'binah': 'Binah',
    'chesed': 'Chesed',
    'gevurah': 'Gevurah',
    'tiferet': 'Tiferet',
    'netzach': 'Netzach',
    'hod': 'Hod',
    'yesod': 'Yesod',
    'malchut': 'Malchut',
    'daat': 'Daat'
  };
  
  for (const [planetName, sefirotMapping] of Object.entries(planetsToSefirot)) {
    const paths = planetsToPaths[planetName] || [];
    const sefiraName = SEFIROT_NAME_MAP[sefirotMapping.sefira] || sefirotMapping.sefiraName;
    cabalisticMappingOutput[planetName] = {
      sefira: sefiraName,
      path: paths.length > 0 ? paths[0].pathNumber : undefined
    };
  }
  
  // Construir resultado con estructura estándar Kerykeion
  const result: KerykeionResult = {
    engine: 'kerykeion',
    engine_version: input.engine_version || '1.0.0',
    planets: planetsOutput,
    houses: housesOutput,
    aspects: aspectsOutput,
    chart_svg: chartSvg,
    cabalistic_mapping: cabalisticMappingOutput,
    technical: {
      siderealTime: parseFloat(siderealTime.toFixed(4)),
      obliquity: 23.4397,
      localMeanTime: hours,
      specialPoints: {
        ascendant: {
          sign: ascendant.sign,
          degree: ascendant.degree
        },
        midheaven: {
          sign: midheaven.sign,
          degree: midheaven.degree
        },
        descendant: {
          sign: descendant.sign,
          degree: descendant.degree
        },
        imumCoeli: {
          sign: imumCoeli.sign,
          degree: imumCoeli.degree
        }
      }
    },
    input: {
      ...input,
      engine: 'kerykeion',
      engine_version: input.engine_version || '1.0.0'
    }
  };
  
  return result;
}

// --- Función de Compatibilidad (Legacy) ---

export function calculateKerykeionChartLegacy(
  birthDate: string,      // ISO string: "YYYY-MM-DDTHH:mm:ss"
  latitude: number,
  longitude: number,
  timezone: string = 'UTC',
  city: string = '',
  country: string = ''
): KerykeionResult {
  // Construir estructura estándar desde parámetros legacy
  const [datePart, timePart] = birthDate.split('T');
  const time = timePart ? timePart.substring(0, 5) : '12:00';
  
  const input: KerykeionInput = {
    birth_date: datePart,
    birth_time: time,
    location: {
      city: city || 'Unknown',
      country: country || 'Unknown',
      lat: latitude,
      lng: longitude,
      timezone: timezone
    },
    house_system: 'placidus',
    zodiac_system: 'tropical',
    engine: 'kerykeion',
    engine_version: '1.0.0'
  };
  
  return calculateKerykeionChart(input);
}

// --- Generación de SVG de la Carta Natal ---

function generateChartSvg(
  planets: Record<string, PlanetPosition>,
  houses: HouseCusp[],
  aspects: Aspect[],
  specialPoints: KerykeionResult['specialPoints']
): string {
  const size = 600;
  const center = size / 2;
  const radius = size / 2 - 50;
  
  // Crear SVG
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="bg-slate-900">`;
  
  // Círculo exterior (360°)
  svg += `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#374151" stroke-width="2"/>`;
  
  // Líneas de casas (cada 30°)
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180; // -90 para empezar en la parte superior
    const x1 = center + radius * Math.cos(angle);
    const y1 = center + radius * Math.sin(angle);
    const x2 = center + (radius - 20) * Math.cos(angle);
    const y2 = center + (radius - 20) * Math.sin(angle);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4B5563" stroke-width="1"/>`;
  }
  
  // Signos del zodíaco (marcadores cada 30°)
  const signNames = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = center + (radius - 30) * Math.cos(angle);
    const y = center + (radius - 30) * Math.sin(angle);
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#9CA3AF" font-size="10" font-family="sans-serif">${signNames[i]}</text>`;
  }
  
  // Dibujar aspectos (líneas entre planetas)
  for (const aspect of aspects.slice(0, 15)) { // Limitar a 15 aspectos más importantes
    const planet1 = planets[aspect.planet1];
    const planet2 = planets[aspect.planet2];
    if (planet1 && planet2) {
      const angle1 = (planet1.longitude - 90) * Math.PI / 180;
      const angle2 = (planet2.longitude - 90) * Math.PI / 180;
      const x1 = center + (radius - 40) * Math.cos(angle1);
      const y1 = center + (radius - 40) * Math.sin(angle1);
      const x2 = center + (radius - 40) * Math.cos(angle2);
      const y2 = center + (radius - 40) * Math.sin(angle2);
      
      const color = aspect.exact ? '#F59E0B' : '#6B7280';
      const strokeWidth = aspect.exact ? 2 : 1;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.6"/>`;
    }
  }
  
  // Dibujar planetas
  const planetColors: Record<string, string> = {
    'Sun': '#FCD34D',
    'Moon': '#E5E7EB',
    'Mercury': '#9CA3AF',
    'Venus': '#FBBF24',
    'Mars': '#EF4444',
    'Jupiter': '#F59E0B',
    'Saturn': '#8B5CF6',
    'Uranus': '#06B6D4',
    'Neptune': '#3B82F6',
    'Pluto': '#6366F1'
  };
  
  for (const [planetName, position] of Object.entries(planets)) {
    const angle = (position.longitude - 90) * Math.PI / 180;
    const x = center + (radius - 40) * Math.cos(angle);
    const y = center + (radius - 40) * Math.sin(angle);
    const color = planetColors[planetName] || '#FFFFFF';
    const radiusPlanet = planetName === 'Sun' || planetName === 'Moon' ? 6 : 4;
    
    svg += `<circle cx="${x}" cy="${y}" r="${radiusPlanet}" fill="${color}" stroke="#1F2937" stroke-width="1"/>`;
    svg += `<text x="${x}" y="${y - 12}" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold">${planetName[0]}</text>`;
  }
  
  // Dibujar ASC y MC
  const ascAngle = (specialPoints.ascendant.longitude - 90) * Math.PI / 180;
  const ascX = center + radius * Math.cos(ascAngle);
  const ascY = center + radius * Math.sin(ascAngle);
  svg += `<line x1="${center}" y1="${center}" x2="${ascX}" y2="${ascY}" stroke="#10B981" stroke-width="2"/>`;
  svg += `<text x="${ascX + 10}" y="${ascY}" fill="#10B981" font-size="10" font-weight="bold">ASC</text>`;
  
  const mcAngle = (specialPoints.midheaven.longitude - 90) * Math.PI / 180;
  const mcX = center + radius * Math.cos(mcAngle);
  const mcY = center + radius * Math.sin(mcAngle);
  svg += `<line x1="${center}" y1="${center}" x2="${mcX}" y2="${mcY}" stroke="#8B5CF6" stroke-width="2"/>`;
  svg += `<text x="${mcX + 10}" y="${mcY}" fill="#8B5CF6" font-size="10" font-weight="bold">MC</text>`;
  
  svg += `</svg>`;
  
  return svg;
}

// --- Función de Validación ---

export function validateKerykeionInput(
  input: KerykeionInput | { birthDate: string; latitude: number; longitude: number; timezone?: string }
): { valid: boolean; error?: string } {
  // Validar estructura estándar
  if ('birth_date' in input) {
    const kerykeionInput = input as KerykeionInput;
    
    if (!kerykeionInput.birth_date) {
      return { valid: false, error: 'La fecha de nacimiento es requerida' };
    }
    
    if (!kerykeionInput.birth_time) {
      return { valid: false, error: 'La hora de nacimiento es requerida' };
    }
    
    const date = new Date(`${kerykeionInput.birth_date}T${kerykeionInput.birth_time}:00`);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'La fecha y hora de nacimiento no son válidas' };
    }
    
    if (!kerykeionInput.location) {
      return { valid: false, error: 'La ubicación es requerida' };
    }
    
    const { lat, lng } = kerykeionInput.location;
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { valid: false, error: 'La latitud debe estar entre -90 y 90' };
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { valid: false, error: 'La longitud debe estar entre -180 y 180' };
    }
    
    // Validar sistemas
    const validHouseSystems = ['placidus', 'equal', 'koch', 'whole_sign', 'regiomontanus', 'campanus'];
    if (kerykeionInput.house_system && !validHouseSystems.includes(kerykeionInput.house_system)) {
      return { valid: false, error: `Sistema de casas inválido. Debe ser uno de: ${validHouseSystems.join(', ')}` };
    }
    
    const validZodiacSystems = ['tropical', 'sidereal'];
    if (kerykeionInput.zodiac_system && !validZodiacSystems.includes(kerykeionInput.zodiac_system)) {
      return { valid: false, error: `Sistema zodiacal inválido. Debe ser uno de: ${validZodiacSystems.join(', ')}` };
    }
    
    return { valid: true };
  }
  
  // Validar estructura legacy
  const legacyInput = input as { birthDate: string; latitude: number; longitude: number; timezone?: string };
  
  if (!legacyInput.birthDate) {
    return { valid: false, error: 'La fecha de nacimiento es requerida' };
  }
  
  const date = new Date(legacyInput.birthDate);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'La fecha de nacimiento no es válida' };
  }
  
  if (isNaN(legacyInput.latitude) || legacyInput.latitude < -90 || legacyInput.latitude > 90) {
    return { valid: false, error: 'La latitud debe estar entre -90 y 90' };
  }
  
  if (isNaN(legacyInput.longitude) || legacyInput.longitude < -180 || legacyInput.longitude > 180) {
    return { valid: false, error: 'La longitud debe estar entre -180 y 180' };
  }
  
  return { valid: true };
}

