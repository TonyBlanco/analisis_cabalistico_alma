'use client';

import PatientSymbolicOverview from '@/components/PatientSymbolicOverview';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';

interface CenterVisualProps {
  onStateChange?: (state: VisualizationState | null) => void;
  patientId?: string | number;
}

export default function CenterVisual({ onStateChange, patientId }: CenterVisualProps) {
  return (
    <div className="h-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Resumen simbólico del paciente</h2>
        <p className="text-xs text-gray-500 mt-1">
          Estado actual de análisis: Astrología, Cábala, Tests
        </p>
      </div>
      
      {patientId ? (
        <PatientSymbolicOverview patientId={patientId} />
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
