/**
 * WorkspaceCard - Display workspace summary
 * 
 * Shows workspace status, subject, dates, and action buttons
 */

import React from 'react';
import { WorkspaceInstance, WorkspaceStatus } from '@/lib/api/swm-mcmi4-api';

interface WorkspaceCardProps {
  workspace: WorkspaceInstance;
  onOpen?: (workspaceId: string) => void;
  onViewResults?: (workspaceId: string) => void;
}

const statusColors: Record<WorkspaceStatus, string> = {
  created: 'bg-gray-200 text-gray-800',
  in_progress: 'bg-blue-200 text-blue-800',
  sealed: 'bg-green-200 text-green-800',
  reviewed: 'bg-purple-200 text-purple-800',
  archived: 'bg-gray-300 text-gray-600',
};

const statusLabels: Record<WorkspaceStatus, string> = {
  created: 'Creado',
  in_progress: 'En Progreso',
  sealed: 'Sellado',
  reviewed: 'Revisado',
  archived: 'Archivado',
};

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onOpen,
  onViewResults,
}) => {
  const canOpen = workspace.status === 'created' || workspace.status === 'in_progress';
  const canViewResults = workspace.status === 'sealed' || workspace.status === 'reviewed' || workspace.status === 'archived';

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            MCMI-4 Místico
          </h3>
          <p className="text-sm text-gray-600">
            ID: {workspace.id.slice(0, 8)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[workspace.status]}`}>
          {statusLabels[workspace.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Sujeto:</span>
          <span className="text-gray-900 font-medium">{workspace.subject_user_id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Creado:</span>
          <span className="text-gray-900">{new Date(workspace.created_at).toLocaleDateString()}</span>
        </div>
        {workspace.started_at && (
          <div className="flex justify-between">
            <span className="text-gray-600">Iniciado:</span>
            <span className="text-gray-900">{new Date(workspace.started_at).toLocaleDateString()}</span>
          </div>
        )}
        {workspace.sealed_at && (
          <div className="flex justify-between">
            <span className="text-gray-600">Sellado:</span>
            <span className="text-gray-900">{new Date(workspace.sealed_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {canOpen && onOpen && (
          <button
            onClick={() => onOpen(workspace.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Abrir Sesión
          </button>
        )}
        {canViewResults && onViewResults && (
          <button
            onClick={() => onViewResults(workspace.id)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            Ver Resultados
          </button>
        )}
      </div>
    </div>
  );
};
