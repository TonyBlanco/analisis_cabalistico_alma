/**
 * Multi-System Integration Module
 * 
 * Exports all integration tools for cross-system symbolic analysis
 */

// Types
export * from './types';

// Pattern Detection
export { detectCrossSystemPatterns, THEME_SIGNATURES } from './pattern-detection';

// Synchrony Detection
export { 
  detectTransgenerationalSynchronies, 
  calculateCabalisticCycle,
  analyzeCyclicPatterns,
  CABALA_CYCLES,
} from './synchrony-detection';

// Question Generator
export { generateQuestions, QUESTION_TEMPLATES, PATTERN_QUESTIONS } from './question-generator';

// Radar Generator
export { 
  generateRadarLayers, 
  detectImbalances,
  SYSTEM_COLORS,
  CABALA_DIMENSIONS,
  BIOEMOTION_DIMENSIONS,
  TAROT_DIMENSIONS,
  ASTROLOGY_DIMENSIONS,
  TRANSGENERATIONAL_DIMENSIONS,
} from './radar-generator';

// ============================================================================
// CONVENIENCE FUNCTION: Full Integration Report
// ============================================================================

import type { 
  AnySystemReading, 
  IntegrationReport, 
  TransgenerationalReading,
} from './types';
import { detectCrossSystemPatterns } from './pattern-detection';
import { detectTransgenerationalSynchronies } from './synchrony-detection';
import { generateQuestions } from './question-generator';
import { generateRadarLayers, detectImbalances } from './radar-generator';

export function generateFullIntegrationReport(
  consultantId: number,
  readings: AnySystemReading[],
  consultantBirthDate?: Date,
): IntegrationReport {
  // 1. Detect cross-system patterns
  const patterns = detectCrossSystemPatterns(readings);
  
  // 2. Detect transgenerational synchronies
  let synchronies: IntegrationReport['synchronies'] = [];
  if (consultantBirthDate) {
    const transReading = readings.find(r => r.system === 'transgenerational') as TransgenerationalReading | undefined;
    if (transReading) {
      synchronies = detectTransgenerationalSynchronies(transReading, consultantBirthDate);
    }
  }
  
  // 3. Generate questions
  const questions = generateQuestions(readings, patterns);
  
  // 4. Generate radar layers
  const radar = generateRadarLayers(readings);
  
  // 5. Detect imbalances and create overall insight
  const imbalanceReport = detectImbalances(radar);
  
  // 6. Create overall insight
  let overallInsight = '';
  if (patterns.length > 0) {
    const topPattern = patterns[0];
    overallInsight = `Patrón principal detectado: ${topPattern.theme}. ${topPattern.insight}`;
    
    if (imbalanceReport.imbalances.length > 0) {
      overallInsight += ` Además, se detectan desequilibrios en: ${imbalanceReport.imbalances.map(i => i.axis).join(', ')}.`;
    }
  } else {
    overallInsight = imbalanceReport.overallTheme;
  }
  
  return {
    id: `report_${consultantId}_${Date.now()}`,
    consultantId,
    createdAt: new Date().toISOString(),
    readings,
    patterns,
    synchronies,
    biography: [], // To be filled from external sources
    questions,
    radar,
    overallInsight,
  };
}
