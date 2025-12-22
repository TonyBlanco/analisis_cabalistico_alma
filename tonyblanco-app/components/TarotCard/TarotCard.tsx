'use client';

import { memo, useCallback } from 'react';
import type { TarotCardData, TarotCardSize } from './TarotCard.types';
import './TarotCard.css';

interface TarotCardProps {
  card: TarotCardData;
  index?: number;
  size?: TarotCardSize;
  isInteractive?: boolean;
  isSelected?: boolean;
  showDetails?: boolean;
  showTitle?: boolean;
  showContent?: boolean;
  onSelect?: (card: TarotCardData) => void;
}

const SIZE_CLASSES: Record<TarotCardSize, string> = {
  small: 'w-24 h-40',
  medium: 'w-32 h-56',
  large: 'w-48 h-80',
};

function TarotCard({
  card,
  index = 0,
  size = 'medium',
  isInteractive = true,
  isSelected = false,
  showDetails = false,
  showTitle = true,
  showContent = true,
  onSelect,
}: TarotCardProps) {
  const handleClick = useCallback(() => {
    if (!isInteractive || !onSelect) return;
    onSelect(card);
  }, [card, isInteractive, onSelect]);

  return (
    <div
      className={`tarot-card ${SIZE_CLASSES[size]} ${
        isSelected ? 'selected' : ''
      } ${isInteractive ? 'interactive' : ''}`}
      onClick={handleClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      aria-pressed={isSelected}
      style={{ zIndex: index }}
      data-card-id={card.id}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-border">
            <div className="card-image-container">
              {card.imageUrl ? (
                <img src={card.imageUrl} alt={card.name} className="card-image" />
              ) : (
                <div className="card-image flex items-center justify-center text-xs text-gray-300">
                  Sin imagen
                </div>
              )}
            </div>
            {showContent && (
              <div className="card-content">
                <div className="card-header">
                  <span className="card-number">{card.number ?? ''}</span>
                  {showTitle && <h3 className="card-title">{card.name}</h3>}
                  <span className="card-symbol">{card.arcana ?? ''}</span>
                </div>
                {showDetails && (
                  <div className="card-details">
                    {card.element && (
                      <div className="card-element">
                        <span className="element-text">{card.element}</span>
                      </div>
                    )}
                    {card.keywords?.length ? (
                      <div className="card-keywords">
                        {card.keywords.slice(0, 3).map((keyword) => (
                          <span key={`${card.id}-${keyword}`} className="keyword-tag">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="card-back">
          <div className="back-text">Tarot</div>
        </div>
      </div>
    </div>
  );
}

export default memo(TarotCard);
