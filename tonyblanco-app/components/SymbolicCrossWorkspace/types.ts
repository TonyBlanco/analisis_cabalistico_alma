export type SymbolicSystemId = 'tarot' | 'tree' | 'astrology';

export interface SymbolicCrossEvent {
  id: string;
  date: string;
  system: SymbolicSystemId;
  symbols: string[];
  sourceEventId: string;
  notes?: string;
}

export interface PatternEvidence {
  sourceEventId: string;
  date: string;
  system: SymbolicSystemId;
  symbols: string[];
}

export interface CrossPattern {
  id: string;
  label: string;
  systems: SymbolicSystemId[];
  window: string;
  evidence: PatternEvidence[];
}

export interface TemporalAlignment {
  id: string;
  window: string;
  systems: SymbolicSystemId[];
  events: PatternEvidence[];
}

export interface SystemDominance {
  system: SymbolicSystemId;
  ratio: number;
  count: number;
  notes: string;
}

export interface SymbolicCrossDataset {
  patientId: string;
  events: SymbolicCrossEvent[];
  windowDays: number;
  patterns: CrossPattern[];
  temporal: TemporalAlignment[];
  dominance: SystemDominance[];
  notes?: string;
}
