'use client';

import type { AstrologyTarotSectionId } from './types';
import TarotPluginAdapter from './TarotPluginAdapter';
import type { DrawnCard } from '@/components/BodySoulVisualization/plugins/tarot';
import type { PatientContext } from '@/components/BodySoulVisualization/types';

interface AstrologyTarotVisualCoreProps {
  activeSection: AstrologyTarotSectionId;
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: DrawnCard[]) => void;
  onCardSelect?: (card: DrawnCard) => void;
}

export default function AstrologyTarotVisualCore({
  activeSection,
  patientId,
  patientName,
  patientBirthDate,
  onSefirahHighlight,
  onReadingComplete,
  onCardSelect,
}: AstrologyTarotVisualCoreProps) {
  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visual principal</h3>
          <p className="text-xs text-gray-500">
            Placeholder visual. Sin interpretacion ni calculo.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 flex flex-col items-center gap-3">
          <h4 className="text-sm font-semibold text-gray-800">Carta Astral (visual)</h4>
          <svg viewBox="0 0 200 200" className="h-40 w-40 text-gray-400" role="img" aria-label="Carta astral">
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="100" y1="30" x2="100" y2="170" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="100" x2="170" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="45" y1="45" x2="155" y2="155" stroke="currentColor" strokeWidth="2" />
            <line x1="155" y1="45" x2="45" y2="155" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="text-xs text-gray-500">Rueda simbolica sin calculos.</p>
        </div>
        <TarotPluginAdapter
          patientId={patientId}
          patientName={patientName}
          patientBirthDate={patientBirthDate}
          onSefirahHighlight={onSefirahHighlight}
          onReadingComplete={onReadingComplete}
          onCardSelect={onCardSelect}
        />
      </div>
    </section>
  );
}
