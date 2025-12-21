import TarotCardGrid from './TarotCardGrid';
import TarotLayer from './TarotLayer';
import TarotTreeOverlay from './TarotTreeOverlay';

export const tarotPlugin = {
  id: 'tarot',
  Layer: TarotLayer,
  TreeOverlay: TarotTreeOverlay,
  CardGrid: TarotCardGrid
};

export { TarotCardGrid, TarotLayer, TarotTreeOverlay };
export * from './tarot.logic';
export * from './types';
