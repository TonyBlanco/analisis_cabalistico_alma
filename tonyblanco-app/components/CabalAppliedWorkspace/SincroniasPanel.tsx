/**
 * SincroniasPanel.tsx - INNOVACIÓN 7: Detector de Sincronías Biográficas
 * 
 * Detecta y visualiza coincidencias significativas en la línea temporal biográfica.
 * Ejemplo: "Hace 9, 18 y 27 años hubo pérdidas - todas en transición Tiferet→Netzach"
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Info,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

interface BiographicalEvent {
  date: string;
  type: string;
  description: string;
  intensity?: number;
}

interface CycleAlignment {
  cycle_name: string;
  years_aligned: number[];
  events_in_cycle: BiographicalEvent[];
  interpretation: string;
}

interface HiddenAnniversary {
  description: string;
  years: number[];
  pattern_detected: string;
  sefirotic_transition?: string;
}

interface TransitionPattern {
  transition: string;
  events_count: number;
  theme: string;
  interpretation: string;
}

interface SincroniasResult {
  cycle_alignments: CycleAlignment[];
  hidden_anniversaries: HiddenAnniversary[];
  transition_patterns: TransitionPattern[];
  soul_calendar: Record<string, string[]>;
  preventive_awareness: string[];
}

interface SincroniasPanelProps {
  birthDate: string;
  consultantUuid?: string;  // NUEVO: UUID para carga automática
  events?: BiographicalEvent[];  // Ahora opcional
  consultantName?: string;
  onSincroniasLoaded?: (sincronias: SincroniasResult) => void;
}

export default function SincroniasPanel({
  birthDate,
  consultantUuid,
  events: propEvents,
  consultantName = 'Consultante',
  onSincroniasLoaded
}: SincroniasPanelProps) {
  const [sincronias, setSincronias] = useState<SincroniasResult | null>(null);
  const [events, setEvents] = useState<BiographicalEvent[]>(propEvents || []);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cycles: true,
    anniversaries: false,
    patterns: false,
    calendar: false,
    awareness: false
  });

  // Cargar eventos automáticamente si tenemos UUID
  const fetchBiographicalEvents = useCallback(async () => {
    if (!consultantUuid) return;
    
    setLoadingEvents(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/consultantes/${consultantUuid}/biographical-events/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.events) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error('[SincroniasPanel] Error loading events:', err);
    } finally {
      setLoadingEvents(false);
    }
  }, [consultantUuid]);

  // Cargar eventos al montar si tenemos UUID y no se pasaron eventos
  useEffect(() => {
    if (consultantUuid && (!propEvents || propEvents.length === 0)) {
      fetchBiographicalEvents();
    }
  }, [consultantUuid, propEvents, fetchBiographicalEvents]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchSincronias = useCallback(async () => {
    if (!birthDate || events.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cabala/sincronias/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: JSON.stringify({
          birth_date: birthDate,
          events: events.map(e => ({
            date: e.date,
            type: e.type,
            description: e.description,
            intensity: e.intensity || 5
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setSincronias(data.sincronias);
        onSincroniasLoaded?.(data.sincronias);
      } else {
        setError(data.error || 'Error al analizar sincronías');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [birthDate, events, onSincroniasLoaded]);

  useEffect(() => {
    if (birthDate && events.length > 0) {
      fetchSincronias();
    }
  }, [birthDate, events.length, fetchSincronias]);

  // Mostrar estado de carga de eventos
  if (loadingEvents) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Cargando eventos biográficos del consultante...</p>
        </div>
      </div>
    );
  }

  if (!birthDate || events.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Info className="w-5 h-5" />
          <div>
            <p className="font-medium">Sin eventos biográficos disponibles</p>
            <p className="text-sm mt-1">Los eventos se cargan automáticamente de tests, sesiones y milestones sefiróticos.</p>
          </div>
        </div>
        {consultantUuid && (
          <button
            onClick={fetchBiographicalEvents}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar eventos
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Detectando sincronías en tu línea temporal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchSincronias}
            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!sincronias) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header - Colores profesionales */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              Sincronías Biográficas
            </h2>
            <p className="text-slate-300 text-sm">
              {events.length} eventos • Patrones significativos detectados
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Ciclos Alineados */}
        {sincronias.cycle_alignments.length > 0 && (
          <Section
            title="Alineaciones de Ciclos"
            icon={<Calendar className="w-5 h-5" />}
            expanded={expandedSections.cycles}
            onToggle={() => toggleSection('cycles')}
          >
            <div className="space-y-4">
              {sincronias.cycle_alignments.map((alignment, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    {alignment.cycle_name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Años: {alignment.years_aligned.join(', ')}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {alignment.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Aniversarios Ocultos */}
        {sincronias.hidden_anniversaries.length > 0 && (
          <Section
            title="Aniversarios Ocultos"
            icon={<Sparkles className="w-5 h-5" />}
            expanded={expandedSections.anniversaries}
            onToggle={() => toggleSection('anniversaries')}
          >
            <div className="space-y-3">
              {sincronias.hidden_anniversaries.map((anniversary, idx) => (
                <div 
                  key={idx}
                  className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg p-4"
                >
                  <p className="text-amber-800 dark:text-amber-300 font-medium">
                    {anniversary.description}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    Patrón: {anniversary.pattern_detected}
                  </p>
                  {anniversary.sefirotic_transition && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Transición sefirótica: {anniversary.sefirotic_transition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Patrones de Transición */}
        {sincronias.transition_patterns.length > 0 && (
          <Section
            title="Patrones de Transición"
            icon={<ChevronRight className="w-5 h-5" />}
            expanded={expandedSections.patterns}
            onToggle={() => toggleSection('patterns')}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {sincronias.transition_patterns.map((pattern, idx) => (
                <div 
                  key={idx}
                  className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded text-xs font-medium">
                      {pattern.transition}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {pattern.events_count} eventos
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {pattern.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Calendario del Alma */}
        {Object.keys(sincronias.soul_calendar || {}).length > 0 && (
          <Section
            title="Calendario del Alma"
            icon={<Calendar className="w-5 h-5" />}
            expanded={expandedSections.calendar}
            onToggle={() => toggleSection('calendar')}
          >
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(sincronias.soul_calendar).map(([month, themes]) => (
                <div 
                  key={month}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
                >
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                    {month}
                  </h5>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {themes.map((theme, idx) => (
                      <li key={idx}>• {theme}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Consciencia Preventiva */}
        {sincronias.preventive_awareness.length > 0 && (
          <Section
            title="Consciencia Preventiva"
            icon={<Info className="w-5 h-5" />}
            expanded={expandedSections.awareness}
            onToggle={() => toggleSection('awareness')}
          >
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <ul className="space-y-2">
                {sincronias.preventive_awareness.map((item, idx) => (
                  <li 
                    key={idx}
                    className="flex items-start gap-2 text-green-800 dark:text-green-300"
                  >
                    <span className="mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
            Las sincronías son patrones observados para reflexión terapéutica.
            No constituyen predicciones ni diagnósticos.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para secciones colapsables
function Section({
  title,
  icon,
  expanded,
  onToggle,
  children
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-purple-600 dark:text-purple-400">{icon}</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}
