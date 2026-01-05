'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableTests, getTestResults, executeTest } from '@/lib/test-api';
import { TestModule, ExecuteTestRequest } from '@/lib/test-types';
import { clinicalTestsRegistry } from '@/lib/clinicalTests.registry';

/**
 * Patient Assigned Tests Section
 * 
 * PHASE 3: Shows assigned patient_self tests for current patient
 * - Fetches tests from GET /api/tests/
 * - Filters: user_access.has_special_access === true AND available_for_personal === true
 * - Shows status: pending / completed
 * - Action button: "Realizar test" (only for pending)
 */
export default function PatientAssignedTestsSection() {
  const router = useRouter();
  const [assignedTests, setAssignedTests] = useState<TestModule[]>([]);
  const [completedTestIds, setCompletedTestIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executingTestCode, setExecutingTestCode] = useState<string | null>(null);

  const routeByTestCode = useState(() => {
    const map = new Map<string, string>();
    for (const entry of clinicalTestsRegistry) {
      if (entry.patient_route) map.set(entry.test_code, entry.patient_route);
    }
    return map;
  })[0];

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch available tests (includes user_access info)
      const response = await getAvailableTests();
      const allTests = response.tests || [];

      const assigned = allTests.filter(
        (test: TestModule) => test.user_access?.has_special_access === true
      );

      setAssignedTests(assigned);

      // Fetch completed results to determine status
      try {
        const results = await getTestResults();
        const completedIds = new Set(
          results.map((result: any) => result.test_module?.id).filter(Boolean)
        );
        setCompletedTestIds(completedIds);
      } catch (err) {
        console.warn('Error fetching results for status check:', err);
        // Continue without status info
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tests asignados';
      setError(errorMessage);
      console.error('Error fetching assigned tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTest = async (test: TestModule) => {
    if (executingTestCode) return; // Prevent double execution

    const route = routeByTestCode.get(test.code);
    if (route) {
      if (!confirm(`¿Deseas comenzar el test "${test.name}"?`)) {
        return;
      }
      router.push(route);
      return;
    }

    // Confirm execution
    if (!confirm(`¿Deseas comenzar el test "${test.name}"?`)) {
      return;
    }

    setExecutingTestCode(test.code);

    try {
      // Prepare input data for patient_self execution
      // The backend will infer patient_id from the authenticated session
      const inputData: Record<string, any> = {
        fecha: new Date().toISOString().split('T')[0],
      };

      const request: ExecuteTestRequest = {
        test_module_code: test.code,
        input_data: inputData,
        save_result: true,
        // DO NOT include patient_id - backend infers it from session
      };

      await executeTest(request);

      // Success - refresh the list and show results
      await fetchAssignedTests();
      
      // Show success message
      alert(`Test "${test.name}" completado exitosamente. Puedes ver el resultado en la sección "Mis Resultados".`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar el test';
      alert(`Error: ${errorMessage}`);
      console.error('Error executing test:', err);
    } finally {
      setExecutingTestCode(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados pendientes
        </h2>
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <div className="h-2 w-40 bg-gray-200 rounded mb-2"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando tests asignados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados pendientes
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

  const pendingTests = assignedTests.filter(
    (test) => !completedTestIds.has(test.id)
  );
  const completedTests = assignedTests.filter((test) =>
    completedTestIds.has(test.id)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Tests asignados
      </h2>

      {assignedTests.length === 0 ? (
        <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">
            No tienes tests asignados por el momento.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Tu terapeuta te notificará cuando te asigne nuevos tests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending Tests */}
          {pendingTests.map((test) => (
            <div
              key={test.code}
              className="border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Pendiente
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  )}
                  {test.test_type && (
                    <span className="text-xs text-gray-500 mt-2 inline-block">
                      Tipo: {test.test_type}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleExecuteTest(test)}
                    disabled={executingTestCode === test.code}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    {executingTestCode === test.code ? 'Ejecutando...' : 'Realizar test'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Completed Tests (read-only) */}
          {completedTests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Tests completados
              </h3>
              {completedTests.map((test) => (
                <div
                  key={test.code}
                  className="border border-gray-200 rounded-md p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Completado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
