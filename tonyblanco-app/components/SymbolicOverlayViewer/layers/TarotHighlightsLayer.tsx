'use client';

interface TarotHighlightsLayerProps {
  cards: string[];
  highlighted: string[];
}

export default function TarotHighlightsLayer({
  cards,
  highlighted,
}: TarotHighlightsLayerProps) {
  if (cards.length === 0) {
    return <p className="text-xs text-gray-500">Sin cartas registradas.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => {
        const isActive = highlighted.includes(card);
        return (
          <span
            key={card}
            className={`rounded-full border px-2 py-1 text-xs ${
              isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            {card}
          </span>
        );
      })}
    </div>
  );
}
