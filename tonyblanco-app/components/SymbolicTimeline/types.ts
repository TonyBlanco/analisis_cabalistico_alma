export type SymbolicSystemId =
  | 'thoth'
  | 'golden-dawn'
  | 'bota'
  | 'hermetic'
  | 'sephiroth';

export type SymbolicEventSource = 'manual' | 'ai-prep';

export interface SymbolicTimelineEvent {
  patientId: string;
  date: string;
  workspace: 'tarot';
  system: SymbolicSystemId;
  symbols: {
    cards?: string[];
    letters?: string[];
    sefirot?: string[];
    paths?: string[];
  };
  notes?: string;
  source: SymbolicEventSource;
}
