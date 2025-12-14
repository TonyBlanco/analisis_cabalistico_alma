'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TestSelector from '@/components/TestSelector';
import CommunicationTools from '@/components/CommunicationTools';
import PatientTestsSidebar from '@/components/PatientTestsSidebar';
import { 
  getPatient, 
  getPatientTests, 
  updatePatient 
} from '@/lib/patient-storage';
import { getLatestComparison } from '@/lib/patient-analysis';
import { getNaturalRemediesBySystem } from '@/lib/natural-remedies';
import type { PatientInfo, PatientTestResult } from '@/types/patient';
import {
  ArrowLeft,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Edit,
  Sparkles,
  Heart,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [tests, setTests] = useState<PatientTestResult[]>([]);
  const [latestComparison, setLatestComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTestSelector, setShowTestSelector] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = () => {
    setLoading(true);
    
    const patientData = getPatient(patientId);
    if (!patientData) {
      alert('Paciente no encontrado');
      router.push('/patients');
      return;
    }

    const patientTests = getPatientTests(patientId);
    const comparison = getLatestComparison(patientId);

    setPatient(patientData);
    setTests(patientTests);
    setLatestComparison(comparison);
    setLoading(false);
  };

  if (loading || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  const latestTest = tests[0];
  const systemsAtRisk = latestTest?.wellnessData?.systemScores.filter(
    s => s.status === 'Crítico' || s.status === 'Regular'
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex">
      {/* Sidebar */}
      <PatientTestsSidebar patient={patient} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/patients">
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Pacientes
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{patient.name}</h1>
                <div className="flex gap-4 text-gray-300">
                  {patient.email && <span>📧 {patient.email}</span>}
                  {patient.phone && <span>📱 {patient.phone}</span>}
                  {patient.birthDate && (
                    <span>🎂 {new Date(patient.birthDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/patients/${patient.id}/edit`}>
                <Button variant="outline" className="border-blue-600 text-blue-400">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>

              <Link href={`/patients/${patient.id}/kabbalah`}>
                <Button 
                  variant="outline" 
                  className="border-amber-600 text-amber-400 hover:bg-amber-600/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Análisis Cabalístico
                </Button>
              </Link>
              
              <Button 
                onClick={() => setShowTestSelector(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500"
              >
                <Activity className="w-4 h-4 mr-2" />
                Realizar Test
              </Button>
            </div>
          </div>
        </div>

        {/* Herramientas de Comunicación Rápida */}
        <Card className="mb-8 bg-gradient-to-r from-slate-900/50 to-blue-900/30 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Herramientas de Comunicación Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommunicationTools patient={patient} />
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tests Realizados</p>
                  <p className="text-3xl font-bold text-white">{tests.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Último Test</p>
                  <p className="text-lg font-bold text-white">
                    {latestTest ? new Date(latestTest.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sistemas en Riesgo</p>
                  <p className="text-3xl font-bold text-white">{systemsAtRisk.length}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Estado General</p>
                  <p className="text-lg font-bold text-white">
                    {latestTest && latestTest.wellnessData ? 
                      Math.round(latestTest.wellnessData.systemScores.reduce((acc, s) => acc + (100 - s.percentage), 0) / latestTest.wellnessData.systemScores.length) + '%'
                      : 'N/A'
                    }
                  </p>
                </div>
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Perfil Cabalístico */}
        {patient.kabbalisticProfile && (
          <Card className="mb-8 bg-gradient-to-r from-amber-900/20 to-purple-900/20 border-amber-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Perfil Cabalístico del Alma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Número del Alma</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {patient.kabbalisticProfile.soulNumber || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">Camino de Vida</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {patient.kabbalisticProfile.lifePath || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Ángel Guardián</p>
                  <p className="text-xl font-bold text-blue-400">
                    {patient.kabbalisticProfile.guardianAngel || 'N/A'}
                  </p>
                </div>
              </div>

              {patient.kabbalisticProfile.weaknesses && patient.kabbalisticProfile.weaknesses.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-300 font-semibold mb-3">Debilidades Identificadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.kabbalisticProfile.weaknesses.map((weakness, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-900/20 text-red-400 border-red-700">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patient.kabbalisticProfile.strengths && patient.kabbalisticProfile.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-300 font-semibold mb-3">Fortalezas:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.kabbalisticProfile.strengths.map((strength, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-900/20 text-green-400 border-green-700">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <Link href={`/patients/${patient.id}/correlations`}>
                  <Button variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-600/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ver Correlaciones con Wellness
                  </Button>
                </Link>
                
                <Link href={`/patients/${patient.id}/kabbalah/edit`}>
                  <Button variant="outline" className="border-purple-600 text-purple-400">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!patient.kabbalisticProfile && (
          <Card className="mb-8 bg-amber-900/10 border-amber-700/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-white font-semibold">Perfil Cabalístico no configurado</p>
                    <p className="text-gray-400 text-sm">
                      Agrega el análisis cabalístico para ver correlaciones con tests de wellness
                    </p>
                  </div>
                </div>
                <Link href={`/patients/${patient.id}/kabbalah`}>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Agregar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparación Temporal */}
        {latestComparison && (
          <Card className="mb-8 bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Evolución ({latestComparison.period})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{latestComparison.summary}</p>
              
              <div className="space-y-3">
                {latestComparison.changes.slice(0, 5).map((change: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {change.trend === 'improving' && <TrendingDown className="w-5 h-5 text-green-400" />}
                      {change.trend === 'declining' && <TrendingUp className="w-5 h-5 text-red-400" />}
                      {change.trend === 'stable' && <Minus className="w-5 h-5 text-blue-400" />}
                      
                      <span className="text-white">{change.system}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className={`font-bold ${
                        change.trend === 'improving' ? 'text-green-400' : 
                        change.trend === 'declining' ? 'text-red-400' : 
                        'text-blue-400'
                      }`}>
                        {change.change > 0 ? '+' : ''}{change.change.toFixed(1)}%
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({change.previousScore.toFixed(0)}% → {change.currentScore.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link href={`/patients/${patient.id}/trends`}>
                <Button variant="outline" className="w-full mt-4 border-blue-600 text-blue-400">
                  Ver Análisis Completo de Tendencias
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Historial de Tests */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Historial de Tests ({tests.length})</span>
              <Button 
                onClick={() => setShowTestSelector(true)}
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                Realizar Nuevo Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No hay tests registrados</p>
                <Button 
                  onClick={() => setShowTestSelector(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-500"
                >
                  Realizar Primer Test
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-semibold">
                            {new Date(test.date).toLocaleDateString('es', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(test.date).toLocaleTimeString('es', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {test.wellnessData && (
                          <div className="grid md:grid-cols-3 gap-3 mb-3">
                            {test.wellnessData.systemScores.map((system, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-gray-300 text-sm">{system.system}</span>
                                <Badge
                                  variant="outline"
                                  className={`
                                    ${system.status === 'Óptimo' ? 'bg-green-900/20 text-green-400 border-green-700' : ''}
                                    ${system.status === 'Normal' ? 'bg-blue-900/20 text-blue-400 border-blue-700' : ''}
                                    ${system.status === 'Regular' ? 'bg-orange-900/20 text-orange-400 border-orange-700' : ''}
                                    ${system.status === 'Crítico' ? 'bg-red-900/20 text-red-400 border-red-700' : ''}
                                  `}
                                >
                                  {system.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {test.therapistNotes && (
                          <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-700">
                            <p className="text-gray-400 text-sm font-semibold mb-1">Notas del Terapeuta:</p>
                            <p className="text-gray-300 text-sm">{test.therapistNotes}</p>
                          </div>
                        )}
                      </div>

                      <Link href={`/patients/${patient.id}/tests/${test.id}`}>
                        <Button size="sm" variant="outline" className="ml-4 border-blue-600 text-blue-400">
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Selector Modal */}
        {showTestSelector && (
          <TestSelector
            patientId={patient.id}
            patientName={patient.name}
            onClose={() => setShowTestSelector(false)}
          />
        )}
        </div>
      </div>
    </div>
  );
}
