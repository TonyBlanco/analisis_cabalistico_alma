'use client';

import { useEffect, useState } from 'react';
import TestCatalogSection from '@/components/TestCatalogSection';
import { ClipboardList, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getActivePatientId, getActivePatientName, setActivePatientId } from '@/lib/active-patient';

export default function TherapistTestsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const searchParams = useSearchParams();
  const [resolvedPatientId, setResolvedPatientId] = useState<number | null>(getActivePatientId());
  const [resolvedPatientName, setResolvedPatientName] = useState<string | null>(getActivePatientName());

  useEffect(() => {
    const idParam = searchParams.get('patient_id');
    if (idParam) {
      const parsed = parseInt(idParam, 10);
      if (!isNaN(parsed)) {
        setActivePatientId(parsed);
        setResolvedPatientId(parsed);
        setResolvedPatientName(getActivePatientName());
      }
    } else {
      setResolvedPatientId(getActivePatientId());
      setResolvedPatientName(getActivePatientName());
    }
  }, [searchParams]);

  const handleTestAssigned = () => {
    setRefreshTrigger((prev) => prev + 1);
    console.log('✓ Test asignado exitosamente');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Catálogo de Tests
          </h1>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <p className="text-sm text-gray-600">
            Visualiza y asigna tests disponibles. El catálogo es global; la asignación usa el paciente activo.
          </p>
          {resolvedPatientId && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-100">
              Paciente: {resolvedPatientName || resolvedPatientId}
            </span>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 space-y-1">
          {!resolvedPatientId ? (
            <>
              <p className="font-medium">Seleccione un paciente activo para asignar tests.</p>
              <p className="text-xs text-blue-700">
                Vuelva al Workspace, elija un paciente y regrese con el contexto ?patient_id=ID.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Cómo asignar tests:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Pestaña "Asignables al paciente"</li>
                <li>Clic en "Asignar" en el test deseado</li>
                <li>Confirmación y listo</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                ℹ️ Los tests asignados aparecerán automáticamente en el panel del paciente.
              </p>
            </>
          )}
        </div>
      </div>

      <TestCatalogSection key={refreshTrigger} onTestAssigned={handleTestAssigned} />
    </div>
  );
}
