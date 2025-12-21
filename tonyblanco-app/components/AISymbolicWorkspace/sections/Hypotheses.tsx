'use client';

import type { SymbolicCrossAnalysis } from '../types';

interface HypothesesProps {
  analysis: SymbolicCrossAnalysis;
}

export default function Hypotheses({ analysis }: HypothesesProps) {
  const systemsLabel = analysis.systems.join(', ');
  const cards = analysis.cards?.map((card) => card.name || card.id).join(', ');
  const sefirot = analysis.sefirot?.map((item) => item.name || item.id).join(', ');

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Hipotesis (borrador)</h3>
      <p className="mt-1 text-xs text-gray-500">
        Lenguaje tentativo, sin afirmaciones clinicas.
      </p>
      <ul className="mt-3 space-y-2 text-xs text-gray-600">
        <li>
          Podria explorarse una lectura comparativa entre los sistemas: {systemsLabel}.
        </li>
        {cards ? (
          <li>
            Podria revisarse la relacion entre las cartas observadas: {cards}.
          </li>
        ) : null}
        {sefirot ? (
          <li>
            Podria evaluarse un eje simbolico relacionado con: {sefirot}.
          </li>
        ) : null}
        <li>
          Podria mantenerse el enfoque en patrones simbolicos sin interpretacion clinica.
        </li>
      </ul>
    </section>
  );
}
