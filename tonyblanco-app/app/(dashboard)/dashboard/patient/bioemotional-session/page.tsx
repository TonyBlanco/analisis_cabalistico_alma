"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HeartPulse,
  Loader2,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Activity,
  MessageSquare,
} from "lucide-react";
import {
  getMyCurrentSession,
  updateMySessionInput,
  listMySessions,
  type BioEmotionalSession,
  type BioEmotionalSessionListItem,
  type BioEmotionalSessionPatientInputPayload,
} from "@/lib/api/bioemotional-clinical";

// Regiones corporales simplificadas para el consultante
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

export default function BioEmotionalSessionPage() {
  const [currentSession, setCurrentSession] = useState<BioEmotionalSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<BioEmotionalSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [notes, setNotes] = useState("");
  const [feelingScore, setFeelingScore] = useState<number>(5);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Load current session and history
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [session, history] = await Promise.all([
        getMyCurrentSession().catch(() => null),
        listMySessions().catch(() => []),
      ]);
      
      setCurrentSession(session);
      setSessionHistory(history);

      // Pre-fill form with existing data
      if (session) {
        setNotes(session.patient_notes || "");
        setFeelingScore(session.patient_feeling_score || 5);
        setSelectedRegions(session.patient_discomfort_regions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la sesión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle region selection
  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((r) => r !== regionId)
        : [...prev, regionId]
    );
    setSuccess(false);
  };

  // Save patient input
  const handleSave = async () => {
    if (!currentSession) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: BioEmotionalSessionPatientInputPayload = {
        patient_notes: notes,
        patient_feeling_score: feelingScore,
        patient_discomfort_regions: selectedRegions,
      };

      const updated = await updateMySessionInput(payload);
      setCurrentSession(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-muted-foreground">Cargando sesión...</span>
      </div>
    );
  }

  // No active session
  if (!currentSession) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Calendar className="h-5 w-5" />
              No hay sesión activa
            </CardTitle>
            <CardDescription>
              Tu terapeuta aún no ha iniciado una sesión bioemotional para ti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cuando tu terapeuta inicie una nueva sesión, podrás registrar aquí cómo te sientes,
              las zonas de tu cuerpo donde experimentas molestias y cualquier nota que quieras
              compartir antes de tu consulta.
            </p>

            {sessionHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-sm">Historial de sesiones anteriores</h4>
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">
                          {new Date(session.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <Badge
                        variant={session.is_closed ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {session.is_closed ? "Cerrada" : "En proceso"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-purple-500" />
            Mi Sesión BioEmotional
          </h1>
          <p className="text-muted-foreground">
            Sesión del{" "}
            {new Date(currentSession.date).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge variant={currentSession.is_closed ? "secondary" : "default"}>
          {currentSession.is_closed ? "Sesión Cerrada" : "Sesión Activa"}
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 dark:text-green-300">Guardado</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            Tus datos han sido guardados correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Feeling Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo te sientes hoy?</CardTitle>
          <CardDescription>
            Indica en una escala del 1 al 10 tu estado general de bienestar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>😔 Muy mal</span>
              <span>😊 Muy bien</span>
            </div>
            <Slider
              value={[feelingScore]}
              onValueChange={(value) => {
                setFeelingScore(value[0]);
                setSuccess(false);
              }}
              min={1}
              max={10}
              step={1}
              disabled={currentSession.is_closed}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {feelingScore}
              </span>
              <span className="text-muted-foreground">/10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Regions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zonas de molestia o tensión</CardTitle>
          <CardDescription>
            Selecciona las áreas de tu cuerpo donde sientes incomodidad, dolor o tensión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {BODY_REGIONS.map((region) => {
              const isSelected = selectedRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => !currentSession.is_closed && toggleRegion(region.id)}
                  disabled={currentSession.is_closed}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                    }
                    ${currentSession.is_closed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <span className="text-2xl block mb-1">{region.emoji}</span>
                  <span className="text-xs font-medium">{region.label}</span>
                </button>
              );
            })}
          </div>
          {selectedRegions.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <strong>Zonas seleccionadas:</strong>{" "}
                {selectedRegions
                  .map((id) => BODY_REGIONS.find((r) => r.id === id)?.label)
                  .join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notas para tu terapeuta
          </CardTitle>
          <CardDescription>
            Describe cómo te has sentido, síntomas físicos o emocionales, o cualquier cosa que
            quieras compartir antes de tu sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSuccess(false);
            }}
            disabled={currentSession.is_closed}
            placeholder="Ej: Esta semana he sentido mucha tensión en el cuello y dolor de cabeza. También he tenido dificultades para dormir..."
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Esta información ayudará a tu terapeuta a personalizar tu sesión.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      {!currentSession.is_closed && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      )}

      {/* Session History */}
      {sessionHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionHistory.map((session) => (
                <div
                  key={session.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${session.id === currentSession.id ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Activity
                      className={`h-4 w-4 ${
                        session.id === currentSession.id ? "text-purple-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">
                      {new Date(session.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {session.id === currentSession.id && (
                      <Badge variant="outline" className="text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {session.observations_count} obs · {session.hypotheses_count} hip
                    </span>
                    <Badge
                      variant={session.is_closed ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {session.is_closed ? "Cerrada" : "Activa"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
