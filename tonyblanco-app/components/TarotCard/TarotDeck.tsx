'use client';

import { useMemo, useState } from 'react';
import TarotCard from './TarotCard';
import type { TarotCardData } from './TarotCard.types';
import './TarotDeck.css';

type TarotDeckCard = TarotCardData | { card: TarotCardData } | { card: TarotCardData; id?: string };

interface TarotDeckProps {
  cards: TarotDeckCard[];
  layout?: 'spread' | 'grid' | 'fan' | 'stack';
  spreadType?: 'three-card' | 'celtic-cross' | 'single';
  onCardSelect?: (card: TarotCardData) => void;
  interactive?: boolean;
}

export default function TarotDeck({
  cards,
  layout = 'grid',
  spreadType = 'three-card',
  onCardSelect,
  interactive = true,
}: TarotDeckProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const normalizedCards = useMemo<TarotCardData[]>(() => {
    return cards.map((card) => {
      if ('card' in card) {
        const inner = card.card;
        return {
          id: inner.id || ('id' in card && card.id) || '',
          name: inner.name || 'Carta',
          number: inner.number,
          arcana: inner.arcana,
          element: inner.element,
          orientation: inner.orientation,
          imageUrl: inner.imageUrl,
          keywords: inner.keywords,
          description: inner.description,
        };
      }
      return card;
    });
  }, [cards]);

  const handleCardSelect = (card: TarotCardData) => {
    setSelectedCardId(card.id);
    onCardSelect?.(card);
  };

  const layoutClass = useMemo(() => {
    switch (layout) {
      case 'spread':
        return spreadType === 'three-card' ? 'three-card-spread' : 'celtic-cross-spread';
      case 'fan':
        return 'fan-layout';
      case 'stack':
        return 'stack-layout';
      case 'grid':
      default:
        return 'grid-layout';
    }
  }, [layout, spreadType]);

  return (
    <div className={`tarot-deck ${layoutClass}`}>
      {normalizedCards.map((card, index) => (
        <div
          key={card.id}
          className="deck-card-wrapper"
          style={
            {
              '--card-index': index,
              '--card-count': normalizedCards.length,
            } as React.CSSProperties
          }
        >
          <TarotCard
            card={card}
            index={index}
            isInteractive={interactive}
            isSelected={selectedCardId === card.id}
            onSelect={handleCardSelect}
            size={layout === 'stack' ? 'small' : 'medium'}
            showDetails={layout === 'grid'}
          />
        </div>
      ))}
    </div>
  );
}
