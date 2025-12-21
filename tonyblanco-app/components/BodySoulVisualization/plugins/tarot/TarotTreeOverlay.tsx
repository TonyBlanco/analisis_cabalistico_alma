'use client';

import { useState } from 'react';
import type { DrawnCard } from './types';

interface TarotTreeOverlayProps {
  reading: DrawnCard[] | null;
  onCardSelect: (card: DrawnCard) => void;
  selectedCard: DrawnCard | null;
}

const SEFIROT_POSITIONS = {
  keter: { x: 50, y: 5 },
  chokmah: { x: 75, y: 20 },
  binah: { x: 25, y: 20 },
  chesed: { x: 75, y: 40 },
  gevurah: { x: 25, y: 40 },
  tiferet: { x: 50, y: 45 },
  netzach: { x: 75, y: 65 },
  hod: { x: 25, y: 65 },
  yesod: { x: 50, y: 75 },
  malkuth: { x: 50, y: 90 },
};

const SEFIROT_INFO = [
  { id: 'malkuth', name: 'Malkuth', spanishName: 'Reino', color: '#84cc16' },
  { id: 'yesod', name: 'Yesod', spanishName: 'Fundamento', color: '#a855f7' },
  { id: 'hod', name: 'Hod', spanishName: 'Esplendor', color: '#f97316' },
  { id: 'netzach', name: 'Netzach', spanishName: 'Victoria', color: '#22c55e' },
  { id: 'tiferet', name: 'Tiferet', spanishName: 'Belleza', color: '#eab308' },
  { id: 'gevurah', name: 'Gevurah', spanishName: 'Rigor', color: '#ef4444' },
  { id: 'chesed', name: 'Chesed', spanishName: 'Misericordia', color: '#3b82f6' },
  { id: 'binah', name: 'Binah', spanishName: 'Entendimiento', color: '#6366f1' },
  { id: 'chokmah', name: 'Chokmah', spanishName: 'Sabiduría', color: '#0ea5e9' },
  { id: 'keter', name: 'Keter', spanishName: 'Corona', color: '#94a3b8' },
];

export default function TarotTreeOverlay({
  reading,
  onCardSelect,
  selectedCard,
}: TarotTreeOverlayProps) {
  const [hoveredSefirah, setHoveredSefirah] = useState<string | null>(null);

  const getCardForSefirah = (sefirahId: string): DrawnCard | null => {
    if (!reading) return null;
    return reading.find(c => c.card.sefirah === sefirahId) || null;
  };

  const getSefirahIndex = (sefirahId: string): number => {
    if (!reading) return -1;
    return reading.findIndex(c => c.card.sefirah === sefirahId);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Árbol de la Vida con Cartas
        </h3>
        <div className="text-sm text-gray-600">
          Click en las Sefirot para ver detalles
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
        <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
          {/* Senderos (paths) */}
          <g className="paths" opacity="0.3">
            <line x1="50" y1="5" x2="50" y2="45" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="50" y1="45" x2="50" y2="75" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="50" y1="75" x2="50" y2="90" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="20" x2="75" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="75" y1="40" x2="75" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="25" y1="20" x2="25" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="40" x2="25" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="50" y1="5" x2="75" y2="20" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="50" y1="5" x2="25" y2="20" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="75" y1="20" x2="25" y2="20" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="20" x2="50" y2="45" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="20" x2="50" y2="45" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="75" y1="20" x2="25" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="20" x2="75" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="40" x2="50" y2="45" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="40" x2="50" y2="45" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="75" y1="40" x2="25" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="40" x2="25" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="40" x2="75" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="50" y1="45" x2="75" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="50" y1="45" x2="25" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="65" x2="50" y2="75" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="65" x2="50" y2="75" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="75" y1="65" x2="25" y2="65" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="75" y1="65" x2="50" y2="90" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="25" y1="65" x2="50" y2="90" stroke="#94a3b8" strokeWidth="0.5" />
          </g>

          {/* Sefirot con cartas */}
          {SEFIROT_INFO.map((sefirah) => {
            const pos = SEFIROT_POSITIONS[sefirah.id as keyof typeof SEFIROT_POSITIONS];
            const card = getCardForSefirah(sefirah.id);
            const index = getSefirahIndex(sefirah.id);
            const isHovered = hoveredSefirah === sefirah.id;
            const isSelected = selectedCard?.card.sefirah === sefirah.id;
            const hasCard = card !== null;

            return (
              <g
                key={sefirah.id}
                className="sefirah-group cursor-pointer"
                onMouseEnter={() => setHoveredSefirah(sefirah.id)}
                onMouseLeave={() => setHoveredSefirah(null)}
                onClick={() => card && onCardSelect(card)}
              >
                {/* Glow effect cuando tiene carta */}
                {hasCard && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="6"
                    fill={sefirah.color}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Círculo principal */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={hasCard ? sefirah.color : '#f1f5f9'}
                  stroke={isSelected ? '#8b5cf6' : isHovered ? '#a78bfa' : '#cbd5e1'}
                  strokeWidth={isSelected ? '0.8' : isHovered ? '0.6' : '0.4'}
                  className="transition-all"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))' : 'none'
                  }}
                />

                {/* Nombre de la Sefirá */}
                <text
                  x={pos.x}
                  y={pos.y + 7}
                  textAnchor="middle"
                  fontSize="2.5"
                  fontWeight="600"
                  fill={hasCard ? '#374151' : '#9ca3af'}
                  className="pointer-events-none"
                >
                  {sefirah.spanishName}
                </text>

                {/* Número de posición si tiene carta */}
                {hasCard && index >= 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 0.8}
                    textAnchor="middle"
                    fontSize="2"
                    fontWeight="700"
                    fill="white"
                    className="pointer-events-none"
                  >
                    {index + 1}
                  </text>
                )}

                {/* Tooltip con nombre de carta */}
                {hasCard && isHovered && (
                  <g>
                    <rect
                      x={pos.x - 15}
                      y={pos.y - 12}
                      width="30"
                      height="8"
                      fill="rgba(0, 0, 0, 0.9)"
                      rx="1"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 7}
                      textAnchor="middle"
                      fontSize="2"
                      fill="white"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {card.card.spanishName}
                    </text>
                    {card.reversed && (
                      <text
                        x={pos.x}
                        y={pos.y - 4.5}
                        textAnchor="middle"
                        fontSize="1.5"
                        fill="#fca5a5"
                        className="pointer-events-none"
                      >
                        (Invertida)
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {SEFIROT_INFO.map((sefirah) => {
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
                {card && (
                  <div className="text-xs text-gray-500 truncate">
                    {card.card.spanishName}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pilares info */}
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