export type SymbolicSystemId = 'tarot' | 'tree' | 'astrology';

export interface SymbolicCrossEvent {
  date: string;
  system: SymbolicSystemId;
  symbols: string[];
  notes?: string;
}

export interface CrossPattern {
  id: string;
  label: string;
  systems: SymbolicSystemId[];
  evidence: string[];
}

export interface TemporalAlignment {
  id: string;
  window: string;
  systems: SymbolicSystemId[];
  observations: string[];
}

export interface SystemDominance {
  system: SymbolicSystemId;
  ratio: number;
  notes: string;
}

export interface SymbolicCrossDataset {
  patientId: string;
  events: SymbolicCrossEvent[];
  patterns: CrossPattern[];
  temporal: TemporalAlignment[];
  dominance: SystemDominance[];
  notes?: string;
}
