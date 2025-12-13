'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Save, ArrowLeft, Brain, Heart, Activity, 
  Layers, Sparkles, AlertTriangle, HelpCircle
} from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import { getAuthToken } from '@/lib/auth';
import { 
  calculateShekinahProfile, 
  validateShekinahInput,
  type ShekinahResult 
} from '@/lib/shekinah-engine';
import ShekinahGuideModal from '@/components/ShekinahGuideModal';
import { useToast, ToastContainer } from '@/components/ui/toast';

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
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [result, setResult] = useState<ShekinahResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/patients/${patientId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos del paciente');
      }

      const data = await response.json();
      setPatient(data);
      
      // Calcular análisis
      if (data.full_name && data.birth_date) {
        const validation = validateShekinahInput(data.full_name, data.birth_date);
        if (validation.valid) {
          const calculated = calculateShekinahProfile(data.full_name, data.birth_date);
          setResult(calculated);
        } else {
          setError(validation.error || 'Error en validación');
        }
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Error al cargar datos');
      showToast({
        type: 'error',
        message: 'Error al cargar los datos del paciente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !patientId) return;

    try {
      setCalculating(true);
      const token = getAuthToken();
      
      const summary = `Shejinah: PIN ${result.identity.pin} - OTD ${result.otd.to}/${result.otd.pt}/${result.otd.td} | Escudos: ${result.shields.list.length} | Imagen Alma: ${result.soulImage.portals.length}`;

      const response = await fetch(`/api/patients/${patientId}/analyses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_type: 'shekinah',
          result: result,
          summary: summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar análisis');
      }

      showToast({
        type: 'success',
        message: 'Análisis Shejinah guardado correctamente'
      });
    } catch (err: any) {
      console.error('Error saving analysis:', err);
      showToast({
        type: 'error',
        message: 'Error al guardar el análisis'
      });
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      </TherapistRoute>
    );
  }

  if (error && !patient) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">Volver</Button>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-400">Análisis Shejinah</h1>
              <p className="text-slate-400 text-sm">Método Moderno Pitagórico</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGuide(true)}>
                <HelpCircle className="w-4 h-4 mr-2" /> Guía
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={calculating || !result}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Button>
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
              
              {/* 1. PIN & OTD */}
              <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500/30 md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-300 text-xs">PIN (Corazón)</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-6xl font-bold text-white">{result.identity.pin}</span>
                  <div className="mt-2 text-xs text-slate-400 space-y-1">
                    <p>Gematría: {result.identity.gematriaTotal}</p>
                    <p>SCF: {result.identity.scf}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-400 flex gap-2">
                    <Activity className="w-4 h-4" /> Trilogía OTD
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { l: 'ORIGEN', v: result.otd.to },
                    { l: 'TRANSF', v: result.otd.pt },
                    { l: 'DESTINO', v: result.otd.td }
                  ].map((x, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded border border-slate-700">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">{x.l}</div>
                      <div className="text-3xl font-bold text-white">{x.v}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 2. VIBRACIONES */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-400 flex gap-2">
                    <Layers className="w-4 h-4" /> Vibraciones del Ser
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  {[
                    { l: "Espíritu", v: result.vibrations.spirit },
                    { l: "Alma", v: result.vibrations.soul },
                    { l: "Cuerpo", v: result.vibrations.body },
                    { l: "Sanador", v: result.vibrations.healingEffect },
                    { l: "Hoy", v: result.vibrations.today }
                  ].map((x, i) => (
                    <div key={i} className="p-2 bg-slate-950 border border-emerald-900/30 rounded">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">{x.l}</div>
                      <span className="text-xl font-bold text-emerald-400">{x.v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 3. ESCUDOS (SÍNTOMAS) */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-2 border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-400 flex gap-2">
                    <Activity className="w-4 h-4" /> Escudos (Síntomas)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.shields.list.length === 0 ? (
                    <p className="text-sm text-green-400">Flujo limpio. Sin escudos activos.</p>
                  ) : (
                    result.shields.list.map((s, i) => (
                      <div key={i} className="p-2 bg-slate-950 rounded border border-red-900/30 text-sm">
                        <div className="flex justify-between mb-1">
                          <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                            Origen {s.origin}
                          </Badge>
                          <Badge className="bg-red-900 text-red-200 text-xs">
                            Escudo {s.portal}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{s.symptoms}</p>
                        <p className="text-xs text-purple-400 mt-1 italic">{s.psychology}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 4. IMAGEN DEL ALMA (CREENCIAS) */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-2 border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 flex gap-2">
                    <Brain className="w-4 h-4" /> Imagen del Alma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.soulImage.portals.length === 0 ? (
                    <p className="text-sm text-green-400">Sin bloqueos de creencias detectados.</p>
                  ) : (
                    result.soulImage.portals.map((p, i) => (
                      <div key={i} className="p-2 bg-slate-950 rounded border border-purple-900/30 text-sm flex justify-between items-center">
                        <span className="text-purple-300">{p.name}</span>
                        <Badge variant="outline" className="border-purple-500/50 text-xs">
                          Bloqueo
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 5. CUENTAS ABIERTAS & CÓSMICA */}
              <Card className="bg-slate-900 border-slate-800 md:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 flex gap-2">
                    <Sparkles className="w-4 h-4" /> Cuentas Abiertas (Deuda & Solución)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.karmic.openAccounts.length === 0 ? (
                    <p className="text-sm text-slate-400 col-span-3">No hay cuentas abiertas detectadas.</p>
                  ) : (
                    result.karmic.openAccounts.map((ca, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-yellow-900/30 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xl font-bold text-white">{ca.number}</span>
                          <Badge className="bg-red-900 text-red-200">T{ca.decomp.T}</Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          Solución (L): <span className="text-green-400 font-bold">{ca.decomp.L}</span>
                        </div>
                        {ca.decomp.C && (
                          <div className="text-xs text-purple-400 mt-1">
                            Cósmico: <span className="font-bold">{ca.decomp.C}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 6. POTENCIALES ARCAICOS */}
              {result.karmic.archaic.length > 0 && (
                <Card className="bg-slate-900 border-slate-800 md:col-span-4 border-l-4 border-l-cyan-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-cyan-400 flex gap-2">
                      <Heart className="w-4 h-4" /> Potenciales Arcaicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.karmic.archaic.map((arch, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-cyan-900/30 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-cyan-300">{arch.number}</span>
                          <Badge className="bg-cyan-900 text-cyan-200">Tesoro</Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          T: {arch.decomp.T} | L: <span className="text-green-400">{arch.decomp.L}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 7. CUENTAS PENDIENTES */}
              {result.karmic.pending.length > 0 && (
                <Card className="bg-slate-900 border-slate-800 md:col-span-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-orange-400 flex gap-2">
                      <AlertTriangle className="w-4 h-4" /> Cuentas Pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.karmic.pending.map((p, i) => (
                        <Badge key={i} className="bg-orange-950 text-orange-200 border-orange-500">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          <ShekinahGuideModal 
            isOpen={showGuide} 
            onClose={() => setShowGuide(false)} 
          />
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </TherapistRoute>
  );
}
