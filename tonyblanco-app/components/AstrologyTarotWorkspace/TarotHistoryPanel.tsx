/**
 * TarotHistoryPanel - Shows previous Tarot readings for a patient
 * 
 * Visual component for listing workspace instances and allowing
 * loading of previous readings.
 */

'use client';

import { useTarotHistory } from '@/lib/api/swm/tarot/hooks';
import type { WorkspaceInstanceList } from '@/lib/api/swm/tarot/types';

interface TarotHistoryPanelProps {
  patientId?: number;
  onLoadInstance?: (instance: WorkspaceInstanceList) => void;
  className?: string;
}

export default function TarotHistoryPanel({
  patientId,
  onLoadInstance,
  className = '',
}: TarotHistoryPanelProps) {
  const { history, isLoading, error, refresh } = useTarotHistory({
    patientId,
    autoLoad: !!patientId,
  });

  // Status badge colors
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    sealed: 'bg-green-100 text-green-700',
    reviewed: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-200 text-gray-500',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
        <h3 className="text-sm font-semibold text-gray-900">Historial de Lecturas</h3>
        <div className="mt-2 flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="ml-2 text-xs text-gray-500">Cargando...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm ${className}`}>
        <h3 className="text-sm font-semibold text-red-900">Error</h3>
        <p className="mt-1 text-xs text-red-700">{error}</p>
        <button
          onClick={refresh}
          className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // No patient selected
  if (!patientId) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
        <h3 className="text-sm font-semibold text-gray-900">Historial de Lecturas</h3>
        <p className="mt-2 text-xs text-gray-500">
          Seleccione un paciente para ver el historial.
        </p>
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
        <h3 className="text-sm font-semibold text-gray-900">Historial de Lecturas</h3>
        <p className="mt-2 text-xs text-gray-500">
          No hay lecturas previas para este paciente.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Historial de Lecturas</h3>
        <button
          onClick={refresh}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Actualizar"
        >
          ↻
        </button>
      </div>
      
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
        {history.map((instance) => (
          <div
            key={instance.id}
            onClick={() => onLoadInstance?.(instance)}
            className="cursor-pointer rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900">
                {instance.spread_type_display}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  statusColors[instance.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {instance.status_display}
              </span>
            </div>
            
            {/* Details */}
            <div className="mt-1 text-[11px] text-gray-500">
              <span>{instance.tarot_system}</span>
              <span className="mx-1">•</span>
              <span>{instance.total_cards} cartas</span>
            </div>
            
            {/* Date */}
            <div className="mt-1 text-[10px] text-gray-400">
              {new Date(instance.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
