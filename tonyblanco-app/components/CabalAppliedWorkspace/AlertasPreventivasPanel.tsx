/**
 * AlertasPreventivasPanel.tsx - Sistema de Alertas Preventivas Éticas
 * 
 * Sistema de avisos basado ÚNICAMENTE en la historia propia del consultante.
 * NO es predicción - es análisis de patrones personales para preparación.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Heart,
  Shield,
  Sun,
  Moon,
  Clock,
  ChevronRight,
  ChevronDown,
  Info,
  Loader2,
  RefreshCw,
  Check
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

interface BiographicalEvent {
  date: string;
  type: string;
  description: string;
  intensity?: number;
}

interface Alert {
  type: string;
  title: string;
  description: string;
  date_range?: string;
  urgency: 'low' | 'medium' | 'high';
  based_on: string;
  suggestions: string[];
}

interface AlertsResult {
  alerts: Alert[];
  calendar_view: Record<string, Alert[]>;
  summary: {
    total_alerts: number;
    high_urgency: number;
    upcoming_30_days: number;
  };
  ethical_note: string;
}

interface AlertasPreventivasPanelProps {
  birthDate: string;
  consultantUuid?: string;  // NUEVO: UUID para carga automática
  events?: BiographicalEvent[];  // Ahora opcional
  consultantName?: string;
  monthsAhead?: number;
  onAlertsLoaded?: (alerts: AlertsResult) => void;
}

// Colores profesionales sutiles
const URGENCY_COLORS = {
  low: {
    bg: 'bg-slate-50 dark:bg-slate-800/30',
    border: 'border-slate-200 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  },
  medium: {
    bg: 'bg-amber-50/50 dark:bg-amber-900/10',
    border: 'border-amber-200/70 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  },
  high: {
    bg: 'bg-rose-50/50 dark:bg-rose-900/10',
    border: 'border-rose-200/70 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
  }
};

const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
  anniversary_loss: <Heart className="w-5 h-5" />,
  anniversary_crisis: <AlertTriangle className="w-5 h-5" />,
  seasonal_pattern: <Sun className="w-5 h-5" />,
  transition_sefirotica: <Moon className="w-5 h-5" />,
  cycle_completion: <Clock className="w-5 h-5" />,
  birthday_proximity: <Calendar className="w-5 h-5" />
};

export default function AlertasPreventivasPanel({
  birthDate,
  consultantUuid,
  events: propEvents,
  consultantName = 'Consultante',
  monthsAhead = 3,
  onAlertsLoaded
}: AlertasPreventivasPanelProps) {
  const [alerts, setAlerts] = useState<AlertsResult | null>(null);
  const [events, setEvents] = useState<BiographicalEvent[]>(propEvents || []);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedAlerts, setExpandedAlerts] = useState<Record<number, boolean>>({});

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
      console.error('[AlertasPreventivasPanel] Error loading events:', err);
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

  const toggleAlert = (index: number) => {
    setExpandedAlerts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const fetchAlerts = useCallback(async () => {
    if (!birthDate || events.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cabala/alertas-preventivas/`, {
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
          })),
          months_ahead: monthsAhead
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlerts(data.alertas);
        onAlertsLoaded?.(data.alertas);
      } else {
        setError(data.error || 'Error al generar alertas');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [birthDate, events, monthsAhead, onAlertsLoaded]);

  useEffect(() => {
    if (birthDate && events.length > 0) {
      fetchAlerts();
    }
  }, [birthDate, events.length, monthsAhead, fetchAlerts]);

  if (!birthDate || events.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <Info className="w-5 h-5" />
          <p>Ingresa eventos biográficos para generar alertas preventivas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Analizando patrones para alertas preventivas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchAlerts}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!alerts) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Alertas Preventivas
              </h2>
              <p className="text-amber-100 text-sm">
                Basadas en TU historia personal
              </p>
            </div>
          </div>
          
          {/* Vista Toggle */}
          <div className="flex bg-amber-400/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-amber-700'
                  : 'text-white hover:bg-amber-400/30'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-amber-700'
                  : 'text-white hover:bg-amber-400/30'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800">
        <div className="flex flex-wrap gap-4 justify-center text-center">
          <div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {alerts.summary.total_alerts}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Alertas totales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {alerts.summary.high_urgency}
            </p>
            <p className="text-xs text-rose-500">Alta prioridad</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {alerts.summary.upcoming_30_days}
            </p>
            <p className="text-xs text-blue-500">Próximos 30 días</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Ethical Banner */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>IMPORTANTE:</strong> {alerts.ethical_note || 'Estas alertas se basan ÚNICAMENTE en patrones observados en TU propia historia. No son predicciones. Son recordatorios para prepararte basados en tu experiencia pasada.'}
            </p>
          </div>
        </div>

        {viewMode === 'list' ? (
          /* Vista de Lista */
          <div className="space-y-4">
            {alerts.alerts.map((alert, idx) => {
              const colors = URGENCY_COLORS[alert.urgency];
              const icon = ALERT_TYPE_ICONS[alert.type] || <Bell className="w-5 h-5" />;
              const isExpanded = expandedAlerts[idx];

              return (
                <div
                  key={idx}
                  className={`${colors.bg} border ${colors.border} rounded-lg overflow-hidden`}
                >
                  <button
                    onClick={() => toggleAlert(idx)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-opacity-70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={colors.text}>{icon}</span>
                      <div className="text-left">
                        <h4 className={`font-medium ${colors.text}`}>
                          {alert.title}
                        </h4>
                        {alert.date_range && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.date_range}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${colors.badge}`}>
                        {alert.urgency === 'high' ? 'Alta' : 
                         alert.urgency === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-gray-700 dark:text-gray-300">
                        {alert.description}
                      </p>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Basado en:</strong> {alert.based_on}
                      </div>

                      {alert.suggestions.length > 0 && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                            Sugerencias:
                          </h5>
                          <ul className="space-y-1">
                            {alert.suggestions.map((suggestion, sidx) => (
                              <li 
                                key={sidx}
                                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span className="text-green-500">✓</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista de Calendario */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(alerts.calendar_view).map(([month, monthAlerts]) => (
              <div 
                key={month}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 capitalize">
                  {month}
                </h4>
                <div className="space-y-2">
                  {monthAlerts.map((alert, idx) => {
                    const colors = URGENCY_COLORS[alert.urgency];
                    return (
                      <div 
                        key={idx}
                        className={`${colors.bg} border-l-4 ${colors.border} rounded-r px-3 py-2`}
                      >
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {alert.title}
                        </p>
                      </div>
                    );
                  })}
                  {monthAlerts.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Sin alertas
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
