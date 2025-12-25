'use client';

import { useState } from 'react';

const placeholders = [
  {
    title: 'Roles & Permisos',
    description: 'Placeholder (sin endpoints admin disponibles en este MVP).',
  },
  {
    title: 'Catálogo',
    description: 'Placeholder (sin endpoints admin catálogo disponibles).',
  },
  {
    title: 'Recursos',
    description: 'Placeholder (sin endpoints admin recursos disponibles).',
  },
  {
    title: 'Auditoría',
    description: 'Placeholder (sin endpoints admin auditoría disponibles).',
  },
  {
    title: 'Configuración',
    description: 'Placeholder (sin endpoints admin configuración disponibles).',
  },
];

export function AdminPlaceholderPanels() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="admin-panel-placeholders" className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Paneles (placeholder)</h2>
          <p className="mt-1 text-sm text-gray-600">Secciones selladas sin backend admin asignado.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">MVP</span>
        </div>
      </div>

      {!expanded ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">Sección contraída.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {placeholders.map((p) => (
            <div key={p.title} className="rounded-md border p-3">
              <div className="text-sm font-medium text-gray-900">{p.title}</div>
              <div className="mt-1 text-sm text-gray-600">{p.description}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
