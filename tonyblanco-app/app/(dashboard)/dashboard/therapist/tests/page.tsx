'use client';

import { useState } from 'react';
import TestCatalogSection from '@/components/TestCatalogSection';
import { ClipboardList, Info } from 'lucide-react';

/**
 * Therapist Tests Catalog Page
 * 
 * Dedicated page for test catalog with clear access from sidebar.
 * 
 * ARCHITECTURE:
 * - Reuses existing TestCatalogSection component
 * - No logic duplication
 * - Clean separation from workspace
 * 
 * FUNCTIONALITY:
 * - Displays assignable tests (patient_self)
 * - Displays clinical evaluations (therapist_clinical)
 * - Allows test assignment to active patient
 * - Refreshes assigned tests list on assignment
 */
export default function TherapistTestsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTestAssigned = () => {
    // Increment trigger to force re-render of any dependent sections
    setRefreshTrigger((prev) => prev + 1);
    console.log('✅ Test asignado exitosamente');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Catálogo de Tests
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Visualiza y asigna tests disponibles para tus pacientes.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 space-y-1">
          <p className="font-medium">Cómo asignar tests:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Selecciona un paciente activo desde el workspace</li>
            <li>Navega a la pestaña "Asignables al paciente"</li>
            <li>Haz clic en "Asignar" en el test deseado</li>
            <li>Confirma la asignación</li>
          </ol>
          <p className="text-xs text-blue-700 mt-2">
            💡 Los tests asignados aparecerán automáticamente en el panel del paciente.
          </p>
        </div>
      </div>

      {/* Test Catalog Component (existing, functional) */}
      <TestCatalogSection onTestAssigned={handleTestAssigned} />
    </div>
  );
}
