'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { executeTest } from '@/lib/test-api';
import { TestModule, ExecuteTestRequest } from '@/lib/test-types';
import { getTestResults } from '@/lib/test-api';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

/**
 * Patient Tests Page
 *
 * Route: /dashboard/patient/tests
 *
 * Shows assigned patient_self tests with execution CTA.
 * Patient can ONLY execute patient_self tests.
 */
export default function PatientTestsPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [assignedTests, setAssignedTests] = useState<TestModule[]>([]);
  const [completedTestIds, setCompletedTestIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executingTestCode, setExecutingTestCode] = useState<string | null>(null);

  useEffect(() => {
    if (authorized && role === 'patient') {
      fetchAssignedTests();
    }
  }, [authorized, role]);

  const fetchAssignedTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('No autenticado');
      }

      // Use exclusively GET /api/tests/assigned/
      const response = await fetch(`${API_URL}/tests/assigned/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al cargar tests asignados');
      }

      const data = await response.json();
      const assigned = data.tests || data || [];
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

      // Success - refresh the list
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

  // Loading state
  if (roleLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Unauthorized - guard handles redirect
  if (!authorized || role !== 'patient') {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Tests Asignados</h1>
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
      </div>
    );
  }

  const pendingTests = assignedTests.filter((test) => !completedTestIds.has(test.id));
  const completedTests = assignedTests.filter((test) => completedTestIds.has(test.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Tests Asignados
        </h1>
        <p className="text-sm text-gray-600">
          Tests que tu terapeuta ha asignado para que completes
        </p>
      </div>

      {/* Empty state */}
      {assignedTests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">
            No tienes tests asignados.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Tu terapeuta te notificará cuando te asigne nuevos tests.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Tests */}
          {pendingTests.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tests Pendientes
              </h2>
              <div className="space-y-3">
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
                          {executingTestCode === test.code ? 'Ejecutando...' : 'Ejecutar test'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tests */}
          {completedTests.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tests Completados
              </h2>
              <div className="space-y-3">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
