/**
 * MCMI-4 Místico Workspace - Execution View
 * 
 * Individual workspace with session control and artifact viewing
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { swmMcmi4Api, WorkspaceStatusResponse, WorkspaceSession, WorkspaceArtifact } from '@/lib/api/swm-mcmi4-api';
import { SessionControl, ArtifactViewer } from '@/components/swm';

export default function WorkspaceExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<WorkspaceStatusResponse | null>(null);
  const [artifacts, setArtifacts] = useState<WorkspaceArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspace();
    loadArtifacts();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await swmMcmi4Api.getWorkspaceStatus(workspaceId);
      setWorkspace(status);
    } catch (err: any) {
      setError(err.message || 'Error al cargar workspace');
      console.error('Error loading workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadArtifacts = async () => {
    try {
      const response = await swmMcmi4Api.getArtifacts(workspaceId);
      setArtifacts(response.artifacts);
    } catch (err: any) {
      console.error('Error loading artifacts:', err);
    }
  };

  const handleStartSession = async () => {
    try {
      await swmMcmi4Api.startSession({ workspace_id: workspaceId });
      await loadWorkspace();
    } catch (err: any) {
      alert(`Error al iniciar sesión: ${err.message}`);
    }
  };

  const handleEndSession = async () => {
    // End session logic would go here
    // For now, just reload
    await loadWorkspace();
  };

  const handleAdvancePhase = async (newPhase: string) => {
    if (!workspace?.active_session) return;

    try {
      await swmMcmi4Api.recordProgress({
        workspace_id: workspaceId,
        session_id: workspace.active_session.session_id,
        action: 'advance_phase',
        payload: { new_phase: newPhase },
      });
      await loadWorkspace();
    } catch (err: any) {
      alert(`Error al avanzar fase: ${err.message}`);
    }
  };

  const handleRecordDecision = async () => {
    if (!workspace?.active_session) return;

    const decision = prompt('Ingresa la decisión interpretativa:');
    if (!decision) return;

    try {
      await swmMcmi4Api.recordProgress({
        workspace_id: workspaceId,
        session_id: workspace.active_session.session_id,
        action: 'record_decision',
        payload: { decision },
      });
      await loadWorkspace();
      await loadArtifacts();
    } catch (err: any) {
      alert(`Error al registrar decisión: ${err.message}`);
    }
  };

  const handleSealWorkspace = async () => {
    if (!workspace?.active_session) return;

    const confirmed = confirm(
      '¿Seguro que deseas sellar el workspace? Esta acción es irreversible.'
    );
    if (!confirmed) return;

    const synthesis = prompt('Ingresa síntesis final (JSON o texto):');
    if (!synthesis) return;

    try {
      const finalSynthesis = JSON.parse(synthesis);
      await swmMcmi4Api.sealWorkspace({
        workspace_id: workspaceId,
        session_id: workspace.active_session.session_id,
        final_synthesis: finalSynthesis,
      });
      await loadWorkspace();
      alert('Workspace sellado exitosamente');
      router.push(`/swm-mcmi4/${workspaceId}/results`);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        // Try plain text
        try {
          await swmMcmi4Api.sealWorkspace({
            workspace_id: workspaceId,
            session_id: workspace.active_session.session_id,
            final_synthesis: { text: synthesis },
          });
          await loadWorkspace();
          alert('Workspace sellado exitosamente');
          router.push(`/swm-mcmi4/${workspaceId}/results`);
        } catch (err2: any) {
          alert(`Error al sellar workspace: ${err2.message}`);
        }
      } else {
        alert(`Error al sellar workspace: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando workspace...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Workspace no encontrado'}</p>
          <button
            onClick={() => router.push('/swm-mcmi4')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a lista
          </button>
        </div>
      </div>
    );
  }

  const activeSession: WorkspaceSession | undefined = workspace.active_session
    ? {
        id: workspace.active_session.session_id,
        workspace_instance: workspaceId,
        executor_user_id: workspace.active_session.executor_user_id,
        started_at: workspace.active_session.started_at,
        session_state: {},
        interactions_count: workspace.active_session.interactions_count,
        current_phase: workspace.active_session.current_phase,
        is_active: true,
      }
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/swm-mcmi4')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Volver a lista
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MCMI-4 Místico - Workspace
        </h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>ID: {workspaceId.slice(0, 8)}</span>
          <span>Estado: <strong>{workspace.status}</strong></span>
          <span>Sujeto: {workspace.subject_user_id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Session Control */}
        <div className="lg:col-span-1">
          <SessionControl
            workspaceId={workspaceId}
            session={activeSession}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            onAdvancePhase={handleAdvancePhase}
          />

          {/* Action Buttons */}
          {activeSession && (
            <div className="mt-6 space-y-3">
              <button
                onClick={handleRecordDecision}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Registrar Decisión
              </button>
              <button
                onClick={handleSealWorkspace}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Sellar Workspace
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Artifacts */}
        <div className="lg:col-span-2">
          <ArtifactViewer artifacts={artifacts} onRefresh={loadArtifacts} />
        </div>
      </div>

      {/* Workspace Info */}
      <div className="mt-8 bg-gray-50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Información del Workspace</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Creado:</p>
            <p className="font-medium">{new Date(workspace.created_at).toLocaleString()}</p>
          </div>
          {workspace.started_at && (
            <div>
              <p className="text-gray-600">Iniciado:</p>
              <p className="font-medium">{new Date(workspace.started_at).toLocaleString()}</p>
            </div>
          )}
          {workspace.sealed_at && (
            <div>
              <p className="text-gray-600">Sellado:</p>
              <p className="font-medium">{new Date(workspace.sealed_at).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Artefactos:</p>
            <p className="font-medium">
              {Object.entries(workspace.artifacts_count).map(([type, count]) => (
                <span key={type} className="mr-3">
                  {type}: {count}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
