'use client';

import { useState, useEffect } from 'react';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { getPatientPreviousTests } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';

/**
 * Assigned Tests Section Component
 * 
 * Shows tests that have been assigned/completed for the active patient.
 * Uses GET /api/tests/patient-previous/?patient_id={id} to fetch.
 * 
 * READ-ONLY: Just displays assigned tests, no actions yet.
 */
export default function AssignedTestsSection() {
  const [assignedTests, setAssignedTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePatientId, setActivePatientIdState] = useState<number | null>(null);
  const [activePatientName, setActivePatientNameState] = useState<string | null>(null);

  // Cargar paciente activo solo en cliente para evitar mismatches SSR/CSR
  useEffect(() => {
    const id = getActivePatientId();
    const name = getActivePatientName();
    setActivePatientIdState(id);
    setActivePatientNameState(name);
  }, []);

  useEffect(() => {
    if (activePatientId) {
      fetchAssignedTests();
    } else {
      setAssignedTests([]);
      setError(null);
    }
  }, [activePatientId]);

  useEffect(() => {
    // Listen for test assignment events to refresh the list
    const handleAssignedTestsChanged = () => {
      if (activePatientId) {
        fetchAssignedTests();
      }
    };

    window.addEventListener('assignedTestsChanged', handleAssignedTestsChanged);
    return () => {
      window.removeEventListener('assignedTestsChanged', handleAssignedTestsChanged);
    };
  }, [activePatientId]);

  const fetchAssignedTests = async () => {
    if (!activePatientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getPatientPreviousTests({
        patient_id: activePatientId,
      });
      const remoteResults = response.results || [];

      // Recupera asignaciones locales (pendientes) registradas tras la asignación.
      let localAssignments: Array<TestResult> = [];
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('assigned_tests_by_patient');
        if (raw) {
          const parsed = JSON.parse(raw) || {};
          const list: Array<{ code: string; name: string; description?: string; assigned_at?: string }> =
            parsed[String(activePatientId)] || [];
          localAssignments = list.map((item) => ({
            id: undefined as any,
            test_module: {
              id: 0,
              code: item.code,
              name: item.name,
              description: item.description,
              test_type: 'basic' as any,
            },
            test_module_code: item.code,
            test_module_name: item.name,
            input_data: {},
            result_data: {},
            notes: undefined,
            is_favorite: false,
            is_archived: false,
            created_at: item.assigned_at || new Date().toISOString(),
            updated_at: item.assigned_at || new Date().toISOString(),
          }));
        }
      }

      // Evitar duplicados: si remoto ya tiene el test, no incluir pendiente local.
      const remoteCodes = new Set(
        remoteResults
          .map((r) => r.test_module?.code || r.test_module_code)
          .filter(Boolean)
      );
      const merged = [
        ...remoteResults,
        ...localAssignments.filter(
          (pending) => !remoteCodes.has(pending.test_module?.code || pending.test_module_code)
        ),
      ];

      setAssignedTests(merged);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tests asignados';
      setError(errorMessage);
      console.error('Error fetching assigned tests:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activePatientId) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados a pacientes
        </h2>
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            Selecciona un paciente para ver sus tests asignados
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados a pacientes
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Cargando tests asignados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados a pacientes
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchAssignedTests}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Determine status: if result exists, it's completed; otherwise pending
  // For now, we show all as they are already completed (they come from getPatientPreviousTests)
  // In the future, we might want to show assigned but not completed tests separately

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Tests Asignados (patient_self)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tests asignados al paciente activo para auto-evaluación
          </p>
        </div>
        {activePatientName && (
          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
            {activePatientName}
          </span>
        )}
      </div>

      {assignedTests.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No hay tests asignados para este paciente aún.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Usa el catálogo de tests para asignar tests al paciente activo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedTests.map((result) => {
            // Determine status: completed (has result)
            const status = result.id ? 'completed' : 'pending';
            const statusLabels = {
              completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
              pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
            };
            const statusInfo = statusLabels[status];

            return (
              <div
                key={result.id || result.test_module?.code}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {result.test_module?.name || result.test_module_name || 'Test sin nombre'}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {result.created_at 
                          ? new Date(result.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Fecha no disponible'}
                      </span>
                      {result.test_module?.code && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {result.test_module.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
