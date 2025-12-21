'use client';

interface AstrologyHighlightsLayerProps {
  dates: string[];
  highlightedDates: string[];
  tokens: string[];
}

export default function AstrologyHighlightsLayer({
  dates,
  highlightedDates,
  tokens,
}: AstrologyHighlightsLayerProps) {
  if (dates.length === 0) {
    return <p className="text-xs text-gray-500">Sin eventos temporales registrados.</p>;
  }

  return (
    <div className="space-y-3 text-xs text-gray-600">
      <div className="flex flex-wrap gap-2">
        {dates.map((date) => {
          const isActive = highlightedDates.includes(date);
          return (
            <span
              key={date}
              className={`rounded-full border px-2 py-1 ${
                isActive
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {date}
            </span>
          );
        })}
      </div>
      {tokens.length > 0 && (
        <div>
          <div className="font-medium text-gray-700">Tokens</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {tokens.map((token) => (
              <span
                key={token}
                className="rounded-full border border-gray-200 bg-white px-2 py-1 text-gray-600"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
