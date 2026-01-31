/**
 * Sefirot Radar - Core Data
 * 
 * Definiciones canónicas de las 10 Sefirot con sus correspondencias
 * y mapeos a números, tests clínicos y estados psicológicos.
 */

import type { SefiraId, PillarType, EnergyState } from './types';

// ============================================================================
// SEFIROT DEFINITIONS
// ============================================================================

export interface SefiraDefinition {
  id: SefiraId;
  name: string;
  hebrewName: string;
  pillar: PillarType;
  /** Número pitagórico correspondiente (1-9 + 10) */
  number: number;
  /** Cualidades cuando está en equilibrio */
  balancedQualities: string[];
  /** Manifestación cuando hay sobrecarga */
  overloadManifestation: string[];
  /** Manifestación cuando hay vacío */
  emptyManifestation: string[];
  /** Tests clínicos que pueden indicar su estado */
  clinicalIndicators: string[];
  /** Color de visualización */
  color: string;
  /** Prácticas recomendadas para equilibrar */
  balancingPractices: string[];
}

export const SEFIROT_DATA: Record<SefiraId, SefiraDefinition> = {
  keter: {
    id: 'keter',
    name: 'Keter',
    hebrewName: 'כתר',
    pillar: 'center',
    number: 1,
    balancedQualities: ['Conexión espiritual', 'Propósito de vida', 'Unidad', 'Voluntad divina'],
    overloadManifestation: ['Disociación', 'Desconexión de la realidad', 'Mesianismo', 'Grandiosidad espiritual'],
    emptyManifestation: ['Vacío existencial', 'Falta de propósito', 'Depresión espiritual', 'Nihilismo'],
    clinicalIndicators: ['Escalas de sentido de vida', 'Disociación (DES)', 'Ideación mística'],
    color: '#FFFFFF',
    balancingPractices: ['Meditación contemplativa', 'Conexión con la naturaleza', 'Práctica de gratitud'],
  },
  
  chokmah: {
    id: 'chokmah',
    name: 'Chokmah',
    hebrewName: 'חכמה',
    pillar: 'right',
    number: 2,
    balancedQualities: ['Sabiduría intuitiva', 'Creatividad expansiva', 'Energía masculina sana', 'Visión'],
    overloadManifestation: ['Impulsividad', 'Energía caótica', 'Hiperactividad mental', 'Acción sin reflexión'],
    emptyManifestation: ['Bloqueo creativo', 'Falta de iniciativa', 'Pasividad excesiva', 'Estancamiento'],
    clinicalIndicators: ['ADHD scales (ASRS)', 'Creatividad', 'Energía/motivación'],
    color: '#808080',
    balancingPractices: ['Canalizar energía en proyectos', 'Ejercicio físico', 'Arte expresivo'],
  },
  
  binah: {
    id: 'binah',
    name: 'Binah',
    hebrewName: 'בינה',
    pillar: 'left',
    number: 3,
    balancedQualities: ['Comprensión profunda', 'Receptividad', 'Energía femenina sana', 'Discernimiento'],
    overloadManifestation: ['Exceso de análisis', 'Rigidez mental', 'Juicio severo', 'Restricción excesiva'],
    emptyManifestation: ['Confusión', 'Falta de límites', 'Incapacidad de procesar', 'Dispersión'],
    clinicalIndicators: ['Rumiación (RRS)', 'Ansiedad analítica', 'Rigidez cognitiva'],
    color: '#000000',
    balancingPractices: ['Journaling reflexivo', 'Establecer límites sanos', 'Contemplación silenciosa'],
  },
  
  chesed: {
    id: 'chesed',
    name: 'Chesed',
    hebrewName: 'חסד',
    pillar: 'right',
    number: 4,
    balancedQualities: ['Amor incondicional', 'Generosidad', 'Expansión', 'Bondad', 'Autocompasión'],
    overloadManifestation: ['Dar sin límites', 'Codependencia', 'Ingenuidad', 'Descuido propio'],
    emptyManifestation: ['Falta de autoamor', 'Dureza consigo mismo', 'Avaricia emocional', 'Aislamiento'],
    clinicalIndicators: ['Autocompasión (SCS)', 'Codependencia', 'Depresión (BDI-2)'],
    color: '#0000FF',
    balancingPractices: ['Autocompasión activa', 'Actos de bondad equilibrados', 'Terapia de amor propio'],
  },
  
  gevurah: {
    id: 'gevurah',
    name: 'Gevurah',
    hebrewName: 'גבורה',
    pillar: 'left',
    number: 5,
    balancedQualities: ['Fuerza sana', 'Límites claros', 'Disciplina', 'Justicia', 'Discernimiento'],
    overloadManifestation: ['Control excesivo', 'Ira', 'Severidad', 'Perfeccionismo', 'Autocrítica cruel'],
    emptyManifestation: ['Falta de límites', 'Debilidad', 'Victimismo', 'Incapacidad de decir no'],
    clinicalIndicators: ['Control (MCMI-4)', 'Ira (STAXI)', 'Perfeccionismo', 'Ansiedad (GAD-7)'],
    color: '#FF0000',
    balancingPractices: ['Trabajo con ira', 'Soltar control', 'Compasión hacia errores'],
  },
  
  tiferet: {
    id: 'tiferet',
    name: 'Tiferet',
    hebrewName: 'תפארת',
    pillar: 'center',
    number: 6,
    balancedQualities: ['Belleza interior', 'Armonía', 'Integración', 'Autenticidad', 'Corazón abierto'],
    overloadManifestation: ['Narcisismo', 'Autoengrandecimiento', 'Vanidad espiritual'],
    emptyManifestation: ['Falta de autoestima', 'Desconexión del corazón', 'Vergüenza', 'No sentirse digno'],
    clinicalIndicators: ['Autoestima (Rosenberg)', 'Narcisismo', 'Vergüenza'],
    color: '#FFD700',
    balancingPractices: ['Heart-centered meditation', 'Expresión auténtica', 'Arte terapia'],
  },
  
  netzach: {
    id: 'netzach',
    name: 'Netzach',
    hebrewName: 'נצח',
    pillar: 'right',
    number: 7,
    balancedQualities: ['Victoria sobre obstáculos', 'Pasión', 'Emociones fluidas', 'Creatividad sensual'],
    overloadManifestation: ['Emociones desbordadas', 'Adicciones', 'Impulsividad emocional', 'Obsesión'],
    emptyManifestation: ['Desconexión emocional', 'Apatía', 'Bloqueo de deseo', 'Alexitimia'],
    clinicalIndicators: ['Regulación emocional', 'Adicciones (AUDIT, DUDIT)', 'Alexitimia (TAS-20)'],
    color: '#00FF00',
    balancingPractices: ['Expresión emocional segura', 'Danza/movimiento', 'Arte sensorial'],
  },
  
  hod: {
    id: 'hod',
    name: 'Hod',
    hebrewName: 'הוד',
    pillar: 'left',
    number: 8,
    balancedQualities: ['Humildad sana', 'Comunicación clara', 'Mente estructurada', 'Reconocimiento'],
    overloadManifestation: ['Mente hiperactiva', 'Ansiedad mental', 'Autocrítica intelectual', 'Overthinking'],
    emptyManifestation: ['Confusión mental', 'Incapacidad de articular', 'Baja autoeficacia'],
    clinicalIndicators: ['Ansiedad (GAD-7)', 'Rumiación', 'Autoeficacia'],
    color: '#FFA500',
    balancingPractices: ['Meditación mindfulness', 'Journaling estructurado', 'Comunicación asertiva'],
  },
  
  yesod: {
    id: 'yesod',
    name: 'Yesod',
    hebrewName: 'יסוד',
    pillar: 'center',
    number: 9,
    balancedQualities: ['Fundamento sólido', 'Conexión', 'Ego sano', 'Intimidad', 'Sueños lúcidos'],
    overloadManifestation: ['Ego inflado', 'Fantasía excesiva', 'Ilusiones', 'Dependencia emocional'],
    emptyManifestation: ['Falta de fundamento', 'Desconexión', 'Problemas de identidad', 'Insomnio'],
    clinicalIndicators: ['Identidad', 'Sueño (ISI)', 'Apego', 'Disociación'],
    color: '#800080',
    balancingPractices: ['Trabajo con sueños', 'Grounding', 'Terapia de apego'],
  },
  
  malkuth: {
    id: 'malkuth',
    name: 'Malkuth',
    hebrewName: 'מלכות',
    pillar: 'center',
    number: 10,
    balancedQualities: ['Presencia física', 'Manifestación', 'Conexión con la tierra', 'Estabilidad material'],
    overloadManifestation: ['Materialismo excesivo', 'Apego a lo físico', 'Somatización', 'Rigidez corporal'],
    emptyManifestation: ['Desconexión del cuerpo', 'Problemas de encarnación', 'Inestabilidad material'],
    clinicalIndicators: ['Somatización (PHQ-15)', 'Imagen corporal', 'Ansiedad somática'],
    color: '#8B4513',
    balancingPractices: ['Yoga/movimiento consciente', 'Contacto con naturaleza', 'Trabajo corporal'],
  },
};

// ============================================================================
// PILLAR DEFINITIONS
// ============================================================================

export interface PillarDefinition {
  id: PillarType;
  name: string;
  hebrewName: string;
  description: string;
  sefirot: SefiraId[];
  /** Qué significa cuando está sobrecargado */
  overloadMeaning: string;
  /** Qué significa cuando está vacío */
  emptyMeaning: string;
}

export const PILLARS_DATA: Record<PillarType, PillarDefinition> = {
  right: {
    id: 'right',
    name: 'Pilar de la Misericordia',
    hebrewName: 'עמוד החסד',
    description: 'Expansión, dar, amor, creatividad, fluir',
    sefirot: ['chokmah', 'chesed', 'netzach'],
    overloadMeaning: 'Exceso de dar sin recibir, límites difusos, dispersión de energía',
    emptyMeaning: 'Bloqueo de la expresión, falta de amor propio, desconexión emocional',
  },
  left: {
    id: 'left',
    name: 'Pilar de la Severidad',
    hebrewName: 'עמוד הדין',
    description: 'Restricción, límites, análisis, disciplina',
    sefirot: ['binah', 'gevurah', 'hod'],
    overloadMeaning: 'Exceso de control, rigidez, autocrítica severa, mente hiperactiva',
    emptyMeaning: 'Falta de límites, confusión, incapacidad de discernir',
  },
  center: {
    id: 'center',
    name: 'Pilar del Equilibrio',
    hebrewName: 'עמוד האמצע',
    description: 'Integración, balance, conexión vertical',
    sefirot: ['keter', 'tiferet', 'yesod', 'malkuth'],
    overloadMeaning: 'Tensión entre extremos, dificultad para integrar',
    emptyMeaning: 'Falta de centro, desconexión entre cielo y tierra',
  },
};

// ============================================================================
// NUMBER TO SEFIRA MAPPING (Pythagorean)
// ============================================================================

export const NUMBER_TO_SEFIRA: Record<number, SefiraId> = {
  1: 'keter',
  2: 'chokmah',
  3: 'binah',
  4: 'chesed',
  5: 'gevurah',
  6: 'tiferet',
  7: 'netzach',
  8: 'hod',
  9: 'yesod',
  10: 'malkuth',
};

export const SEFIRA_TO_NUMBER: Record<SefiraId, number> = {
  keter: 1,
  chokmah: 2,
  binah: 3,
  chesed: 4,
  gevurah: 5,
  tiferet: 6,
  netzach: 7,
  hod: 8,
  yesod: 9,
  malkuth: 10,
};

// ============================================================================
// ENERGY STATE THRESHOLDS
// ============================================================================

export const ENERGY_THRESHOLDS = {
  criticalLow: 15,
  empty: 35,
  balancedLow: 40,
  balancedHigh: 65,
  overload: 75,
  criticalHigh: 90,
};

export function getEnergyState(level: number): EnergyState {
  if (level <= ENERGY_THRESHOLDS.criticalLow) return 'critical-low';
  if (level <= ENERGY_THRESHOLDS.empty) return 'empty';
  if (level >= ENERGY_THRESHOLDS.criticalHigh) return 'critical-high';
  if (level >= ENERGY_THRESHOLDS.overload) return 'overload';
  return 'balanced';
}

export function getEnergyStateColor(state: EnergyState): string {
  switch (state) {
    case 'critical-low': return '#DC2626'; // red-600
    case 'empty': return '#F59E0B'; // amber-500
    case 'balanced': return '#10B981'; // emerald-500
    case 'overload': return '#F97316'; // orange-500
    case 'critical-high': return '#7C3AED'; // violet-600
  }
}

export function getEnergyStateLabel(state: EnergyState): string {
  switch (state) {
    case 'critical-low': return 'Críticamente Vacío';
    case 'empty': return 'Vacío';
    case 'balanced': return 'Equilibrado';
    case 'overload': return 'Sobrecargado';
    case 'critical-high': return 'Críticamente Sobrecargado';
  }
}
