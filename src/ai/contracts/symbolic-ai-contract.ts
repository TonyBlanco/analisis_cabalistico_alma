export type SymbolicSystemId =
  | 'thoth'
  | 'golden-dawn'
  | 'bota'
  | 'hermetic'
  | 'sephiroth';

export type SymbolicEventSource = 'manual' | 'ai-prep';

export type AIRequestIntent =
  | 'exploratorio'
  | 'integrativo'
  | 'evolutivo';

export interface TarotCardRef {
  id: string;
  name?: string;
  number?: number;
  system?: SymbolicSystemId;
}

export interface HebrewLetterRef {
  name: string;
  gematria?: number;
  glyph?: string;
}

export interface SefirahRef {
  id: string;
  name?: string;
}

export interface PathRef {
  label: string;
  from?: string;
  to?: string;
}

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

export interface AISymbolicContext {
  patientId: string;
  timestamp: string;
  system: SymbolicSystemId;
  timeline: SymbolicTimelineEvent[];
  cards?: TarotCardRef[];
  letters?: HebrewLetterRef[];
  sefirot?: SefirahRef[];
  paths?: PathRef[];
  intent?: AIRequestIntent;
  notes?: string;
}

export interface SymbolicCrossAnalysis {
  systems: SymbolicSystemId[];
  cards?: TarotCardRef[];
  letters?: HebrewLetterRef[];
  sefirot?: SefirahRef[];
  paths?: PathRef[];
  timeline?: SymbolicTimelineEvent[];
  intent?: AIRequestIntent;
}
