'use client';

import type { SymbolicCrossAnalysis } from '../types';

interface SymbolicLinksProps {
  analysis: SymbolicCrossAnalysis;
}

export default function SymbolicLinks({ analysis }: SymbolicLinksProps) {
  const cards = analysis.cards?.map((card) => card.name || card.id).join(', ');
  const letters = analysis.letters?.map((letter) => letter.name).join(', ');
  const sefirot = analysis.sefirot?.map((item) => item.name || item.id).join(', ');
  const paths = analysis.paths?.map((path) => path.label).join(', ');

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Vinculos simbolicos</h3>
      <p className="mt-1 text-xs text-gray-500">
        Mapa descriptivo de referencias disponibles.
      </p>
      <div className="mt-3 space-y-2 text-xs text-gray-600">
        {cards ? (
          <div>
            <span className="font-medium">Cartas:</span> {cards}
          </div>
        ) : null}
        {letters ? (
          <div>
            <span className="font-medium">Letras:</span> {letters}
          </div>
        ) : null}
        {sefirot ? (
          <div>
            <span className="font-medium">Sefirot:</span> {sefirot}
          </div>
        ) : null}
        {paths ? (
          <div>
            <span className="font-medium">Senderos:</span> {paths}
          </div>
        ) : null}
      </div>
    </section>
  );
}
