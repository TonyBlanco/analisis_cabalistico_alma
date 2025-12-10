'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowLeft,
  Download,
  User,
  Calendar,
  Loader2,
  Hash,
  Heart,
  Target,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import CabalisticReport from '@/components/CabalisticReport';

export default function CompleteNumerologyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [resultId, setResultId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    fecha_nacimiento: ''
  });

  useEffect(() => {
    if (patientId) {
      const patientData = getPatient(patientId);
      if (patientData) {
        setPatient(patientData);
        setFormData({
          nombre: patientData.name,
          fecha_nacimiento: patientData.birthDate 
            ? new Date(patientData.birthDate).toISOString().split('T')[0]
            : ''
        });
      }
    } else {
      // Cargar datos del usuario actual si no viene de paciente
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('http://127.0.0.1:8000/api/me/', {
          headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(userData => {
          if (userData.full_name) {
            setFormData(prev => ({
              ...prev,
              nombre: userData.full_name
            }));
          }
          if (userData.birth_date) {
            setFormData(prev => ({
              ...prev,
              fecha_nacimiento: new Date(userData.birth_date).toISOString().split('T')[0]
            }));
          }
        })
        .catch(err => console.error('Error loading user data:', err));
      }
    }
  }, [patientId]);

  const handleCalculate = async () => {
    if (!formData.nombre || !formData.fecha_nacimiento) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar formato de fecha
    const fecha = new Date(formData.fecha_nacimiento);
    if (isNaN(fecha.getTime())) {
      setError('Fecha de nacimiento inválida');
      return;
    }

    setCalculating(true);
    setError('');

    try {
      const payload: ExecuteTestRequest = {
        test_module_code: 'complete-numerology',
        input_data: {
          nombre: formData.nombre.trim(),
          fecha_nacimiento: formData.fecha_nacimiento, // Formato YYYY-MM-DD
          full_name: formData.nombre.trim(),
          birth_date: formData.fecha_nacimiento
        },
        client_name: formData.nombre.trim(),
        client_birth_date: formData.fecha_nacimiento,
        save_result: true,
        patient_id: patientId || undefined
      };

      console.log('Enviando payload:', payload);

      const response = await executeTest(payload);
      
      console.log('Respuesta recibida:', response);

      // El backend devuelve: { success: true, result: { test_type, processed, result: {...}, message }, result_id }
      // El result interno tiene: { test_type, processed, timestamp, result: mapa, message }
      const resultData = response.result || response;
      
      // Verificar si el procesamiento fue exitoso
      if (resultData.processed === false) {
        throw new Error(resultData.message || resultData.note || 'Error al procesar el test');
      }

      // Extraer el mapa cabalístico del resultado
      // La estructura es: response.result.result contiene el mapa
      if (resultData.result) {
        setResult(resultData.result);
      } else if (resultData.numeros_principales) {
        // Si ya tiene numeros_principales, es el mapa directo
        setResult(resultData);
      } else {
        // Fallback: usar todo el resultData
        setResult(resultData);
      }

      if (response.result_id) {
        setResultId(response.result_id);
      }

      alert('Análisis de Numerología Completa calculado y guardado correctamente');
    } catch (err: any) {
      console.error('Error calculating:', err);
      const errorMessage = err.message || err.error || 'Error al calcular el análisis de numerología completa';
      setError(errorMessage);
      
      // Mostrar más detalles en consola para debugging
      if (err.response) {
        console.error('Error response:', err.response);
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Numerologia_Completa_${formData.nombre || 'analisis'}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 py-12 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={patientId ? `/patients/${patientId}` : '/tests'}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {patientId ? 'Volver al Paciente' : 'Volver a Tests'}
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Numerología Completa
              </h1>
              <p className="text-amber-400 text-lg">
                Análisis profundo de todos tus números: destino, alma, personalidad, madurez, karmas y más
              </p>
              {patient && (
                <p className="text-gray-300 text-sm mt-2">Paciente: {patient.name}</p>
              )}
            </div>
          </div>
        </div>

        {!result ? (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Datos para el Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient && (
                <div className="bg-blue-900/30 border-l-4 border-blue-500 p-3 rounded-sm mb-4">
                  <p className="text-sm text-blue-200">
                    <User className="inline-block w-4 h-4 mr-2" />
                    <strong>Paciente:</strong> {patient.name}
                    {patient.birthDate && (
                      <span className="ml-4">
                        <Calendar className="inline-block w-4 h-4 mr-1" />
                        Nacimiento: {new Date(patient.birthDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Nombre completo"
                    disabled={!!patient?.name}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={!!patient?.birthDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-3 rounded-sm">
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <Button
                onClick={handleCalculate}
                disabled={calculating || !formData.nombre || !formData.fecha_nacimiento}
                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 disabled:opacity-50"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calcular Numerología Completa
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Resultado del Análisis</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar JSON
                    </Button>
                    {resultId && (
                      <Link href={`/tests/results/${resultId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Ver Resultado Completo
                        </Button>
                      </Link>
                    )}
                    {patientId && (
                      <Link href={`/patients/${patientId}`}>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                          Volver al Paciente
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Usar el componente CabalisticReport si tiene numeros_principales */}
                {result.numeros_principales ? (
                  <CabalisticReport 
                    mapa={result} 
                    clientName={formData.nombre}
                    birthDate={formData.fecha_nacimiento}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Mostrar resultados estructurados */}
                    {result.numeros_principales && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(result.numeros_principales).map(([key, data]: [string, any]) => (
                          <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-sm p-4">
                            <h3 className="text-sm font-semibold text-amber-400 mb-2 uppercase">
                              {key.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-2xl font-bold text-white">{data.valor || data}</p>
                            {data.arbol?.nombre_es && (
                              <p className="text-sm text-gray-300 mt-1">Sefirá: {data.arbol.nombre_es}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {result.inclusion_base && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-sm p-4">
                        <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase">
                          Inclusión de Base
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-300 font-medium mb-1">Números Dominantes:</p>
                            <p className="text-white">
                              {Array.isArray(result.inclusion_base.dominantes) 
                                ? result.inclusion_base.dominantes.join(', ')
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-300 font-medium mb-1">Números Ausentes (Karmas):</p>
                            <p className="text-white">
                              {Array.isArray(result.inclusion_base.ausentes)
                                ? result.inclusion_base.ausentes.join(', ')
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <details className="bg-slate-800/50 border border-slate-700 p-4 rounded-sm">
                      <summary className="font-semibold text-white cursor-pointer">
                        Ver JSON Completo
                      </summary>
                      <pre className="text-xs overflow-auto max-h-60 bg-slate-900 p-3 rounded-sm mt-3 text-gray-300">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

