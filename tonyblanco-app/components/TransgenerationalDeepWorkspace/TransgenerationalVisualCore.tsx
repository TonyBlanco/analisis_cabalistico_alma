'use client';

import type { TransgenerationalSectionId } from './types';

interface TransgenerationalVisualCoreProps {
  activeSection: TransgenerationalSectionId;
}

export default function TransgenerationalVisualCore({
  activeSection,
}: TransgenerationalVisualCoreProps) {
  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arbol Genealogico (placeholder)</h3>
          <p className="text-xs text-gray-500">
            Observacional. Sin inferencia, sin generacion, sin diagnostico.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 flex items-center justify-center">
        <svg viewBox="0 0 320 220" className="h-56 w-auto text-gray-400" role="img" aria-label="Arbol genealogico">
          <circle cx="60" cy="40" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="160" cy="40" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="260" cy="40" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="110" cy="120" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="210" cy="120" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="160" cy="190" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="60" y1="56" x2="110" y2="104" stroke="currentColor" strokeWidth="2" />
          <line x1="160" y1="56" x2="110" y2="104" stroke="currentColor" strokeWidth="2" />
          <line x1="160" y1="56" x2="210" y2="104" stroke="currentColor" strokeWidth="2" />
          <line x1="260" y1="56" x2="210" y2="104" stroke="currentColor" strokeWidth="2" />
          <line x1="110" y1="136" x2="160" y2="174" stroke="currentColor" strokeWidth="2" />
          <line x1="210" y1="136" x2="160" y2="174" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}
