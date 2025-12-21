export type AstrologyViewMode = 'visual' | 'correspondences' | 'synthesis';

export interface AstrologyContext {
  patientId?: string;
  patientBirthDate?: Date;
  activeView: AstrologyViewMode;
}
