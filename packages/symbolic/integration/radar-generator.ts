/**
 * Radar Visualization Data Generator
 * 
 * Genera datos para visualización radar multi-capa
 * integrando todos los sistemas simbólicos
 */

import type { RadarLayer, AnySystemReading, SymbolicSystem } from './types';

// ============================================================================
// RADAR DIMENSIONS PER SYSTEM
// ============================================================================

const CABALA_DIMENSIONS = [
  { key: 'keter', label: 'Keter', tooltip: 'Corona - Voluntad Superior' },
  { key: 'chokmah', label: 'Chokmah', tooltip: 'Sabiduría - Masculino' },
  { key: 'binah', label: 'Binah', tooltip: 'Entendimiento - Femenino' },
  { key: 'chesed', label: 'Chesed', tooltip: 'Misericordia - Expansión' },
  { key: 'gevurah', label: 'Gevurah', tooltip: 'Rigor - Contención' },
  { key: 'tiferet', label: 'Tiferet', tooltip: 'Belleza - Centro' },
  { key: 'netzach', label: 'Netzach', tooltip: 'Victoria - Emociones' },
  { key: 'hod', label: 'Hod', tooltip: 'Gloria - Intelecto' },
  { key: 'yesod', label: 'Yesod', tooltip: 'Fundamento - Identidad' },
  { key: 'malkuth', label: 'Malkuth', tooltip: 'Reino - Material' },
];

const BIOEMOTION_DIMENSIONS = [
  { key: 'heart', label: 'Corazón', emotion: 'Alegría/Tristeza' },
  { key: 'liver', label: 'Hígado', emotion: 'Ira' },
  { key: 'kidney', label: 'Riñón', emotion: 'Miedo' },
  { key: 'lung', label: 'Pulmón', emotion: 'Tristeza/Duelo' },
  { key: 'stomach', label: 'Estómago', emotion: 'Preocupación' },
  { key: 'intestine', label: 'Intestino', emotion: 'Soltar/Retener' },
  { key: 'throat', label: 'Garganta', emotion: 'Expresión' },
  { key: 'back', label: 'Espalda', emotion: 'Carga/Soporte' },
];

const TAROT_DIMENSIONS = [
  { key: 'fire', label: 'Fuego', suits: ['bastos', 'wands'] },
  { key: 'water', label: 'Agua', suits: ['copas', 'cups'] },
  { key: 'air', label: 'Aire', suits: ['espadas', 'swords'] },
  { key: 'earth', label: 'Tierra', suits: ['oros', 'pentacles'] },
  { key: 'masculine', label: 'Masculino', cards: ['emperor', 'magician', 'sun', 'chariot'] },
  { key: 'feminine', label: 'Femenino', cards: ['empress', 'high_priestess', 'moon', 'star'] },
];

const ASTROLOGY_DIMENSIONS = [
  { key: 'fire', label: 'Fuego', signs: ['aries', 'leo', 'sagittarius'] },
  { key: 'water', label: 'Agua', signs: ['cancer', 'scorpio', 'pisces'] },
  { key: 'air', label: 'Aire', signs: ['gemini', 'libra', 'aquarius'] },
  { key: 'earth', label: 'Tierra', signs: ['taurus', 'virgo', 'capricorn'] },
  { key: 'cardinal', label: 'Cardinal', quality: 'initiating' },
  { key: 'fixed', label: 'Fijo', quality: 'stabilizing' },
  { key: 'mutable', label: 'Mutable', quality: 'adapting' },
];

const TRANSGENERATIONAL_DIMENSIONS = [
  { key: 'paternal', label: 'Paterno', line: 'father' },
  { key: 'maternal', label: 'Materno', line: 'mother' },
  { key: 'control', label: 'Control', pattern: 'authority' },
  { key: 'sacrifice', label: 'Sacrificio', pattern: 'martyrdom' },
  { key: 'secrecy', label: 'Secretos', pattern: 'hidden' },
  { key: 'loss', label: 'Pérdidas', pattern: 'grief' },
];

// ============================================================================
// LAYER COLORS
// ============================================================================

const SYSTEM_COLORS: Record<SymbolicSystem, string> = {
  cabala: 'rgba(147, 51, 234, 0.6)', // Purple
  tarot: 'rgba(234, 179, 8, 0.6)',   // Yellow/Gold
  astrology: 'rgba(59, 130, 246, 0.6)', // Blue
  bioemotions: 'rgba(34, 197, 94, 0.6)', // Green
  transgenerational: 'rgba(249, 115, 22, 0.6)', // Orange
};

// ============================================================================
// RADAR DATA GENERATORS
// ============================================================================

function generateCabalaLayer(reading: AnySystemReading): RadarLayer {
  const data = reading.data as any;
  const dimensions = CABALA_DIMENSIONS.map(dim => {
    let value = 30; // Base value
    
    // Increase for dominant sefirot
    if (data.dominantSefirot?.includes(dim.key)) {
      value = 85;
    } else if (data.currentSefira === dim.key) {
      value = 90;
    } else if (data.weakSefirot?.includes(dim.key)) {
      value = 15;
    }
    
    // Consider ausencias
    const numberMapping: Record<string, number> = {
      keter: 1, chokmah: 2, binah: 3, chesed: 4, gevurah: 5,
      tiferet: 6, netzach: 7, hod: 8, yesod: 9, malkuth: 10,
    };
    const sefiraNumber = numberMapping[dim.key];
    if (data.ausencias?.includes(sefiraNumber)) {
      value = 10;
    } else if (data.sobrantes?.includes(sefiraNumber)) {
      value = 80;
    }
    
    return {
      label: dim.label,
      value,
      detail: dim.tooltip,
    };
  });
  
  return {
    system: 'cabala',
    dimensions,
    color: SYSTEM_COLORS.cabala,
  };
}

function generateBioEmotionLayer(reading: AnySystemReading): RadarLayer {
  const data = reading.data as any;
  
  const organMapping: Record<string, string[]> = {
    heart: ['corazón', 'pecho', 'heart'],
    liver: ['hígado', 'liver'],
    kidney: ['riñón', 'kidney', 'lumbar'],
    lung: ['pulmón', 'lung', 'respiración'],
    stomach: ['estómago', 'stomach', 'digestión'],
    intestine: ['intestino', 'intestine', 'colon'],
    throat: ['garganta', 'throat', 'tiroides'],
    back: ['espalda', 'back', 'columna'],
  };
  
  const dimensions = BIOEMOTION_DIMENSIONS.map(dim => {
    let value = 20; // Base value (healthy)
    
    const relatedOrgans = organMapping[dim.key] || [];
    const symptom = data.symptoms?.find((s: any) => 
      relatedOrgans.some(org => s.organ.toLowerCase().includes(org))
    );
    
    if (symptom) {
      value = symptom.intensity || 70;
    }
    
    return {
      label: dim.label,
      value,
      detail: `${dim.emotion}${symptom ? ` - ${symptom.description}` : ''}`,
    };
  });
  
  return {
    system: 'bioemotions',
    dimensions,
    color: SYSTEM_COLORS.bioemotions,
  };
}

function generateTarotLayer(reading: AnySystemReading): RadarLayer {
  const data = reading.data as any;
  const cards = data.cards || [];
  
  const elementCount: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  const energyCount: Record<string, number> = { masculine: 0, feminine: 0 };
  
  cards.forEach((card: any) => {
    if (card.element) {
      elementCount[card.element] = (elementCount[card.element] || 0) + 1;
    }
    if (card.energy) {
      energyCount[card.energy] = (energyCount[card.energy] || 0) + 1;
    }
  });
  
  const total = cards.length || 1;
  
  const dimensions = TAROT_DIMENSIONS.map(dim => {
    let value = 20;
    
    if (['fire', 'water', 'air', 'earth'].includes(dim.key)) {
      value = Math.min(100, (elementCount[dim.key] / total) * 100 * 2 + 10);
    } else if (dim.key === 'masculine' || dim.key === 'feminine') {
      value = Math.min(100, (energyCount[dim.key] / total) * 100 * 2 + 10);
    }
    
    // Override with explicit data
    if (data.dominantElement === dim.key) value = 90;
    if (data.dominantEnergy === dim.key) value = 90;
    
    return {
      label: dim.label,
      value,
      detail: dim.key,
    };
  });
  
  return {
    system: 'tarot',
    dimensions,
    color: SYSTEM_COLORS.tarot,
  };
}

function generateAstrologyLayer(reading: AnySystemReading): RadarLayer {
  const data = reading.data as any;
  
  const dimensions = ASTROLOGY_DIMENSIONS.map(dim => {
    let value = 25; // Base
    
    // Element balance
    if (data.elementBalance && ['fire', 'water', 'air', 'earth'].includes(dim.key)) {
      const total = Object.values(data.elementBalance as Record<string, number>).reduce((a, b) => a + b, 0);
      if (total > 0) {
        value = ((data.elementBalance[dim.key] || 0) / total) * 100;
      }
    }
    
    // Dominant element
    if (data.dominantElement === dim.key) {
      value = Math.max(value, 85);
    }
    
    return {
      label: dim.label,
      value,
      detail: dim.key,
    };
  });
  
  return {
    system: 'astrology',
    dimensions,
    color: SYSTEM_COLORS.astrology,
  };
}

function generateTransgenerationalLayer(reading: AnySystemReading): RadarLayer {
  const data = reading.data as any;
  
  // Analyze patterns
  const patternScores: Record<string, number> = {
    paternal: 30,
    maternal: 30,
    control: 20,
    sacrifice: 20,
    secrecy: 20,
    loss: 20,
  };
  
  // Dominant lineage
  if (data.dominantLineage === 'paternal') {
    patternScores.paternal = 85;
    patternScores.maternal = 30;
  } else if (data.dominantLineage === 'maternal') {
    patternScores.maternal = 85;
    patternScores.paternal = 30;
  }
  
  // Inherited patterns
  const allPatterns = [
    ...(data.inheritedPatterns || []),
    ...(data.paternalLine?.flatMap((a: any) => a.patterns || []) || []),
    ...(data.maternalLine?.flatMap((a: any) => a.patterns || []) || []),
  ].map((p: string) => p.toLowerCase());
  
  if (allPatterns.some(p => p.includes('control') || p.includes('autoridad') || p.includes('militar'))) {
    patternScores.control = 80;
  }
  if (allPatterns.some(p => p.includes('sacrificio') || p.includes('mártir') || p.includes('cuidador'))) {
    patternScores.sacrifice = 80;
  }
  if (allPatterns.some(p => p.includes('secreto') || p.includes('tabú') || p.includes('silencio'))) {
    patternScores.secrecy = 80;
  }
  if (allPatterns.some(p => p.includes('pérdida') || p.includes('muerte') || p.includes('duelo'))) {
    patternScores.loss = 80;
  }
  
  const dimensions = TRANSGENERATIONAL_DIMENSIONS.map(dim => ({
    label: dim.label,
    value: patternScores[dim.key] || 25,
    detail: dim.pattern || dim.line || '',
  }));
  
  return {
    system: 'transgenerational',
    dimensions,
    color: SYSTEM_COLORS.transgenerational,
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function generateRadarLayers(readings: AnySystemReading[]): RadarLayer[] {
  const layers: RadarLayer[] = [];
  
  readings.forEach(reading => {
    switch (reading.system) {
      case 'cabala':
        layers.push(generateCabalaLayer(reading));
        break;
      case 'bioemotions':
        layers.push(generateBioEmotionLayer(reading));
        break;
      case 'tarot':
        layers.push(generateTarotLayer(reading));
        break;
      case 'astrology':
        layers.push(generateAstrologyLayer(reading));
        break;
      case 'transgenerational':
        layers.push(generateTransgenerationalLayer(reading));
        break;
    }
  });
  
  return layers;
}

// ============================================================================
// IMBALANCE DETECTION
// ============================================================================

export interface ImbalanceReport {
  overallTheme: string;
  imbalances: Array<{
    axis: string;
    description: string;
    systems: SymbolicSystem[];
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

export function detectImbalances(layers: RadarLayer[]): ImbalanceReport {
  const imbalances: ImbalanceReport['imbalances'] = [];
  
  // Cross-layer analysis
  const systemData: Map<SymbolicSystem, Map<string, number>> = new Map();
  
  layers.forEach(layer => {
    const dimensionMap = new Map<string, number>();
    layer.dimensions.forEach(d => {
      dimensionMap.set(d.label.toLowerCase(), d.value);
    });
    systemData.set(layer.system, dimensionMap);
  });
  
  // Check masculine/feminine balance
  let masculineScore = 0;
  let feminineScore = 0;
  let masculineCount = 0;
  let feminineCount = 0;
  
  // Tarot
  const tarotData = systemData.get('tarot');
  if (tarotData) {
    masculineScore += tarotData.get('masculino') || 0;
    feminineScore += tarotData.get('femenino') || 0;
    masculineCount++;
    feminineCount++;
  }
  
  // Cabala (Chokmah = masculine, Binah = feminine)
  const cabalaData = systemData.get('cabala');
  if (cabalaData) {
    masculineScore += cabalaData.get('chokmah') || 0;
    feminineScore += cabalaData.get('binah') || 0;
    masculineCount++;
    feminineCount++;
  }
  
  // Transgenerational
  const transData = systemData.get('transgenerational');
  if (transData) {
    masculineScore += transData.get('paterno') || 0;
    feminineScore += transData.get('materno') || 0;
    masculineCount++;
    feminineCount++;
  }
  
  const avgMasculine = masculineCount > 0 ? masculineScore / masculineCount : 50;
  const avgFeminine = feminineCount > 0 ? feminineScore / feminineCount : 50;
  
  if (avgMasculine - avgFeminine > 30) {
    imbalances.push({
      axis: 'Masculino/Femenino',
      description: 'Exceso de energía masculina/controladora, déficit de receptividad femenina',
      systems: ['tarot', 'cabala', 'transgenerational'].filter(s => systemData.has(s as SymbolicSystem)) as SymbolicSystem[],
      severity: avgMasculine - avgFeminine > 50 ? 'high' : 'medium',
    });
  } else if (avgFeminine - avgMasculine > 30) {
    imbalances.push({
      axis: 'Masculino/Femenino',
      description: 'Déficit de energía masculina/acción, posible exceso de receptividad',
      systems: ['tarot', 'cabala', 'transgenerational'].filter(s => systemData.has(s as SymbolicSystem)) as SymbolicSystem[],
      severity: avgFeminine - avgMasculine > 50 ? 'high' : 'medium',
    });
  }
  
  // Check elemental balance (Tarot + Astrology)
  const elements = ['fuego', 'agua', 'aire', 'tierra'];
  const elementScores: Record<string, number[]> = {};
  
  [tarotData, systemData.get('astrology')].forEach(data => {
    if (data) {
      elements.forEach(el => {
        if (!elementScores[el]) elementScores[el] = [];
        const score = data.get(el) || data.get(el.charAt(0).toUpperCase() + el.slice(1));
        if (score !== undefined) elementScores[el].push(score);
      });
    }
  });
  
  elements.forEach(el => {
    const scores = elementScores[el];
    if (scores && scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 15) {
        imbalances.push({
          axis: `Elemento ${el.charAt(0).toUpperCase() + el.slice(1)}`,
          description: `Ausencia o déficit significativo del elemento ${el}`,
          systems: ['tarot', 'astrology'].filter(s => systemData.has(s as SymbolicSystem)) as SymbolicSystem[],
          severity: avg < 10 ? 'high' : 'medium',
        });
      }
    }
  });
  
  // Determine overall theme
  let overallTheme = 'Equilibrio general adecuado';
  
  if (imbalances.some(i => i.axis === 'Masculino/Femenino' && avgMasculine > avgFeminine)) {
    overallTheme = 'Patrón predominante de CONTROL/ESTRUCTURA - necesita integrar receptividad';
  } else if (imbalances.some(i => i.axis === 'Masculino/Femenino' && avgFeminine > avgMasculine)) {
    overallTheme = 'Patrón predominante de RECEPTIVIDAD - necesita integrar acción y límites';
  } else if (imbalances.length > 2) {
    overallTheme = 'Múltiples desequilibrios detectados - trabajo integral recomendado';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  imbalances.forEach(imb => {
    if (imb.axis.includes('Masculino') && avgMasculine > avgFeminine) {
      recommendations.push('Fortalecer la polaridad femenina/receptiva en todos los niveles');
      recommendations.push('Trabajar con Binah (Cábala), La Emperatriz (Tarot), elemento Agua');
    } else if (imb.axis.includes('Masculino') && avgFeminine > avgMasculine) {
      recommendations.push('Fortalecer la polaridad masculina/activa');
      recommendations.push('Trabajar con Chokmah (Cábala), El Emperador (Tarot), elemento Fuego');
    }
    
    if (imb.axis.includes('Agua')) {
      recommendations.push('Conectar con el elemento Agua: emociones, intuición, fluir');
    }
    if (imb.axis.includes('Fuego')) {
      recommendations.push('Activar el elemento Fuego: acción, pasión, voluntad');
    }
    if (imb.axis.includes('Tierra')) {
      recommendations.push('Enraizar con el elemento Tierra: cuerpo, materia, práctica');
    }
    if (imb.axis.includes('Aire')) {
      recommendations.push('Integrar el elemento Aire: mente, comunicación, perspectiva');
    }
  });
  
  return {
    overallTheme,
    imbalances,
    recommendations: [...new Set(recommendations)],
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SYSTEM_COLORS, CABALA_DIMENSIONS, BIOEMOTION_DIMENSIONS, TAROT_DIMENSIONS, ASTROLOGY_DIMENSIONS, TRANSGENERATIONAL_DIMENSIONS };
