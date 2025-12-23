'use client';

import type { AnatomicalRegion } from './data/anatomicalRegions';

interface RegionDetailPanelProps {
  region: AnatomicalRegion | null;
  onClear: () => void;
}

export default function RegionDetailPanel({ region, onClear }: RegionDetailPanelProps) {
  if (!region) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Región seleccionada</h4>
        <p className="text-xs text-gray-500">
          Selecciona una región del cuerpo para ver su contexto bio-emocional
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{region.label}</h4>
          <p className="text-xs text-gray-600 mt-1">{region.description}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Limpiar selección"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Temas bio-emocionales asociados:</p>
        <ul className="space-y-1">
          {region.bioEmotionalThemes.map((theme, index) => (
            <li
              key={index}
              className="text-xs text-gray-600 flex items-start gap-2"
            >
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{theme}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-blue-200">
        <p className="text-[11px] text-gray-500 italic">
          Esta información es consultiva y no diagnóstica. El terapeuta observa y decide.
        </p>
      </div>
    </div>
  );
}
