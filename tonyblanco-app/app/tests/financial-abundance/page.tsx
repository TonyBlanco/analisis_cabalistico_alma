'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ArrowLeft,
  Download,
  User,
  Calendar,
  Loader2,
  TrendingUp,
  Coins,
  AlertCircle,
  Sparkles,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient, savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import FinancialHealthReport from '@/components/FinancialHealthReport';

// Función para calcular datos financieros (copiada de FinancialHealthReport)
const gematriaValues: Record<string, number> = {
  a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
  j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
  s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
};

const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22) return num;
  if (num < 10) return num;
  return reduceNumber(String(num).split('').reduce((a, b) => a + parseInt(b), 0));
};

const calculateFinancialData = (name: string, birthDate: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const consonants = cleanName.replace(/[aeiou]/g, '');
  let consSum = 0;
  for (let char of consonants) consSum += gematriaValues[char] || 0;
  const manifestationNumber = reduceNumber(consSum);
  
  const dateSum = birthDate.replace(/[^0-9]/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
  const flowNumber = reduceNumber(dateSum);
  
  let expansion = 0, restriction = 0, management = 0;
  for (let char of cleanName) {
    const val = gematriaValues[char];
    if ([3, 6, 9].includes(val)) expansion += 1;
    else if ([4, 7, 8].includes(val)) restriction += 1;
    else management += 1;
  }
  
  const total = expansion + restriction + management || 1;
  
  let archetype = "El Constructor";
  if (manifestationNumber === 8 || flowNumber === 8) archetype = "El Magnate (Energía 8)";
  else if (manifestationNumber === 4) archetype = "El Arquitecto (Estructura)";
  else if (manifestationNumber === 5) archetype = "El Comerciante (Fluctuante)";
  else if (manifestationNumber === 9) archetype = "El Filántropo (Dar para recibir)";
  else if (manifestationNumber === 7) archetype = "El Místico (Dinero no es prioridad)";
  
  let tikun = "";
  const balExpansion = Math.round((expansion / total) * 100);
  const balRestriction = Math.round((restriction / total) * 100);
  const balManagement = Math.round((management / total) * 100);
  
  if (balExpansion > 60) tikun = "Exceso de Jésed: Gastas más de lo que ingresas. Necesitas Gevurá (presupuesto estricto).";
  else if (balRestriction > 60) tikun = "Exceso de Gevurá: Miedo a invertir. Bloqueas el flujo por tacañería o miedo.";
  else if (manifestationNumber === 7) tikun = "Necesitas 'aterrizar'. Tu energía es muy etérea para Malchut. Usa sistemas automáticos.";
  else tikun = "Equilibrio saludable. Enfócate en la estrategia (Hod) para multiplicar.";
  
  return {
    manifestationNumber,
    flowNumber,
    wealthArchetype: archetype,
    energyBalance: {
      expansion: balExpansion,
      restriction: balRestriction,
      management: balManagement
    },
    tikun
  };
};

export default function FinancialAbundancePage() {
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
        
        // Manejar fecha de nacimiento correctamente
        let fechaFormateada = '';
        if (patientData.birthDate) {
          // Si ya está en formato YYYY-MM-DD, usarlo directamente
          if (/^\d{4}-\d{2}-\d{2}$/.test(patientData.birthDate)) {
            fechaFormateada = patientData.birthDate;
          } else {
            // Intentar convertir desde otros formatos
            try {
              const fecha = new Date(patientData.birthDate);
              if (!isNaN(fecha.getTime())) {
                fechaFormateada = fecha.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Error parsing birthDate:', e);
            }
          }
        }
        
        setFormData({
          nombre: patientData.name,
          fecha_nacimiento: fechaFormateada
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
            // Manejar fecha del usuario de la misma manera
            let fechaFormateada = '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(userData.birth_date)) {
              fechaFormateada = userData.birth_date;
            } else {
              try {
                const fecha = new Date(userData.birth_date);
                if (!isNaN(fecha.getTime())) {
                  fechaFormateada = fecha.toISOString().split('T')[0];
                }
              } catch (e) {
                console.error('Error parsing user birth_date:', e);
              }
            }
            
            if (fechaFormateada) {
              setFormData(prev => ({
                ...prev,
                fecha_nacimiento: fechaFormateada
              }));
            }
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
      // El patientId del frontend es un string de localStorage, no un ID del backend
      // Solo enviar patient_id si es un número válido (ID del backend)
      const backendPatientId = patientId && /^\d+$/.test(patientId) ? parseInt(patientId) : undefined;

      const payload: ExecuteTestRequest = {
        test_module_code: 'financial-abundance',
        input_data: {
          nombre: formData.nombre.trim(),
          fecha_nacimiento: formData.fecha_nacimiento, // Formato YYYY-MM-DD
          full_name: formData.nombre.trim(),
          birth_date: formData.fecha_nacimiento
        },
        client_name: formData.nombre.trim(),
        client_birth_date: formData.fecha_nacimiento,
        save_result: true,
        ...(backendPatientId ? { patient_id: backendPatientId } : {})
      };

      console.log('Enviando payload:', payload);

      const response = await executeTest(payload);
      
      console.log('Respuesta recibida:', response);

      // El backend devuelve: { success: true, result: { test_type, processed, result: {...}, message }, result_id }
      const resultData = response.result || response;
      
      // Verificar si el procesamiento fue exitoso
      if (resultData.processed === false) {
        throw new Error(resultData.message || resultData.note || 'Error al procesar el test');
      }

      // Extraer el resultado
      let finalResult = null;
      if (resultData.result) {
        finalResult = resultData.result;
      } else if (resultData.numeros_principales) {
        // Si ya tiene numeros_principales, es el mapa directo
        finalResult = resultData;
      } else {
        // Fallback: usar todo el resultData
        finalResult = resultData;
      }
      
      setResult(finalResult);

      if (response.result_id) {
        setResultId(response.result_id);
      }

      // Calcular datos financieros completos
      const financialCalculations = calculateFinancialData(formData.nombre.trim(), formData.fecha_nacimiento);
      
      // Guardar el test en el perfil del paciente si viene de un paciente
      if (patientId && patient) {
        try {
          savePatientTest({
            patientId: patientId,
            testType: 'financial-abundance',
            date: new Date().toISOString().split('T')[0],
            resultData: {
              mapa_cabalistico: finalResult,
              nombre: formData.nombre.trim(),
              fecha_nacimiento: formData.fecha_nacimiento,
              analisis_financiero: finalResult?.analisis_financiero || null,
              calculos_financieros: financialCalculations,
              // Incluir todos los datos del mapa cabalístico
              numeros_principales: finalResult?.numeros_principales,
              inclusion_base: finalResult?.inclusion_base,
              estructura_energetica: finalResult?.estructura_energetica,
              vibraciones: finalResult?.vibraciones,
              cuentas_pendientes: finalResult?.cuentas_pendientes,
              dones: finalResult?.dones,
              recomendaciones: finalResult?.recomendaciones
            },
            summary: `Análisis de Abundancia Financiera (Parnassah) - ${formData.nombre} - Arquetipo: ${financialCalculations.wealthArchetype}`,
            backendResultId: response.result_id
          });

          console.log('✅ Test guardado en perfil del paciente con todos los cálculos');
        } catch (saveError) {
          console.error('Error guardando test en perfil del paciente:', saveError);
          // No bloquear el flujo si falla el guardado local
        }
      }

      alert('Análisis de Abundancia Financiera calculado y guardado correctamente' + (patientId ? ' en el perfil del paciente' : ''));
    } catch (err: any) {
      console.error('Error calculating:', err);
      const errorMessage = err.message || err.error || 'Error al calcular el análisis de abundancia financiera';
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
      downloadAnchorNode.setAttribute("download", `Abundancia_Financiera_${formData.nombre || 'analisis'}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-amber-950 py-12 px-4 text-white">
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-amber-500 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Abundancia Financiera
              </h1>
              <p className="text-green-400 text-lg">
                Descubre tus ciclos financieros y cómo atraer prosperidad según tu numerología
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
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-full bg-gradient-to-r from-green-500 to-amber-500 hover:from-green-600 hover:to-amber-600 disabled:opacity-50"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Calcular Abundancia Financiera
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
                        <Button className="bg-green-600 hover:bg-green-700">
                          Volver al Paciente
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Usar FinancialHealthReport para el análisis de Parnassah con Gemini */}
                <FinancialHealthReport 
                  clientName={formData.nombre}
                  birthDate={formData.fecha_nacimiento}
                  mapa={result}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

