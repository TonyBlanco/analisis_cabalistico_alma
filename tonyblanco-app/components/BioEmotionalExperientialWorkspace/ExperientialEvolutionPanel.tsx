'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import SessionTimeline from './SessionTimeline';
import EvolutionCharts from './EvolutionCharts';
import SessionComparison from './SessionComparison';
import type { SessionSummary, EvolutionData, SessionComparison as SessionComparisonType } from './timeline-types';
import { calculateEvolutionTrends, createSessionComparison } from './timeline-types';
import { listSessions, type BioEmotionalSessionListItem } from '@/lib/api/bioemotional-clinical';

// ============================================
// EXPERIENTIAL EVOLUTION PANEL
// Integration of PROMPT #7 Timeline Components
// Now with real data from BioEmotionalSession API
// ============================================

interface ExperientialEvolutionPanelProps {
    patientId: number | null;
}

/**
 * Converts API session item to SessionSummary format for timeline components
 */
function mapSessionToSummary(session: BioEmotionalSessionListItem): SessionSummary {
    return {
        id: session.id,
        date: new Date(session.date),
        patientId: String(session.patient_id),
        regionsObserved: session.regions_observed || [],
        observationsCount: session.observations_count,
        hypothesesCount: session.hypotheses_count,
        synthesisCompleted: session.synthesis_completed,
        emotionalState: session.emotional_state,
        notes: undefined, // Notes not included in list serializer for privacy
    };
}

/**
 * Panel container for session timeline, evolution charts, and comparison modal.
 * Uses real data from the BioEmotionalSession API.
 */
export default function ExperientialEvolutionPanel({ patientId }: ExperientialEvolutionPanelProps) {
    // State for session selection and comparison
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<SessionComparisonType | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string | null>(null);

    // Data loading state
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load sessions from API when patientId changes
    useEffect(() => {
        async function fetchSessions() {
            if (!patientId) {
                setSessions([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const apiSessions = await listSessions(patientId);
                const mappedSessions = apiSessions.map(mapSessionToSummary);
                setSessions(mappedSessions);

                // Auto-select the most recent session if none selected
                if (mappedSessions.length > 0 && !currentSessionId) {
                    setCurrentSessionId(mappedSessions[0].id);
                }
            } catch (err) {
                console.error('Error loading sessions:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
                setSessions([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSessions();
    }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Calculate evolution data from sessions
    const evolutionData: EvolutionData = useMemo(() => ({
        sessions,
        trends: calculateEvolutionTrends(sessions),
    }), [sessions]);

    // Handlers
    const handleSessionSelect = useCallback((sessionId: string) => {
        setCurrentSessionId(sessionId);
    }, []);

    const handleCompareClick = useCallback((sessionId: string) => {
        if (selectedForCompare && selectedForCompare !== sessionId) {
            // Already have one session selected, create comparison
            const sessionA = sessions.find(s => s.id === selectedForCompare);
            const sessionB = sessions.find(s => s.id === sessionId);

            if (sessionA && sessionB) {
                // Order by date (earlier first)
                const [earlier, later] = sessionA.date < sessionB.date
                    ? [sessionA, sessionB]
                    : [sessionB, sessionA];
                setComparisonData(createSessionComparison(earlier, later));
            }
            setSelectedForCompare(null);
        } else {
            // First session for comparison
            setSelectedForCompare(sessionId);
        }
    }, [selectedForCompare, sessions]);

    const handleCloseComparison = useCallback(() => {
        setComparisonData(null);
        setSelectedForCompare(null);
    }, []);

    // No patient state
    if (!patientId) {
        return (
            <div className="col-span-2 bio-card-glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Evolución del Consultante
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                    Selecciona un paciente desde el workspace clínico para ver su historial de sesiones.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <span>⚠️</span>
                    <span>No hay paciente activo</span>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="col-span-2 bio-card-glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4 animate-pulse">⏳</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Cargando historial...
                </h4>
                <p className="text-sm text-gray-600">
                    Obteniendo sesiones del consultante
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="col-span-2 bio-card-glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h4 className="text-lg font-semibold text-red-700 mb-2">
                    Error al cargar sesiones
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                    {error}
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="bio-btn bio-btn-secondary text-sm"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Selection indicator for comparison mode */}
            {selectedForCompare && (
                <div className="col-span-2 mb-4">
                    <div className="bio-card rounded-lg p-3 bg-indigo-50 border-2 border-indigo-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-indigo-700">
                            <span>🔍</span>
                            <span>
                                <strong>Modo comparación:</strong> Selecciona otra sesión para comparar
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedForCompare(null)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Main Layout: Timeline Left, Charts Right */}
            <div className="col-span-2 grid md:grid-cols-[minmax(0,35%)_minmax(0,65%)] gap-6">
                {/* Left: Session Timeline */}
                <div>
                    <SessionTimeline
                        sessions={sessions}
                        currentSessionId={currentSessionId || undefined}
                        onSessionSelect={handleSessionSelect}
                        onCompareClick={handleCompareClick}
                    />
                </div>

                {/* Right: Evolution Charts */}
                <div>
                    <EvolutionCharts data={evolutionData} />
                </div>
            </div>

            {/* Comparison Modal */}
            {comparisonData && (
                <SessionComparison
                    comparison={comparisonData}
                    onClose={handleCloseComparison}
                />
            )}
        </>
    );
}
