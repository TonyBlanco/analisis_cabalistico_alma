export type SefiraId =
  | 'keter' | 'chokmah' | 'binah'
  | 'chesed' | 'gevurah' | 'tiferet'
  | 'netzach' | 'hod' | 'yesod' | 'malchut';

export interface SefiraDefinition {
  id: SefiraId;
  name: string;
  hebrew?: string;
  essence: string;
}

export const SEFIROT_DEFINITIONS: SefiraDefinition[] = [];
