/**
 * SessionControl - Session management UI
 * 
 * Start session, end session, phase navigation
 */

import React, { useState } from 'react';
import { WorkspaceSession } from '@/lib/api/swm-mcmi4-api';

interface SessionControlProps {
  workspaceId: string;
  session?: WorkspaceSession;
  onStartSession: () => Promise<void>;
  onEndSession: () => Promise<void>;
  onAdvancePhase: (newPhase: string) => Promise<void>;
}

const phases = [
  'initial_review',
  'interpretive_work',
  'synthesis',
  'final_review',
];

const phaseLabels: Record<string, string> = {
  initial_review: 'Revisión Inicial',
  interpretive_work: 'Trabajo Interpretativo',
  synthesis: 'Síntesis',
  final_review: 'Revisión Final',
};

export const SessionControl: React.FC<SessionControlProps> = ({
  workspaceId,
  session,
  onStartSession,
  onEndSession,
  onAdvancePhase,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await onStartSession();
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (confirm('¿Seguro que deseas finalizar la sesión?')) {
      setLoading(true);
      try {
        await onEndSession();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdvancePhase = async () => {
    const currentIndex = phases.indexOf(session?.current_phase || 'initial_review');
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setLoading(true);
      try {
        await onAdvancePhase(nextPhase);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!session) {
    return (
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Control de Sesión</h3>
        <p className="text-gray-600 mb-4">
          No hay sesión activa. Inicia una nueva sesión para comenzar el trabajo interpretativo.
        </p>
        <button
          onClick={handleStartSession}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </div>
    );
  }

  const currentPhaseIndex = phases.indexOf(session.current_phase);
  const canAdvance = currentPhaseIndex < phases.length - 1;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sesión Activa</h3>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Activa
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Fase Actual:</p>
          <p className="text-lg font-medium text-gray-900">
            {phaseLabels[session.current_phase] || session.current_phase}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Interacciones:</p>
          <p className="text-lg font-medium text-gray-900">{session.interactions_count}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Iniciada:</p>
          <p className="text-sm text-gray-900">
            {new Date(session.started_at).toLocaleString()}
          </p>
        </div>

        <div className="pt-4 border-t space-y-2">
          {canAdvance && (
            <button
              onClick={handleAdvancePhase}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Avanzando...' : `Avanzar a ${phaseLabels[phases[currentPhaseIndex + 1]]}`}
            </button>
          )}
          <button
            onClick={handleEndSession}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 font-medium"
          >
            {loading ? 'Finalizando...' : 'Finalizar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
