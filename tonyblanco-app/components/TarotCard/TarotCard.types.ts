export type TarotCardSize = 'small' | 'medium' | 'large';
export type TarotCardOrientation = 'upright' | 'reversed';

export interface TarotCardData {
  id: string;
  name: string;
  number?: string | number;
  arcana?: string;
  element?: string;
  orientation?: TarotCardOrientation;
  imageUrl?: string;
  keywords?: string[];
  description?: string;
  sefirahId?: string;
}
