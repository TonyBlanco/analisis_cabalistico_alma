/**
 * MCMI4ProcessOrchestrator
 * 
 * Orchestrates the complete MCMI-4 Místico process:
 * 1. Assign mcmi4-signal test to patient
 * 2. Wait for patient to complete signal (generates TestResult)
 * 3. Wait for patient to complete reflection (generates TestResult)
 * 4. Create Workspace from TestResults (both required)
 * 5. Navigate to interpretation workspace
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, User, CheckCircle, Clock, XCircle, Sparkles, Loader2, Trash2, FileText } from 'lucide-react';
import { fetchPatients, type Patient } from '@/lib/api/patients-api';
import type { AssignmentPayload } from '@/lib/assignment-api';
import { swmMcmi4Api } from '@/lib/api/swm-mcmi4-api';
import { createReflectionBySignal, getReflectionBySignalId } from '@/lib/api/mcmi4-reflection-api';
import { getApiBaseUrl } from '@/lib/api-base';
import AssignMCMI4Modal from '@/components/AssignMCMI4Modal';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';

interface SignalTestResult {
  id: number;
  test_module_code?: string;
  patient_id?: number | null;
  created_at?: string;
}

interface ReflectionTestResult {
  id: number;
  test_module_code?: string;
  patient_id?: number | null;
  created_at?: string;
}

type BasicTestResult = {
  id?: number;
  created_at?: string;
  test_module?: { code?: string } | null;
  test_id?: string | null;
};

interface ProcessState {
  patient: Patient;
  assignment: AssignmentPayload | null;
  testResult: SignalTestResult | null;
  reflectionResult: ReflectionTestResult | null;
  reflectionWorkspace: { id: string; status: 'draft' | 'sealed' } | null;
  workspaceId: string | null;
}

export default function MCMI4ProcessOrchestrator() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processStates, setProcessStates] = useState<ProcessState[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [creatingWorkspace, setCreatingWorkspace] = useState<number | null>(null);
  const [invitingPatientId, setInvitingPatientId] = useState<number | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  // AlertDialog state for reset confirmation
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<ProcessState | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;
      if (!token) {
        setError('Sesión no válida. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const API_BASE = getApiBaseUrl();

      // Fetch all required data
      const [patients, workspacesList] = await Promise.all([
        fetchPatients(false),
        swmMcmi4Api.listWorkspaces(undefined, token),
      ]);

      // Assignments are informational only; TestResult is the source of truth for the flow.
      const assignmentsResponse = await fetch(`${API_BASE}/assignments?test_type=mcmi4-signal`, {
        credentials: 'include',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let assignments: AssignmentPayload[] = [];
      if (assignmentsResponse.ok) {
        assignments = await assignmentsResponse.json();
      }

      // Build process states - fetch TestResults individually per patient
      const states: ProcessState[] = await Promise.all(
        patients.map(async (patient) => {
          const assignment = assignments.find((a) => a.patient_id === patient.id) || null;
          
          const patientUserId = typeof patient.user === 'number' 
            ? patient.user 
            : patient.user?.id;

          let testResult: SignalTestResult | null = null;
          let reflectionResult: ReflectionTestResult | null = null;

          if (patientUserId) {
            // Fetch TestResults for this specific user using user_id filter
            try {
              const signalUrl = `${API_BASE}/tests/results/?test_code=mcmi4-signal&user_id=${patientUserId}`;
              const reflUrl = `${API_BASE}/tests/results/?test_code=mcmi4-reflection&user_id=${patientUserId}`;
              
              console.log(`[Orchestrator] Fetching signal for patient ${patient.id}, user ${patientUserId}:`, signalUrl);
              
              const [signalResp, reflResp] = await Promise.all([
                fetch(signalUrl, {
                  credentials: 'include',
                  headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                  },
                }),
                fetch(reflUrl, {
                  credentials: 'include',
                  headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                  },
                }),
              ]);

              if (signalResp.ok) {
                const signalData = await signalResp.json();
                console.log(`[Orchestrator] Signal response for patient ${patient.id}:`, signalData);
                const allSignals: BasicTestResult[] = Array.isArray(signalData)
                  ? signalData
                  : (signalData.results || []);
                if (allSignals.length > 0) {
                  // Get latest
                  const latestSignal = allSignals
                    .sort((a, b) => {
                      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
                      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
                      return bTime - aTime;
                    })[0];
                  if (latestSignal) {
                    testResult = latestSignal as SignalTestResult;
                    console.log(`[Orchestrator] Found signal result ID ${latestSignal.id} for patient ${patient.id}`);
                  }
                } else {
                  console.log(`[Orchestrator] No signal result found for patient ${patient.id}`);
                }
              } else {
                console.error(`[Orchestrator] Signal fetch failed:`, signalResp.status, await signalResp.text());
              }

              if (reflResp.ok) {
                const reflData = await reflResp.json();
                const allReflections: BasicTestResult[] = Array.isArray(reflData)
                  ? reflData
                  : (reflData.results || []);
                if (allReflections.length > 0) {
                  const latestReflection = allReflections
                    .sort((a, b) => {
                      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
                      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
                      return bTime - aTime;
                    })[0];
                  if (latestReflection) {
                    reflectionResult = latestReflection as ReflectionTestResult;
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching results for patient ${patient.id}:`, err);
            }
          }

          // Check for reflection workspace if signal exists
          let reflectionWorkspace: { id: string; status: 'draft' | 'sealed' } | null = null;
          if (testResult) {
            try {
              const reflWs = await getReflectionBySignalId(String(testResult.id));
              if (reflWs) {
                reflectionWorkspace = {
                  id: reflWs.workspace_id,
                  status: reflWs.status,
                };
              }
            } catch (err) {
              // No reflection workspace yet - that's fine
              console.log(`No reflection workspace for patient ${patient.id} signal ${testResult.id}`, err);
            }
          }

          const workspaceId = testResult
            ? workspacesList.workspaces.find(
                (ws) => ws.mcmi4_source_data_id === String(testResult.id)
              )?.id || null
            : null;

          return {
            patient,
            assignment,
            testResult,
            reflectionResult,
            reflectionWorkspace,
            workspaceId,
          };
        })
      );

      setProcessStates(states);
    } catch (err) {
      console.error('Error fetching orchestrator data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAssignModal(true);
  };

  const handleAssignComplete = () => {
    setShowAssignModal(false);
    setSelectedPatient(null);
    fetchData(); // Refresh data
  };

  const handleCreateWorkspace = async (state: ProcessState) => {
    if (!state.testResult) return;

    try {
      const patientUserId = typeof state.patient.user === 'number' 
        ? state.patient.user 
        : state.patient.user?.id;

      if (!patientUserId) {
        toast.error(
          'No disponible: el Sujeto requiere cuenta vinculada para ejecutar esta Exploración. Contacta con soporte para vincular la cuenta.'
        );
        return;
      }

      setCreatingWorkspace(state.patient.id);

      const workspace = await swmMcmi4Api.createWorkspace({
        subject_user_id: String(patientUserId),
        mcmi4_source_data_id: String(state.testResult.id),
      });

      // Navigate to workspace
      router.push(`/dashboard/therapist/swm/mcmi4/${workspace.workspace_id}`);
    } catch (err) {
      console.error('Error creating workspace:', err);
      alert(`Error al crear workspace: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setCreatingWorkspace(null);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    router.push(`/dashboard/therapist/swm/mcmi4/${workspaceId}`);
  };

  const handleInviteReflection = async (state: ProcessState) => {
    if (!state.testResult) return;

    const patientUserId = typeof state.patient.user === 'number' 
      ? state.patient.user 
      : state.patient.user?.id;

    if (!patientUserId) {
      alert('Paciente sin usuario v lido.');
      return;
    }

    try {
      setInvitingPatientId(state.patient.id);
      const workspace = await createReflectionBySignal({
        subject_user_id: patientUserId,
        signal_id: String(state.testResult.id),
      });

      setProcessStates((prev) =>
        prev.map((ps) =>
          ps.patient.id === state.patient.id
            ? {
                ...ps,
                reflectionWorkspace: {
                  id: workspace.workspace_id,
                  status: workspace.status as 'draft' | 'sealed',
                },
              }
            : ps
        )
      );

      setFeedbackMessage('✅ Reflexión creada. El consultante la verá en su panel.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Error creating reflection workspace:', err);
      alert(
        `Error al generar reflexi¢n: ${err instanceof Error ? err.message : 'Error desconocido'}`
      );
    } finally {
      setInvitingPatientId(null);
    }
  };

  // Opens AlertDialog for reset confirmation
  const handleResetClick = (state: ProcessState) => {
    setResetTarget(state);
    setResetDialogOpen(true);
  };

  // Executes the actual reset after confirmation
  const handleResetConfirm = async () => {
    if (!resetTarget) return;
    const state = resetTarget;

    setResetDialogOpen(false);
    setDeletingPatient(state.patient.id);

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;
      if (!token) {
        alert('❌ Sesión no válida');
        setDeletingPatient(null);
        setResetTarget(null);
        return;
      }

      const API_BASE = getApiBaseUrl();

      // Delete TestResults (backend will handle cascading if needed)
      const deletePromises = [];

      if (state.testResult) {
        deletePromises.push(
          fetch(`${API_BASE}/tests/results/${state.testResult.id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          })
        );
      }

      if (state.reflectionResult) {
        deletePromises.push(
          fetch(`${API_BASE}/tests/results/${state.reflectionResult.id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          })
        );
      }

      if (state.assignment) {
        deletePromises.push(
          fetch(`${API_BASE}/assignments/${state.assignment.id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          })
        );
      }

      await Promise.allSettled(deletePromises);

      // Refresh data
      await fetchData();
      
      setFeedbackMessage('✅ Datos eliminados exitosamente');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting data:', err);
      setFeedbackMessage(`❌ Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setDeletingPatient(null);
      setResetTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Orquestación de Proceso MCMI-4</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Orquestación de Proceso MCMI-4</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Orquestación de Proceso MCMI-4</h2>
              <p className="text-xs text-gray-600 mt-1">
                Gestión completa: Asignación → Señal → Reflexión → Workspace → Interpretación
              </p>
            </div>
          </div>
          {feedbackMessage && (
            <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              {feedbackMessage}
            </div>
          )}
        </div>

        {processStates.length === 0 ? (
          <div className="px-6 py-8">
            <p className="text-sm text-gray-600">
              No hay consultantes registrados. Crea consultantes primero en Gestión de Consultantes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Señal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reflexión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workspace
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processStates.map((state) => (
                  <tr key={state.patient.id}>
                    {/* Consultante */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{state.patient.full_name}</p>
                          <p className="text-xs text-gray-500">ID: {state.patient.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Assignment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {state.testResult ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">Completado</p>
                            <p className="text-xs text-gray-500">Señal ya existe</p>
                          </div>
                        </div>
                      ) : state.assignment ? (
                        <div className="flex items-center gap-2">
                          {state.assignment.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {state.assignment.status === 'assigned' && 'Asignado'}
                              {state.assignment.status === 'in_progress' && 'En progreso'}
                              {state.assignment.status === 'completed' && 'Completado'}
                              {state.assignment.status === 'pending_compute' && 'Procesando'}
                            </p>
                            <p className="text-xs text-gray-500">ID: {state.assignment.id}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">No asignado</span>
                        </div>
                      )}
                    </td>

                    {/* TestResult Status (Signal) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {state.testResult ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">Completado</p>
                            <p className="text-xs text-gray-500">ID: {state.testResult.id}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Pendiente</span>
                        </div>
                      )}
                    </td>

                    {/* Reflection Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {state.reflectionWorkspace?.status === 'sealed' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">Completada</p>
                            <button
                              onClick={() => {
                                const userId = typeof state.patient.user === 'number' 
                                  ? state.patient.user 
                                  : state.patient.user?.id;
                                router.push(`/dashboard/therapist/swm/mcmi4-reflection/${userId}`);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Ver reflexión
                            </button>
                          </div>
                        </div>
                      ) : state.reflectionWorkspace?.status === 'draft' ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">En progreso</p>
                            <p className="text-xs text-gray-500">Borrador activo</p>
                          </div>
                        </div>
                      ) : state.testResult ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <button
                              onClick={() => handleInviteReflection(state)}
                              disabled={invitingPatientId === state.patient.id}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer disabled:opacity-60"
                            >
                              {invitingPatientId === state.patient.id ? 'Creando...' : 'Habilitar reflexión'}
                            </button>
                            <p className="text-xs text-gray-500">Consultante la verá en su panel</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Pendiente señal</span>
                        </div>
                      )}
                    </td>

                    {/* Workspace Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {state.workspaceId ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">Creado</p>
                            <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">
                              {state.workspaceId}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">No creado</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {state.workspaceId ? (
                          <button
                            onClick={() => handleOpenWorkspace(state.workspaceId!)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90"
                            style={{ backgroundColor: '#7c3aed' }}
                          >
                            <Sparkles className="w-3 h-3" />
                            Abrir Workspace
                          </button>
                        ) : state.testResult && state.reflectionWorkspace?.status === 'sealed' ? (
                          <button
                            onClick={() => handleCreateWorkspace(state)}
                            disabled={creatingWorkspace === state.patient.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#7c3aed' }}
                          >
                            {creatingWorkspace === state.patient.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                Crear Workspace
                              </>
                            )}
                          </button>
                        ) : state.testResult && state.reflectionWorkspace?.status === 'draft' ? (
                          <span className="text-xs text-amber-600">Reflexión en borrador</span>
                        ) : state.testResult && !state.reflectionWorkspace ? (
                          <span className="text-xs text-amber-600">Esperando reflexión</span>
                        ) : !state.assignment ? (
                          <button
                            onClick={() => handleAssignClick(state.patient)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          >
                            <ClipboardList className="w-3 h-3" />
                            Asignar SIGNAL
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Esperando respuesta</span>
                        )}
                        
                        {/* Reset button - always available if there's any data */}
                        {(state.assignment || state.testResult || state.reflectionResult || state.workspaceId) && (
                          <button
                            onClick={() => handleResetClick(state)}
                            disabled={deletingPatient === state.patient.id}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                            title="Eliminar todos los datos de MCMI-4 para este paciente"
                          >
                            {deletingPatient === state.patient.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedPatient && (
        <AssignMCMI4Modal
          open={showAssignModal}
          onClose={handleAssignComplete}
          patientId={selectedPatient.id}
          patientName={selectedPatient.full_name}
          patientUserId={
            typeof selectedPatient.user === 'number'
              ? selectedPatient.user
              : selectedPatient.user?.id || null
          }
        />
      )}

      {/* AlertDialog for reset confirmation */}
      <AlertDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Eliminar datos MCMI-4"
        description={`¿Eliminar TODOS los datos de MCMI-4 para ${resetTarget?.patient.full_name}? Esta acción NO se puede deshacer.`}
        items={resetTarget ? [
          resetTarget.assignment ? `Assignment (ID: ${resetTarget.assignment.id})` : null,
          resetTarget.testResult ? `TestResult Signal (ID: ${resetTarget.testResult.id})` : null,
          resetTarget.reflectionResult ? `TestResult Reflection (ID: ${resetTarget.reflectionResult.id})` : null,
          resetTarget.workspaceId ? `Workspace (${resetTarget.workspaceId})` : null,
        ].filter((item): item is string => item !== null) : []}
        confirmLabel="Eliminar todo"
        cancelLabel="Cancelar"
        onConfirm={handleResetConfirm}
        destructive
        loading={deletingPatient !== null}
      />
    </>
  );
}
