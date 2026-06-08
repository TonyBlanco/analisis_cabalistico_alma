'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAvailableTests, getTestResults, executeTest, getPatientPreviousTests } from '@/lib/test-api';
import { TestModule, ExecuteTestRequest } from '@/lib/test-types';
import {
  clinicalTestsRegistry,
  DEPRECATED_TEST_CODE_ALIASES,
  normalizeClinicalTestCode,
} from '@/lib/clinicalTests.registry';
import { getActivePatientId } from '@/lib/active-patient';
import { unassignTestFromPatient } from '@/lib/assignment-api';
import StartTestModal from '@/components/StartTestModal';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Sparkles } from 'lucide-react';

/**
 * Patient Assigned Tests Section
 * 
 * PHASE 3: Shows assigned patient_self tests for current patient
 * - Fetches tests from GET /api/tests/
 * - Filters: user_access.has_special_access === true AND available_for_personal === true
 * - Shows status: pending / completed
 * - Action button: "Iniciar exploración" (only for pending)
 */
export default function PatientAssignedTestsSection() {
  const router = useRouter();
  const [assignedTests, setAssignedTests] = useState<TestModule[]>([]);
  const [completedTestIds, setCompletedTestIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executingTestCode, setExecutingTestCode] = useState<string | null>(null);
  const [removingTestCode, setRemovingTestCode] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [startTestTarget, setStartTestTarget] = useState<TestModule | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  // AlertDialog state for unassign confirmation
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<TestModule | null>(null);

  const activePatientId = getActivePatientId();

  const normalizeCode = (code?: string | null) =>
    normalizeClinicalTestCode(String(code || ''));

  const routeByTestCode = useState(() => {
    const map = new Map<string, string>();
    for (const entry of clinicalTestsRegistry) {
      if (entry.patient_route) map.set(normalizeCode(entry.test_code), entry.patient_route);
    }
    return map;
  })[0];

  const routeAliases = useState(() => {
    const aliases = new Map<string, string>([
      ['phq9', 'phq-9'],
      ['gad7', 'gad-7'],
      ['bdi2', 'bdi-ii'],
      ['stai', 'anxiety-state-trait'],
      ['mcmi4-mystic', 'mcmi4-mystic'],
    ]);
    for (const [from, to] of Object.entries(DEPRECATED_TEST_CODE_ALIASES)) {
      aliases.set(normalizeClinicalTestCode(from), normalizeClinicalTestCode(to));
    }
    return aliases;
  })[0];

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prefer PatientPrevious endpoint when available (therapist context).
      // If it fails (403 for patient or other), fall back to existing behavior.
      try {
        const resp = await getPatientPreviousTests({});
        const results = Array.isArray(resp) ? resp : (resp.results || []);

        // Map TestResult objects to a minimal TestModule-like shape
        const mapped = results.map((r: any) => ({
          id: r.test_module?.id || null,
          code: r.test_module?.code || r.test_module_code || r.test_id || null,
          name: r.test_module?.name || r.test_module_name || (r.test_module && r.test_module.name) || 'Test sin nombre',
          description: r.test_module?.description || r.details?.description || '',
          test_type: r.test_module?.test_type || null,
          // Mark assignment-only entries so UI can show pending state
          user_access: { has_special_access: !!(r.result_data?.assignment_only || r.details?.legacy_assignment) },
          __raw_result: r,
        }));

        setAssignedTests(mapped as any);
        // Cuando podemos leer desde patient-previous estamos en contexto terapeuta
        // (esto habilita acciones de terapeuta como "Quitar asignación").
        setUserType('therapist');

        const completedIds = new Set<number>();
        for (const r of results) {
          if (!(r.result_data && (r.result_data.assignment_only === true || (r.details || {}).legacy_assignment === true))) {
            if (r.test_module && r.test_module.id) completedIds.add(r.test_module.id);
          }
        }
        setCompletedTestIds(completedIds);
        setLoading(false);
        return;
      } catch (innerErr) {
        // If patient-previous is not accessible (e.g., patient user), continue to fallback
        console.debug('getPatientPreviousTests not available, falling back to available-tests flow', innerErr);
      }

      // Fallback: original flow for patients (uses UserTestAccess info)
      const response = await getAvailableTests();
      setUserType(response.user_type || '');
      const allTests = response.tests || [];

      const tests = allTests.map((t) => ({
        ...t,
        status: t.is_active ? 'active' : 'inactive',
      }));

      const visibleTests = tests.filter((t) => t.status === 'active');

      const assigned = visibleTests.filter(
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

  // Opens the AlertDialog for unassign confirmation
  const handleUnassignClick = (test: TestModule) => {
    if (!activePatientId) return;
    if (userType !== 'therapist') return;
    setUnassignTarget(test);
    setUnassignDialogOpen(true);
  };

  // Executes the actual unassign after confirmation
  const handleUnassignConfirm = async () => {
    if (!activePatientId || !unassignTarget) return;

    setRemovingTestCode(unassignTarget.code);
    setUnassignDialogOpen(false);
    
    try {
      await unassignTestFromPatient(activePatientId, unassignTarget.code);
      // Show success message
      setActionMessage({
        type: 'success',
        text: `Test "${unassignTarget.name}" desasignado correctamente.`,
      });
      // Refresh the list
      await fetchAssignedTests();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al quitar la asignación';
      setActionMessage({
        type: 'error',
        text: message,
      });
      setError(message);
    } finally {
      setRemovingTestCode(null);
      setUnassignTarget(null);
    }
  };

  const handleExecuteTest = async (test: TestModule) => {
    setActionMessage(null);
    setStartTestTarget(test);
    setStartModalOpen(true);
  };

  const handleStartTest = async () => {
    const test = startTestTarget;
    if (!test) return;
    if (executingTestCode) return; // Prevent double execution

    const normalizedCode = normalizeCode(test.code);
    const mappedCode = routeAliases.get(normalizedCode) || normalizedCode;
    const route = routeByTestCode.get(mappedCode);
    if (route) {
      setStartModalOpen(false);
      setStartTestTarget(null);
      router.push(route);
      return;
    }

    setStartModalOpen(false);
    setStartTestTarget(null);
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
      setActionMessage({
        type: 'success',
        text: `Test "${test.name}" completado exitosamente. Puedes ver el resultado en la secci▋ "Mis Resultados".`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar el test';
      setActionMessage({
        type: 'error',
        text: `Error: ${errorMessage}`,
      });
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
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tests asignados
        </h2>
        {actionMessage && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${actionMessage.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
              }`}
          >
            {actionMessage.text}
          </div>
        )}

        {assignedTests.length === 0 ? (
          <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-gray-500 text-sm">No tests available at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Tests */}
            {pendingTests.map((test, idx) => (
              <div
                key={`${test.id ?? 'pending'}-${String(test.code || 'code').toLowerCase()}-${idx}`}
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
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleExecuteTest(test)}
                      disabled={executingTestCode === test.code}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      {executingTestCode === test.code ? 'Explorando...' : 'Iniciar exploración'}
                    </button>
                    {userType === 'therapist' && activePatientId && (
                      <button
                        onClick={() => handleUnassignClick(test)}
                        disabled={removingTestCode === test.code}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removingTestCode === test.code ? 'Quitando...' : 'Quitar asignación'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Completed Tests (read-only) */}
            {completedTests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Exploraciones completadas
                </h3>
                {completedTests.map((test, idx) => (
                  <div
                    key={`${test.id ?? 'completed'}-${String(test.code || 'code').toLowerCase()}-${idx}`}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          Completado
                        </span>
                      </div>
                      {/* CTA: Ir a Reflexión for mcmi4-signal */}
                      {(test.code === 'mcmi4-signal' || test.code === 'mcmi4_signal') && userType !== 'therapist' && (
                        <Link
                          href="/dashboard/patient/swm/mcmi4-reflection"
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-violet-100 rounded-md hover:bg-violet-200 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          Ir a Reflexión
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <StartTestModal
        open={startModalOpen}
        testName={startTestTarget?.name || ''}
        description={startTestTarget?.description || ''}
        loading={Boolean(executingTestCode)}
        onCancel={() => {
          setStartModalOpen(false);
          setStartTestTarget(null);
        }}
        onConfirm={handleStartTest}
      />
      {/* AlertDialog for unassign confirmation */}
      <AlertDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        title="Quitar asignación"
        description={`¿Deseas quitar la asignación del test "${unassignTarget?.name || ''}"?`}
        confirmLabel="Quitar asignación"
        cancelLabel="Cancelar"
        onConfirm={handleUnassignConfirm}
        destructive
        loading={removingTestCode === unassignTarget?.code}
      />
    </>
  );
}
