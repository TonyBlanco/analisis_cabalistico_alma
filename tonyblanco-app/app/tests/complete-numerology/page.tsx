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
  AlertCircle,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import CabalisticReport from '@/components/CabalisticReport';
import { useToast, ToastContainer } from '@/components/ui/toast';
import type { NumerologyResult } from '@/types/numerology';
import InterpretationModal from '@/components/InterpretationModal';
import { isTherapist } from '@/lib/auth';

export default function CompleteNumerologyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || searchParams.get('patient_id');
  
  // Detectar si es terapeuta (si viene desde ficha de paciente o si el usuario es terapeuta)
  const isTherapistView = !!patientId || isTherapist();

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState<string>('');
  const [resultId, setResultId] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

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

  const validateDate = (dateString: string): { valid: boolean; error?: string } => {
    const fecha = new Date(dateString);
    const today = new Date();
    const minDate = new Date('1900-01-01');

    if (isNaN(fecha.getTime())) {
      return { valid: false, error: 'Fecha de nacimiento inválida' };
    }

    if (fecha > today) {
      return { valid: false, error: 'La fecha de nacimiento no puede ser futura' };
    }

    if (fecha < minDate) {
      return { valid: false, error: 'La fecha de nacimiento debe ser posterior a 1900' };
    }

    return { valid: true };
  };

  const handleCalculate = async () => {
    if (!formData.nombre || !formData.fecha_nacimiento) {
      const errorMsg = 'Por favor completa todos los campos requeridos';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return;
    }

    // Validar fecha con validación mejorada
    const dateValidation = validateDate(formData.fecha_nacimiento);
    if (!dateValidation.valid) {
      setError(dateValidation.error || 'Fecha inválida');
      showToast(dateValidation.error || 'Fecha inválida', 'error');
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
        patient_id: patientId ? parseInt(patientId) : undefined
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
      let finalResult: NumerologyResult;
      if (resultData.result) {
        finalResult = resultData.result as NumerologyResult;
      } else if (resultData.numeros_principales) {
        // Si ya tiene numeros_principales, es el mapa directo
        finalResult = resultData as NumerologyResult;
      } else {
        // Fallback: usar todo el resultData
        finalResult = resultData as NumerologyResult;
      }
      setResult(finalResult);

      if (response.result_id) {
        setResultId(response.result_id);
      }

      showToast('Análisis de Numerología Completa calculado y guardado correctamente', 'success');
      setError('');
    } catch (err: any) {
      console.error('Error calculating:', err);
      const errorMessage = err.message || err.error || 'Error al calcular el análisis de numerología completa';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
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

  // Estilos condicionales según si es terapeuta o usuario personal
  const containerClasses = isTherapistView
    ? "min-h-screen bg-gray-50 py-12 px-4"
    : "min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 py-12 px-4 text-white";
  
  const textPrimaryClasses = isTherapistView ? "text-gray-900" : "text-white";
  const textSecondaryClasses = isTherapistView ? "text-gray-600" : "text-slate-300";
  const textAccentClasses = isTherapistView ? "text-purple-600" : "text-amber-400";
  const cardClasses = isTherapistView
    ? "bg-white border-gray-200 shadow-md"
    : "bg-slate-900/50 border-slate-700";
  const cardTitleClasses = isTherapistView ? "text-gray-900" : "text-white";
  const inputClasses = isTherapistView
    ? "w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
    : "w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

  return (
    <div className={containerClasses}>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={patientId ? `/therapist/patients/${patientId}` : '/dashboard/therapist'}>
            <Button 
              variant="outline" 
              className={isTherapistView 
                ? "mb-4 border-gray-300 hover:bg-gray-100 text-gray-700" 
                : "mb-4 border-slate-700 hover:bg-slate-800 text-white"
              }
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {patientId ? 'Volver al Paciente' : 'Volver al Dashboard'}
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isTherapistView 
                ? "bg-gradient-to-br from-purple-500 to-purple-600" 
                : "bg-gradient-to-br from-amber-500 to-purple-500"
            }`}>
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${textPrimaryClasses}`}>
                Numerología Completa
              </h1>
              <p className={`${textAccentClasses} text-lg`}>
                Análisis profundo de todos tus números: destino, alma, personalidad, madurez, karmas y más
              </p>
              {patient && (
                <p className={`${textSecondaryClasses} text-sm mt-2`}>
                  Paciente: {patient.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {!result ? (
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={cardTitleClasses}>Datos para el Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient && (
                <div className={`border-l-4 p-3 rounded-lg mb-4 ${
                  isTherapistView 
                    ? "bg-blue-50 border-blue-500" 
                    : "bg-blue-900/30 border-blue-500"
                }`}>
                  <p className={`text-sm flex items-center ${
                    isTherapistView ? "text-blue-900" : "text-blue-200"
                  }`}>
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
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                    isTherapistView ? "text-gray-700" : "text-slate-300"
                  }`}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className={inputClasses}
                    placeholder="Nombre completo"
                    disabled={!!patient?.name}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                    isTherapistView ? "text-gray-700" : "text-slate-300"
                  }`}>
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className={inputClasses}
                    disabled={!!patient?.birthDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {error && (
                <div className={`border-l-4 p-3 rounded-lg animate-in fade-in ${
                  isTherapistView 
                    ? "bg-red-50 border-red-500" 
                    : "bg-red-900/30 border-red-500"
                }`}>
                  <p className={`text-sm flex items-center ${
                    isTherapistView ? "text-red-700" : "text-red-400"
                  }`}>
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </p>
                </div>
              )}

              <Button
                onClick={handleCalculate}
                disabled={calculating || !formData.nombre || !formData.fecha_nacimiento}
                className={`w-full disabled:opacity-50 ${
                  isTherapistView
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    : "bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                }`}
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
            <Card className={cardClasses}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={cardTitleClasses}>Resultado del Análisis</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setShowGuide(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Guía de Interpretación
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className={isTherapistView 
                        ? "border-gray-300 hover:bg-gray-100 text-gray-700" 
                        : "border-slate-700 hover:bg-slate-800 text-white"
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar JSON
                    </Button>
                    {resultId && (
                      <Link href={`/tests/results/${resultId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Ver Resultado Completo
                        </Button>
                      </Link>
                    )}
                    {patientId && (
                      <Link href={`/therapist/patients/${patientId}`}>
                        <Button className={isTherapistView 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                        }>
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
                    isTherapistView={isTherapistView}
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
      
      {/* Modal de Guía de Interpretación */}
      <InterpretationModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

