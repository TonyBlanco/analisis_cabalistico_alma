'use client';

import PatientSymbolicOverview from '@/components/PatientSymbolicOverview';
import BodySoulVisualization from '@/components/BodySoulVisualization';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import ExportHistoryList from '@/components/HolisticExportHistory/ExportHistoryList';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import type { ContextSectionId } from './types';
import Link from 'next/link';

interface CenterVisualProps {
  activeSection: ContextSectionId;
  onStateChange?: (state: VisualizationState | null) => void;
  patientId?: string | number;
  onAddNote?: (text: string) => void;
}

export default function CenterVisual({
  activeSection,
  onStateChange,
  patientId,
  onAddNote,
}: CenterVisualProps) {
  const titleMap: Record<ContextSectionId, string> = {
    overview: 'Resumen simbólico del paciente',
    'clinical-history': 'Historia clínica',
    bioemotional: 'Bio-Emoción',
    visualization: 'Body-Soul',
    evaluations: 'Evaluaciones',
    'integrative-notes': 'Notas integrativas',
  };

  const subtitleMap: Record<ContextSectionId, string> = {
    overview: 'Estado actual de análisis: Astrología, Cábala, Tests',
    'clinical-history': 'Contexto longitudinal y exports holísticos',
    bioemotional: 'Observaciones simbólicas y relacionales',
    visualization: 'Visualización consultiva por capas',
    evaluations: 'Tests asignados y resultados guardados',
    'integrative-notes': 'Notas humanas (sin automatización)',
  };

  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{titleMap[activeSection]}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {subtitleMap[activeSection]}
        </p>
      </div>
      
      {patientId ? (
        <>
          {activeSection === 'overview' && <PatientSymbolicOverview patientId={patientId} />}

          {activeSection === 'visualization' && (
            <BodySoulVisualization
              onStateChange={(state) => {
                onStateChange?.(state);
              }}
            />
          )}

          {activeSection === 'evaluations' && (
            <AssignedTestsSection patientId={patientId} />
          )}

          {activeSection === 'clinical-history' && (
            <ExportHistoryList patientId={patientId} onAddNote={onAddNote} />
          )}

          {activeSection === 'bioemotional' && (
            <div className="space-y-3">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                Abre el workspace para diccionario, hipótesis y notas simbólicas.
              </div>
              <Link
                href="/dashboard/therapist/bioemotional-experiencial-profunda"
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Abrir workspace de Bio-Emoción
              </Link>
            </div>
          )}

          {activeSection === 'integrative-notes' && (
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
              Usa el panel derecho para escribir y revisar notas integrativas.
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500">
            <p className="text-sm">Selecciona un paciente para ver su resumen simbólico</p>
          </div>
        </div>
      )}
    </div>
  );
}
