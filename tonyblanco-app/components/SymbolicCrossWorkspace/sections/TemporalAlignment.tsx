'use client';

import type { TemporalAlignment } from '../types';

interface TemporalAlignmentProps {
  alignments: TemporalAlignment[];
}

export default function TemporalAlignmentSection({
  alignments,
}: TemporalAlignmentProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Alineacion temporal</h3>
      <p className="mt-1 text-xs text-gray-500">
        Ventanas temporales con actividad simbolica concurrente.
      </p>
      {alignments.length === 0 ? (
        <p className="mt-3 text-xs text-gray-500">
          Sin alineaciones temporales en esta ventana.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-xs text-gray-600">
          {alignments.map((alignment) => (
            <li key={alignment.id} className="space-y-1">
              <div className="font-medium text-gray-700">{alignment.window}</div>
              <div className="text-[11px] text-gray-500">
                Sistemas: {alignment.systems.join(', ')}
              </div>
              <div className="text-[11px] text-gray-500">
                Observaciones: {alignment.observations.join(' | ')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
