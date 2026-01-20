/**
 * MCMI-4 Místico Workspaces - List View
 * 
 * Main page for listing and accessing MCMI-4 Místico workspaces
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { swmMcmi4Api, WorkspaceInstance, WorkspaceStatus } from '@/lib/api/swm-mcmi4-api';
import { WorkspaceCard } from '@/components/swm';

export default function SwmMcmi4Page() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WorkspaceStatus | 'all'>('all');

  useEffect(() => {
    loadWorkspaces();
  }, [statusFilter]);

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const response = await swmMcmi4Api.listWorkspaces(filters);
      setWorkspaces(response.workspaces);
    } catch (err: any) {
      setError(err.message || 'Error al cargar workspaces');
      console.error('Error loading workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    router.push(`/swm-mcmi4/${workspaceId}`);
  };

  const handleViewResults = (workspaceId: string) => {
    router.push(`/swm-mcmi4/${workspaceId}/results`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MCMI-4 Místico - Workspaces
        </h1>
        <p className="text-gray-600">
          Espacios de trabajo especializados para interpretación cabalística del MCMI-4
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                statusFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {(['created', 'in_progress', 'sealed', 'reviewed'] as WorkspaceStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-sm ${
                  statusFilter === status
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'created' && 'Creado'}
                {status === 'in_progress' && 'En Progreso'}
                {status === 'sealed' && 'Sellado'}
                {status === 'reviewed' && 'Revisado'}
              </button>
            ))}
          </div>
          <button
            onClick={loadWorkspaces}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando workspaces...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadWorkspaces}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Workspaces Grid */}
      {!loading && !error && (
        <>
          {workspaces.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No se encontraron workspaces</p>
              <p className="text-sm text-gray-500">
                Los workspaces aparecerán aquí cuando sean creados por terapeutas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onOpen={handleOpenWorkspace}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Total: {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
