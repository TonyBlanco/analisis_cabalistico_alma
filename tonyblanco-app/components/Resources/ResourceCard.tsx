'use client';

import { useState } from 'react';
import { Resource } from '@/lib/resources-api';
import SessionLinkModal from './SessionLinkModal';

interface ResourceCardProps {
  resource: Resource;
  onAssign?: (resourceId: number) => void;
  onUnassign?: (resourceId: number) => void;
  showAssignButton?: boolean;
  showUnassignButton?: boolean;
  therapistNotes?: string;
  readOnly?: boolean;
}

/**
 * ResourceCard Component
 * 
 * Reusable card component for displaying resources.
 * Handles different resource types including external session links.
 */
export default function ResourceCard({
  resource,
  onAssign,
  onUnassign,
  showAssignButton = false,
  showUnassignButton = false,
  therapistNotes,
  readOnly = false,
}: ResourceCardProps) {
  const [showSessionModal, setShowSessionModal] = useState(false);

  const getResourceTypeBadge = (type: string) => {
    const typeMap: Record<string, { bg: string; text: string; label: string }> = {
      pdf: { bg: 'bg-red-100', text: 'text-red-800', label: 'PDF' },
      audio: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'AUDIO' },
      video: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'VIDEO' },
      class: { bg: 'bg-green-100', text: 'text-green-800', label: 'CLASE' },
      session: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'SESIÓN' },
    };

    const config = typeMap[type.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type.toUpperCase() };
    return (
      <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getAccessLevelBadge = (level: string) => {
    const levelMap: Record<string, { bg: string; text: string; label: string }> = {
      free: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Gratuito' },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Asignado' },
      paid: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'De pago' },
    };

    const config = levelMap[level] || { bg: 'bg-gray-100', text: 'text-gray-700', label: level };
    return (
      <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleResourceOpen = () => {
    // Check if it's a session/class with external link
    if ((resource.resource_type === 'class' || resource.resource_type === 'session') && resource.external_link) {
      setShowSessionModal(true);
    } else if (resource.file_url) {
      // Regular file resource - open directly
      window.open(resource.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmSession = () => {
    if (resource.external_link) {
      window.open(resource.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  const isSessionType = resource.resource_type === 'class' || resource.resource_type === 'session';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            {getResourceTypeBadge(resource.resource_type)}
            {getAccessLevelBadge(resource.access_level)}
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
        
        {resource.description && (
          <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
        )}

        {therapistNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
            <p className="text-xs font-medium text-blue-800 mb-1">Notas del terapeuta:</p>
            <p className="text-xs text-blue-700">{therapistNotes}</p>
          </div>
        )}

        {resource.duration && (
          <p className="text-xs text-gray-500 mb-3">
            Duración: {resource.duration} min
          </p>
        )}

        <div className="flex flex-col gap-2 mt-4">
          {/* Primary action button */}
          {(resource.file_url || resource.external_link) && (
            <button
              onClick={handleResourceOpen}
              className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {isSessionType ? 'Abrir sesión' : 'Ver recurso'}
            </button>
          )}

          {/* Assign/Unassign buttons */}
          {!readOnly && (
            <div className="flex gap-2">
              {showAssignButton && onAssign && (
                <button
                  onClick={() => onAssign(resource.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Asignar
                </button>
              )}
              {showUnassignButton && onUnassign && (
                <button
                  onClick={() => onUnassign(resource.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  Desasignar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Link Confirmation Modal */}
      {isSessionType && resource.external_link && (
        <SessionLinkModal
          open={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onConfirm={handleConfirmSession}
          sessionType={resource.resource_type}
          sessionTitle={resource.title}
        />
      )}
    </>
  );
}
