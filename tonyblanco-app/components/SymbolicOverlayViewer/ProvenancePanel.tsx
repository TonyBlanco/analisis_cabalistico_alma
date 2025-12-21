'use client';

import type { CrossPattern } from './types';

interface ProvenancePanelProps {
  pattern?: CrossPattern | null;
}

export default function ProvenancePanel({ pattern }: ProvenancePanelProps) {
  if (!pattern) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-500">
        Selecciona un patron para ver su procedencia.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600">
      <div className="font-semibold text-gray-800">Procedencia</div>
      <div className="mt-2 space-y-2">
        {pattern.evidence.map((evidence) => (
          <div key={evidence.sourceEventId} className="space-y-1">
            <div className="text-[11px] text-gray-500">
              {evidence.system} · {evidence.date}
            </div>
            <div>{evidence.symbols.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
