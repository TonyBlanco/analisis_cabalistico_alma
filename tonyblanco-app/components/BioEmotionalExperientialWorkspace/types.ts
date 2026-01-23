export type WorkspaceState = 'observation' | 'analysis' | 'synthesis' | 'closure';

export type BodyAnatomy = 'male' | 'female' | 'intersex' | 'unknown';

export interface ExperientialContext {
  patientId: number | null;
  patientName: string | null;
  biologicalSex: BodyAnatomy;
  sessionLabel: string;
}

/**
 * Progress tracking for each workspace phase (0-100)
 */
export interface WorkspaceProgress {
  observation: number;
  analysis: number;
  synthesis: number;
  closure: number;
}
