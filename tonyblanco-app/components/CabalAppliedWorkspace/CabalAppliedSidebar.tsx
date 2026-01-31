'use client';

import type { CabalSectionId } from './types';

interface CabalAppliedSidebarProps {
  activeSection: CabalSectionId;
  onChange: (section: CabalSectionId) => void;
}

const sections: Array<{ id: CabalSectionId; label: string; description: string; group?: string }> = [
  // Módulos Base
  { id: 'tree', label: '🔯 Árbol', description: 'Vista simbólica del Árbol de la Vida.', group: 'base' },
  { id: 'gematria', label: '🔢 Gematría', description: 'Espacio observacional sin cálculos.', group: 'base' },
  { id: 'soul-map', label: '🗺️ Mapa del Alma', description: 'Mapa simbólico de resonancias sefiróticas.', group: 'base' },
  { id: 'cycles', label: '🔄 Ciclos Tikún', description: 'Línea temporal de ciclos evolutivos.', group: 'base' },
  { id: 'notarikon', label: '✍️ Notarikón', description: 'Análisis de acrónimos y síntesis.', group: 'base' },
  { id: 'shadow-work', label: '🌑 Sombras', description: 'Qliphoth y polaridades luz/sombra.', group: 'base' },
  // Módulos Avanzados
  { id: 'sefirot-radar', label: '📊 Radar Sefirot', description: 'Desequilibrios: tests + bio + cálculos.', group: 'advanced' },
  { id: 'multi-system', label: '🔮 Multi-Sistema', description: 'Integración Cábala-Tarot-Astro-Bio-Trans.', group: 'advanced' },
  // Innovaciones Terapéuticas
  { id: 'sincronias', label: '✨ Sincronías', description: 'Detector de coincidencias biográficas.', group: 'innovations' },
  { id: 'alertas-preventivas', label: '🔔 Alertas', description: 'Avisos éticos basados en tu historia.', group: 'innovations' },
  { id: 'exportacion-narrativa', label: '📜 Narrativa', description: 'Carta del Alma, Mapa del Viaje, Libro.', group: 'innovations' },
  { id: 'calendario-cosmico', label: '🌙 Calendario', description: 'Ciclos lunares y sefiróticos reales.', group: 'innovations' },
  // Síntesis y Ayuda
  { id: 'synthesis', label: '📝 Síntesis', description: 'Notas humanas de integración.', group: 'synthesis' },
  { id: 'ai-assistant', label: '✨ IA Asistida', description: 'Asistente ético de exploración textual.', group: 'synthesis' },
  { id: 'resources', label: '📚 Recursos', description: 'Material consultivo de apoyo.', group: 'synthesis' },
];

export default function CabalAppliedSidebar({
  activeSection,
  onChange,
}: CabalAppliedSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
        <h2 className="text-lg font-semibold text-gray-900">Cábala Aplicada</h2>
      </div>
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
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
        Sin interpretación ni automatización.
      </div>
    </aside>
  );
}

