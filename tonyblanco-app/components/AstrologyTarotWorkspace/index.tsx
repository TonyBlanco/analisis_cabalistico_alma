'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import AstrologyTarotSidebar from './AstrologyTarotSidebar';
import AstrologyTarotVisualCore from './AstrologyTarotVisualCore';
import type { AstrologyTarotSectionId } from './types';

export default function AstrologyTarotWorkspace() {
  const [activeSection, setActiveSection] = useState<AstrologyTarotSectionId>('visual');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Astrologia | Tarot</h1>
          </div>
        </div>
        <Link
          href="/dashboard/therapist"
          className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
        >
          Volver al espacio clinico
        </Link>
      </header>

      <div className="flex">
        <AstrologyTarotSidebar activeSection={activeSection} onChange={setActiveSection} />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Sin interpretacion, sin prediccion, sin automatizacion.
          </div>
          <div className="flex gap-6 items-start">
            <AstrologyTarotVisualCore activeSection={activeSection} />
            <aside className="w-72 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Panel interno</h3>
                <p className="text-xs text-gray-600">
                  Espacio reservado para notas humanas y observaciones narrativas.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Seccion activa</h3>
                <p className="text-xs text-gray-600">
                  {activeSection === 'visual' && 'Visual principal'}
                  {activeSection === 'reading' && 'Lectura consultiva'}
                  {activeSection === 'synthesis' && 'Sintesis humana'}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
