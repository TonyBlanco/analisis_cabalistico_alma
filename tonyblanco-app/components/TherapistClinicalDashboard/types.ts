export type ContextSectionId =
  | 'overview'
  | 'clinical-history'
  | 'bioemotional'
  | 'visualization'
  | 'evaluations'
  | 'integrative-notes';

export interface ContextSection {
  id: ContextSectionId;
  label: string;
  description: string;
}

export interface IntegrativeNote {
  id: string;
  text: string;
  createdAt: string;
}
