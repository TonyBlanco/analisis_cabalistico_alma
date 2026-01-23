'use client';

import { useState, memo, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SessionSummary } from './timeline-types';

// ============================================
// SESSION TIMELINE COMPONENT
// PROMPT #7: Timeline y Comparación de Sesiones
// ============================================

interface SessionTimelineProps {
  sessions: SessionSummary[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onCompareClick: (sessionId: string) => void;
}

/**
 * Vertical timeline showing session history with selection and comparison controls
 */
function SessionTimelineComponent({
  sessions,
  currentSessionId,
  onSessionSelect,
  onCompareClick,
}: SessionTimelineProps) {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const getEmotionalStateColor = useCallback((state: SessionSummary['emotionalState']) => {
    switch (state) {
      case 'better':
        return 'bg-green-500';
      case 'worse':
        return 'bg-red-500';
      case 'same':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  }, []);

  const getEmotionalStateIcon = useCallback((state: SessionSummary['emotionalState']) => {
    switch (state) {
      case 'better':
        return '📈';
      case 'worse':
        return '📉';
      case 'same':
        return '➡️';
      default:
        return '❓';
    }
  }, []);

  const getEmotionalStateLabel = useCallback((state: SessionSummary['emotionalState']) => {
    switch (state) {
      case 'better':
        return 'Mejoría';
      case 'worse':
        return 'Empeoramiento';
      case 'same':
        return 'Sin cambios';
      default:
        return 'No evaluado';
    }
  }, []);

  const handleMouseEnter = useCallback((sessionId: string) => {
    setHoveredSessionId(sessionId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSessionId(null);
  }, []);

  const handleSessionClick = useCallback(
    (sessionId: string) => {
      onSessionSelect(sessionId);
    },
    [onSessionSelect]
  );

  const handleCompareClick = useCallback(
    (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      onCompareClick(sessionId);
    },
    [onCompareClick]
  );

  return (
    <div className="bio-card-glass rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          📅 Timeline de Evolución
        </h4>
        <p className="text-xs text-gray-600">
          Historial de sesiones del consultante
        </p>
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm text-gray-500">
            No hay sesiones previas registradas
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Las sesiones aparecerán aquí después de guardarlas
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"
            aria-hidden="true"
          />

          {/* Sessions List */}
          <div className="space-y-4" role="list" aria-label="Historial de sesiones">
            {sessions.map((session, index) => {
              const isHovered = hoveredSessionId === session.id;
              const isCurrent = currentSessionId === session.id;
              const sessionNumber = sessions.length - index;

              return (
                <div
                  key={session.id}
                  className="relative pl-14"
                  onMouseEnter={() => handleMouseEnter(session.id)}
                  onMouseLeave={handleMouseLeave}
                  role="listitem"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`
                      absolute left-4 top-2 w-5 h-5 rounded-full border-4 border-white
                      transition-all duration-300 shadow-sm
                      ${getEmotionalStateColor(session.emotionalState)}
                      ${isHovered || isCurrent ? 'scale-125 shadow-lg' : 'scale-100'}
                    `}
                    title={getEmotionalStateLabel(session.emotionalState)}
                    aria-hidden="true"
                  />

                  {/* Session Card */}
                  <button
                    type="button"
                    className={`
                      bio-card rounded-xl p-4 cursor-pointer transition-all duration-300 w-full text-left
                      hover:shadow-md
                      ${isCurrent ? 'ring-2 ring-indigo-500 shadow-lg bg-indigo-50/50' : ''}
                      ${isHovered && !isCurrent ? 'transform -translate-y-1 shadow-md' : ''}
                    `}
                    onClick={() => handleSessionClick(session.id)}
                    aria-current={isCurrent ? 'true' : undefined}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Sesión #{sessionNumber}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-indigo-600 font-normal">
                              (actual)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(session.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg"
                          title={getEmotionalStateLabel(session.emotionalState)}
                          role="img"
                          aria-label={getEmotionalStateLabel(session.emotionalState)}
                        >
                          {getEmotionalStateIcon(session.emotionalState)}
                        </span>
                        {session.synthesisCompleted && (
                          <span className="bio-badge bio-badge-success text-xs">
                            ✓ Completa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Stats */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span title="Observaciones registradas">
                        📝 {session.observationsCount} observaciones
                      </span>
                      <span title="Hipótesis generadas">
                        💡 {session.hypothesesCount} hipótesis
                      </span>
                      <span title="Regiones corporales observadas">
                        📍 {session.regionsObserved.length} regiones
                      </span>
                    </div>

                    {/* Notes Preview */}
                    {session.notes && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
                        "{session.notes}"
                      </p>
                    )}

                    {/* Hover Actions */}
                    {isHovered && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSessionClick(session.id);
                          }}
                          className="flex-1 bio-btn bio-btn-secondary text-xs py-1.5"
                        >
                          👁️ Ver Detalles
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCompareClick(e, session.id)}
                          className="flex-1 bio-btn bio-btn-primary text-xs py-1.5"
                          disabled={sessions.length < 2}
                          title={
                            sessions.length < 2
                              ? 'Se necesitan al menos 2 sesiones para comparar'
                              : 'Comparar con otra sesión'
                          }
                        >
                          🔍 Comparar
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Timeline Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total: {sessions.length} sesiones</span>
              <span>
                Primera:{' '}
                {format(new Date(sessions[sessions.length - 1]?.date || new Date()), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SessionTimeline = memo(SessionTimelineComponent);
SessionTimeline.displayName = 'SessionTimeline';

export default SessionTimeline;
