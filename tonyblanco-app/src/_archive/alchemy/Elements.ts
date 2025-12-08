export type ElementId = 'fire' | 'earth' | 'air' | 'water' | 'ether';

export interface Element {
  id: ElementId;
  name: { en?: string; es?: string };
  symbol?: string;
}

export default {} as Record<ElementId, Element>;
