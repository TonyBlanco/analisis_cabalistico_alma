'use client';

import type { WorkspaceState, WorkspaceProgress } from './types';

interface ExperientialSidebarProps {
  state: WorkspaceState;
  onStateChange: (state: WorkspaceState) => void;
  progress?: WorkspaceProgress;
}

const stateLabels: Record<WorkspaceState, string> = {
  observation: 'Observación',
  analysis: 'Análisis',
  synthesis: 'Síntesis',
  closure: 'Cierre',
};

const stateIcons: Record<WorkspaceState, string> = {
  observation: '👁️',
  analysis: '🔍',
  synthesis: '✨',
  closure: '🔒',
};

const stateDescriptions: Record<WorkspaceState, string> = {
  observation: 'Lectura consultiva del cuerpo vivido.',
  analysis: 'Organización de patrones y referencias.',
  synthesis: 'Integración en notas humanas.',
  closure: 'Cierre consciente del espacio de trabajo.',
};

const defaultProgress: WorkspaceProgress = {
  observation: 0,
  analysis: 0,
  synthesis: 0,
  closure: 0,
};

export default function ExperientialSidebar({ 
  state, 
  onStateChange,
  progress = defaultProgress,
}: ExperientialSidebarProps) {
  // Calculate overall progress
  const overallProgress = Math.round(
    (progress.observation + progress.analysis + progress.synthesis + progress.closure) / 4
  );

  return (
    <aside className="w-72 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header con gradiente */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
        <p className="text-xs uppercase tracking-wide text-white/80 font-medium">
          Bio-Emoción Experiencial
        </p>
        <h2 className="text-xl font-bold text-white mt-1">
          Workspace Profundo
        </h2>
      </div>

      {/* Progress Tracker */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        <p className="text-xs font-medium text-gray-600 mb-2">Progreso General</p>
        <div className="bio-progress">
          <div 
            className="bio-progress-bar"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {overallProgress}% completado
        </p>
      </div>

      {/* Estados con iconos y progreso individual */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto bio-scrollbar">
        {(Object.keys(stateLabels) as WorkspaceState[]).map((key, index) => {
          const isActive = state === key;
          const stateProgress = progress[key] || 0;
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStateChange(key)}
              className={`
                w-full text-left rounded-xl px-4 py-3 text-sm border-2 transition-all duration-300
                bio-animate-slide-in-right bio-stagger-${index + 1}
                ${isActive
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md transform scale-[1.02]'
                  : 'border-transparent bg-white hover:bg-gray-50 hover:border-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stateIcons[key]}</span>
                  <p className={`text-sm font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {stateLabels[key]}
                  </p>
                </div>
                {stateProgress > 0 && (
                  <span className={`bio-badge ${isActive ? 'bio-badge-primary' : 'bg-gray-100 text-gray-600'}`}>
                    {stateProgress}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {stateDescriptions[key]}
              </p>
              {stateProgress > 0 && (
                <div className="mt-2 bio-progress bio-progress-sm">
                  <div 
                    className="bio-progress-bar"
                    style={{ width: `${stateProgress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer con disclaimer */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <p className="text-xs text-gray-600 leading-relaxed flex items-center gap-1">
          <span>💡</span>
          <span>Este espacio no sustituye el juicio humano.</span>
        </p>
      </div>
    </aside>
  );
}
