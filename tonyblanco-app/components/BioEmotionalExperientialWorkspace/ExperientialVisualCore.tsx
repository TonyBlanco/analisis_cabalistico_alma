'use client';

import type { BodyAnatomy, WorkspaceState } from './types';

interface ExperientialVisualCoreProps {
  anatomy: BodyAnatomy;
  state: WorkspaceState;
}

const anatomyLabel: Record<BodyAnatomy, string> = {
  male: 'Anatomia masculina',
  female: 'Anatomia femenina',
  intersex: 'Anatomia intersexual',
  unknown: 'Anatomia neutral',
};

export default function ExperientialVisualCore({ anatomy, state }: ExperientialVisualCoreProps) {
  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cuerpo experiencial</h3>
          <p className="text-xs text-gray-500">
            Vista 2D consultiva. No diagnostica ni automatiza conclusiones.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estado</p>
          <p className="text-sm font-medium text-gray-800 capitalize">{state}</p>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center gap-4">
        <svg
          viewBox="0 0 200 320"
          className="h-64 w-auto text-gray-400"
          role="img"
          aria-label={anatomyLabel[anatomy]}
        >
          <circle cx="100" cy="40" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="70" y="70" width="60" height="90" rx="28" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="45" y="95" width="25" height="70" rx="12" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="130" y="95" width="25" height="70" rx="12" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="78" y="160" width="20" height="90" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="102" y="160" width="20" height="90" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">{anatomyLabel[anatomy]}</p>
          <p className="text-xs text-gray-500">
            Seleccion basada en sexo biologico. Identidad de genero no altera esta vista.
          </p>
        </div>
      </div>
    </section>
  );
}
