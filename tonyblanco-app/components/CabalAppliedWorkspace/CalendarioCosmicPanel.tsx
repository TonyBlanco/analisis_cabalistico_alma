/**
 * CalendarioCosmicPanel.tsx - INNOVACIÓN 15: Conexión Calendario Lunar/Solar Real
 * 
 * Sincroniza ciclos cabalísticos con astronomía real:
 * - Fases lunares → Correspondencias Sefiróticas
 * - Equinoccios/Solsticios → Pilares del Árbol
 * - Eclipses → Momentos de transformación
 * - Ciclos naturales verificables
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Moon, 
  Sun, 
  Calendar,
  Star,
  CloudSun,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

interface LunarPhase {
  phase: string;
  illumination: number;
  moon_sign?: string;
  precise: boolean;
}

interface CosmicContext {
  date: string;
  lunar_phase: LunarPhase;
  season: {
    season: string;
    active_pillar: string;
    pillar_sefirot: string[];
    seasonal_quality: string;
    kabbalistic_meaning: string;
    next_cardinal: {
      name: string;
      date: string;
      days_until: number;
    };
  };
  planetary_influences: Record<string, any>;
  upcoming_events: Array<{
    type: string;
    name: string;
    date: string;
    days_until: number;
    sefira?: string;
    significance?: string;
  }>;
  kabbalistic_synthesis: string;
  recommended_practices: Array<{
    type: string;
    title: string;
    description: string;
    timing: string;
  }>;
  shadow_warnings: Array<{
    source: string;
    qliphah: string;
    warning: string;
    prevention: string;
  }>;
  personal_cycle?: {
    age: number;
    sefirotic_cycle_year: number;
    current_sefira: string;
    days_until_next_birthday: number;
    next_sefira: string;
  };
}

interface CalendarioCosmicPanelProps {
  birthDate?: string;
  consultantName?: string;
  onContextLoaded?: (context: CosmicContext) => void;
}

const LUNAR_PHASE_NAMES: Record<string, string> = {
  new_moon: 'Luna Nueva',
  waxing_crescent: 'Creciente',
  first_quarter: 'Cuarto Creciente',
  waxing_gibbous: 'Gibosa Creciente',
  full_moon: 'Luna Llena',
  waning_gibbous: 'Gibosa Menguante',
  last_quarter: 'Cuarto Menguante',
  waning_crescent: 'Menguante'
};

const PHASE_TO_SEFIRA: Record<string, string> = {
  new_moon: 'Binah',
  waxing_crescent: 'Chesed',
  first_quarter: 'Gevurah',
  waxing_gibbous: 'Tiferet',
  full_moon: 'Keter',
  waning_gibbous: 'Chokmah',
  last_quarter: 'Hod',
  waning_crescent: 'Yesod'
};

// Colores profesionales para los pilares
const PILLAR_COLORS: Record<string, string> = {
  left: 'from-slate-600 to-slate-700',      // Severidad - más oscuro
  middle: 'from-slate-700 to-slate-800',    // Equilibrio - neutro elegante
  right: 'from-slate-500 to-slate-600'      // Misericordia - más claro
};

export default function CalendarioCosmicPanel({
  birthDate,
  consultantName = 'Consultante',
  onContextLoaded
}: CalendarioCosmicPanelProps) {
  const [context, setContext] = useState<CosmicContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'events'>('today');

  const fetchContext = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: selectedDate
      });
      if (birthDate) {
        params.append('birth_date', birthDate);
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cabala/calendario-cosmico/?${params}`, {
        headers: {
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        }
      });

      const data = await response.json();
      if (data.success) {
        setContext(data.cosmic_context);
        onContextLoaded?.(data.cosmic_context);
      } else {
        setError(data.error || 'Error al obtener contexto cósmico');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, birthDate, onContextLoaded]);

  useEffect(() => {
    fetchContext();
  }, [selectedDate, fetchContext]);

  const navigateDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (loading && !context) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Consultando el cosmos...</p>
        </div>
      </div>
    );
  }

  if (error && !context) {
    return (
      <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/70 dark:border-rose-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchContext}
            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  const pillarColor = PILLAR_COLORS[context.season.active_pillar] || PILLAR_COLORS.middle;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${pillarColor} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Moon className="w-6 h-6 text-white" />
              <Sun className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Calendario Cósmico
              </h2>
              <p className="text-white/80 text-sm">
                Ciclos lunares y sefiróticos
              </p>
            </div>
            <div className="group relative">
              <Info className="h-4 w-4 text-white/70 hover:text-white cursor-help transition-colors" />
              <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
                <p className="font-medium mb-1">Sincronía Astronómica Real</p>
                <p>• Fases lunares verificables con astronomía</p>
                <p>• Correspondencias Sefiróticas por fase</p>
                <p>• Estaciones y pilares del Árbol de la Vida</p>
                <p>• Momentos de transformación cósmica</p>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-white/20 rounded transition-colors text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white border-none text-sm focus:outline-none"
            />
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-white/20 rounded transition-colors text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'today', label: 'Hoy', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'calendar', label: 'Calendario', icon: <Calendar className="w-4 h-4" /> },
          { id: 'events', label: 'Eventos', icon: <Star className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'today' && (
          <TodayView context={context} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView context={context} selectedDate={selectedDate} />
        )}
        {activeTab === 'events' && (
          <EventsView context={context} />
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
            Las correspondencias cósmicas son simbólicas. Los ciclos naturales 
            reflejan patrones universales, no determinan tu destino.
          </p>
        </div>
      </div>
    </div>
  );
}

// Vista de "Hoy"
function TodayView({ context }: { context: CosmicContext }) {
  const phase = context.lunar_phase;
  const phaseName = LUNAR_PHASE_NAMES[phase.phase] || phase.phase;
  const sefira = PHASE_TO_SEFIRA[phase.phase] || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Lunar Phase Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{phaseName}</h3>
            <p className="text-indigo-300 mt-1">
              Iluminación: {phase.illumination}%
            </p>
            {phase.moon_sign && phase.moon_sign !== 'unknown' && (
              <p className="text-indigo-300">
                Luna en {phase.moon_sign}
              </p>
            )}
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20">
              <LunarPhaseVisual phase={phase.phase} illumination={phase.illumination} />
            </div>
            <p className="text-sm text-indigo-300 mt-2">
              Sefirá: <span className="font-semibold text-white">{sefira}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Synthesis */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
          Síntesis del día
        </h4>
        <p className="text-gray-700 dark:text-gray-300">
          {context.kabbalistic_synthesis}
        </p>
      </div>

      {/* Season & Pillar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              Estación
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 capitalize">
            {context.season.season}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {context.season.seasonal_quality}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-purple-500" />
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              Pilar Activo
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 capitalize">
            Pilar {context.season.active_pillar === 'left' ? 'Izquierdo (Severidad)' :
                   context.season.active_pillar === 'right' ? 'Derecho (Misericordia)' :
                   'Central (Equilibrio)'}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {context.season.pillar_sefirot.map((sefira) => (
              <span
                key={sefira}
                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs"
              >
                {sefira}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Cycle (if available) */}
      {context.personal_cycle && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Tu ciclo personal
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Año sefirótico</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {context.personal_cycle.sefirotic_cycle_year}º de 10
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sefirá actual</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                {context.personal_cycle.current_sefira}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Próximo cumpleaños</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                En {context.personal_cycle.days_until_next_birthday} días
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Próxima Sefirá</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                {context.personal_cycle.next_sefira}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Practices */}
      {context.recommended_practices.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Prácticas recomendadas
          </h4>
          <div className="space-y-2">
            {context.recommended_practices.map((practice, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    {practice.title}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {practice.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shadow Warnings */}
      {context.shadow_warnings.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Avisos de sombra
          </h4>
          <div className="space-y-2">
            {context.shadow_warnings.map((warning, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-medium text-rose-800 dark:text-rose-300">
                    {warning.warning}
                  </p>
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    Prevención: {warning.prevention}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Vista de Calendario
function CalendarView({ context, selectedDate }: { context: CosmicContext; selectedDate: string }) {
  return (
    <div className="text-center py-8">
      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-400">
        Vista de calendario lunar-sefirótico mensual.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        Próximamente: Calendario visual con fases lunares y correspondencias.
      </p>
    </div>
  );
}

// Vista de Eventos
function EventsView({ context }: { context: CosmicContext }) {
  const events = context.upcoming_events || [];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
        Próximos eventos cósmicos
      </h4>

      {events.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay eventos próximos en los siguientes 30 días.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                event.type === 'lunar_phase' ? 'bg-indigo-100 dark:bg-indigo-900' :
                event.type === 'cardinal_point' ? 'bg-amber-100 dark:bg-amber-900' :
                event.type === 'eclipse' ? 'bg-purple-100 dark:bg-purple-900' :
                'bg-gray-100 dark:bg-gray-600'
              }`}>
                {event.type === 'lunar_phase' && <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                {event.type === 'cardinal_point' && <Sun className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                {event.type === 'eclipse' && <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-800 dark:text-gray-200">
                  {event.name.replace(/_/g, ' ')}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {event.date} • En {event.days_until} días
                </p>
                {event.sefira && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs">
                    {event.sefira}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Next Cardinal Point */}
      {context.season.next_cardinal && (
        <div className="mt-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-4">
          <h5 className="font-medium text-amber-800 dark:text-amber-300">
            Próximo punto cardinal
          </h5>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {context.season.next_cardinal.name.replace(/_/g, ' ')} el {context.season.next_cardinal.date}
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            En {context.season.next_cardinal.days_until} días
          </p>
        </div>
      )}
    </div>
  );
}

// Componente visual de fase lunar
function LunarPhaseVisual({ phase, illumination }: { phase: string; illumination: number }) {
  // Simplificación visual de la fase
  const getPhaseStyle = () => {
    switch (phase) {
      case 'new_moon':
        return 'bg-gray-800';
      case 'full_moon':
        return 'bg-yellow-100';
      case 'waxing_crescent':
      case 'waxing_gibbous':
        return 'bg-gradient-to-r from-gray-800 to-yellow-100';
      case 'waning_gibbous':
      case 'waning_crescent':
        return 'bg-gradient-to-l from-gray-800 to-yellow-100';
      case 'first_quarter':
        return 'bg-gradient-to-r from-gray-800 via-gray-800 to-yellow-100';
      case 'last_quarter':
        return 'bg-gradient-to-l from-gray-800 via-gray-800 to-yellow-100';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div 
      className={`w-full h-full rounded-full shadow-inner ${getPhaseStyle()}`}
      style={{
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      }}
    />
  );
}
