import type { AdvancedChartInput } from '../chart/chartTypes';

export type PsychProfile = {
  dominantArchetypes: Array<{ planet: string; reason: string; weight: number }>;
  shadowConflicts: Array<{ pattern: string; evidence: string[]; weight: number }>;
  individuationKeys: Array<{ theme: string; evidence: string[] }>;
  relationshipThemes: Array<{ theme: string; evidence: string[] }>;
  vocationThemes: Array<{ theme: string; evidence: string[] }>;
  sevenSinsArchetypes: Array<{ archetype: string; evidence: string[] }>;
  notes: string[];
};

// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA AVANZADO DE PESOS ARQUETIPOS (Hermético-Junguiano)
// ═══════════════════════════════════════════════════════════════════════════

// Dignidades Esenciales (Tradición Ptolemaica-Hermética)
const DIGNITIES: Record<string, { domicile: string[]; exaltation: string[]; detriment: string[]; fall: string[] }> = {
  sun: { domicile: ['leo'], exaltation: ['aries'], detriment: ['aquarius'], fall: ['libra'] },
  moon: { domicile: ['cancer'], exaltation: ['taurus'], detriment: ['capricorn'], fall: ['scorpio'] },
  mercury: { domicile: ['gemini', 'virgo'], exaltation: ['virgo'], detriment: ['sagittarius', 'pisces'], fall: ['pisces'] },
  venus: { domicile: ['taurus', 'libra'], exaltation: ['pisces'], detriment: ['scorpio', 'aries'], fall: ['virgo'] },
  mars: { domicile: ['aries', 'scorpio'], exaltation: ['capricorn'], detriment: ['libra', 'taurus'], fall: ['cancer'] },
  jupiter: { domicile: ['sagittarius', 'pisces'], exaltation: ['cancer'], detriment: ['gemini', 'virgo'], fall: ['capricorn'] },
  saturn: { domicile: ['capricorn', 'aquarius'], exaltation: ['libra'], detriment: ['cancer', 'leo'], fall: ['aries'] },
  uranus: { domicile: ['aquarius'], exaltation: ['scorpio'], detriment: ['leo'], fall: ['taurus'] },
  neptune: { domicile: ['pisces'], exaltation: ['cancer'], detriment: ['virgo'], fall: ['capricorn'] },
  pluto: { domicile: ['scorpio'], exaltation: ['leo'], detriment: ['taurus'], fall: ['aquarius'] },
};

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

function signFromLongitude(lon: number): string {
  const normalized = ((lon % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(normalized / 30)] ?? '';
}

// Regencias por signo (para calcular dispositor y recepciones mutuas)
const RULERS: Record<string, string> = {
  aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon',
  leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'pluto',
  sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'uranus', pisces: 'neptune'
};

// Elementos (para análisis de temperamento)
const ELEMENTS: Record<string, string> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water'
};

// Modalidades (para análisis de dinamismo psíquico)
const MODALITIES: Record<string, string> = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable'
};

/**
 * Calcula dignidad esencial de un planeta en un signo
 * @returns Puntos: +5 domicilio, +4 exaltación, -2 destierro, -3 caída, 0 peregrino
 */
function getEssentialDignity(planet: string, sign: string): { points: number; reason: string } {
  const p = planet.toLowerCase();
  const s = sign.toLowerCase();
  const dig = DIGNITIES[p];
  
  if (!dig) return { points: 0, reason: 'peregrino' };
  
  if (dig.domicile.includes(s)) return { points: 5, reason: 'domicilio' };
  if (dig.exaltation.includes(s)) return { points: 4, reason: 'exaltación' };
  if (dig.detriment.includes(s)) return { points: -2, reason: 'destierro' };
  if (dig.fall.includes(s)) return { points: -3, reason: 'caída' };
  
  return { points: 0, reason: 'peregrino' };
}

/**
 * Calcula peso de aspectos ponderado por orbe
 * Orbe < 1° = fuerte, 1-3° = medio, >3° = débil
 */
function getAspectWeight(aspectType: string, orb: number): number {
  const baseWeights: Record<string, number> = {
    conjunction: 5,
    opposition: 4,
    trine: 4,
    square: 4,
    sextile: 3,
    quintile: 2,
    semisquare: 2,
    sesquiquadrate: 2,
    quincunx: 2,
  };
  
  const base = baseWeights[aspectType.toLowerCase()] || 1;
  
  // Multiplicador por precisión de orbe
  if (orb < 1) return base * 1.5;
  if (orb < 3) return base * 1.0;
  return base * 0.5;
}

// Deterministic symbolic engine: no invented text, only derives from chart structures
export function buildPsychProfile(input: AdvancedChartInput): PsychProfile {
  const planets = input.planets;
  const aspects = input.aspects;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 1: CALCULAR PESOS ARQUETÍPICOS AVANZADOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const archetypeWeights: Record<string, { score: number; reasons: string[] }> = {};
  
  planets.forEach(p => {
    const planet = p.key.toLowerCase();
    archetypeWeights[planet] = { score: 0, reasons: [] };
    
    // 1. DIGNIDAD ESENCIAL (+5 a -3 puntos)
    const dignity = getEssentialDignity(planet, p.sign);
    archetypeWeights[planet].score += dignity.points;
    if (dignity.points !== 0) {
      archetypeWeights[planet].reasons.push(`${dignity.reason} (${dignity.points > 0 ? '+' : ''}${dignity.points})`);
    }
    
    // 2. POSICIÓN POR CASA (Angular > Sucedente > Cadente)
    // Angular (1,4,7,10): +5 | Sucedente (2,5,8,11): +3 | Cadente (3,6,9,12): +1
    const house = p.house;
    if ([1, 4, 7, 10].includes(house)) {
      archetypeWeights[planet].score += 5;
      archetypeWeights[planet].reasons.push(`angular casa ${house} (+5)`);
    } else if ([2, 5, 8, 11].includes(house)) {
      archetypeWeights[planet].score += 3;
      archetypeWeights[planet].reasons.push(`sucedente casa ${house} (+3)`);
    } else {
      archetypeWeights[planet].score += 1;
      archetypeWeights[planet].reasons.push(`cadente casa ${house} (+1)`);
    }
    
    // 3. LUMINARIAS: Multiplicador x1.3 (Sol/Luna son centrales en psique)
    if (planet === 'sun' || planet === 'moon') {
      archetypeWeights[planet].score *= 1.3;
      archetypeWeights[planet].reasons.push('luminar x1.3');
    }
  });
  
  // 4. ASPECTOS PONDERADOS POR ORBE Y TIPO
  const aspectCounts: Record<string, number> = {};
  aspects.forEach(a => {
    const weight = getAspectWeight(a.type, a.orb || 0);
    const planetA = a.a.toLowerCase();
    const planetB = a.b.toLowerCase();
    
    aspectCounts[planetA] = (aspectCounts[planetA] || 0) + 1;
    aspectCounts[planetB] = (aspectCounts[planetB] || 0) + 1;
    
    if (archetypeWeights[planetA]) {
      archetypeWeights[planetA].score += weight;
    }
    if (archetypeWeights[planetB]) {
      archetypeWeights[planetB].score += weight;
    }
  });
  
  // Agregar razones de aspectos
  Object.keys(aspectCounts).forEach(planet => {
    if (archetypeWeights[planet]) {
      archetypeWeights[planet].reasons.push(`${aspectCounts[planet]} aspectos`);
    }
  });
  
  // 5. REGENTE DEL ASCENDENTE: +6 puntos (identidad primaria)
  const ascLon = input.angles?.ascLon ?? input.houses[0]?.cuspLon;
  const ascSign = ascLon != null ? signFromLongitude(ascLon) : undefined;
  if (ascSign) {
    const ascRuler = RULERS[ascSign];
    if (ascRuler && archetypeWeights[ascRuler]) {
      archetypeWeights[ascRuler].score += 6;
      archetypeWeights[ascRuler].reasons.push('regente ASC (+6)');
    }
  }
  
  // 6. DISPOSITOR DE LA LUNA: +3 puntos (regente del signo donde está la Luna)
  const moonPlanet = planets.find(p => p.key.toLowerCase() === 'moon');
  if (moonPlanet) {
    const moonSign = moonPlanet.sign.toLowerCase();
    const moonDispositor = RULERS[moonSign];
    if (moonDispositor && archetypeWeights[moonDispositor]) {
      archetypeWeights[moonDispositor].score += 3;
      archetypeWeights[moonDispositor].reasons.push('dispositor Luna (+3)');
    }
  }
  
  // 7. RECEPCIONES MUTUAS: +4 puntos (lazos arquetípicos fuertes)
  // Ejemplo: Venus en Aries y Marte en Libra = recepción mutua
  planets.forEach(p1 => {
    planets.forEach(p2 => {
      if (p1.key === p2.key) return;
      const p1Name = p1.key.toLowerCase();
      const p2Name = p2.key.toLowerCase();
      const p1Sign = p1.sign.toLowerCase();
      const p2Sign = p2.sign.toLowerCase();
      
      // Si p1 está en domicilio de p2 Y p2 está en domicilio de p1
      if (RULERS[p1Sign] === p2Name && RULERS[p2Sign] === p1Name) {
        if (archetypeWeights[p1Name] && !archetypeWeights[p1Name].reasons.includes('recepción mutua (+4)')) {
          archetypeWeights[p1Name].score += 4;
          archetypeWeights[p1Name].reasons.push('recepción mutua (+4)');
        }
      }
    });
  });
  
  // Generar lista de arquetipos dominantes (Top 7 para profundidad)
  const dominantArchetypes = Object.entries(archetypeWeights)
    .map(([planet, data]) => ({
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      reason: data.reasons.join(' · '),
      weight: Math.round(data.score * 10) / 10 // Redondear a 1 decimal
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 7);

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: CONFLICTOS DE SOMBRA (Aspectos tensos ponderados)
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: CONFLICTOS DE SOMBRA (Aspectos tensos ponderados)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const shadow = aspects
    .filter(a => ['square', 'opposition', 'quincunx'].includes(a.type))
    .map(a => {
      const weight = getAspectWeight(a.type, a.orb || 0);
      const evidence = [`${a.type} (orbe ${(a.orb || 0).toFixed(1)}°)`];
      
      // Priorizar conflictos con luminarias
      const involvesLuminary = ['sun', 'moon'].includes(a.a.toLowerCase()) || ['sun', 'moon'].includes(a.b.toLowerCase());
      const finalWeight = involvesLuminary ? weight * 1.5 : weight;
      
      return {
        pattern: `${a.a}–${a.b} ${a.type}`,
        evidence,
        weight: Math.round(finalWeight * 10) / 10
      };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8); // Top 8 conflictos

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 3: CLAVES DE INDIVIDUACIÓN (Aspectos armónicos)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const individ = aspects
    .filter(a => ['trine', 'sextile'].includes(a.type))
    .map(a => ({
      theme: `${a.a}↔${a.b} ${a.type}`,
      evidence: [`orbe ${(a.orb || 0).toFixed(1)}°`]
    }))
    .slice(0, 8); // Top 8 recursos

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 4: LOS SIETE PECADOS (Arquetipos de intensidad)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const sins: Array<{ archetype: string; evidence: string[] }> = [];
  
  // Ira (Marte): Aspectos tensos >3 o en signos de fuego angular
  const mars = planets.find(p => p.key.toLowerCase() === 'mars');
  const marsAspectsTense = aspects.filter(a => 
    (a.a.toLowerCase() === 'mars' || a.b.toLowerCase() === 'mars') && 
    ['square', 'opposition'].includes(a.type)
  ).length;
  if (mars && (marsAspectsTense >= 3 || ([1, 4, 7, 10].includes(mars.house) && ELEMENTS[mars.sign.toLowerCase()] === 'fire'))) {
    sins.push({ archetype: 'Ira', evidence: [`Marte: ${marsAspectsTense} aspectos tensos, casa ${mars.house}`] });
  }
  
  // Orgullo (Sol): Sol en casa 1, 5 o 10 con dignidad
  const sun = planets.find(p => p.key.toLowerCase() === 'sun');
  if (sun && ([1, 5, 10].includes(sun.house) || getEssentialDignity('sun', sun.sign).points > 3)) {
    sins.push({ archetype: 'Orgullo', evidence: [`Sol casa ${sun.house}, ${getEssentialDignity('sun', sun.sign).reason}`] });
  }
  
  // Lujuria (Venus/Marte): Aspectos entre Venus-Marte o Venus en Escorpio/Aries
  const venus = planets.find(p => p.key.toLowerCase() === 'venus');
  const venusMarsCon = aspects.some(a => 
    (a.a.toLowerCase() === 'venus' && a.b.toLowerCase() === 'mars') ||
    (a.a.toLowerCase() === 'mars' && a.b.toLowerCase() === 'venus')
  );
  if (venus && (venusMarsCon || ['scorpio', 'aries'].includes(venus.sign.toLowerCase()))) {
    sins.push({ archetype: 'Lujuria', evidence: [`Venus en ${venus.sign}, aspectos Venus-Marte: ${venusMarsCon}`] });
  }
  
  // Pereza (Neptuno): Neptuno angular o aspectos con Luna
  const neptune = planets.find(p => p.key.toLowerCase() === 'neptune');
  if (neptune && [1, 4, 7, 10].includes(neptune.house)) {
    sins.push({ archetype: 'Pereza/Evasión', evidence: [`Neptuno angular casa ${neptune.house}`] });
  }
  
  // Gula (Júpiter): Júpiter aspectos >4 o en signos de expansión
  const jupiter = planets.find(p => p.key.toLowerCase() === 'jupiter');
  const jupiterAspects = aspects.filter(a => a.a.toLowerCase() === 'jupiter' || a.b.toLowerCase() === 'jupiter').length;
  if (jupiter && (jupiterAspects >= 4 || ['sagittarius', 'pisces'].includes(jupiter.sign.toLowerCase()))) {
    sins.push({ archetype: 'Gula/Exceso', evidence: [`Júpiter: ${jupiterAspects} aspectos, signo ${jupiter.sign}`] });
  }
  
  // Envidia (Saturno/Plutón tensos)
  const saturn = planets.find(p => p.key.toLowerCase() === 'saturn');
  const saturnTense = aspects.filter(a => 
    (a.a.toLowerCase() === 'saturn' || a.b.toLowerCase() === 'saturn') && 
    ['square', 'opposition'].includes(a.type)
  ).length;
  if (saturn && saturnTense >= 2) {
    sins.push({ archetype: 'Envidia/Carencia', evidence: [`Saturno: ${saturnTense} aspectos tensos`] });
  }
  
  // Avaricia (Saturno en casa 2/8 o con Venus)
  if (saturn && [2, 8].includes(saturn.house)) {
    sins.push({ archetype: 'Avaricia/Control', evidence: [`Saturno casa ${saturn.house}`] });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANÁLISIS COMPLEMENTARIO (Relaciones y Vocación)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const relationshipThemes: Array<{ theme: string; evidence: string[] }> = [];
  const vocationThemes: Array<{ theme: string; evidence: string[] }> = [];
  
  // Temas de relación: Planetas en casa 7
  const house7Planets = planets.filter(p => p.house === 7);
  house7Planets.forEach(p => {
    relationshipThemes.push({
      theme: `${p.key} en Casa 7`,
      evidence: [`Búsqueda de ${p.key.toLowerCase()} en el otro`]
    });
  });
  
  // Temas vocacionales: Planetas en casa 10 y regente de MC
  const house10Planets = planets.filter(p => p.house === 10);
  house10Planets.forEach(p => {
    vocationThemes.push({
      theme: `${p.key} en Casa 10`,
      evidence: [`Expresión profesional de ${p.key.toLowerCase()}`]
    });
  });

  return {
    dominantArchetypes,
    shadowConflicts: shadow,
    individuationKeys: individ,
    relationshipThemes,
    vocationThemes,
    sevenSinsArchetypes: sins,
    notes: [
      'Sistema avanzado: dignidades esenciales + aspectos ponderados + recepciones mutuas',
      'Pesos basados en tradición hermética y psicología junguiana',
      'Lectura simbólica y orientativa — no clínica.'
    ]
  };
}
