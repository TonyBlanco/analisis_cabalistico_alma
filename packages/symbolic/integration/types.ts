/**
 * Multi-System Integration Types
 * 
 * Tipos para la integración de múltiples sistemas simbólicos:
 * Cábala, Tarot, Astrología, Bio-Emociones, Transgeneracional
 */

// ============================================================================
// SISTEMA BASE
// ============================================================================

export type SymbolicSystem = 'cabala' | 'tarot' | 'astrology' | 'bioemotions' | 'transgenerational';

export interface SystemReading {
  system: SymbolicSystem;
  timestamp: string;
  source: string; // ej: "lectura manual", "test MCMI-IV", "SHA workspace"
  data: Record<string, unknown>;
}

// ============================================================================
// CÁBALA
// ============================================================================

export interface CabalaReading extends SystemReading {
  system: 'cabala';
  data: {
    currentSefira?: string;
    currentCycle?: {
      number: number;
      sefira: string;
      startAge: number;
      endAge: number;
    };
    dominantSefirot?: string[];
    weakSefirot?: string[];
    ausencias?: number[];
    sobrantes?: number[];
    caminoVida?: number;
    qliphothActive?: string[];
  };
}

// ============================================================================
// TAROT
// ============================================================================

export interface TarotReading extends SystemReading {
  system: 'tarot';
  data: {
    spread?: string; // "cruz celta", "3 cartas", etc.
    cards: Array<{
      position: string;
      arcana: string;
      name: string;
      reversed?: boolean;
      keywords: string[];
      element?: 'fire' | 'water' | 'air' | 'earth';
      energy?: 'masculine' | 'feminine' | 'neutral';
    }>;
    dominantElement?: string;
    dominantEnergy?: 'masculine' | 'feminine' | 'balanced';
    themes?: string[];
  };
}

// ============================================================================
// ASTROLOGÍA
// ============================================================================

export interface AstrologyReading extends SystemReading {
  system: 'astrology';
  data: {
    sunSign?: string;
    moonSign?: string;
    ascendant?: string;
    dominantPlanet?: string;
    dominantElement?: 'fire' | 'water' | 'air' | 'earth';
    elementBalance?: {
      fire: number;
      water: number;
      air: number;
      earth: number;
    };
    currentTransits?: Array<{
      planet: string;
      aspect: string;
      to: string;
      theme: string;
    }>;
    themes?: string[];
  };
}

// ============================================================================
// BIO-EMOCIONES
// ============================================================================

export interface BioEmotionReading extends SystemReading {
  system: 'bioemotions';
  data: {
    symptoms: Array<{
      organ: string;
      description: string;
      intensity: number; // 0-100
      emotion: string;
      duration?: string;
    }>;
    dominantEmotion?: string;
    organMap?: Record<string, {
      emotion: string;
      intensity: number;
    }>;
    patterns?: string[];
  };
}

// ============================================================================
// TRANSGENERACIONAL
// ============================================================================

export interface TransgenerationalReading extends SystemReading {
  system: 'transgenerational';
  data: {
    paternalLine?: Array<{
      relation: string; // "padre", "abuelo paterno", etc.
      name?: string;
      keyEvents?: Array<{
        age: number;
        event: string;
        theme: string;
      }>;
      patterns?: string[];
      profession?: string;
      traits?: string[];
    }>;
    maternalLine?: Array<{
      relation: string;
      name?: string;
      keyEvents?: Array<{
        age: number;
        event: string;
        theme: string;
      }>;
      patterns?: string[];
      profession?: string;
      traits?: string[];
    }>;
    inheritedPatterns?: string[];
    dominantLineage?: 'paternal' | 'maternal' | 'balanced';
    cyclicPatterns?: Array<{
      age: number;
      ancestors: string[];
      event: string;
    }>;
  };
}

// ============================================================================
// INTEGRACIÓN MULTI-SISTEMA
// ============================================================================

export type AnySystemReading = CabalaReading | TarotReading | AstrologyReading | BioEmotionReading | TransgenerationalReading;

export interface CrossSystemPattern {
  id: string;
  theme: string; // ej: "CONTROL EXCESIVO", "MIEDO AL ABANDONO"
  confidence: number; // 0-1
  systems: SymbolicSystem[];
  evidence: Array<{
    system: SymbolicSystem;
    indicator: string;
    detail: string;
  }>;
  insight: string;
  recommendations?: string[];
}

export interface TransgenerationalSynchrony {
  id: string;
  age: number;
  cycle?: {
    number: number;
    sefira: string;
  };
  ancestors: Array<{
    relation: string;
    event: string;
    age: number;
  }>;
  consultantAge: number;
  yearsToPattern: number;
  alertLevel: 'info' | 'attention' | 'urgent';
  workingSuggestion: string;
}

export interface BiographyEvent {
  id: string;
  date: string;
  age: number;
  description: string;
  type: 'crisis' | 'achievement' | 'transition' | 'loss' | 'birth' | 'health' | 'relationship' | 'other';
  cabala?: {
    sefira: string;
    cycle: number;
    transition?: { from: string; to: string };
  };
  bioemotion?: {
    organ: string;
    symptom: string;
    emotion: string;
  };
  pattern?: string;
}

export interface GenerativeQuestion {
  id: string;
  question: string;
  sources: Array<{
    system: SymbolicSystem;
    element: string;
  }>;
  depth: 'surface' | 'medium' | 'deep';
  theme: string;
}

export interface RadarLayer {
  system: SymbolicSystem;
  dimensions: Array<{
    label: string;
    value: number; // 0-100
    detail?: string;
  }>;
  color: string;
}

export interface IntegrationReport {
  id: string;
  consultantId: number;
  createdAt: string;
  readings: AnySystemReading[];
  patterns: CrossSystemPattern[];
  synchronies: TransgenerationalSynchrony[];
  biography: BiographyEvent[];
  questions: GenerativeQuestion[];
  radar: RadarLayer[];
  overallInsight: string;
}
