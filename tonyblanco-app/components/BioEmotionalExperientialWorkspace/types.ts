export type WorkspaceState = 'observation' | 'analysis' | 'synthesis' | 'closure';

export type BodyAnatomy = 'male' | 'female' | 'intersex' | 'unknown';

export interface ExperientialContext {
  patientId: number | null;
  patientName: string | null;
  biologicalSex: BodyAnatomy;
  sessionLabel: string;
}
