'use client';

import type { AISymbolicContext } from '../types';

interface ObservationsProps {
  context: AISymbolicContext;
}

export default function Observations({ context }: ObservationsProps) {
  const cards = context.cards?.map((card) => card.name || card.id).join(', ');
  const letters = context.letters?.map((letter) => letter.name).join(', ');
  const sefirot = context.sefirot?.map((item) => item.name || item.id).join(', ');
  const paths = context.paths?.map((path) => path.label).join(', ');

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Observaciones</h3>
      <p className="mt-1 text-xs text-gray-500">
        Sintesis descriptiva basada en datos simbolicos disponibles.
      </p>
      <div className="mt-3 space-y-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Sistema activo:</span> {context.system}
        </div>
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
        {context.intent ? (
          <div>
            <span className="font-medium">Intencion:</span> {context.intent}
          </div>
        ) : null}
      </div>
    </section>
  );
}
