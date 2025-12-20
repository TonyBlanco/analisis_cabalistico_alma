'use client';

import type { CabalSectionId } from './types';

interface CabalAppliedSidebarProps {
  activeSection: CabalSectionId;
  onChange: (section: CabalSectionId) => void;
}

const sections: Array<{ id: CabalSectionId; label: string; description: string }> = [
  { id: 'tree', label: 'Arbol', description: 'Vista simbolica del Arbol de la Vida.' },
  { id: 'gematria', label: 'Gematria', description: 'Espacio observacional sin calculos.' },
  { id: 'synthesis', label: 'Sintesis', description: 'Notas humanas de integracion.' },
  { id: 'resources', label: 'Recursos', description: 'Material consultivo de apoyo.' },
];

export default function CabalAppliedSidebar({
  activeSection,
  onChange,
}: CabalAppliedSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
        <h2 className="text-lg font-semibold text-gray-900">Cabala Aplicada</h2>
      </div>
      <div className="flex-1 px-3 py-4 space-y-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-gray-300 bg-gray-100 text-gray-900'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <p className="text-sm font-medium">{section.label}</p>
              <p className="text-[11px] text-gray-500">{section.description}</p>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
        Sin interpretacion ni automatizacion.
      </div>
    </aside>
  );
}
