import type { SefiraId } from './definitions';

export interface SefiraCorrespondence {
  id: SefiraId;
  body?: string[];
  emotion?: string[];
  attributes?: string[];
}

export const SEFIROT_CORRESPONDENCES: SefiraCorrespondence[] = [];
