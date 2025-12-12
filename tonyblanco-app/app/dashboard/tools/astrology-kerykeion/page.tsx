'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Save, ArrowLeft, Compass, MapPin, Clock, 
  AlertCircle, CheckCircle, HelpCircle, Star, Sparkles
} from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import { getAuthToken } from '@/lib/auth';
import { 
  calculateKerykeionChart,
  calculateKerykeionChartLegacy,
  validateKerykeionInput,
  type KerykeionResult,
  type KerykeionInput
} from '@/lib/kerykeion-engine';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface PatientData {
  id: number;
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time?: string; // HH:mm:ss
  birth_place?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  birth_city?: string;
  birth_country?: string;
  first_name?: string;
  last_name?: string;
}

export default function KerykeionAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId') || searchParams?.get('patient_id');
  
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [result, setResult] = useState<KerykeionResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      setLoading(false);
      // Permitir trabajar sin patientId - el usuario puede ingresar datos manualmente
    }
  }, [patientId]);

  const loadPatientData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Error al cargar el paciente');
      }

      const patientData: PatientData = await response.json();
      
      if (!patientData.birth_date) {
        throw new Error('El paciente no tiene fecha de nacimiento registrada');
      }

      // Validar coordenadas geográficas
      if (!patientData.birth_latitude || !patientData.birth_longitude) {
        throw new Error('El paciente necesita tener coordenadas geográficas (latitud y longitud) registradas');
      }

      setPatient(patientData);

      // Construir estructura de entrada estándar Kerykeion
      const birthTime = patientData.birth_time 
        ? patientData.birth_time.substring(0, 5) // "HH:MM"
        : '12:00';
      
      // Extraer ciudad y país del birth_place si existe
      let city = patientData.birth_city || 'Unknown';
      let country = patientData.birth_country || 'Unknown';
      
      if (patientData.birth_place && !city) {
        // Intentar parsear "Ciudad, País" del birth_place
        const parts = patientData.birth_place.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          city = parts[0];
          country = parts[1];
        } else if (parts.length === 1) {
          city = parts[0];
        }
      }
      
      // Obtener timezone (por defecto UTC, idealmente debería calcularse desde lat/lng)
      const timezone = 'UTC'; // TODO: Calcular timezone desde coordenadas
      
      const kerykeionInput: KerykeionInput = {
        birth_date: patientData.birth_date,
        birth_time: birthTime,
        location: {
          city,
          country,
          lat: patientData.birth_latitude!,
          lng: patientData.birth_longitude!,
          timezone
        },
        house_system: 'placidus',
        zodiac_system: 'tropical',
        engine: 'kerykeion',
        engine_version: '1.0.0'
      };

      // Validar entrada
      const validation = validateKerykeionInput(kerykeionInput);
      
      if (!validation.valid) {
        throw new Error(validation.error || 'Datos inválidos');
      }

      // Calcular carta usando estructura estándar
      setCalculating(true);
      const chart = calculateKerykeionChart(kerykeionInput);
      setResult(chart);
      
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Error al cargar los datos del paciente');
      showToast(err.message || 'Error al cargar los datos del paciente', 'error');
    } finally {
      setLoading(false);
      setCalculating(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!patient || !result) {
      showToast('No hay datos para guardar', 'error');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const payload = {
        analysis_type: 'astrology-kerykeion',
        input_data: result.input, // Estructura estándar Kerykeion
        result_data: result, // Guardamos el JSON completo
        summary: `Kerykeion: ASC ${result.technical?.specialPoints?.ascendant.sign || 'N/A'} ${result.technical?.specialPoints?.ascendant.degree || 0}° - MC ${result.technical?.specialPoints?.midheaven.sign || 'N/A'} ${result.technical?.specialPoints?.midheaven.degree || 0}°`,
        therapist_notes: `Generado automáticamente por Módulo Kerykeion ${result.input.engine_version || '1.0.0'} - Astrología Técnica`
      };

      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/cabalistic-analysis/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Error al guardar el análisis');
      }

      showToast('Análisis Kerykeion guardado exitosamente en la ficha del paciente', 'success');
      
    } catch (err: any) {
      console.error('Error saving analysis:', err);
      showToast(err.message || 'Error al guardar el análisis', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-slate-400">Cargando datos del paciente...</p>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  // Si no hay patientId, mostrar mensaje informativo
  if (!patientId && !patient && !loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 text-white p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Selecciona un Paciente</h2>
              <p className="text-amber-300 mb-4">
                Para realizar un análisis de Kerykeion, necesitas acceder desde la ficha de un paciente.
              </p>
              <Button
                onClick={() => router.push('/dashboard/therapist')}
                className="mt-4 bg-amber-600 hover:bg-amber-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  if (error && !patient) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 text-white p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-red-300">{error}</p>
              <Button
                onClick={() => router.push(patientId ? `/therapist/patients/${patientId}` : '/dashboard/therapist')}
                className="mt-4 bg-amber-600 hover:bg-amber-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(patientId ? `/therapist/patients/${patientId}` : '/dashboard/therapist')}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                    Astrología Técnica (Kerykeion)
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Carta Precisa - Mapa Exacto sin Interpretación
                  </p>
                  {patient && (
                    <p className="text-slate-500 text-xs mt-1">
                      Paciente: {patient.full_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveToProfile}
                  disabled={saving || !result}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar en Ficha
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Declaración de Principios */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
            <p className="text-sm text-amber-200 italic leading-relaxed">
              <strong className="text-amber-400 font-semibold">Filosofía del Método:</strong> "Este módulo no interpreta el alma: 
              construye el mapa exacto para que la conciencia pueda leerlo."
            </p>
          </div>
        </div>

        {/* Main Content */}
        {patient && result && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Columna Izquierda: Puntos Especiales */}
              <div className="lg:col-span-1 space-y-6">
                {/* ASC */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      Ascendente (ASC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {result.technical?.specialPoints?.ascendant.degree || 0}°
                      </div>
                      <Badge variant="outline" className="border-amber-400 text-amber-300 text-lg px-4 py-2">
                        {result.technical?.specialPoints?.ascendant.sign || 'N/A'}
                      </Badge>
                      <div className="mt-3 text-xs text-slate-400">
                        <p>Casa: 1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* MC */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Medio Cielo (MC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {result.technical?.specialPoints?.midheaven.degree || 0}°
                      </div>
                      <Badge variant="outline" className="border-purple-400 text-purple-300 text-lg px-4 py-2">
                        {result.technical?.specialPoints?.midheaven.sign || 'N/A'}
                      </Badge>
                      <div className="mt-3 text-xs text-slate-400">
                        <p>Casa: 10</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datos Técnicos */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Datos Técnicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiempo Sidéreo:</span>
                      <span className="text-white font-mono">{result.technical.siderealTime.toFixed(4)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Oblicuidad:</span>
                      <span className="text-white font-mono">{result.technical.obliquity}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latitud:</span>
                      <span className="text-white font-mono">{result.birthData.latitude.toFixed(4)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Longitud:</span>
                      <span className="text-white font-mono">{result.birthData.longitude.toFixed(4)}°</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna Central: Planetas */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      Posiciones Planetarias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {Object.entries(result.planets).map(([planet, position]) => (
                        <div key={planet} className="p-3 bg-slate-950 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{planet}</span>
                            <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                              {position.sign} {position.degree}°
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna Derecha: Aspectos, Casas y Mapeo Cabalístico */}
              <div className="lg:col-span-1 space-y-6">
                {/* Aspectos */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-500" />
                      Aspectos ({result.aspects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {result.aspects.slice(0, 20).map((aspect, idx) => (
                        <div key={idx} className={`p-2 rounded text-xs ${
                          aspect.orb < 1 
                            ? 'bg-amber-500/20 border border-amber-500/50' 
                            : 'bg-slate-950 border border-slate-700'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold">
                              {aspect.from} {aspect.type} {aspect.to}
                            </span>
                            <span className="text-slate-400">
                              orb: {aspect.orb.toFixed(2)}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Casas */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Casas Astrológicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(result.houses).map(([houseNumber, house]) => (
                        <div key={houseNumber} className="p-2 bg-slate-950 rounded border border-slate-700">
                          <div className="font-semibold text-white mb-1">Casa {houseNumber}</div>
                          <div className="text-slate-400">
                            {house.sign} {house.degree}°
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mapeo Cabalístico */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Mapeo Cabalístico (Técnico)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {Object.entries(result.cabalistic_mapping).map(([planet, mapping]) => (
                        <div key={planet} className="p-2 bg-slate-950 rounded border border-slate-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-semibold text-sm">{planet}</span>
                            <Badge variant="outline" className="border-purple-500 text-purple-300 text-xs">
                              {mapping.sefira}
                            </Badge>
                          </div>
                          {mapping.path && (
                            <div className="text-xs text-slate-400 mt-1">
                              Sendero {mapping.path}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SVG de la Carta */}
              {result.chart_svg && (
                <Card className="bg-slate-900 border-slate-800 md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-500" />
                      Carta Natal Técnica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center bg-slate-950 rounded-lg p-4">
                      <div 
                        dangerouslySetInnerHTML={{ __html: result.chart_svg }}
                        className="max-w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        )}
      </div>
    </TherapistRoute>
  );
}

