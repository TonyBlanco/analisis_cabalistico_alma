import type { SefiraId } from './definitions';

export interface SefiraMeaning {
  id: SefiraId;
  light: string;
  shadow: string;
  tikkun: string;
}

export const SEFIROT_MEANINGS: SefiraMeaning[] = [];
