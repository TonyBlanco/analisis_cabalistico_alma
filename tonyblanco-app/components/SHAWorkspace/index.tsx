'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Layers, Plus, Lock, Eye, AlertCircle, ArrowLeft, Send, CheckCircle, Clock, FileText, RotateCcw } from 'lucide-react';
import { swmShaApi, WorkspaceInstance, WorkspaceArtifact } from '@/lib/api/swm-sha-api';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import { createAssignment } from '@/lib/assignment-api';
import { AIInterpretationPanel } from '@/components/ai';

// SHA Harmony test result interface
interface ShaHarmonyResult {
  id: number;
  test_module: { code: string; name: string };
  scores: Record<string, any>;
  interpretation?: string;
  created_at: string;
}

// Assignment status interface
interface AssignmentStatus {
  exists: boolean;
  id?: number;
  status?: string;
  created_at?: string;
}

export default function SHAWorkspace() {
  // Active patient from therapist context
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientUserId, setPatientUserId] = useState<number | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  
  // Workspace state
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceInstance | null>(null);
  const [artifacts, setArtifacts] = useState<WorkspaceArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // SHA Harmony test state
  const [shaHarmonyResult, setShaHarmonyResult] = useState<ShaHarmonyResult | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>({ exists: false });
  const [sendingAssignment, setSendingAssignment] = useState(false);
  const [resettingAssignment, setResettingAssignment] = useState(false);

  // Load active patient from global context (set by therapist dashboard)
  useEffect(() => {
    const loadActivePatient = async () => {
      setIsLoadingPatient(true);
      const activeId = getActivePatientId();
      const activeName = getActivePatientName();
      
      if (activeId) {
        setPatientId(activeId);
        setPatientName(activeName);
        
        // Fetch patient profile to get user_id (needed for workspace)
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_BASE_URL}/therapist/patients/${activeId}/profile/`, {
            headers: {
              'Authorization': `Token ${token}`,
            },
          });
          if (response.ok) {
            const profile = await response.json();
            setPatientUserId(profile.user_id || profile.user);
          }
        } catch (err) {
          console.error('Error fetching patient user_id:', err);
        }
      }
      setIsLoadingPatient(false);
    };
    
    loadActivePatient();
    
    // Listen for active patient changes
    const handlePatientChange = () => {
      loadActivePatient();
    };
    
    window.addEventListener('activePatientChanged', handlePatientChange);
    return () => window.removeEventListener('activePatientChanged', handlePatientChange);
  }, []);

  // Load workspace when patient is available
  useEffect(() => {
    if (!patientUserId) return;
    loadWorkspace();
    loadShaHarmonyStatus();
  }, [patientUserId]);

  // Check if patient has SHA Harmony test result or pending assignment
  const loadShaHarmonyStatus = async () => {
    if (!patientId || !patientUserId) return;
    
    try {
      const token = getAuthToken();
      
      // Check assignments for sha_harmony - this includes both pending and completed
      const assignmentsResponse = await fetch(
        `${API_BASE_URL}/assignments?patient_id=${patientId}&test_type=sha_harmony`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignments = assignmentsData.results || assignmentsData;
        
        if (assignments.length > 0) {
          // Sort by created_at descending to get the most recent
          const sortedAssignments = assignments.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latestAssignment = sortedAssignments[0];
          
          if (latestAssignment.status === 'completed' && latestAssignment.results) {
            // Assignment completed - show results
            setShaHarmonyResult({
              id: latestAssignment.id,
              test_module: { code: 'sha_harmony', name: 'Armonía Sefirótica (SHA)' },
              scores: latestAssignment.results,
              created_at: latestAssignment.updated_at || latestAssignment.created_at,
            });
            setAssignmentStatus({
              exists: true,
              id: latestAssignment.id,
              status: 'completed',
              created_at: latestAssignment.created_at,
            });
          } else {
            // Assignment pending or in progress
            setAssignmentStatus({
              exists: true,
              id: latestAssignment.id,
              status: latestAssignment.status,
              created_at: latestAssignment.created_at,
            });
            setShaHarmonyResult(null);
          }
          return;
        }
      }
      
      // No assignment found
      setAssignmentStatus({ exists: false });
      setShaHarmonyResult(null);
    } catch (err) {
      console.error('Error checking SHA Harmony status:', err);
    }
  };

  // Send SHA Harmony questionnaire to patient
  const handleSendShaQuestionnaire = async () => {
    if (!patientId || !patientUserId) return;
    
    try {
      setSendingAssignment(true);
      setError(null);
      
      await createAssignment({
        patient_id: patientId,
        assigned_to_user_id: patientUserId,
        test_type: 'sha_harmony',
        n_questions: 10, // cuestionario SHA: 10 ítems
      });
      
      setAssignmentStatus({
        exists: true,
        status: 'assigned',
        created_at: new Date().toISOString(),
      });
      
      // Reload status to confirm
      await loadShaHarmonyStatus();
    } catch (err: any) {
      setError(err.message || 'Error enviando cuestionario');
    } finally {
      setSendingAssignment(false);
    }
  };

  // Reset SHA Harmony assignment (delete assignment and test results)
  const handleResetAssignment = async () => {
    if (!assignmentStatus.id) return;
    
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas resetear este cuestionario? Se eliminarán los resultados actuales y el paciente deberá completarlo nuevamente.'
    );
    if (!confirmed) return;
    
    try {
      setResettingAssignment(true);
      setError(null);
      
      const token = getAuthToken();
      
      // Call backend to reset the assignment
      const response = await fetch(
        `${API_BASE_URL}/assignments/${assignmentStatus.id}/reset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Error reseteando cuestionario');
      }
      
      // Clear local state and reload
      setShaHarmonyResult(null);
      setAssignmentStatus({ exists: true, id: assignmentStatus.id, status: 'assigned' });
      await loadShaHarmonyStatus();
    } catch (err: any) {
      setError(err.message || 'Error reseteando cuestionario');
    } finally {
      setResettingAssignment(false);
    }
  };

  const loadWorkspace = async () => {
    if (!patientUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all workspaces and find one for this patient
      const workspaces = await swmShaApi.listWorkspaces();
      const activeWorkspace = workspaces.find(
        w => w.subject_user.id === patientUserId && 
             (w.status === 'created' || w.status === 'in_progress')
      );
      
      if (activeWorkspace) {
        setCurrentWorkspace(activeWorkspace);
        await loadArtifacts(activeWorkspace.id);
      } else {
        setCurrentWorkspace(null);
        setArtifacts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando workspace');
      console.error('Error loading workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadArtifacts = async (instanceId: string) => {
    try {
      const artifactsData = await swmShaApi.listArtifacts(instanceId);
      setArtifacts(artifactsData);
    } catch (err: any) {
      console.error('Error loading artifacts:', err);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!patientUserId) {
      setError('No hay consultante activo');
      return;
    }

    try {
      setLoading(true);
      await swmShaApi.createWorkspace({
        subject_user_id: patientUserId,
        config: { version: '1.0' },
        metadata: {
          created_by_ui: 'therapist-swm',
          consultante_name: patientName || 'Consultante',
        },
      });
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || 'Error creando workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSealWorkspace = async () => {
    if (!currentWorkspace) return;
    
    if (!confirm('¿Sellar este workspace? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await swmShaApi.sealWorkspace({ instance_id: currentWorkspace.id });
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || 'Error sellando workspace');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      created: 'bg-gray-200 text-gray-800',
      in_progress: 'bg-blue-200 text-blue-800',
      sealed: 'bg-green-200 text-green-800',
      reviewed: 'bg-purple-200 text-purple-800',
      archived: 'bg-red-200 text-red-800',
    };

    const statusLabels: Record<string, string> = {
      created: 'Creado',
      in_progress: 'En progreso',
      sealed: 'Sellado',
      reviewed: 'Revisado',
      archived: 'Archivado',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-200 text-gray-800'}`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  // No patient selected - show message
  if (!isLoadingPatient && !patientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Workspace Especializado</p>
              <h1 className="text-2xl font-semibold text-gray-900">Auditoría de Armonía Sefirótica (SHA)</h1>
            </div>
          </div>
          <Link
            href="/dashboard/therapist"
            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al espacio clínico
          </Link>
        </header>
        
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
            <h2 className="mb-2 text-lg font-semibold text-gray-900">No hay consultante activo</h2>
            <p className="mb-4 text-gray-600">
              Debes seleccionar un consultante desde tu espacio de trabajo antes de acceder al módulo SHA.
            </p>
            <Link
              href="/dashboard/therapist"
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Ir al dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace Especializado</p>
            <h1 className="text-2xl font-semibold text-gray-900">Auditoría de Armonía Sefirótica (SHA)</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Patient context indicator */}
          <div className="rounded-lg bg-purple-50 px-4 py-2 text-sm">
            <span className="text-gray-500">Consultante:</span>{' '}
            <span className="font-medium text-purple-700">{patientName || 'Cargando...'}</span>
          </div>
          <Link
            href="/dashboard/therapist"
            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al espacio clínico
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Info Banner */}
        <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800">
          Sistema de workspace para evaluación holística de balance sefirótico
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <strong>Error:</strong> {error}
              <button onClick={() => setError(null)} className="ml-2 underline">
                Cerrar
              </button>
            </div>
          </div>
        )}

        {loading || isLoadingPatient ? (
          <div className="py-12 text-center text-gray-500">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            Cargando workspace...
          </div>
        ) : currentWorkspace ? (
          /* Workspace exists - show details */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Workspace Info */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Workspace SHA: {currentWorkspace.subject_user.first_name} {currentWorkspace.subject_user.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">ID: {currentWorkspace.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(currentWorkspace.status)}
                    {currentWorkspace.status === 'in_progress' && (
                      <button
                        onClick={handleSealWorkspace}
                        className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <Lock className="h-4 w-4" />
                        Sellar
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Creado</p>
                    <p className="text-sm text-gray-900">
                      {new Date(currentWorkspace.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  {currentWorkspace.started_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Iniciado</p>
                      <p className="text-sm text-gray-900">
                        {new Date(currentWorkspace.started_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}
                  {currentWorkspace.sealed_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Sellado</p>
                      <p className="text-sm text-gray-900">
                        {new Date(currentWorkspace.sealed_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Workspace content - SHA Harmony Status */}
                <div className="space-y-4">
                  {/* SHA Harmony Result Card */}
                  {shaHarmonyResult ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="font-semibold text-green-800">Cuestionario SHA Harmony Completado</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Fecha de completado</p>
                          <p className="font-medium">{new Date(shaHarmonyResult.created_at).toLocaleString('es-ES')}</p>
                        </div>
                        {/* Handle v2 format (harmony_index) */}
                        {shaHarmonyResult.scores?.harmony_index !== undefined ? (
                          <>
                            <div>
                              <p className="text-gray-500">Índice de Armonía</p>
                              <p className="font-medium text-lg">
                                {shaHarmonyResult.scores.harmony_index.toFixed(1)} / 5.0
                              </p>
                            </div>
                            {shaHarmonyResult.scores.harmony_level && (
                              <div className="col-span-2">
                                <p className="text-gray-500">Nivel de Armonía</p>
                                <p className={`font-semibold ${
                                  shaHarmonyResult.scores.harmony_level === 'excellent' ? 'text-green-600' :
                                  shaHarmonyResult.scores.harmony_level === 'good' ? 'text-blue-600' :
                                  shaHarmonyResult.scores.harmony_level === 'moderate' ? 'text-yellow-600' :
                                  'text-orange-600'
                                }`}>
                                  {shaHarmonyResult.scores.harmony_label || shaHarmonyResult.scores.harmony_level}
                                </p>
                              </div>
                            )}
                            {shaHarmonyResult.scores.sefirot_scores && (
                              <div className="col-span-2">
                                <p className="text-gray-500 mb-2">Distribución Sefirótica</p>
                                <div className="space-y-1">
                                  {Object.entries(shaHarmonyResult.scores.sefirot_scores).map(([sefira, score]) => (
                                    <div key={sefira} className="flex items-center gap-2 text-xs">
                                      <span className="w-20 text-purple-700 font-medium">{sefira}</span>
                                      <div className="flex-1 bg-purple-200 rounded-full h-1.5">
                                        <div
                                          className="bg-purple-600 h-1.5 rounded-full"
                                          style={{ width: `${(Number(score) / 5) * 100}%` }}
                                        />
                                      </div>
                                      <span className="w-10 text-right text-purple-700 font-bold">{String(score)}/5</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {shaHarmonyResult.scores.recommendations && shaHarmonyResult.scores.recommendations.length > 0 && (
                              <div className="col-span-2 mt-2 pt-2 border-t border-green-200">
                                <p className="text-gray-500 mb-1">Recomendaciones</p>
                                <ul className="space-y-0.5 text-xs text-gray-700">
                                  {shaHarmonyResult.scores.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-green-600">✓</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (shaHarmonyResult.scores?.total !== undefined || shaHarmonyResult.scores?.schema_version) ? (
                          /* Handle v1 format (legacy) */
                          <>
                            <div>
                              <p className="text-gray-500">Puntuación Total</p>
                              <p className="font-medium text-lg">
                                {shaHarmonyResult.scores.total ?? 'N/A'} / {shaHarmonyResult.scores.max_score ?? 40}
                              </p>
                            </div>
                            {shaHarmonyResult.scores.zone && (
                              <div className="col-span-2">
                                <p className="text-gray-500">Zona de Riesgo</p>
                                <p className={`font-semibold ${
                                  shaHarmonyResult.scores.zone === 'Low risk' ? 'text-green-600' :
                                  shaHarmonyResult.scores.zone === 'Hazardous use' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {shaHarmonyResult.scores.zone_label || shaHarmonyResult.scores.zone}
                                </p>
                              </div>
                            )}
                            {shaHarmonyResult.scores.sefira && (
                              <div className="col-span-2">
                                <p className="text-gray-500">Correspondencia Sefirótica</p>
                                <p className="font-medium text-purple-700">✡ {shaHarmonyResult.scores.sefira}</p>
                              </div>
                            )}
                            {shaHarmonyResult.scores.interpretation && (
                              <div className="col-span-2 mt-2 pt-2 border-t border-green-200">
                                <p className="text-sm text-gray-600">{shaHarmonyResult.scores.interpretation}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          // Legacy format - just show completion status
                          <div className="col-span-2">
                            <p className="text-gray-500">Estado</p>
                            <p className="font-medium text-green-600">
                              {shaHarmonyResult.scores?.message || 'Completado - Pendiente de análisis detallado'}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Reset button */}
                      <div className="mt-4 pt-3 border-t border-green-200 flex justify-end">
                        <button
                          onClick={handleResetAssignment}
                          disabled={resettingAssignment}
                          className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <RotateCcw className={`h-4 w-4 ${resettingAssignment ? 'animate-spin' : ''}`} />
                          {resettingAssignment ? 'Reseteando...' : 'Reenviar cuestionario'}
                        </button>
                      </div>
                    </div>
                  ) : assignmentStatus.exists ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-6 w-6 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Cuestionario Pendiente</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        El cuestionario SHA Harmony fue enviado al paciente y está esperando ser completado.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Enviado: {assignmentStatus.created_at ? new Date(assignmentStatus.created_at).toLocaleString('es-ES') : 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-blue-800">Cuestionario SHA Harmony</h3>
                            <p className="text-sm text-gray-600">
                              Evaluación de equilibrio sefirótico (Netzach) - 10 preguntas
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleSendShaQuestionnaire}
                          disabled={sendingAssignment}
                          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {sendingAssignment ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Enviar al paciente
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Interpretation Panel */}
                  {shaHarmonyResult && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      <AIInterpretationPanel 
                        testResultId={shaHarmonyResult.id}
                        onRefresh={() => loadShaHarmonyStatus()}
                      />
                    </div>
                  )}
                  
                  {/* Workspace Analysis Placeholder */}
                  {!shaHarmonyResult && (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <Layers className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">Área de trabajo del módulo SHA</p>
                      <p className="mt-2 text-sm text-gray-400">
                        Envía el cuestionario al paciente para comenzar el análisis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Artifacts Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Artefactos ({artifacts.length})
                </h3>
                {artifacts.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                    No hay artefactos guardados
                  </div>
                ) : (
                  <div className="space-y-3">
                    {artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <p className="font-medium text-gray-900">
                          {artifact.artifact_type_display}
                        </p>
                        <p className="text-xs text-gray-500">
                          v{artifact.version} • {new Date(artifact.created_at).toLocaleDateString('es-ES')}
                        </p>
                        <div className="mt-2 flex gap-2">
                          {artifact.is_sealed && (
                            <span className="text-xs text-green-600">
                              <Lock className="inline h-3 w-3" /> Sellado
                            </span>
                          )}
                          {artifact.share_with_consultant && (
                            <span className="text-xs text-blue-600">
                              <Eye className="inline h-3 w-3" /> Compartido
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No workspace - show create option */
          <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center">
            <Layers className="mx-auto mb-4 h-16 w-16 text-purple-300" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No hay workspace activo
            </h2>
            <p className="mb-6 text-gray-600">
              No existe un workspace SHA activo para <strong>{patientName}</strong>.
              Crea uno para comenzar la auditoría de armonía sefirótica.
            </p>
            <button
              onClick={handleCreateWorkspace}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Crear Workspace SHA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
