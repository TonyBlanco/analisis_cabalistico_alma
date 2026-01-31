/**
 * Sefirot Radar - Clinical Mappings
 * 
 * Mapeo de tests clínicos a Sefirot basado en correspondencias
 * psicológicas y cabalísticas.
 */

import type { SefiraId } from './types';

// ============================================================================
// CLINICAL TEST MAPPINGS
// ============================================================================

export interface ClinicalTestMapping {
  testCode: string;
  testName: string;
  /** Mapeo de escalas/scores a sefirot */
  scaleMapping: Array<{
    scaleName: string;
    scaleCode?: string;
    /** Sefirá afectada */
    sefira: SefiraId;
    /** Dirección: score alto aumenta (+) o disminuye (-) el nivel */
    direction: 'positive' | 'negative' | 'inverted';
    /** Factor de peso (0-1) */
    weight: number;
    /** Umbral de activación (score mínimo para considerar) */
    threshold?: number;
  }>;
}

export const CLINICAL_TEST_MAPPINGS: Record<string, ClinicalTestMapping> = {
  // ============================================================================
  // DEPRESSION & MOOD
  // ============================================================================
  'bdi2': {
    testCode: 'bdi2',
    testName: 'Beck Depression Inventory II',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'chesed', direction: 'negative', weight: 0.8 },
      { scaleName: 'Total Score', sefira: 'tiferet', direction: 'negative', weight: 0.7 },
      { scaleName: 'Total Score', sefira: 'netzach', direction: 'negative', weight: 0.6 },
      { scaleName: 'Hopelessness items', sefira: 'keter', direction: 'negative', weight: 0.5 },
    ],
  },
  
  'phq9': {
    testCode: 'phq9',
    testName: 'Patient Health Questionnaire-9',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'chesed', direction: 'negative', weight: 0.7 },
      { scaleName: 'Total Score', sefira: 'netzach', direction: 'negative', weight: 0.6 },
      { scaleName: 'Energy/Fatigue', sefira: 'malkuth', direction: 'negative', weight: 0.5 },
    ],
  },
  
  // ============================================================================
  // ANXIETY
  // ============================================================================
  'gad7': {
    testCode: 'gad7',
    testName: 'Generalized Anxiety Disorder 7',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'gevurah', direction: 'positive', weight: 0.8 },
      { scaleName: 'Total Score', sefira: 'hod', direction: 'positive', weight: 0.7 },
      { scaleName: 'Worry', sefira: 'binah', direction: 'positive', weight: 0.5 },
    ],
  },
  
  'bai': {
    testCode: 'bai',
    testName: 'Beck Anxiety Inventory',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'gevurah', direction: 'positive', weight: 0.7 },
      { scaleName: 'Somatic symptoms', sefira: 'malkuth', direction: 'positive', weight: 0.6 },
      { scaleName: 'Cognitive symptoms', sefira: 'hod', direction: 'positive', weight: 0.6 },
    ],
  },
  
  // ============================================================================
  // SLEEP
  // ============================================================================
  'isi': {
    testCode: 'isi',
    testName: 'Insomnia Severity Index',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'yesod', direction: 'negative', weight: 0.8 },
      { scaleName: 'Total Score', sefira: 'malkuth', direction: 'negative', weight: 0.5 },
    ],
  },
  
  // ============================================================================
  // MCMI-4 (Personality)
  // ============================================================================
  'mcmi4': {
    testCode: 'mcmi4',
    testName: 'Millon Clinical Multiaxial Inventory IV',
    scaleMapping: [
      // Clinical Patterns
      { scaleName: 'Schizoid', scaleCode: '1', sefira: 'netzach', direction: 'negative', weight: 0.7 },
      { scaleName: 'Avoidant', scaleCode: '2A', sefira: 'chesed', direction: 'negative', weight: 0.6 },
      { scaleName: 'Depressive', scaleCode: '2B', sefira: 'chesed', direction: 'negative', weight: 0.7 },
      { scaleName: 'Dependent', scaleCode: '3', sefira: 'yesod', direction: 'positive', weight: 0.6 },
      { scaleName: 'Histrionic', scaleCode: '4', sefira: 'netzach', direction: 'positive', weight: 0.6 },
      { scaleName: 'Narcissistic', scaleCode: '5', sefira: 'tiferet', direction: 'positive', weight: 0.7 },
      { scaleName: 'Antisocial', scaleCode: '6A', sefira: 'gevurah', direction: 'positive', weight: 0.6 },
      { scaleName: 'Sadistic', scaleCode: '6B', sefira: 'gevurah', direction: 'positive', weight: 0.8 },
      { scaleName: 'Compulsive', scaleCode: '7', sefira: 'gevurah', direction: 'positive', weight: 0.7 },
      { scaleName: 'Negativistic', scaleCode: '8A', sefira: 'hod', direction: 'positive', weight: 0.5 },
      { scaleName: 'Masochistic', scaleCode: '8B', sefira: 'chesed', direction: 'inverted', weight: 0.6 },
      
      // Severe Patterns
      { scaleName: 'Schizotypal', scaleCode: 'S', sefira: 'keter', direction: 'positive', weight: 0.6 },
      { scaleName: 'Borderline', scaleCode: 'C', sefira: 'yesod', direction: 'positive', weight: 0.7 },
      { scaleName: 'Paranoid', scaleCode: 'P', sefira: 'gevurah', direction: 'positive', weight: 0.7 },
      
      // Clinical Syndromes
      { scaleName: 'Anxiety', scaleCode: 'A', sefira: 'hod', direction: 'positive', weight: 0.6 },
      { scaleName: 'Somatoform', scaleCode: 'H', sefira: 'malkuth', direction: 'positive', weight: 0.7 },
      { scaleName: 'Bipolar', scaleCode: 'N', sefira: 'chokmah', direction: 'positive', weight: 0.6 },
      { scaleName: 'Dysthymia', scaleCode: 'D', sefira: 'chesed', direction: 'negative', weight: 0.7 },
      { scaleName: 'PTSD', scaleCode: 'R', sefira: 'yesod', direction: 'negative', weight: 0.7 },
    ],
  },
  
  // ============================================================================
  // AQ-KABBALAH (Custom Soul Test)
  // ============================================================================
  'aq-kabbalah': {
    testCode: 'aq-kabbalah',
    testName: 'Auditoría del Alma Cabalística',
    scaleMapping: [
      { scaleName: 'Keter', sefira: 'keter', direction: 'positive', weight: 1.0 },
      { scaleName: 'Chokmah', sefira: 'chokmah', direction: 'positive', weight: 1.0 },
      { scaleName: 'Binah', sefira: 'binah', direction: 'positive', weight: 1.0 },
      { scaleName: 'Chesed', sefira: 'chesed', direction: 'positive', weight: 1.0 },
      { scaleName: 'Gevurah', sefira: 'gevurah', direction: 'positive', weight: 1.0 },
      { scaleName: 'Tiferet', sefira: 'tiferet', direction: 'positive', weight: 1.0 },
      { scaleName: 'Netzach', sefira: 'netzach', direction: 'positive', weight: 1.0 },
      { scaleName: 'Hod', sefira: 'hod', direction: 'positive', weight: 1.0 },
      { scaleName: 'Yesod', sefira: 'yesod', direction: 'positive', weight: 1.0 },
      { scaleName: 'Malkuth', sefira: 'malkuth', direction: 'positive', weight: 1.0 },
    ],
  },
  
  // ============================================================================
  // SUBSTANCE USE
  // ============================================================================
  'audit': {
    testCode: 'audit',
    testName: 'Alcohol Use Disorders Identification Test',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'netzach', direction: 'positive', weight: 0.7, threshold: 8 },
      { scaleName: 'Total Score', sefira: 'yesod', direction: 'negative', weight: 0.5, threshold: 8 },
    ],
  },
  
  'dudit': {
    testCode: 'dudit',
    testName: 'Drug Use Disorders Identification Test',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'netzach', direction: 'positive', weight: 0.7, threshold: 6 },
      { scaleName: 'Total Score', sefira: 'yesod', direction: 'negative', weight: 0.5, threshold: 6 },
    ],
  },
  
  // ============================================================================
  // TRAUMA
  // ============================================================================
  'pcl5': {
    testCode: 'pcl5',
    testName: 'PTSD Checklist for DSM-5',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'yesod', direction: 'negative', weight: 0.8 },
      { scaleName: 'Intrusion', sefira: 'binah', direction: 'positive', weight: 0.6 },
      { scaleName: 'Avoidance', sefira: 'netzach', direction: 'negative', weight: 0.6 },
      { scaleName: 'Arousal', sefira: 'gevurah', direction: 'positive', weight: 0.6 },
    ],
  },
  
  // ============================================================================
  // EATING
  // ============================================================================
  'eat26': {
    testCode: 'eat26',
    testName: 'Eating Attitudes Test',
    scaleMapping: [
      { scaleName: 'Total Score', sefira: 'malkuth', direction: 'negative', weight: 0.7 },
      { scaleName: 'Control', sefira: 'gevurah', direction: 'positive', weight: 0.6 },
      { scaleName: 'Body Image', sefira: 'tiferet', direction: 'negative', weight: 0.5 },
    ],
  },
  
  // ============================================================================
  // ADHD
  // ============================================================================
  'asrs': {
    testCode: 'asrs',
    testName: 'Adult ADHD Self-Report Scale',
    scaleMapping: [
      { scaleName: 'Inattention', sefira: 'hod', direction: 'positive', weight: 0.6 },
      { scaleName: 'Hyperactivity', sefira: 'chokmah', direction: 'positive', weight: 0.7 },
      { scaleName: 'Impulsivity', sefira: 'netzach', direction: 'positive', weight: 0.5 },
    ],
  },
  
  // ============================================================================
  // AUTISM SPECTRUM
  // ============================================================================
  'aq50': {
    testCode: 'aq50',
    testName: 'Autism Quotient',
    scaleMapping: [
      { scaleName: 'Social Skills', sefira: 'netzach', direction: 'negative', weight: 0.6 },
      { scaleName: 'Communication', sefira: 'hod', direction: 'negative', weight: 0.5 },
      { scaleName: 'Attention to Detail', sefira: 'binah', direction: 'positive', weight: 0.5 },
      { scaleName: 'Imagination', sefira: 'chokmah', direction: 'negative', weight: 0.4 },
    ],
  },
};

// ============================================================================
// BIOGRAPHY EVENT MAPPINGS
// ============================================================================

export interface BiographyEventMapping {
  category: string;
  events: Array<{
    keyword: string;
    impacts: Array<{
      sefira: SefiraId;
      direction: 'overload' | 'empty';
      baseIntensity: number;
    }>;
  }>;
}

export const BIOGRAPHY_MAPPINGS: BiographyEventMapping[] = [
  {
    category: 'trauma',
    events: [
      {
        keyword: 'abandono',
        impacts: [
          { sefira: 'chesed', direction: 'empty', baseIntensity: 70 },
          { sefira: 'yesod', direction: 'empty', baseIntensity: 60 },
        ],
      },
      {
        keyword: 'abuso',
        impacts: [
          { sefira: 'gevurah', direction: 'overload', baseIntensity: 80 },
          { sefira: 'yesod', direction: 'empty', baseIntensity: 70 },
          { sefira: 'tiferet', direction: 'empty', baseIntensity: 60 },
        ],
      },
      {
        keyword: 'pérdida',
        impacts: [
          { sefira: 'chesed', direction: 'empty', baseIntensity: 60 },
          { sefira: 'binah', direction: 'overload', baseIntensity: 50 },
        ],
      },
      {
        keyword: 'violencia',
        impacts: [
          { sefira: 'gevurah', direction: 'overload', baseIntensity: 75 },
          { sefira: 'chesed', direction: 'empty', baseIntensity: 65 },
        ],
      },
    ],
  },
  {
    category: 'familia',
    events: [
      {
        keyword: 'padre ausente',
        impacts: [
          { sefira: 'chokmah', direction: 'empty', baseIntensity: 60 },
          { sefira: 'gevurah', direction: 'empty', baseIntensity: 50 },
        ],
      },
      {
        keyword: 'madre controladora',
        impacts: [
          { sefira: 'binah', direction: 'overload', baseIntensity: 65 },
          { sefira: 'chesed', direction: 'empty', baseIntensity: 55 },
        ],
      },
      {
        keyword: 'padre autoritario',
        impacts: [
          { sefira: 'gevurah', direction: 'overload', baseIntensity: 70 },
          { sefira: 'chesed', direction: 'empty', baseIntensity: 50 },
        ],
      },
      {
        keyword: 'sobreprotección',
        impacts: [
          { sefira: 'malkuth', direction: 'empty', baseIntensity: 55 },
          { sefira: 'yesod', direction: 'overload', baseIntensity: 50 },
        ],
      },
    ],
  },
  {
    category: 'relaciones',
    events: [
      {
        keyword: 'codependencia',
        impacts: [
          { sefira: 'chesed', direction: 'overload', baseIntensity: 70 },
          { sefira: 'gevurah', direction: 'empty', baseIntensity: 60 },
        ],
      },
      {
        keyword: 'aislamiento',
        impacts: [
          { sefira: 'netzach', direction: 'empty', baseIntensity: 65 },
          { sefira: 'chesed', direction: 'empty', baseIntensity: 55 },
        ],
      },
      {
        keyword: 'relación tóxica',
        impacts: [
          { sefira: 'gevurah', direction: 'overload', baseIntensity: 60 },
          { sefira: 'tiferet', direction: 'empty', baseIntensity: 55 },
        ],
      },
    ],
  },
];

// ============================================================================
// UTILITY: Find applicable mapping for a test
// ============================================================================

export function findTestMapping(testCode: string): ClinicalTestMapping | undefined {
  return CLINICAL_TEST_MAPPINGS[testCode.toLowerCase()];
}

export function findBiographyImpacts(
  category: string,
  description: string
): BiographyEventMapping['events'][0]['impacts'] {
  const categoryMapping = BIOGRAPHY_MAPPINGS.find(
    m => m.category.toLowerCase() === category.toLowerCase()
  );
  
  if (!categoryMapping) return [];
  
  const descLower = description.toLowerCase();
  for (const event of categoryMapping.events) {
    if (descLower.includes(event.keyword.toLowerCase())) {
      return event.impacts;
    }
  }
  
  return [];
}
