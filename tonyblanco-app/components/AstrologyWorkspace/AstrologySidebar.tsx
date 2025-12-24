'use client';

import type { AstrologyViewMode } from './types';

interface AstrologySidebarProps {
  activeView: AstrologyViewMode;
  onViewChange: (view: AstrologyViewMode) => void;
}

const sections: Array<{ id: AstrologyViewMode; label: string; enabled: boolean }> = [
  { id: 'visual', label: 'Visual', enabled: true },
  { id: 'correspondences', label: 'Correspondencias', enabled: false },
  { id: 'synthesis', label: 'Sintesis', enabled: false },
];

export default function AstrologySidebar({ activeView, onViewChange }: AstrologySidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
        <h2 className="text-lg font-semibold text-gray-900">Astrologia</h2>
      </div>
      <div className="flex-1 px-3 py-4 space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            disabled={!section.enabled}
            onClick={() => section.enabled && onViewChange(section.id)}
            className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
              section.enabled
                ? activeView === section.id
                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                  : 'border border-transparent text-gray-700 hover:bg-gray-50'
                : 'border border-transparent text-gray-400 cursor-not-allowed'
            }`}
          >
            <p className="text-sm font-medium">{section.label}</p>
            <p className="text-[11px] text-gray-500">
              {section.enabled ? (activeView === section.id ? 'Activo' : 'Disponible') : 'Deshabilitado'}
            </p>
          </button>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.
      </div>
    </aside>
  );
}
