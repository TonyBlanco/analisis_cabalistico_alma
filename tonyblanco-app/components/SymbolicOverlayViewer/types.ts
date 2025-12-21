export interface PatientContext {
  patientId: string;
  patientBirthDate?: Date;
  patientName?: string;
}

export interface SymbolicTimelineEvent {
  patientId: string;
  date: string;
  workspace: 'tarot';
  system: string;
  symbols: {
    cards?: string[];
    letters?: string[];
    sefirot?: string[];
    paths?: string[];
  };
  source: 'manual' | 'ai-prep';
  notes?: string;
}

export interface CrossPattern {
  id: string;
  label: string;
  systems: string[];
  window: string;
  evidence: Array<{
    sourceEventId: string;
    date: string;
    system: string;
    symbols: string[];
  }>;
}

export interface SymbolicOverlayData {
  patientContext: PatientContext;
  events: SymbolicTimelineEvent[];
  patterns: CrossPattern[];
}
