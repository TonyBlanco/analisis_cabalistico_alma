'use client';

import type { CrossPattern } from '../types';

interface CrossPatternsProps {
  patterns: CrossPattern[];
}

export default function CrossPatterns({ patterns }: CrossPatternsProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Patrones cruzados</h3>
      <p className="mt-1 text-xs text-gray-500">
        Coincidencias observables entre sistemas simbolicos.
      </p>
      {patterns.length === 0 ? (
        <p className="mt-3 text-xs text-gray-500">
          Sin patrones cruzados detectados en esta ventana.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-xs text-gray-600">
          {patterns.map((pattern) => (
            <li key={pattern.id} className="space-y-1">
              <div className="font-medium text-gray-700">{pattern.label}</div>
              <div className="text-[11px] text-gray-500">
                Sistemas: {pattern.systems.join(', ')}
              </div>
              <div className="text-[11px] text-gray-500">
                Ventana: {pattern.window}
              </div>
              <div className="text-[11px] text-gray-500">
                Evidencia:{' '}
                {pattern.evidence
                  .map(
                    (item) =>
                      `${item.system} @ ${item.date.split('T')[0]}: ${item.symbols.join(', ')}`
                  )
                  .join(' | ')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
