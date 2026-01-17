/**
 * WorkspaceListView - Dashboard for SWM MCMI-4 Workspaces
 * 
 * Lists all workspaces accessible to current user
 * Allows creation of new workspaces
 * Shows status: created, in_progress, sealed, reviewed
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  swmMcmi4Api,
  type WorkspaceInstance,
  type WorkspaceStatus,
} from '@/lib/api/swm-mcmi4-api';
import { WorkspaceCard } from '@/components/swm';
import {
  PlusCircleIcon,
  FunnelIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

interface WorkspaceListViewProps {
  onOpenWorkspace?: (workspaceId: string) => void;
  onViewResults?: (workspaceId: string) => void;
  onCreateNew?: () => void;
}

const STATUS_FILTERS: Array<{ value: WorkspaceStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'Todos', color: 'gray' },
  { value: 'created', label: 'Creados', color: 'gray' },
  { value: 'in_progress', label: 'En Progreso', color: 'blue' },
  { value: 'sealed', label: 'Sellados', color: 'green' },
  { value: 'reviewed', label: 'Revisados', color: 'purple' },
];

export const WorkspaceListView: React.FC<WorkspaceListViewProps> = ({
  onOpenWorkspace,
  onViewResults,
  onCreateNew,
}) => {
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<WorkspaceInstance[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<WorkspaceInstance[]>([]);
  const [statusFilter, setStatusFilter] = useState<WorkspaceStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredWorkspaces(workspaces);
    } else {
      setFilteredWorkspaces(workspaces.filter(w => w.status === statusFilter));
    }
  }, [statusFilter, workspaces]);

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await swmMcmi4Api.listWorkspaces();
      setWorkspaces(response.workspaces);
      setFilteredWorkspaces(response.workspaces);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to load workspaces';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: WorkspaceStatus | 'all'): number => {
    if (status === 'all') return workspaces.length;
    return workspaces.filter(w => w.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error al cargar workspaces</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={loadWorkspaces}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workspaces MCMI-4 Místico</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestiona tus espacios de trabajo de análisis simbólico
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Nuevo Workspace
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(filter => {
            const count = getStatusCount(filter.value);
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {filter.label}
                <span className={`ml-2 ${isActive ? 'text-purple-200' : 'text-gray-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspaces Grid */}
      {filteredWorkspaces.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">
            {statusFilter === 'all'
              ? 'No tienes workspaces aún'
              : `No hay workspaces en estado "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}"`
            }
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Crea un nuevo workspace para comenzar con el análisis MCMI-4
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Crear Primer Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map(workspace => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onOpen={onOpenWorkspace}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {workspaces.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-900">{workspaces.length}</p>
              <p className="text-xs text-purple-700">Total Workspaces</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {workspaces.filter(w => w.status === 'in_progress').length}
              </p>
              <p className="text-xs text-blue-700">En Progreso</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {workspaces.filter(w => w.status === 'sealed').length}
              </p>
              <p className="text-xs text-green-700">Sellados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {workspaces.filter(w => w.status === 'reviewed').length}
              </p>
              <p className="text-xs text-purple-700">Revisados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
