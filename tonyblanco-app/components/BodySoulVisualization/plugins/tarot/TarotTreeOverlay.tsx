'use client';

import { useMemo, useState } from 'react';
import SefirotInteractive, {
  SEFIROT_CANONICAL,
  type SefirotId,
} from '../../SefirotInteractive';
import type { DrawnCard } from './types';

interface TarotTreeOverlayProps {
  reading: DrawnCard[] | null;
  onCardSelect: (card: DrawnCard) => void;
  selectedCard: DrawnCard | null;
}

const SEFIROT_COLOR_MAP: Record<SefirotId, string> = {
  malkuth: '#84cc16',
  yesod: '#a855f7',
  hod: '#f97316',
  netzach: '#22c55e',
  tiferet: '#eab308',
  gevurah: '#ef4444',
  chesed: '#3b82f6',
  binah: '#6366f1',
  chokmah: '#0ea5e9',
  keter: '#94a3b8',
};

export default function TarotTreeOverlay({
  reading,
  onCardSelect,
  selectedCard,
}: TarotTreeOverlayProps) {
  const [hoveredSefirah, setHoveredSefirah] = useState<SefirotId | null>(null);

  const sefirahInfo = useMemo(
    () =>
      SEFIROT_CANONICAL.map((node) => ({
        id: node.id,
        cx: node.cx,
        cy: node.cy,
        spanishName: node.meaning,
        color: SEFIROT_COLOR_MAP[node.id],
      })),
    [],
  );

  const getCardForSefirah = (sefirahId: SefirotId): DrawnCard | null => {
    if (!reading) return null;
    return reading.find((card) => card.card.sefirah === sefirahId) ?? null;
  };

  const getSefirahIndex = (sefirahId: SefirotId): number => {
    if (!reading) return -1;
    return reading.findIndex((card) => card.card.sefirah === sefirahId);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Arbol de la Vida con Cartas
        </h3>
        <div className="text-sm text-gray-600">
          Click en las Sefirot para ver detalles
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
        <SefirotInteractive
          className="absolute inset-0 w-full h-full"
          showBackground={false}
          showPillarLabels={false}
          showPillarGuides={false}
          showHebrew={false}
          showLabels={false}
          showMeaning={false}
        >
          {sefirahInfo.map((sefirah) => {
            const card = getCardForSefirah(sefirah.id);
            const index = getSefirahIndex(sefirah.id);
            const isHovered = hoveredSefirah === sefirah.id;
            const isSelected = selectedCard?.card.sefirah === sefirah.id;
            const hasCard = card !== null;
            const radius = 12;
            const glowRadius = 18;

            return (
              <g
                key={sefirah.id}
                className="sefirah-group cursor-pointer"
                onMouseEnter={() => setHoveredSefirah(sefirah.id)}
                onMouseLeave={() => setHoveredSefirah(null)}
                onClick={() => card && onCardSelect(card)}
              >
                {hasCard ? (
                  <circle
                    cx={sefirah.cx}
                    cy={sefirah.cy}
                    r={glowRadius}
                    fill={sefirah.color}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                ) : null}

                <circle
                  cx={sefirah.cx}
                  cy={sefirah.cy}
                  r={radius}
                  fill={hasCard ? sefirah.color : '#f1f5f9'}
                  stroke={isSelected ? '#8b5cf6' : isHovered ? '#a78bfa' : '#cbd5e1'}
                  strokeWidth={isSelected ? 2.4 : isHovered ? 2 : 1.4}
                  className="transition-all"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' : 'none',
                  }}
                />

                <text
                  x={sefirah.cx}
                  y={sefirah.cy + 28}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={hasCard ? '#374151' : '#9ca3af'}
                  className="pointer-events-none"
                >
                  {sefirah.spanishName}
                </text>

                {hasCard && index >= 0 ? (
                  <text
                    x={sefirah.cx}
                    y={sefirah.cy + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="white"
                    className="pointer-events-none"
                  >
                    {index + 1}
                  </text>
                ) : null}

                {hasCard && isHovered ? (
                  <g>
                    <rect
                      x={sefirah.cx - 70}
                      y={sefirah.cy - 34}
                      width="140"
                      height="24"
                      fill="rgba(0, 0, 0, 0.9)"
                      rx="4"
                    />
                    <text
                      x={sefirah.cx}
                      y={sefirah.cy - 18}
                      textAnchor="middle"
                      fontSize="9"
                      fill="white"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {card.card.spanishName}
                    </text>
                    {card.reversed ? (
                      <text
                        x={sefirah.cx}
                        y={sefirah.cy - 6}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#fca5a5"
                        className="pointer-events-none"
                      >
                        (Invertida)
                      </text>
                    ) : null}
                  </g>
                ) : null}
              </g>
            );
          })}
        </SefirotInteractive>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {sefirahInfo.map((sefirah) => {
          const card = getCardForSefirah(sefirah.id);
          return (
            <div
              key={sefirah.id}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                card ? 'border-gray-200 hover:border-purple-300 hover:shadow-md' : 'border-gray-100 opacity-50'
              }`}
              onClick={() => card && onCardSelect(card)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: card ? sefirah.color : '#e5e7eb' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">
                  {sefirah.spanishName}
                </div>
                {card ? (
                  <div className="text-xs text-gray-500 truncate">
                    {card.card.spanishName}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-semibold text-red-800 mb-1">Severidad</div>
          <div className="text-xs text-red-600">Binah, Gevurah, Hod</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-xs font-semibold text-amber-800 mb-1">Equilibrio</div>
          <div className="text-xs text-amber-600">Keter, Tiferet, Yesod, Malkuth</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-800 mb-1">Misericordia</div>
          <div className="text-xs text-blue-600">Chokmah, Chesed, Netzach</div>
        </div>
      </div>
    </div>
  );
}
