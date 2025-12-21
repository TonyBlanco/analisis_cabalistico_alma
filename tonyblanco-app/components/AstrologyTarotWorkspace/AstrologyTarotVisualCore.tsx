'use client';

import Link from 'next/link';
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
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 flex flex-col items-center gap-3 text-center">
          <h4 className="text-sm font-semibold text-gray-800">Astrologia</h4>
          <p className="text-xs text-gray-500">
            La visualizacion astrologica vive en su propio workspace.
          </p>
          <Link
            href="/dashboard/therapist/astrologia"
            className="text-sm font-medium text-blue-600 underline underline-offset-4"
          >
            Abrir Workspace de Astrologia
          </Link>
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
