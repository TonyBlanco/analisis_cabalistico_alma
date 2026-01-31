/**
 * Shadow Work Module - Main exports
 * 
 * Integrates Qliphoth data, number polarities, and shadow analysis tools
 */

export * from './qliphoth-data';
export * from './number-polarities';

import { QLIPHOTH, Qliphah, getQliphahForSefira, SEFIRA_TO_QLIPHAH } from './qliphoth-data';
import { NUMBER_POLARITIES, NumberPolarity, getNumberPolarity, getShadowAnalysisForMissingNumbers } from './number-polarities';

export interface ShadowReport {
  qliphothAnalysis: {
    activeSefira: string;
    correspondingQliphah: Qliphah | null;
    shadowWarning: string;
    integrationGuidance: string;
  }[];
  missingNumbersShadows: {
    number: number;
    shadowWork: string;
    affirmation: string;
    integrationPath: string;
  }[];
  dominantNumberShadow: {
    number: number;
    polarity: NumberPolarity | null;
    balanceAdvice: string;
  } | null;
  overallShadowTheme: string;
}

/**
 * Generate a comprehensive shadow report based on numerological data
 */
export function generateShadowReport(params: {
  activeSefirot: string[];
  missingNumbers: number[];
  dominantNumber?: number;
}): ShadowReport {
  const { activeSefirot, missingNumbers, dominantNumber } = params;

  // 1. Qliphoth Analysis for active sefirot
  const qliphothAnalysis = activeSefirot.map(sefira => {
    const qliphah = getQliphahForSefira(sefira);
    return {
      activeSefira: sefira,
      correspondingQliphah: qliphah,
      shadowWarning: qliphah 
        ? `⚠️ Cuidado con la sombra de ${qliphah.spanishName}: ${qliphah.shadowExpression}`
        : 'Sin sombra específica identificada.',
      integrationGuidance: qliphah?.integrationPath || 'Observa cómo esta energía se manifiesta en ti.',
    };
  });

  // 2. Missing numbers shadow work
  const missingNumbersShadows = getShadowAnalysisForMissingNumbers(missingNumbers);

  // 3. Dominant number shadow
  let dominantNumberShadow = null;
  if (dominantNumber) {
    const polarity = getNumberPolarity(dominantNumber);
    dominantNumberShadow = {
      number: dominantNumber,
      polarity,
      balanceAdvice: polarity 
        ? `Tu número dominante ${dominantNumber} te da los dones de "${polarity.lightExpression.title}", pero cuidado con caer en "${polarity.shadowExpression.title}". ${polarity.integrationPath}`
        : `Observa el balance entre luz y sombra en tu número dominante ${dominantNumber}.`,
    };
  }

  // 4. Identify overall shadow theme
  const shadowKeywords: string[] = [];
  qliphothAnalysis.forEach(q => {
    if (q.correspondingQliphah) {
      shadowKeywords.push(...q.correspondingQliphah.keywords.slice(0, 2));
    }
  });
  missingNumbers.forEach(num => {
    const polarity = getNumberPolarity(num);
    if (polarity) {
      shadowKeywords.push(...polarity.shadowExpression.keywords.slice(0, 2));
    }
  });

  const uniqueKeywords = [...new Set(shadowKeywords)].slice(0, 5);
  const overallShadowTheme = uniqueKeywords.length > 0
    ? `Los temas de sombra predominantes a trabajar incluyen: ${uniqueKeywords.join(', ')}. Recuerda que las sombras son oportunidades de crecimiento, no defectos.`
    : 'No se identificaron temas de sombra específicos. Continúa con la auto-observación consciente.';

  return {
    qliphothAnalysis,
    missingNumbersShadows,
    dominantNumberShadow,
    overallShadowTheme,
  };
}

/**
 * Get the Qliphotic tree structure (inverse of Tree of Life)
 */
export function getQliphoticTree(): {
  name: string;
  hebrewName: string;
  qliphoth: Array<{
    id: string;
    qliphah: Qliphah;
    position: { x: number; y: number };
  }>;
  paths: Array<{ from: string; to: string }>;
} {
  // Positions mirror the Tree of Life (inverted symbolically)
  const positions: Record<string, { x: number; y: number }> = {
    thaumiel: { x: 50, y: 10 },
    ghagiel: { x: 25, y: 25 },
    satariel: { x: 75, y: 25 },
    gamchicoth: { x: 25, y: 45 },
    golachab: { x: 75, y: 45 },
    thagirion: { x: 50, y: 55 },
    arab_zaraq: { x: 25, y: 70 },
    samael: { x: 75, y: 70 },
    gamaliel: { x: 50, y: 80 },
    lilith: { x: 50, y: 95 },
  };

  const qliphoth = Object.entries(QLIPHOTH).map(([id, qliphah]) => ({
    id,
    qliphah,
    position: positions[id] || { x: 50, y: 50 },
  }));

  // Same path structure as Tree of Life
  const paths = [
    { from: 'thaumiel', to: 'ghagiel' },
    { from: 'thaumiel', to: 'satariel' },
    { from: 'ghagiel', to: 'satariel' },
    { from: 'ghagiel', to: 'gamchicoth' },
    { from: 'ghagiel', to: 'thagirion' },
    { from: 'satariel', to: 'golachab' },
    { from: 'satariel', to: 'thagirion' },
    { from: 'gamchicoth', to: 'golachab' },
    { from: 'gamchicoth', to: 'thagirion' },
    { from: 'gamchicoth', to: 'arab_zaraq' },
    { from: 'golachab', to: 'thagirion' },
    { from: 'golachab', to: 'samael' },
    { from: 'thagirion', to: 'arab_zaraq' },
    { from: 'thagirion', to: 'samael' },
    { from: 'thagirion', to: 'gamaliel' },
    { from: 'arab_zaraq', to: 'gamaliel' },
    { from: 'samael', to: 'gamaliel' },
    { from: 'gamaliel', to: 'lilith' },
  ];

  return {
    name: 'El Árbol de la Muerte (Qliphoth)',
    hebrewName: 'עץ הקליפות',
    qliphoth,
    paths,
  };
}
