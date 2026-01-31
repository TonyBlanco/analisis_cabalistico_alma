/**
 * Sefirot Radar - Types
 * 
 * Sistema de visualización de desequilibrios sefiróticos
 * cruzando múltiples fuentes de datos:
 * - Tests clínicos
 * - Biografía personal
 * - Cálculos cabalísticos (Pitágoras, Gematría, etc.)
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type SefiraId = 
  | 'keter' 
  | 'chokmah' 
  | 'binah' 
  | 'chesed' 
  | 'gevurah' 
  | 'tiferet' 
  | 'netzach' 
  | 'hod' 
  | 'yesod' 
  | 'malkuth';

export type PillarType = 'left' | 'center' | 'right';

export type EnergyState = 'overload' | 'balanced' | 'empty' | 'critical-low' | 'critical-high';

// ============================================================================
// DATA SOURCES
// ============================================================================

/** Datos de tests clínicos que impactan sefirot */
export interface ClinicalTestData {
  source: 'clinical-test';
  testType: string; // 'bdi2', 'gad7', 'phq9', 'mcmi4', 'aq-kabbalah', etc.
  testName: string;
  /** Scores mapeados a sefirot (0-100) */
  sefirotScores: Partial<Record<SefiraId, number>>;
  /** Fecha del test */
  timestamp: string;
  /** Peso de esta fuente (0-1) */
  weight?: number;
}

/** Datos biográficos que impactan sefirot */
export interface BiographyData {
  source: 'biography';
  category: string; // 'trauma', 'family', 'career', 'relationships', etc.
  description: string;
  /** Sefirot afectadas con dirección (+overload, -empty) */
  impacts: Array<{
    sefira: SefiraId;
    direction: 'overload' | 'empty';
    intensity: number; // 0-100
  }>;
  /** Edad cuando ocurrió (opcional) */
  age?: number;
  weight?: number;
}

/** Datos de cálculos cabalísticos */
export interface CabalisticCalcData {
  source: 'cabalistic-calc';
  method: string; // 'pitagoras', 'gematria', 'tikun-cycles', etc.
  /** Sefirot derivadas del cálculo */
  sefirotScores: Partial<Record<SefiraId, number>>;
  /** Números ausentes (mapean a sefirot vacías) */
  ausencias?: number[];
  /** Números dominantes (mapean a sefirot sobrecargadas) */
  dominantes?: number[];
  /** Ciclo actual de vida */
  currentCycle?: {
    sefira: SefiraId;
    year: number;
  };
  weight?: number;
}

/** Datos de otros sistemas simbólicos */
export interface SymbolicSystemData {
  source: 'symbolic-system';
  system: 'tarot' | 'astrology' | 'bioemotions' | 'transgenerational';
  sefirotScores: Partial<Record<SefiraId, number>>;
  notes?: string;
  weight?: number;
}

export type DataSource = ClinicalTestData | BiographyData | CabalisticCalcData | SymbolicSystemData;

// ============================================================================
// RADAR OUTPUT
// ============================================================================

/** Score computado para una sefirá individual */
export interface SefiraScore {
  id: SefiraId;
  name: string;
  hebrewName: string;
  /** Nivel de energía (0-100) */
  level: number;
  /** Estado derivado del nivel */
  state: EnergyState;
  /** Pilar al que pertenece */
  pillar: PillarType;
  /** Fuentes que contribuyeron al score */
  contributors: Array<{
    source: DataSource['source'];
    name: string;
    contribution: number;
    direction: 'up' | 'down';
  }>;
  /** Descripción del estado actual */
  stateDescription: string;
  /** Color para visualización */
  color: string;
}

/** Análisis de un pilar completo */
export interface PillarAnalysis {
  pillar: PillarType;
  name: string;
  description: string;
  /** Promedio de energía del pilar */
  averageLevel: number;
  /** Sefirot en este pilar */
  sefirot: SefiraId[];
  /** Estado general del pilar */
  state: EnergyState;
  /** Insight interpretativo */
  insight: string;
}

/** Desequilibrio detectado */
export interface Imbalance {
  type: 'pillar-asymmetry' | 'sefira-overload' | 'sefira-empty' | 'axis-tension';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  /** Sefirot involucradas */
  involvedSefirot: SefiraId[];
  /** Recomendación de trabajo */
  workRecommendation: string;
  /** Prioridad (1 = más urgente) */
  priority: number;
}

/** Recomendación de trabajo terapéutico */
export interface WorkRecommendation {
  sefira: SefiraId;
  action: 'strengthen' | 'release' | 'balance';
  reason: string;
  practices: string[];
  priority: number;
}

/** Resultado completo del radar */
export interface SefirotRadarResult {
  /** Timestamp de generación */
  generatedAt: string;
  /** Scores de las 10 sefirot */
  sefirot: SefiraScore[];
  /** Análisis por pilares */
  pillars: PillarAnalysis[];
  /** Desequilibrios detectados */
  imbalances: Imbalance[];
  /** Recomendaciones de trabajo ordenadas por prioridad */
  recommendations: WorkRecommendation[];
  /** Insight visual principal */
  mainInsight: string;
  /** Resumen ejecutivo */
  summary: string;
  /** Fuentes de datos usadas */
  dataSources: Array<{
    type: DataSource['source'];
    name: string;
    weight: number;
  }>;
}

// ============================================================================
// HISTORICAL TRACKING
// ============================================================================

/** Snapshot histórico para tracking de evolución */
export interface RadarSnapshot {
  id: string;
  consultantId: number;
  timestamp: string;
  sefirotLevels: Record<SefiraId, number>;
  mainInsight: string;
  /** Cambios desde el snapshot anterior */
  changes?: Array<{
    sefira: SefiraId;
    previousLevel: number;
    currentLevel: number;
    direction: 'improved' | 'worsened' | 'stable';
  }>;
}

/** Evolución temporal */
export interface EvolutionAnalysis {
  consultantId: number;
  snapshots: RadarSnapshot[];
  /** Tendencias por sefirá */
  trends: Record<SefiraId, 'improving' | 'declining' | 'fluctuating' | 'stable'>;
  /** Insight de evolución */
  evolutionInsight: string;
}
