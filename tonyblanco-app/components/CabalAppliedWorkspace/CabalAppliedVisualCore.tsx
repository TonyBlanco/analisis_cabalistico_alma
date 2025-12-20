'use client';

import type { CabalSectionId } from './types';

interface CabalAppliedVisualCoreProps {
  activeSection: CabalSectionId;
}

export default function CabalAppliedVisualCore({ activeSection }: CabalAppliedVisualCoreProps) {
  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arbol de la Vida (visual only)</h3>
          <p className="text-xs text-gray-500">
            Placeholder observacional. Sin significado ni calculo.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 flex items-center justify-center">
        <svg viewBox="0 0 240 320" className="h-64 w-auto text-gray-400" role="img" aria-label="Arbol de la Vida">
          <circle cx="120" cy="40" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="80" cy="90" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="160" cy="90" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="120" cy="140" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="80" cy="190" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="160" cy="190" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="120" cy="240" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="80" cy="290" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="160" cy="290" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="120" y1="56" x2="80" y2="76" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="56" x2="160" y2="76" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="104" x2="120" y2="126" stroke="currentColor" strokeWidth="2" />
          <line x1="160" y1="104" x2="120" y2="126" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="154" x2="80" y2="176" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="154" x2="160" y2="176" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="204" x2="120" y2="226" stroke="currentColor" strokeWidth="2" />
          <line x1="160" y1="204" x2="120" y2="226" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="254" x2="80" y2="276" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="254" x2="160" y2="276" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}
