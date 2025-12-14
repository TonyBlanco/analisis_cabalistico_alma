'use client';

import { useState } from 'react';
import { TAROT_ARCANA, getArcanaByPath, type TarotArcana } from '@/data/tarot-arcana';
import { X, Sparkles } from 'lucide-react';

/**
 * Componente interactivo del Árbol de la Vida con los 22 Senderos del Tarot
 * Al pasar el mouse sobre un sendero, muestra la carta correspondiente
 */

interface Sefirah {
  id: string;
  name: string;
  nameEs: string;
  x: number;
  y: number;
}

interface Path {
  from: string;
  to: string;
  arcana: TarotArcana;
  pathId: string;
}

const SEFIROT: Sefirah[] = [
  { id: 'Keter', name: 'Keter', nameEs: 'Corona', x: 50, y: 5 },
  { id: 'Chokmah', name: 'Chokmah', nameEs: 'Sabiduría', x: 75, y: 20 }, // DERECHA (corregido)
  { id: 'Binah', name: 'Binah', nameEs: 'Entendimiento', x: 25, y: 20 }, // IZQUIERDA (corregido)
  { id: 'Chesed', name: 'Chesed', nameEs: 'Misericordia', x: 85, y: 40 }, // DERECHA (corregido)
  { id: 'Gevurah', name: 'Gevurah', nameEs: 'Severidad', x: 15, y: 40 }, // IZQUIERDA (corregido)
  { id: 'Tiferet', name: 'Tiferet', nameEs: 'Belleza', x: 50, y: 50 },
  { id: 'Netzach', name: 'Netzach', nameEs: 'Victoria', x: 75, y: 70 }, // DERECHA (corregido)
  { id: 'Hod', name: 'Hod', nameEs: 'Gloria', x: 25, y: 70 }, // IZQUIERDA (corregido)
  { id: 'Yesod', name: 'Yesod', nameEs: 'Fundamento', x: 50, y: 85 },
  { id: 'Malkuth', name: 'Malkuth', nameEs: 'Reino', x: 50, y: 98 }
];

interface TreeOfLifeTarotProps {
  onArcanaSelect?: (arcana: TarotArcana) => void;
  highlightPath?: { from: string; to: string } | null;
}

export default function TreeOfLifeTarot({ onArcanaSelect, highlightPath }: TreeOfLifeTarotProps = {}) {
  const [hoveredPath, setHoveredPath] = useState<Path | null>(null);
  const [selectedArcana, setSelectedArcana] = useState<TarotArcana | null>(null);

  // Construir los senderos basados en los arcanos
  const paths: Path[] = TAROT_ARCANA.map(arcana => ({
    from: arcana.sefirot.from,
    to: arcana.sefirot.to,
    arcana,
    pathId: `path-${arcana.sefirot.from}-${arcana.sefirot.to}`
  }));

  const getSefirah = (id: string): Sefirah => {
    return SEFIROT.find(s => s.id === id) || SEFIROT[0];
  };

  const handlePathHover = (path: Path) => {
    setHoveredPath(path);
  };

  const handlePathClick = (path: Path) => {
    setSelectedArcana(path.arcana);
    if (onArcanaSelect) {
      onArcanaSelect(path.arcana);
    }
  };

  return (
    <div className="relative w-full">
      {/* SVG del Árbol de la Vida */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl p-8 border-2 border-purple-300/50">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto"
          style={{ minHeight: '600px' }}
        >
          {/* Definiciones para efectos */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#A8DADC" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Dibujar senderos (líneas) */}
          {paths.map((path) => {
            const fromSefirah = getSefirah(path.from);
            const toSefirah = getSefirah(path.to);
            const midX = (fromSefirah.x + toSefirah.x) / 2;
            const midY = (fromSefirah.y + toSefirah.y) / 2;
            
            // Verificar si este sendero está destacado (highlightPath)
            const isHighlighted = highlightPath && 
              ((path.from === highlightPath.from && path.to === highlightPath.to) ||
               (path.from === highlightPath.to && path.to === highlightPath.from));
            
            const isHovered = hoveredPath?.pathId === path.pathId;
            const shouldHighlight = isHovered || isHighlighted;

            return (
              <g key={path.pathId}>
                {/* Línea del sendero */}
                <line
                  x1={fromSefirah.x}
                  y1={fromSefirah.y}
                  x2={toSefirah.x}
                  y2={toSefirah.y}
                  stroke={shouldHighlight ? '#D4AF37' : '#A8DADC'}
                  strokeWidth={shouldHighlight ? '1' : '0.5'}
                  strokeOpacity={shouldHighlight ? '1' : '0.4'}
                  filter={shouldHighlight ? 'url(#glow)' : ''}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => handlePathHover(path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  onClick={() => handlePathClick(path)}
                />
                
                {/* Número de la carta en el medio del sendero */}
                {(isHovered || isHighlighted) && (
                  <g>
                    <circle
                      cx={midX}
                      cy={midY}
                      r={isHighlighted ? "4" : "3"}
                      fill={isHighlighted ? "#D4AF37" : "#D4AF37"}
                      filter="url(#glow)"
                      className="pointer-events-none"
                    />
                    <text
                      x={midX}
                      y={midY + 0.8}
                      textAnchor="middle"
                      fontSize={isHighlighted ? "2.5" : "2"}
                      fill="white"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {path.arcana.number}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Dibujar Sefirot (círculos) */}
          {SEFIROT.map((sefirah) => (
            <g key={sefirah.id}>
              {/* Círculo exterior con glow */}
              <circle
                cx={sefirah.x}
                cy={sefirah.y}
                r="5"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.2"
                strokeOpacity="0.3"
                filter="url(#glow)"
                className="pointer-events-none"
              />
              {/* Círculo principal */}
              <circle
                cx={sefirah.x}
                cy={sefirah.y}
                r="4"
                fill="#D4AF37"
                stroke="#A8DADC"
                strokeWidth="0.4"
                filter="url(#glow)"
                className="cursor-pointer hover:r-5 transition-all"
              />
              {/* Nombre en español */}
              <text
                x={sefirah.x}
                y={sefirah.y - 7}
                textAnchor="middle"
                fontSize="2.8"
                fill="#E2E8F0"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {sefirah.nameEs}
              </text>
              {/* Nombre en hebreo */}
              <text
                x={sefirah.x}
                y={sefirah.y + 9}
                textAnchor="middle"
                fontSize="1.8"
                fill="#A8DADC"
                className="pointer-events-none"
              >
                {sefirah.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip flotante con información de la carta */}
        {hoveredPath && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-2xl p-4 border-2 border-purple-200 max-w-xs z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-purple-600">
                {hoveredPath.arcana.number}
              </span>
              <div>
                <h4 className="font-bold text-gray-900">{hoveredPath.arcana.nameEs}</h4>
                <p className="text-xs text-gray-600">{hoveredPath.arcana.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Sendero:</strong> {hoveredPath.arcana.sefirot.fromName} → {hoveredPath.arcana.sefirot.toName}
            </p>
            <p className="text-xs text-gray-600 italic">
              {hoveredPath.arcana.meaning}
            </p>
            <p className="text-xs text-purple-700 mt-2 font-medium">
              💡 {hoveredPath.arcana.therapeuticMessage}
            </p>
          </div>
        )}
      </div>

      {/* Modal de carta seleccionada */}
      {selectedArcana && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedArcana(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <span className="text-3xl font-bold">{selectedArcana.number}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedArcana.nameEs}</h2>
                      <p className="text-purple-100">{selectedArcana.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArcana(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="inline-block px-6 py-3 bg-purple-100 rounded-lg mb-4">
                    <span className="text-4xl font-serif" dir="rtl">
                      {selectedArcana.hebrewLetter}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600">
                    Sendero: <strong>{selectedArcana.sefirot.fromName}</strong> → <strong>{selectedArcana.sefirot.toName}</strong>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Significado:</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedArcana.meaning}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Mensaje Terapéutico:
                  </h3>
                  <p className="text-purple-800 leading-relaxed">{selectedArcana.therapeuticMessage}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Meditación:</h3>
                  <p className="text-blue-800 leading-relaxed italic">{selectedArcana.meditation}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

