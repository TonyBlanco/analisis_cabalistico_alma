/**
 * Pattern Detection Engine
 * 
 * Motor de detección de patrones cruzados entre sistemas simbólicos
 */

import type {
  SymbolicSystem,
  AnySystemReading,
  CrossSystemPattern,
  CabalaReading,
  TarotReading,
  AstrologyReading,
  BioEmotionReading,
  TransgenerationalReading,
} from './types';

// ============================================================================
// THEME MAPPINGS - Correspondencias entre sistemas
// ============================================================================

interface ThemeSignature {
  theme: string;
  displayName: string;
  cabala: string[];
  tarot: string[];
  astrology: string[];
  bioemotions: string[];
  transgenerational: string[];
  insight: string;
  recommendations: string[];
}

const THEME_SIGNATURES: ThemeSignature[] = [
  {
    theme: 'CONTROL_EXCESS',
    displayName: 'Control Excesivo',
    cabala: ['gevurah', 'din', 'rigor', 'contención'],
    tarot: ['emperador', 'justice', 'chariot', 'control', 'autoridad', 'estructura'],
    astrology: ['saturno', 'capricornio', 'tierra_dominante', 'marte'],
    bioemotions: ['hígado', 'ira', 'tensión', 'rigidez', 'mandíbula'],
    transgenerational: ['militar', 'autoritario', 'controlador', 'dictador', 'estricto'],
    insight: 'Cinco lenguajes diferentes, un solo grito del alma: hay un exceso de energía de control que necesita ser equilibrado con receptividad y fluidez.',
    recommendations: [
      'Trabajar el eje Chesed-Gevurah (misericordia-rigor)',
      'Explorar el arquetipo de La Emperatriz como contrapeso',
      'Atender el hígado con prácticas de liberación emocional',
      'Investigar mandatos familiares sobre "tener el control"',
    ],
  },
  {
    theme: 'ABANDONMENT_FEAR',
    displayName: 'Miedo al Abandono',
    cabala: ['chesed', 'yesod', 'dependencia', 'apego'],
    tarot: ['luna', 'star_reversed', 'abandono', 'soledad', 'nueve_espadas'],
    astrology: ['luna', 'cancer', 'agua_exceso', 'neptuno', 'casa_12'],
    bioemotions: ['riñón', 'miedo', 'espalda_baja', 'retención_líquidos'],
    transgenerational: ['abandono', 'huérfano', 'emigración', 'separación', 'ausente'],
    insight: 'Un patrón de miedo al abandono emerge desde múltiples dimensiones. Este miedo puede ser heredado y necesita ser reconocido para ser transformado.',
    recommendations: [
      'Fortalecer Yesod (fundamento personal)',
      'Trabajar con la carta de La Estrella conscientemente',
      'Cuidar los riñones y la energía vital',
      'Explorar historias de separación en el árbol familiar',
    ],
  },
  {
    theme: 'SUPPRESSED_FEMININE',
    displayName: 'Femenino Suprimido',
    cabala: ['binah_débil', 'malkuth_débil', 'receptividad_baja'],
    tarot: ['emperatriz_reversed', 'luna_reversed', 'copas_ausentes', 'masculino_exceso'],
    astrology: ['agua_ausente', 'luna_débil', 'venus_afligida', 'fuego_exceso'],
    bioemotions: ['útero', 'ovarios', 'pechos', 'retención', 'sequedad'],
    transgenerational: ['matriarca_silenciada', 'madre_sumisa', 'abuela_reprimida'],
    insight: 'Hay una desconexión con lo femenino/receptivo que atraviesa varios niveles. El sistema pide integrar la polaridad receptiva.',
    recommendations: [
      'Activar conscientemente Binah y Malkuth',
      'Meditar con La Emperatriz y La Luna',
      'Conectar con el elemento Agua',
      'Honrar el linaje femenino del árbol',
    ],
  },
  {
    theme: 'BLOCKED_EXPRESSION',
    displayName: 'Expresión Bloqueada',
    cabala: ['hod_débil', 'netzach_débil', 'comunicación_bloqueada'],
    tarot: ['hierophant_reversed', 'espadas_conflicto', 'silencio'],
    astrology: ['mercurio_retrógrado', 'géminis_afligido', 'casa_3_vacía'],
    bioemotions: ['garganta', 'tiroides', 'mandíbula', 'tensión_cuello'],
    transgenerational: ['secretos', 'tabú', 'silencio', 'no_hablar', 'vergüenza'],
    insight: 'Hay algo que necesita ser expresado pero encuentra múltiples bloqueos. Los secretos familiares pueden estar manifestándose en el cuerpo.',
    recommendations: [
      'Fortalecer el eje Hod-Netzach',
      'Trabajar la garganta energéticamente',
      'Explorar los secretos familiares con cuidado',
      'Prácticas de expresión segura (escribir, cantar, arte)',
    ],
  },
  {
    theme: 'EXCESSIVE_SACRIFICE',
    displayName: 'Sacrificio Excesivo',
    cabala: ['chesed_exceso', 'tiferet_débil', 'límites_difusos'],
    tarot: ['hanged_man', 'diez_bastos', 'martir', 'carga'],
    astrology: ['neptuno_dominante', 'piscis', 'casa_12', 'virgo_servicio'],
    bioemotions: ['hombros', 'espalda', 'agotamiento', 'sistema_inmune'],
    transgenerational: ['mártir', 'sacrificio', 'cuidador', 'enfermera', 'monja'],
    insight: 'El patrón de sacrificio excesivo por otros está agotando los recursos vitales. Es necesario recuperar el centro propio.',
    recommendations: [
      'Equilibrar Chesed con Gevurah (dar con límites)',
      'Fortalecer Tiferet (centro del ser)',
      'Atender la espalda y los hombros',
      'Investigar roles de "salvadores" en la familia',
    ],
  },
  {
    theme: 'MATERIAL_DISCONNECT',
    displayName: 'Desconexión Material',
    cabala: ['malkuth_débil', 'arraigo_bajo', 'espiritualización_excesiva'],
    tarot: ['oros_ausentes', 'mundo_reversed', 'desencarnado'],
    astrology: ['tierra_ausente', 'urano_neptuno_dominante', 'saturno_débil'],
    bioemotions: ['piernas', 'pies', 'intestinos', 'baja_energía'],
    transgenerational: ['pobreza', 'pérdida_material', 'emigración', 'desposesión'],
    insight: 'Hay una dificultad para encarnar, materializar y estar presente en el mundo físico. Las raíces necesitan ser fortalecidas.',
    recommendations: [
      'Activar conscientemente Malkuth',
      'Trabajar con cartas de Oros/Pentáculos',
      'Conectar con el elemento Tierra',
      'Explorar historias de pérdida material en el linaje',
    ],
  },
  {
    theme: 'TRANSFORMATION_RESISTANCE',
    displayName: 'Resistencia a la Transformación',
    cabala: ['daath_bloqueado', 'gevurah_rígido'],
    tarot: ['death_reversed', 'tower_reversed', 'resistencia', 'estancamiento'],
    astrology: ['plutón_aspecto_difícil', 'escorpio_reprimido', 'casa_8_conflicto'],
    bioemotions: ['intestino_grueso', 'retención', 'estreñimiento', 'toxinas'],
    transgenerational: ['trauma_no_procesado', 'duelos_incompletos', 'secretos_muerte'],
    insight: 'Hay una resistencia profunda a soltar lo viejo para que nazca lo nuevo. Duelos no procesados en el linaje pueden estar bloqueando la transformación.',
    recommendations: [
      'Trabajar con la energía de Da\'at (conocimiento oculto)',
      'Meditar con La Muerte y La Torre conscientemente',
      'Atender el sistema digestivo (soltar)',
      'Completar duelos familiares pendientes',
    ],
  },
  {
    theme: 'HEART_PROTECTION',
    displayName: 'Corazón Protegido/Cerrado',
    cabala: ['tiferet_bloqueado', 'chesed_gevurah_desbalance'],
    tarot: ['copas_reversed', 'corazón_herido', 'tres_espadas'],
    astrology: ['venus_afligida', 'sol_aspecto_saturno', 'leo_reprimido'],
    bioemotions: ['corazón', 'pecho', 'pulmones', 'tristeza', 'opresión'],
    transgenerational: ['desamor', 'traición', 'corazón_roto', 'frialdad'],
    insight: 'El corazón se ha protegido de heridas pasadas, propias y heredadas. Es tiempo de abrirse gradualmente a recibir y dar amor.',
    recommendations: [
      'Sanar Tiferet (centro del corazón)',
      'Equilibrar Chesed y Gevurah',
      'Atender pecho y pulmones (respiración profunda)',
      'Explorar heridas de amor en el árbol familiar',
    ],
  },
];

// ============================================================================
// PATTERN DETECTION FUNCTIONS
// ============================================================================

function extractCabalaIndicators(reading: CabalaReading): string[] {
  const indicators: string[] = [];
  const data = reading.data;
  
  if (data.currentSefira) indicators.push(data.currentSefira.toLowerCase());
  if (data.dominantSefirot) indicators.push(...data.dominantSefirot.map(s => s.toLowerCase()));
  if (data.weakSefirot) indicators.push(...data.weakSefirot.map(s => `${s.toLowerCase()}_débil`));
  if (data.qliphothActive) indicators.push(...data.qliphothActive.map(q => q.toLowerCase()));
  
  // Analyze ausencias/sobrantes
  if (data.ausencias && data.ausencias.length > 0) {
    indicators.push('ausencias_presentes');
  }
  
  return indicators;
}

function extractTarotIndicators(reading: TarotReading): string[] {
  const indicators: string[] = [];
  const data = reading.data;
  
  data.cards.forEach(card => {
    indicators.push(card.name.toLowerCase().replace(/ /g, '_'));
    indicators.push(...card.keywords.map(k => k.toLowerCase()));
    if (card.reversed) indicators.push(`${card.name.toLowerCase()}_reversed`);
    if (card.energy) indicators.push(`${card.energy}_energy`);
    if (card.element) indicators.push(card.element);
  });
  
  if (data.dominantElement) indicators.push(`${data.dominantElement}_dominante`);
  if (data.dominantEnergy) indicators.push(`${data.dominantEnergy}_exceso`);
  if (data.themes) indicators.push(...data.themes.map(t => t.toLowerCase()));
  
  return indicators;
}

function extractAstrologyIndicators(reading: AstrologyReading): string[] {
  const indicators: string[] = [];
  const data = reading.data;
  
  if (data.dominantPlanet) indicators.push(data.dominantPlanet.toLowerCase());
  if (data.dominantElement) indicators.push(`${data.dominantElement}_dominante`);
  if (data.sunSign) indicators.push(data.sunSign.toLowerCase());
  if (data.moonSign) indicators.push(data.moonSign.toLowerCase());
  
  // Element balance analysis
  if (data.elementBalance) {
    const { fire, water, air, earth } = data.elementBalance;
    const total = fire + water + air + earth;
    if (total > 0) {
      if (water / total < 0.1) indicators.push('agua_ausente');
      if (fire / total < 0.1) indicators.push('fuego_ausente');
      if (earth / total < 0.1) indicators.push('tierra_ausente');
      if (air / total < 0.1) indicators.push('aire_ausente');
      if (fire / total > 0.4) indicators.push('fuego_exceso');
      if (water / total > 0.4) indicators.push('agua_exceso');
    }
  }
  
  if (data.themes) indicators.push(...data.themes.map(t => t.toLowerCase()));
  
  return indicators;
}

function extractBioEmotionIndicators(reading: BioEmotionReading): string[] {
  const indicators: string[] = [];
  const data = reading.data;
  
  data.symptoms.forEach(symptom => {
    indicators.push(symptom.organ.toLowerCase());
    indicators.push(symptom.emotion.toLowerCase());
    if (symptom.intensity > 70) {
      indicators.push(`${symptom.organ.toLowerCase()}_alto`);
    }
  });
  
  if (data.dominantEmotion) indicators.push(data.dominantEmotion.toLowerCase());
  if (data.patterns) indicators.push(...data.patterns.map(p => p.toLowerCase()));
  
  return indicators;
}

function extractTransgenerationalIndicators(reading: TransgenerationalReading): string[] {
  const indicators: string[] = [];
  const data = reading.data;
  
  // Extract from paternal line
  data.paternalLine?.forEach(ancestor => {
    ancestor.patterns?.forEach(p => indicators.push(p.toLowerCase()));
    ancestor.traits?.forEach(t => indicators.push(t.toLowerCase()));
    if (ancestor.profession) indicators.push(ancestor.profession.toLowerCase());
  });
  
  // Extract from maternal line
  data.maternalLine?.forEach(ancestor => {
    ancestor.patterns?.forEach(p => indicators.push(p.toLowerCase()));
    ancestor.traits?.forEach(t => indicators.push(t.toLowerCase()));
    if (ancestor.profession) indicators.push(ancestor.profession.toLowerCase());
  });
  
  if (data.inheritedPatterns) {
    indicators.push(...data.inheritedPatterns.map(p => p.toLowerCase()));
  }
  
  if (data.dominantLineage) {
    indicators.push(`${data.dominantLineage}_dominante`);
  }
  
  return indicators;
}

function extractIndicators(reading: AnySystemReading): string[] {
  switch (reading.system) {
    case 'cabala': return extractCabalaIndicators(reading as CabalaReading);
    case 'tarot': return extractTarotIndicators(reading as TarotReading);
    case 'astrology': return extractAstrologyIndicators(reading as AstrologyReading);
    case 'bioemotions': return extractBioEmotionIndicators(reading as BioEmotionReading);
    case 'transgenerational': return extractTransgenerationalIndicators(reading as TransgenerationalReading);
    default: return [];
  }
}

function matchTheme(indicators: string[], themeKeywords: string[]): { matched: boolean; matchedKeywords: string[] } {
  const matchedKeywords = indicators.filter(ind => 
    themeKeywords.some(kw => ind.includes(kw) || kw.includes(ind))
  );
  return {
    matched: matchedKeywords.length > 0,
    matchedKeywords,
  };
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

export function detectCrossSystemPatterns(readings: AnySystemReading[]): CrossSystemPattern[] {
  const patterns: CrossSystemPattern[] = [];
  
  // Extract indicators per system
  const systemIndicators: Map<SymbolicSystem, string[]> = new Map();
  readings.forEach(reading => {
    const indicators = extractIndicators(reading);
    const existing = systemIndicators.get(reading.system) || [];
    systemIndicators.set(reading.system, [...existing, ...indicators]);
  });
  
  // Check each theme signature
  THEME_SIGNATURES.forEach(signature => {
    const evidence: CrossSystemPattern['evidence'] = [];
    const matchingSystems: SymbolicSystem[] = [];
    
    // Check each system
    const systems: SymbolicSystem[] = ['cabala', 'tarot', 'astrology', 'bioemotions', 'transgenerational'];
    
    systems.forEach(system => {
      const indicators = systemIndicators.get(system) || [];
      const themeKeywords = signature[system];
      const { matched, matchedKeywords } = matchTheme(indicators, themeKeywords);
      
      if (matched) {
        matchingSystems.push(system);
        evidence.push({
          system,
          indicator: matchedKeywords.join(', '),
          detail: `Detectado: ${matchedKeywords.slice(0, 3).join(', ')}`,
        });
      }
    });
    
    // Only create pattern if 3+ systems match
    if (matchingSystems.length >= 3) {
      const confidence = matchingSystems.length / systems.length;
      patterns.push({
        id: `pattern_${signature.theme}_${Date.now()}`,
        theme: signature.displayName,
        confidence,
        systems: matchingSystems,
        evidence,
        insight: signature.insight,
        recommendations: signature.recommendations,
      });
    }
  });
  
  // Sort by confidence
  return patterns.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

export { THEME_SIGNATURES };
export type { ThemeSignature };
