'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Save, ArrowLeft, Brain, Heart, Activity, 
  Calendar, Sparkles, AlertCircle, CheckCircle, HelpCircle 
} from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import { getAuthToken } from '@/lib/auth';
import { 
  calculateShekinahProfile, 
  validateShekinahInput,
  type ShekinahResult 
} from '@/lib/shekinah-engine';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ShekinahGuideModal from '@/components/ShekinahGuideModal';

interface PatientData {
  id: number;
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  first_name?: string;
  last_name?: string;
}

export default function ShekinahAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId') || searchParams?.get('patient_id');
  
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [result, setResult] = useState<ShekinahResult | null>(null);
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

      setPatient(patientData);

      // Calcular análisis automáticamente
      const validation = validateShekinahInput(patientData.full_name, patientData.birth_date);
      if (!validation.valid) {
        throw new Error(validation.error || 'Datos inválidos');
      }

      const analysis = calculateShekinahProfile(patientData.full_name, patientData.birth_date);
      setResult(analysis);
      
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Error al cargar los datos del paciente');
      showToast(err.message || 'Error al cargar los datos del paciente', 'error');
    } finally {
      setLoading(false);
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
        analysis_type: 'shekinah',
        input_data: {
          name: patient.full_name,
          birthDate: patient.birth_date
        },
        result_data: result, // Guardamos el JSON completo para la IA
        summary: `Shejinah: PIN ${result.identity.pin} - OTD ${result.otd.to}-${result.otd.pt}-${result.otd.td}`,
        therapist_notes: 'Generado automáticamente por Módulo Atlantis - Shejinah Moderno Pitagórico'
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

      const data = await response.json();
      showToast('Análisis Shejinah guardado exitosamente en la ficha del paciente', 'success');
      
      // Opcional: redirigir a la ficha del paciente
      // router.push(`/therapist/patients/${patientId}`);
      
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
                Para realizar un análisis de Shejinah, necesitas acceder desde la ficha de un paciente.
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
                    Análisis Shejinah
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Método Moderno Pitagórico (Atlantis)
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
                  onClick={() => setShowGuide(true)}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Guía de Interpretación
                </Button>
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

        {/* Main Content */}
        {patient && result && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Declaración de Principios */}
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm text-amber-200 italic leading-relaxed">
                <strong className="text-amber-400 font-semibold">Filosofía del Método:</strong> "Este módulo no interpreta el alma: 
                construye el mapa exacto para que la conciencia pueda leerlo."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* PIN Card */}
              <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500/30 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Número del Corazón (PIN)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-2">
                  <span className="text-6xl font-bold text-white mb-2">{result.identity.pin}</span>
                  <Badge variant="outline" className="border-indigo-400 text-indigo-300">
                    Vibración Total
                  </Badge>
                  <div className="mt-4 text-center text-xs text-slate-400">
                    <p>Gematría: {result.identity.gematriaTotal}</p>
                    <p>SCF: {result.identity.scf}</p>
                  </div>
                </CardContent>
              </Card>

              {/* OTD Cards */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-amber-400 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Trilogía OTD
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">ORIGEN</div>
                    <div className="text-3xl font-bold text-white">{result.otd.to}</div>
                    <div className="text-xs text-slate-400 mt-2">Base Estructural</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-lg border border-purple-900/30">
                    <div className="text-[10px] text-purple-400 uppercase mb-1">TRANSFORMACIÓN</div>
                    <div className="text-3xl font-bold text-white">{result.otd.pt}</div>
                    <div className="text-xs text-slate-400 mt-2">Principio de Crisis</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-lg border border-cyan-900/30">
                    <div className="text-[10px] text-cyan-400 uppercase mb-1">DESTINO</div>
                    <div className="text-3xl font-bold text-white">{result.otd.td}</div>
                    <div className="text-xs text-slate-400 mt-2">Misión Sagrada</div>
                  </div>
                </CardContent>
              </Card>

              {/* Declaración del Alma */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-amber-500" />
                    Declaración del Alma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-amber-500 pl-6 py-4 italic text-slate-300 text-lg leading-relaxed bg-slate-950/50 rounded-r-lg">
                    "Yo, <strong className="text-white">{patient.full_name}</strong>, reconozco que mi base estructural es el 
                    Arcano <strong className="text-amber-400">{result.otd.to}</strong>. Transformo mis desafíos a través de la energía del 
                    Arcano <strong className="text-purple-400">{result.otd.pt}</strong>, para manifestar mi misión sagrada regida por el 
                    Arcano <strong className="text-cyan-400">{result.otd.td}</strong>."
                  </blockquote>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Información Detallada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identidad */}
                    <div>
                      <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">
                        Identidad
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gematría Total:</span>
                          <span className="text-white font-semibold">{result.identity.gematriaTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">SCF (Suma Cifras Fecha):</span>
                          <span className="text-white font-semibold">{result.identity.scf}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Edad Transformación:</span>
                          <span className="text-white font-semibold">{result.identity.et}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ciclo Anual */}
                    <div>
                      <h3 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">
                        Ciclo Anual
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Año Actual:</span>
                          <span className="text-white font-semibold">{result.yearlyCycle.currentYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vibración Actual:</span>
                          <span className="text-white font-semibold">{result.yearlyCycle.vibration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Karmas */}
                    {result.karmas.pending.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">
                          Karmas Pendientes
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {result.karmas.pending.map((karma, idx) => (
                            <Badge key={idx} variant="outline" className="border-red-500 text-red-400">
                              Arcano {karma}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ejes de Tensión */}
                    {result.karmas.axes.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wider">
                          Ejes de Tensión
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {result.karmas.axes.map((axis, idx) => (
                            <Badge key={idx} variant="outline" className="border-orange-500 text-orange-400">
                              Eje {axis}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* Modal de Guía */}
        <ShekinahGuideModal open={showGuide} onOpenChange={setShowGuide} />
      </div>
    </TherapistRoute>
  );
}

