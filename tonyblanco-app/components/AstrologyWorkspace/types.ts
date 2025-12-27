export type AstrologyViewMode = 'visual' | 'training';

export type AstrologyWorkspaceMode = 'observational' | 'training';

export interface AstrologyContext {
  patientId?: string;
  patientBirthDate?: Date;
  activeView: AstrologyViewMode;
}
