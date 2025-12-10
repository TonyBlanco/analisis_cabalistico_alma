'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Save,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { getPatient } from '@/lib/patient-storage';
import { updatePatient } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';

// Métodos disponibles (mismo array que en la página de selección)
const KABBALAH_METHODS = [
  { id: 'gematria', name: 'Gematría', nameHebrew: 'גימטריה' },
  { id: 'tree-of-life', name: 'Árbol de la Vida', nameHebrew: 'עץ חיים' },
  { id: 'soul-number', name: 'Número del Alma', nameHebrew: 'מספר הנשמה' },
  { id: 'tikun', name: 'Tikún (Corrección del Alma)', nameHebrew: 'תיקון' },
  { id: 'mazal', name: 'Mazal (Destino y Suerte)', nameHebrew: 'מזל' },
  { id: '72-names', name: '72 Nombres de Dios', nameHebrew: 'ע״ב שמות' },
  { id: 'shemot', name: 'Shemot (Poder de los Nombres)', nameHebrew: 'שמות' },
  { id: 'complete', name: 'Análisis Cabalístico Completo', nameHebrew: 'ניתוח מלא' },
];

export default function KabbalahMethodPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const methodId = params.method as string;
  
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    dia: '',
    mes: '',
    anio: ''
  });

  const method = KABBALAH_METHODS.find(m => m.id === methodId);

  useEffect(() => {
    if (patientId) {
      const patientData = getPatient(patientId);
      if (patientData) {
        setPatient(patientData);
        
        // Cargar datos del paciente
        if (patientData.birthDate) {
          const birthDate = new Date(patientData.birthDate);
          setFormData({
            nombre: patientData.name,
            dia: birthDate.getDate().toString(),
            mes: (birthDate.getMonth() + 1).toString(),
            anio: birthDate.getFullYear().toString()
          });
        } else {
          setFormData({
            nombre: patientData.name,
            dia: '',
            mes: '',
            anio: ''
          });
        }
      }
    }
    setLoading(false);
  }, [patientId]);

  const handleCalculate = async () => {
    if (!formData.nombre || !formData.dia || !formData.mes || !formData.anio) {
      setError('Por favor completa todos los campos');
      return;
    }

    setCalculating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://127.0.0.1:8000/api/calcular/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          dia: formData.dia.toString(),
          mes: formData.mes.toString(),
          anio: formData.anio.toString(),
          sistema: 'dshevastan' // Sistema por defecto
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al calcular el análisis');
      }

      const data = await response.json();
      setResult(data);
      
      // Guardar en el perfil del paciente
      if (patientId && patient) {
        // Extraer datos del resultado según la estructura del backend
        const numerosPrincipales = data.numeros_principales || {};
        const esencia = numerosPrincipales.esencia?.valor || data.esencia;
        const destino = numerosPrincipales.destino?.valor || data.destino;
        const expresion = numerosPrincipales.expresion?.valor || data.expresion;
        
        // Asegurar que weaknesses y strengths sean arrays
        const normalizeArray = (value: any): string[] => {
          if (Array.isArray(value)) {
            return value.filter(item => typeof item === 'string' && item.trim() !== '');
          }
          if (typeof value === 'string' && value.trim() !== '') {
            return [value.trim()];
          }
          return [];
        };

        const kabbalisticProfile = {
          soulNumber: esencia || null,
          lifePath: destino || null,
          guardianAngel: data.angel_guardian || data.arbol_vida?.angel_guardian || null,
          weaknesses: normalizeArray(data.cuentas_pendientes || data.debilidades),
          strengths: normalizeArray(data.dones || data.fortalezas),
          calculatedAt: new Date().toISOString(),
          method: methodId,
          fullResult: data
        };
        
        updatePatient(patientId, {
          kabbalisticProfile
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al calcular el análisis cabalístico');
    } finally {
      setCalculating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const data = {
      paciente: patient?.name,
      metodo: method?.name,
      fecha: new Date().toISOString(),
      datos_entrada: formData,
      resultado: result
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analisis_Cabalistico_${methodId}_${patient?.name}_${Date.now()}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!method) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-900/50 border-red-700">
            <CardContent className="py-8 text-center">
              <p className="text-red-400 mb-4">Método no encontrado</p>
              <Link href={`/patients/${patientId}/kabbalah`}>
                <Button variant="outline" className="border-slate-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Métodos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/patients/${patientId}/kabbalah`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Métodos
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{method.name}</h1>
              <p className="text-amber-400 text-lg">{method.nameHebrew}</p>
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
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-sm mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Paciente:</strong> {patient.name}
                    {patient.birthDate && (
                      <span className="ml-2">
                        • Nacimiento: {new Date(patient.birthDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Día de Nacimiento *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dia}
                    onChange={(e) => setFormData({...formData, dia: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Día"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Mes de Nacimiento *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.mes}
                    onChange={(e) => setFormData({...formData, mes: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Mes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Año de Nacimiento *
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.anio}
                    onChange={(e) => setFormData({...formData, anio: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Año"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-3 rounded-sm">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleCalculate}
                disabled={calculating || !formData.nombre || !formData.dia || !formData.mes || !formData.anio}
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
                    Calcular Análisis
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
                    <Link href={`/patients/${patientId}`}>
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar y Volver
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Números Principales */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Números Principales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {result.numeros_principales?.esencia && (
                        <div className="bg-amber-900/30 border border-amber-700/50 p-5 rounded-sm">
                          <p className="text-amber-400 text-xs mb-2 uppercase tracking-wide">Esencia (Alma)</p>
                          <p className="text-4xl font-bold text-white mb-2">
                            {typeof result.numeros_principales.esencia.valor === 'string' 
                              ? result.numeros_principales.esencia.valor.split('/')[0]
                              : result.numeros_principales.esencia.valor}
                          </p>
                          {result.numeros_principales.esencia.arbol?.nombre_es && (
                            <p className="text-xs text-amber-300">
                              {result.numeros_principales.esencia.arbol.nombre_es}
                            </p>
                          )}
                        </div>
                      )}
                      {result.numeros_principales?.expresion && (
                        <div className="bg-blue-900/30 border border-blue-700/50 p-5 rounded-sm">
                          <p className="text-blue-400 text-xs mb-2 uppercase tracking-wide">Expresión</p>
                          <p className="text-4xl font-bold text-white mb-2">
                            {typeof result.numeros_principales.expresion.valor === 'string' 
                              ? result.numeros_principales.expresion.valor.split('/')[0]
                              : result.numeros_principales.expresion.valor}
                          </p>
                          {result.numeros_principales.expresion.arbol?.nombre_es && (
                            <p className="text-xs text-blue-300">
                              {result.numeros_principales.expresion.arbol.nombre_es}
                            </p>
                          )}
                        </div>
                      )}
                      {result.numeros_principales?.herencia && (
                        <div className="bg-green-900/30 border border-green-700/50 p-5 rounded-sm">
                          <p className="text-green-400 text-xs mb-2 uppercase tracking-wide">Herencia (Espíritu)</p>
                          <p className="text-4xl font-bold text-white mb-2">
                            {typeof result.numeros_principales.herencia.valor === 'string' 
                              ? result.numeros_principales.herencia.valor.split('/')[0]
                              : result.numeros_principales.herencia.valor}
                          </p>
                          {result.numeros_principales.herencia.arbol?.nombre_es && (
                            <p className="text-xs text-green-300">
                              {result.numeros_principales.herencia.arbol.nombre_es}
                            </p>
                          )}
                        </div>
                      )}
                      {result.numeros_principales?.destino && (
                        <div className="bg-purple-900/30 border border-purple-700/50 p-5 rounded-sm">
                          <p className="text-purple-400 text-xs mb-2 uppercase tracking-wide">Destino</p>
                          <p className="text-4xl font-bold text-white mb-2">
                            {typeof result.numeros_principales.destino.valor === 'string' 
                              ? result.numeros_principales.destino.valor.split('/')[0]
                              : result.numeros_principales.destino.valor}
                          </p>
                          {result.numeros_principales.destino.arbol?.nombre_es && (
                            <p className="text-xs text-purple-300">
                              {result.numeros_principales.destino.arbol.nombre_es}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inclusion Base */}
                  {result.inclusion_base && (
                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-sm">
                      <h3 className="text-white font-semibold mb-4 text-lg">Inclusión de Base</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.inclusion_base.dominantes && result.inclusion_base.dominantes.length > 0 && (
                          <div>
                            <p className="text-green-400 text-sm font-semibold mb-2">Números Dominantes</p>
                            <div className="flex flex-wrap gap-2">
                              {result.inclusion_base.dominantes.map((num: number, idx: number) => (
                                <span key={idx} className="bg-green-900/30 border border-green-700 px-3 py-1 rounded text-green-300 text-sm font-bold">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.inclusion_base.ausentes && result.inclusion_base.ausentes.length > 0 && (
                          <div>
                            <p className="text-red-400 text-sm font-semibold mb-2">Números Ausentes (Karmas)</p>
                            <div className="flex flex-wrap gap-2">
                              {result.inclusion_base.ausentes.map((num: number, idx: number) => (
                                <span key={idx} className="bg-red-900/30 border border-red-700 px-3 py-1 rounded text-red-300 text-sm font-bold">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.inclusion_base.maestrias && result.inclusion_base.maestrias.length > 0 && (
                          <div>
                            <p className="text-amber-400 text-sm font-semibold mb-2">Maestrías</p>
                            <div className="flex flex-wrap gap-2">
                              {result.inclusion_base.maestrias.map((num: number, idx: number) => (
                                <span key={idx} className="bg-amber-900/30 border border-amber-700 px-3 py-1 rounded text-amber-300 text-sm font-bold">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Análisis Cabalístico */}
                  {result.analisis_cabalista && (
                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-sm">
                      <h3 className="text-white font-semibold mb-4 text-lg">Análisis Cabalístico</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        {result.analisis_cabalista.interpretacion && (
                          <p className="leading-relaxed">{result.analisis_cabalista.interpretacion}</p>
                        )}
                        {result.analisis_cabalista.temas_clave && result.analisis_cabalista.temas_clave.length > 0 && (
                          <div>
                            <p className="text-amber-400 font-semibold mb-2">Temas Clave:</p>
                            <ul className="space-y-1">
                              {result.analisis_cabalista.temas_clave.map((tema: string, idx: number) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-amber-400 mr-2">•</span>
                                  <span>{tema}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cuentas Pendientes */}
                  {result.cuentas_pendientes && result.cuentas_pendientes.length > 0 && (
                    <div className="bg-red-900/30 border-l-4 border-red-500 p-5 rounded-sm">
                      <h3 className="text-red-400 font-semibold mb-3 text-lg">Cuentas Pendientes (Tikun)</h3>
                      <ul className="space-y-2">
                        {result.cuentas_pendientes.map((item: string, idx: number) => (
                          <li key={idx} className="text-red-300 text-sm flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {result.recomendaciones && (
                    <div className="bg-blue-900/30 border-l-4 border-blue-500 p-5 rounded-sm">
                      <h3 className="text-blue-400 font-semibold mb-3 text-lg">Recomendaciones</h3>
                      {Array.isArray(result.recomendaciones) ? (
                        <ul className="space-y-2">
                          {result.recomendaciones.map((rec: string, idx: number) => (
                            <li key={idx} className="text-blue-300 text-sm flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-blue-300 text-sm">{JSON.stringify(result.recomendaciones)}</p>
                      )}
                    </div>
                  )}

                  {/* Secuencia Principal */}
                  {result.secuencia_principal && result.secuencia_principal.length > 0 && (
                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-sm">
                      <h3 className="text-white font-semibold mb-4 text-lg">Secuencia Principal</h3>
                      <div className="flex flex-wrap gap-3">
                        {result.secuencia_principal.map((item: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/50 border border-slate-600 px-4 py-2 rounded-sm">
                            <p className="text-xs text-gray-400 mb-1">{item.etapa || item.nombre || `Etapa ${idx + 1}`}</p>
                            <p className="text-xl font-bold text-white">{item.valor || item.numero}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Árbol de la Vida - Detalles */}
                  {(result.numeros_principales?.esencia?.arbol || result.numeros_principales?.expresion?.arbol || result.numeros_principales?.destino?.arbol) && (
                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-sm">
                      <h3 className="text-white font-semibold mb-4 text-lg">Correspondencias en el Árbol de la Vida</h3>
                      <div className="space-y-4">
                        {result.numeros_principales.esencia?.arbol && (
                          <div className="bg-amber-900/20 border border-amber-700/30 p-4 rounded-sm">
                            <p className="text-amber-400 font-semibold mb-2">Esencia</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {result.numeros_principales.esencia.arbol.nombre_es && (
                                <div>
                                  <span className="text-gray-400">Sefirá:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.esencia.arbol.nombre_es}</span>
                                </div>
                              )}
                              {result.numeros_principales.esencia.arbol.arcangel && (
                                <div>
                                  <span className="text-gray-400">Arcángel:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.esencia.arbol.arcangel}</span>
                                </div>
                              )}
                              {result.numeros_principales.esencia.arbol.planeta && (
                                <div>
                                  <span className="text-gray-400">Planeta:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.esencia.arbol.planeta}</span>
                                </div>
                              )}
                              {result.numeros_principales.esencia.arbol.significado && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Significado:</span>
                                  <p className="text-white mt-1">{result.numeros_principales.esencia.arbol.significado}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {result.numeros_principales.expresion?.arbol && (
                          <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-sm">
                            <p className="text-blue-400 font-semibold mb-2">Expresión</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {result.numeros_principales.expresion.arbol.nombre_es && (
                                <div>
                                  <span className="text-gray-400">Sefirá/Sendero:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.expresion.arbol.nombre_es}</span>
                                </div>
                              )}
                              {result.numeros_principales.expresion.arbol.arcangel && (
                                <div>
                                  <span className="text-gray-400">Arcángel:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.expresion.arbol.arcangel}</span>
                                </div>
                              )}
                              {result.numeros_principales.expresion.arbol.significado && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Significado:</span>
                                  <p className="text-white mt-1">{result.numeros_principales.expresion.arbol.significado}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {result.numeros_principales.destino?.arbol && (
                          <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-sm">
                            <p className="text-purple-400 font-semibold mb-2">Destino</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {result.numeros_principales.destino.arbol.nombre_es && (
                                <div>
                                  <span className="text-gray-400">Sefirá/Sendero:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.destino.arbol.nombre_es}</span>
                                </div>
                              )}
                              {result.numeros_principales.destino.arbol.arcangel && (
                                <div>
                                  <span className="text-gray-400">Arcángel:</span>
                                  <span className="text-white ml-2">{result.numeros_principales.destino.arbol.arcangel}</span>
                                </div>
                              )}
                              {result.numeros_principales.destino.arbol.significado && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Significado:</span>
                                  <p className="text-white mt-1">{result.numeros_principales.destino.arbol.significado}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* JSON Completo (Colapsable) */}
                  <details className="bg-slate-900/50 border border-slate-700 p-4 rounded-sm">
                    <summary className="text-white font-semibold cursor-pointer mb-2">
                      Ver Resultado Completo (JSON)
                    </summary>
                    <pre className="text-xs text-gray-300 overflow-auto max-h-96 bg-slate-950 p-4 rounded mt-3">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

