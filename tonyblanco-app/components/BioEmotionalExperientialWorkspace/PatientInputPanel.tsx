'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HeartPulse, 
  MessageSquare, 
  MapPin, 
  TrendingUp,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  getMyCurrentSession,
  listSessions,
  type BioEmotionalSession,
  type BioEmotionalSessionListItem,
} from '@/lib/api/bioemotional-clinical';

interface PatientInputPanelProps {
  patientId: number | null;
  onSessionData?: (session: BioEmotionalSession | null) => void;
}

// Regiones corporales simplificadas para visualización
const BODY_REGIONS = [
  { id: "cabeza", label: "Cabeza", emoji: "🧠" },
  { id: "cuello", label: "Cuello", emoji: "📍" },
  { id: "hombros", label: "Hombros", emoji: "💪" },
  { id: "pecho", label: "Pecho", emoji: "❤️" },
  { id: "espalda_alta", label: "Espalda Alta", emoji: "🔙" },
  { id: "espalda_baja", label: "Espalda Baja", emoji: "🔻" },
  { id: "abdomen", label: "Abdomen", emoji: "🫃" },
  { id: "brazos", label: "Brazos", emoji: "🦾" },
  { id: "manos", label: "Manos", emoji: "🤲" },
  { id: "piernas", label: "Piernas", emoji: "🦵" },
  { id: "pies", label: "Pies", emoji: "🦶" },
  { id: "pelvis", label: "Pelvis", emoji: "⭕" },
];

export default function PatientInputPanel({ patientId, onSessionData }: PatientInputPanelProps) {
  const [currentSession, setCurrentSession] = useState<BioEmotionalSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<BioEmotionalSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<string>('current');

  const loadSessionData = async () => {
    if (!patientId) {
      setCurrentSession(null);
      setSessionHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener sesiones del paciente
      const sessions = await listSessions(patientId);
      setSessionHistory(sessions);
      
      // La sesión activa es la más reciente no cerrada
      const activeSession = sessions.find(s => !s.is_closed);
      
      if (activeSession) {
        // Cargar detalles de la sesión activa
        const sessionDetail = await getMyCurrentSession(); // Necesitaríamos un endpoint específico para terapeutas
        setCurrentSession(sessionDetail);
        onSessionData?.(sessionDetail);
      } else {
        setCurrentSession(null);
        onSessionData?.(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del consultante');
      setCurrentSession(null);
      setSessionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [patientId]);

  const getWellnessColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getWellnessIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="h-4 w-4" />;
    if (score >= 6) return <TrendingUp className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="h-5 w-5 animate-pulse text-purple-500" />
          <h4 className="text-sm font-semibold text-gray-900">Cargando datos del consultante...</h4>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h4 className="text-sm font-semibold text-red-900">Error al cargar</h4>
        </div>
        <p className="text-sm text-red-700">{error}</p>
        <Button 
          onClick={loadSessionData} 
          variant="outline" 
          size="sm" 
          className="mt-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h4 className="text-sm font-semibold text-amber-900">Sin sesión activa</h4>
        </div>
        <p className="text-sm text-amber-700 mb-3">
          El consultante aún no ha proporcionado información para la sesión actual.
        </p>
        {sessionHistory.length > 0 && (
          <div className="text-xs text-amber-600">
            <strong>Últimas sesiones:</strong> {sessionHistory.length} registradas
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <HeartPulse className="h-5 w-5" />
            <h4 className="font-semibold">Input del Consultante</h4>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="h-4 w-4" />
            {new Date(currentSession.date).toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="text-sm">Sesión Actual</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4 mt-4">
            {/* Escala de Bienestar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Estado de Bienestar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${getWellnessColor(currentSession.patient_feeling_score || 5)}`}>
                  {getWellnessIcon(currentSession.patient_feeling_score || 5)}
                  <span className="font-bold text-lg">
                    {currentSession.patient_feeling_score || 'No reportado'}
                  </span>
                  <span className="text-sm">/10</span>
                </div>
              </CardContent>
            </Card>

            {/* Zonas de Molestia */}
            {currentSession.patient_discomfort_regions && currentSession.patient_discomfort_regions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Zonas de Molestia Reportadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentSession.patient_discomfort_regions.map((regionId: string) => {
                      const region = BODY_REGIONS.find(r => r.id === regionId);
                      return region ? (
                        <Badge key={regionId} variant="secondary" className="flex items-center gap-1">
                          <span>{region.emoji}</span>
                          <span className="text-xs">{region.label}</span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notas del Consultante */}
            {currentSession.patient_notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notas del Consultante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {currentSession.patient_notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-2">
              {sessionHistory.slice(0, 5).map((session) => (
                <div 
                  key={session.id}
                  className={`p-3 rounded-lg border text-sm ${
                    session.id === currentSession.id 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {new Date(session.date).toLocaleDateString('es-ES')}
                    </span>
                    <Badge variant={session.is_closed ? 'secondary' : 'default'} className="text-xs">
                      {session.is_closed ? 'Cerrada' : 'Activa'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {session.observations_count} observaciones • {session.hypotheses_count} hipótesis
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}