'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getPatient, 
  getPatientTests
} from '@/lib/patient-storage';
import { correlateKabbalisticFindings } from '@/lib/patient-analysis';
import type { PatientInfo, PatientTestResult } from '@/types/patient';
import type { KabbalisticCorrelation } from '@/lib/patient-analysis';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  Heart,
  Brain,
  Zap,
  Info,
  FileText,
} from 'lucide-react';

export default function CorrelationsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [tests, setTests] = useState<PatientTestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<PatientTestResult | null>(null);
  const [correlations, setCorrelations] = useState<KabbalisticCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = () => {
    setLoading(true);
    
    const patientData = getPatient(patientId);
    if (!patientData) {
      alert('Paciente no encontrado');
      router.push('/patients');
      return;
    }

    const patientTests = getPatientTests(patientId).filter(
      t => t.testType === 'wellness' && t.wellnessData
    );

    setPatient(patientData);
    setTests(patientTests);
    
    // Seleccionar el test más reciente por defecto
    if (patientTests.length > 0) {
      setSelectedTest(patientTests[0]);
      calculateCorrelations(patientData, patientTests[0]);
    }
    
    setLoading(false);
  };

  const calculateCorrelations = (patientData: PatientInfo, test: PatientTestResult) => {
    if (!patientData.kabbalisticProfile || !test.wellnessData) {
      setCorrelations([]);
      return;
    }

    const correlationsResult = correlateKabbalisticFindings(
      patientData.kabbalisticProfile,
      test
    );

    setCorrelations(correlationsResult);
  };

  const handleTestChange = (test: PatientTestResult) => {
    setSelectedTest(test);
    if (patient) {
      calculateCorrelations(patient, test);
    }
  };

  const getCorrelationColor = (correlation: string) => {
    switch (correlation) {
      case 'strong':
        return 'bg-red-900/30 border-red-500 text-red-300';
      case 'moderate':
        return 'bg-orange-900/30 border-orange-500 text-orange-300';
      case 'weak':
        return 'bg-yellow-900/30 border-yellow-500 text-yellow-300';
      default:
        return 'bg-gray-900/30 border-gray-500 text-gray-300';
    }
  };

  const getCorrelationBadgeColor = (correlation: string) => {
    switch (correlation) {
      case 'strong':
        return 'bg-red-500/20 text-red-400 border-red-700';
      case 'moderate':
        return 'bg-orange-500/20 text-orange-400 border-orange-700';
      case 'weak':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-700';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Óptimo':
        return 'text-green-400';
      case 'Normal':
        return 'text-blue-400';
      case 'Regular':
        return 'text-yellow-400';
      case 'Crítico':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando correlaciones...</div>
      </div>
    );
  }

  if (!patient.kabbalisticProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Paciente
            </Button>
          </Link>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Perfil Cabalístico Requerido
              </h2>
              <p className="text-gray-400 mb-6">
                Este paciente no tiene un perfil cabalístico configurado. 
                Necesitas agregar un análisis cabalístico para ver las correlaciones.
              </p>
              <Link href={`/patients/${patientId}/kabbalah`}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Agregar Perfil Cabalístico
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Paciente
            </Button>
          </Link>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No hay Tests de Wellness
              </h2>
              <p className="text-gray-400 mb-6">
                Este paciente no tiene tests de wellness completados. 
                Necesitas realizar un test de wellness para ver las correlaciones.
              </p>
              <Link href={`/patients/${patientId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Realizar Test de Wellness
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Paciente
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Correlaciones Cabalísticas
              </h1>
              <p className="text-gray-300">
                Análisis cruzado entre perfil cabalístico y tests de wellness
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Paciente: <span className="text-amber-400">{patient.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Test Selector */}
        <Card className="mb-6 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Seleccionar Test de Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => handleTestChange(test)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTest?.id === test.id
                      ? 'border-amber-500 bg-amber-900/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                    {selectedTest?.id === test.id && (
                      <CheckCircle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {test.wellnessData?.systemScores.length || 0} sistemas evaluados
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Correlations Results */}
        {selectedTest && (
          <>
            {correlations.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No se encontraron correlaciones
                  </h2>
                  <p className="text-gray-400">
                    No se detectaron correlaciones significativas entre el perfil cabalístico 
                    y los resultados del test de wellness seleccionado.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {correlations.length} Correlación{correlations.length !== 1 ? 'es' : ''} Encontrada{correlations.length !== 1 ? 's' : ''}
                  </h2>
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-700">
                    Test: {new Date(selectedTest.date).toLocaleDateString()}
                  </Badge>
                </div>

                {correlations.map((correlation, idx) => (
                  <Card
                    key={idx}
                    className={`bg-slate-900/50 border-l-4 ${getCorrelationColor(correlation.correlation)}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-white">
                              {correlation.kabbalisticFinding.description}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={getCorrelationBadgeColor(correlation.correlation)}
                            >
                              {correlation.correlation === 'strong'
                                ? 'Fuerte'
                                : correlation.correlation === 'moderate'
                                ? 'Moderada'
                                : correlation.correlation === 'weak'
                                ? 'Débil'
                                : 'Sin Correlación'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              Confianza: {Math.round(correlation.confidence)}%
                            </span>
                            {correlation.kabbalisticFinding.bodyArea && (
                              <span className="flex items-center">
                                <Activity className="w-4 h-4 mr-1" />
                                Área: {correlation.kabbalisticFinding.bodyArea}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {correlation.correlation === 'strong' && (
                            <AlertCircle className="w-6 h-6 text-red-400" />
                          )}
                          {correlation.correlation === 'moderate' && (
                            <Info className="w-6 h-6 text-orange-400" />
                          )}
                          {correlation.correlation === 'weak' && (
                            <Info className="w-6 h-6 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Explanation */}
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <p className="text-gray-300 leading-relaxed">
                          {correlation.explanation}
                        </p>
                      </div>

                      {/* Wellness Findings */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Hallazgos en Wellness
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {correlation.wellnessFindings.map((finding, findIdx) => (
                            <div
                              key={findIdx}
                              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold text-sm">
                                  {finding.system}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(finding.status)} border-current`}
                                >
                                  {finding.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-slate-900 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      finding.percentage > 50
                                        ? 'bg-red-500'
                                        : finding.percentage > 30
                                        ? 'bg-orange-500'
                                        : finding.percentage > 15
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(finding.percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="text-gray-400 text-xs">
                                  {finding.percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      {correlation.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Heart className="w-5 h-5 mr-2" />
                            Recomendaciones
                          </h3>
                          <ul className="space-y-2">
                            {correlation.recommendations.map((rec, recIdx) => (
                              <li
                                key={recIdx}
                                className="flex items-start gap-2 text-gray-300 bg-slate-800/50 border border-slate-700 rounded-lg p-3"
                              >
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

