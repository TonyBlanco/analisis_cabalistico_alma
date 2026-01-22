'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { getTestResultsForPatient, getPatientPreviousTests } from '@/lib/test-api';
import { unassignTestFromPatient } from '@/lib/assignment-api';
import { TestResult } from '@/lib/test-types';
import { AlertDialog } from '@/components/ui/alert-dialog';

/**
 * Assigned Tests Section Component
 * 
 * Shows tests that have been assigned/completed for the active patient.
 * Uses GET /api/tests/patient-previous/?patient_id={id} to fetch.
 * 
 * READ-ONLY: Just displays assigned tests, no actions yet.
 */
export default function AssignedTestsSection({
  patientId,
  patientName,
}: {
  patientId?: string | number | null;
  patientName?: string | null;
} = {}) {
  const [assignedTests, setAssignedTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingTestCode, setRemovingTestCode] = useState<string | null>(null);
  const [activePatientId, setActivePatientIdState] = useState<number | null>(null);
  const [activePatientName, setActivePatientNameState] = useState<string | null>(null);
  // AlertDialog state
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resolvedPatientId = useMemo(() => {
    if (patientId === undefined) return null;
    if (patientId === null || patientId === '') return null;
    if (typeof patientId === 'number') return patientId;
    const parsed = parseInt(String(patientId), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [patientId]);

  // Cargar paciente activo solo en cliente para evitar mismatches SSR/CSR
  useEffect(() => {
    if (resolvedPatientId !== null) {
      setActivePatientIdState(resolvedPatientId);
      setActivePatientNameState(patientName ?? null);
      return;
    }

    const id = getActivePatientId();
    const name = getActivePatientName();
    setActivePatientIdState(id);
    setActivePatientNameState(name);
  }, [resolvedPatientId, patientName]);

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

  useEffect(() => {
    // Patient completes tests in a different session, so refresh on focus/visibility.
    const refresh = () => {
      if (activePatientId) {
        fetchAssignedTests();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activePatientId]);

  const fetchAssignedTests = useCallback(async () => {
    if (!activePatientId) return;

    setLoading(true);
    setError(null);

    try {
      // Use patient-previous endpoint to include pending assignments
      const data = await getPatientPreviousTests({ patient_id: activePatientId });
      const remoteResults = Array.isArray(data) ? data : (data.results || []);
      setAssignedTests(remoteResults as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tests asignados';
      setError(errorMessage);
      console.error('Error fetching assigned tests:', err);
    } finally {
      setLoading(false);
    }
  }, [activePatientId]);

  // Opens AlertDialog for unassign confirmation
  const handleUnassignClick = useCallback((result: any) => {
    if (!activePatientId) return;
    const code = result?.test_module?.code || result?.test_module_code;
    if (!code) return;
    setUnassignTarget(result);
    setUnassignDialogOpen(true);
  }, [activePatientId]);

  // Executes the actual unassign after confirmation
  const handleUnassignConfirm = useCallback(async () => {
    if (!activePatientId || !unassignTarget) return;

    const code = unassignTarget?.test_module?.code || unassignTarget?.test_module_code;
    if (!code) return;

    const isCompleted = !(
      (unassignTarget as any)?.result_data?.assignment_only === true ||
      (unassignTarget as any)?.details?.legacy_assignment === true
    );

    setUnassignDialogOpen(false);
    setRemovingTestCode(String(code));

    try {
      await unassignTestFromPatient(activePatientId, String(code), isCompleted);

      const normalizeCode = (c: any) => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetNorm = normalizeCode(code);

      const key = 'assigned_tests_by_patient';
      const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const parsed = existing ? JSON.parse(existing) : {};
      const patientKey = String(activePatientId);
      const current: Array<{ code: string }> = parsed[patientKey] || [];
      parsed[patientKey] = current.filter((t: any) => normalizeCode(t.code) !== targetNorm);

      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('assignedTestsChanged', { detail: { patientId: activePatientId, unassigned: code } }));
      }

      // Optimistic state update
      setAssignedTests((prev) => prev.filter((t: any) => {
        const tCode = t?.test_module?.code || t?.test_module_code || t?.test_id;
        return normalizeCode(tCode) !== targetNorm;
      }));

      // Show success message
      const testName = unassignTarget.test_module?.name || unassignTarget.test_module_name || code;
      setActionMessage({
        type: 'success',
        text: isCompleted 
          ? `Resultado de "${testName}" eliminado correctamente.`
          : `Asignación de "${testName}" eliminada correctamente.`,
      });

      await fetchAssignedTests();
    } catch (err) {
      console.error('Error unassigning test:', err);
      const message = err instanceof Error ? err.message : 'Error al quitar la asignación';
      setActionMessage({ type: 'error', text: message });
      setError(message);
    } finally {
      setRemovingTestCode(null);
      setUnassignTarget(null);
    }
  }, [activePatientId, fetchAssignedTests, unassignTarget]);

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
            const isAssignmentOnly =
              (result as any)?.result_data?.assignment_only === true ||
              (result as any)?.details?.legacy_assignment === true;

            const status = isAssignmentOnly ? 'pending' : 'completed';
            const canViewResult = !isAssignmentOnly && Boolean(result.id);
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

                  <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                    {canViewResult && (
                      <Link
                        href={`/dashboard/therapist/tests/results/${result.id}`}
                        className="text-sm text-blue-700 hover:text-blue-900 underline"
                      >
                        Ver resultado
                      </Link>
                    )}

                    {/* Allow deleting ANY test (pending or completed) */}
                    <button
                      type="button"
                      onClick={() => handleUnassignClick(result)}
                      disabled={removingTestCode === String(result?.test_module?.code || result?.test_module_code)}
                      className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
                      title={isAssignmentOnly ? "Quitar asignación" : "Eliminar resultado para reasignar"}
                    >
                      {removingTestCode === String(result?.test_module?.code || result?.test_module_code)
                        ? 'Eliminando...'
                        : isAssignmentOnly ? 'Quitar asignación' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Action message feedback */}
      {actionMessage && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            actionMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {actionMessage.text}
        </div>
      )}
      {/* AlertDialog for unassign confirmation */}
      <AlertDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        title={
          (unassignTarget?.result_data?.assignment_only === true ||
           unassignTarget?.details?.legacy_assignment === true)
            ? 'Quitar asignación'
            : 'Eliminar resultado'
        }
        description={
          (unassignTarget?.result_data?.assignment_only === true ||
           unassignTarget?.details?.legacy_assignment === true)
            ? `¿Deseas quitar la asignación del test "${unassignTarget?.test_module?.name || unassignTarget?.test_module_name || ''}"?`
            : `¿Deseas eliminar el resultado del test "${unassignTarget?.test_module?.name || unassignTarget?.test_module_name || ''}"? Esto permitirá reasignarlo. El resultado se perderá.`
        }
        confirmLabel={
          (unassignTarget?.result_data?.assignment_only === true ||
           unassignTarget?.details?.legacy_assignment === true)
            ? 'Quitar asignación'
            : 'Eliminar resultado'
        }
        cancelLabel="Cancelar"
        onConfirm={handleUnassignConfirm}
        destructive
        loading={removingTestCode !== null}
      />
    </div>
  );
}
