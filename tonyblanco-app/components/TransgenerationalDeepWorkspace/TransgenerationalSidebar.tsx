'use client';

import type { TransgenerationalSectionId } from './types';

interface TransgenerationalSidebarProps {
  activeSection: TransgenerationalSectionId;
  onChange: (section: TransgenerationalSectionId) => void;
}

const sections: Array<{
  id: TransgenerationalSectionId;
  label: string;
  description: string;
}> = [
  { id: 'tree', label: 'Arbol', description: 'Mapa genealogico observacional.' },
  { id: 'events', label: 'Eventos', description: 'Linea de eventos sin inferencia.' },
  { id: 'synthesis', label: 'Sintesis', description: 'Notas humanas de integracion.' },
];

export default function TransgenerationalSidebar({
  activeSection,
  onChange,
}: TransgenerationalSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace relacional</p>
        <h2 className="text-lg font-semibold text-gray-900">Transgeneracional Profundo</h2>
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
        Sin inferencia ni generacion automatica.
      </div>
    </aside>
  );
}
