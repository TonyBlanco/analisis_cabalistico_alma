'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import AstrologyTarotSidebar from './AstrologyTarotSidebar';
import AstrologyTarotVisualCore from './AstrologyTarotVisualCore';
import type { AstrologyTarotSectionId, TarotSystemId } from './types';

interface AstrologyTarotWorkspaceProps {
  patientId?: string;
  patientBirthDate?: Date;
}

export default function AstrologyTarotWorkspace({
  patientId,
  patientBirthDate,
}: AstrologyTarotWorkspaceProps) {
  const [activeSection, setActiveSection] =
    useState<AstrologyTarotSectionId>('tarot-natal');
  const [selectedSystem, setSelectedSystem] = useState<TarotSystemId>('thoth');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const sectionLabelMap: Record<AstrologyTarotSectionId, string> = {
    'tarot-systems': 'Sistemas de Tarot',
    'tarot-natal': 'Carta Natal',
    'tarot-tree-spread': 'Tirada del Arbol',
    'tarot-free-spread': 'Tirada Libre',
    'tarot-correspondences': 'Correspondencias',
    'tarot-deck-view': 'Visualizar Mazo',
    'tarot-ai-draft': 'Preparar Analisis IA',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Tarot</h1>
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
        <AstrologyTarotSidebar
          activeSection={activeSection}
          onChange={setActiveSection}
          selectedSystem={selectedSystem}
          onSelectSystem={setSelectedSystem}
          patientId={patientId}
          selectedCardId={selectedCardId}
        />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.
          </div>
          <div className="flex gap-6 items-start">
            <AstrologyTarotVisualCore
              activeSection={activeSection}
              patientId={patientId}
              patientBirthDate={patientBirthDate}
              selectedSystem={selectedSystem}
              onCardSelect={(card) => setSelectedCardId((card as { id?: string } | null)?.id ?? null)}
            />
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
                  {sectionLabelMap[activeSection]}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
