'use client';

import type { WorkspaceState } from './types';

interface ExperientialSidebarProps {
  state: WorkspaceState;
  onStateChange: (state: WorkspaceState) => void;
}

const stateLabels: Record<WorkspaceState, string> = {
  observation: 'Observacion',
  analysis: 'Analisis',
  synthesis: 'Sintesis',
  closure: 'Cierre',
};

export default function ExperientialSidebar({ state, onStateChange }: ExperientialSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Bio-Emocion Experiencial</p>
        <h2 className="text-lg font-semibold text-gray-900">Workspace profundo</h2>
      </div>
      <div className="flex-1 px-3 py-4 space-y-2">
        {(Object.keys(stateLabels) as WorkspaceState[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onStateChange(key)}
            className={`w-full text-left rounded-md px-3 py-2 text-sm border transition-colors ${
              state === key
                ? 'border-gray-300 bg-gray-100 text-gray-900'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <p className="text-sm font-medium">{stateLabels[key]}</p>
            <p className="text-[11px] text-gray-500">
              {key === 'observation' && 'Lectura consultiva del cuerpo vivido.'}
              {key === 'analysis' && 'Organizacion de patrones y referencias.'}
              {key === 'synthesis' && 'Integracion en notas humanas.'}
              {key === 'closure' && 'Cierre consciente del espacio de trabajo.'}
            </p>
          </button>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Este espacio no sustituye el juicio humano.
      </div>
    </aside>
  );
}
