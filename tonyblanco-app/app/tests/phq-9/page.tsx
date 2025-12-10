'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, FileText, User, Clock, AlertTriangle, UserCircle } from 'lucide-react';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import { savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';

export default function PHQ9Assessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [clientData, setClientData] = useState({
    nombre: '',
    edad: '',
    fecha: new Date().toISOString().split('T')[0],
    terapeuta: '',
    sesion: '',
    tipo: 'inicial'
  });
  
  const [responses, setResponses] = useState({} as Record<number, number>);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  // Cargar datos del paciente si viene desde la página del paciente
  useEffect(() => {
    if (patientId) {
      const patientData = getPatient(patientId);
      if (patientData) {
        setPatient(patientData);
        // Calcular edad desde fecha de nacimiento
        let edad = '';
        if (patientData.birthDate) {
          const birthDate = new Date(patientData.birthDate);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            edad = (age - 1).toString();
          } else {
            edad = age.toString();
          }
        }
        
        // Cargar datos del usuario actual para el terapeuta
        const token = localStorage.getItem('authToken');
        if (token) {
          fetch('http://127.0.0.1:8000/api/me/', {
            headers: { 'Authorization': `Token ${token}` }
          })
          .then(res => res.json())
          .then(userData => {
            setClientData({
              nombre: patientData.name,
              edad: edad,
              fecha: new Date().toISOString().split('T')[0],
              terapeuta: userData.full_name || userData.username || '',
              sesion: '',
              tipo: 'inicial'
            });
          })
          .catch(err => console.error('Error loading user data:', err));
        } else {
          setClientData({
            nombre: patientData.name,
            edad: edad,
            fecha: new Date().toISOString().split('T')[0],
            terapeuta: '',
            sesion: '',
            tipo: 'inicial'
          });
        }
      }
    } else {
      // Si no viene de paciente, cargar datos del usuario actual
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('http://127.0.0.1:8000/api/me/', {
          headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(userData => {
          if (userData.full_name) {
            setClientData(prev => ({
              ...prev,
              nombre: userData.full_name,
              terapeuta: userData.full_name || userData.username || ''
            }));
          }
          if (userData.birth_date) {
            const birthDate = new Date(userData.birth_date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            let edad = '';
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              edad = (age - 1).toString();
            } else {
              edad = age.toString();
            }
            setClientData(prev => ({ ...prev, edad }));
          }
        })
        .catch(err => console.error('Error loading user data:', err));
      }
    }
  }, [patientId]);

  // Las 9 preguntas del PHQ-9
  const questions = [
    { id: 1, text: 'Poco interés o placer en hacer las cosas' },
    { id: 2, text: 'Sentirse decaído(a), deprimido(a) o sin esperanza' },
    { id: 3, text: 'Problemas para quedarse dormido(a), permanecer dormido(a) o dormir demasiado' },
    { id: 4, text: 'Sentirse cansado(a) o con poca energía' },
    { id: 5, text: 'Poco apetito o comer en exceso' },
    { id: 6, text: 'Sentirse mal con usted mismo(a) - o que es un fracaso o que ha quedado mal con usted mismo(a) o con su familia' },
    { id: 7, text: 'Problemas para concentrarse en ciertas actividades, tales como leer el periódico o ver la televisión' },
    { id: 8, text: 'Moverse o hablar tan lento que otras personas podrían haberlo notado. O lo contrario - estar tan inquieto(a) o agitado(a) que se ha estado moviendo mucho más de lo normal' },
    { id: 9, text: 'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera' }
  ];

  const scaleLabels = [
    'Nada en absoluto',
    'Varios días',
    'Más de la mitad de los días',
    'Casi todos los días'
  ];

  const handleResponse = (qId: number, val: number) => {
    setResponses({ ...responses, [qId]: val });
  };

  const calcScores = () => {
    let total = 0;
    Object.values(responses).forEach((v) => {
      total += v;
    });
    return { total };
  };

  const getSeverity = (score: number) => {
    if (score <= 4) return { lvl: 'Mínima', col: 'green', desc: 'Depresión mínima o ausente' };
    if (score <= 9) return { lvl: 'Leve', col: 'yellow', desc: 'Depresión leve' };
    if (score <= 14) return { lvl: 'Moderada', col: 'orange', desc: 'Depresión moderada' };
    if (score <= 19) return { lvl: 'Moderadamente Grave', col: 'red', desc: 'Depresión moderadamente grave' };
    return { lvl: 'Grave', col: 'red', desc: 'Depresión grave' };
  };

  const checkSuicide = () => {
    const r = responses[9];
    if (r >= 1) return { risk: true, lvl: r >= 2 ? 'ALTO' : 'MODERADO' };
    return { risk: false };
  };

  const genCode = () => {
    const s = calcScores();
    return `PHQ9-${Date.now().toString(36)}-${s.total}`;
  };

  const genJSON = () => {
    const s = calcScores();
    const sev = getSeverity(s.total);
    const sui = checkSuicide();
    const time = Math.round((Date.now() - startTime) / 1000);
    
    return {
      instrumento: 'PHQ-9',
      codigo: genCode(),
      fecha: clientData.fecha,
      cliente: {
        nombre: clientData.nombre,
        edad: parseInt(clientData.edad),
        terapeuta: clientData.terapeuta,
        sesion: clientData.sesion,
        tipo: clientData.tipo
      },
      tiempo_seg: time,
      respuestas: responses,
      puntuaciones: {
        total: s.total,
        maximo: 27
      },
      interpretacion: {
        gravedad: sev.lvl,
        descripcion: sev.desc,
        rango: `${s.total}/27`
      },
      alertas: {
        riesgo_suicida: sui.risk,
        nivel_riesgo: sui.risk ? sui.lvl : null
      },
      recomendaciones: sev.lvl === 'Grave' || sev.lvl === 'Moderadamente Grave' 
        ? 'Se recomienda evaluación clínica inmediata y posible tratamiento'
        : sev.lvl === 'Moderada'
        ? 'Se recomienda seguimiento y posible intervención'
        : 'Seguimiento rutinario recomendado'
    };
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PHQ9_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    const payload: ExecuteTestRequest = {
      test_module_code: 'phq-9',
      input_data: {
        nombre: clientData.nombre,
        edad: clientData.edad,
        fecha: clientData.fecha,
        terapeuta: clientData.terapeuta,
        sesion: clientData.sesion,
        tipo: clientData.tipo,
        responses: responses
      },
      client_name: clientData.nombre,
      client_birth_date: clientData.fecha,
      patient_id: patientId ? parseInt(patientId) : undefined,
      save_result: true
    };
    try {
      const res = await executeTest(payload);
      
      // Si viene de un paciente, guardar también en el perfil del paciente
      if (patientId && patient) {
        const testResult = {
          patientId: patientId,
          testType: 'wellness' as const,
          date: clientData.fecha,
          wellnessData: {
            answers: responses,
            systemScores: [],
            completedIn: Math.round((Date.now() - startTime) / 1000)
          },
          therapistNotes: `PHQ-9 - Puntuación: ${scores!.total}/27 - Severidad: ${sev!.lvl}`,
          recommendations: sev!.lvl === 'Grave' || sev!.lvl === 'Moderadamente Grave'
            ? ['Evaluación clínica inmediata', 'Posible tratamiento farmacológico']
            : sev!.lvl === 'Moderada'
            ? ['Seguimiento clínico', 'Posible intervención terapéutica']
            : ['Seguimiento rutinario']
        };
        
        savePatientTest(testResult);
      }
      
      alert('Resultado guardado en el historial' + (patientId ? ' y en el perfil del paciente' : '') + ' (ID: ' + (res.result_id || 'N/A') + ')');
      
      // Si viene de paciente, volver a su página
      if (patientId) {
        router.push(`/patients/${patientId}`);
      } else {
        setShowResults(false);
      }
    } catch (err: any) {
      alert('Error guardando en servidor: ' + (err.message || err));
    }
  };

  const allFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const allAnswered = Object.keys(responses).length === 9;
  const scores = showResults ? calcScores() : null;
  const sev = showResults ? getSeverity(scores!.total) : null;
  const sui = showResults ? checkSuicide() : null;

  // Colores hospitalarios según severidad
  const getSeverityStyle = (level: string) => {
    switch(level) {
      case 'Mínima': return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800', title: 'text-slate-900' };
      case 'Leve': return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', title: 'text-blue-900' };
      case 'Moderada': return { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', title: 'text-amber-900' };
      case 'Moderadamente Grave': return { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-800', title: 'text-orange-900' };
      case 'Grave': return { bg: 'bg-red-50', border: 'border-red-600', text: 'text-red-800', title: 'text-red-900' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800', title: 'text-slate-900' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 mb-4">
          {/* Header hospitalario */}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center mr-3">
                <FileText className="text-slate-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'system-ui, -apple-system' }}>
                  PHQ-9 - Cuestionario de Salud del Paciente
                </h1>
                <p className="text-sm text-slate-600 flex items-center mt-1">
                  <Clock size={14} className="mr-1" />5 min | Screening de depresión
                </p>
              </div>
            </div>
          </div>

          {!showResults ? (
            <>
              {/* Datos del cliente - estilo hospitalario */}
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center text-base">
                  <User size={18} className="mr-2 text-slate-600" />
                  Datos del Cliente
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {patient && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircle className="text-blue-600" size={18} />
                        <span className="text-sm font-semibold text-blue-900">Paciente: {patient.name}</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Los datos se guardarán automáticamente en el perfil del paciente para exámenes cruzados.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Nombre completo *</label>
                    <input
                      type="text"
                      value={clientData.nombre}
                      onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nombre completo del paciente"
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Edad *</label>
                    <input
                      type="number"
                      value={clientData.edad}
                      onChange={(e) => setClientData({...clientData, edad: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Edad en años"
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Fecha de evaluación</label>
                    <input
                      type="date"
                      value={clientData.fecha}
                      onChange={(e) => setClientData({...clientData, fecha: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Terapeuta *</label>
                    <input
                      type="text"
                      value={clientData.terapeuta}
                      onChange={(e) => setClientData({...clientData, terapeuta: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nombre del terapeuta evaluador"
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Número de sesión</label>
                    <input
                      type="text"
                      value={clientData.sesion}
                      onChange={(e) => setClientData({...clientData, sesion: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Ej: Sesión 1, 2, 3..."
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Tipo de evaluación</label>
                    <select
                      value={clientData.tipo}
                      onChange={(e) => setClientData({...clientData, tipo: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      style={{ fontSize: '14px', fontWeight: '400' }}
                    >
                      <option value="inicial">Inicial</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                </div>
              </div>

              {allFilled && (
                <div className="space-y-5">
                  {/* Instrucciones */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-sm">
                    <p className="text-sm text-slate-800 leading-relaxed">
                      <strong className="font-semibold">Instrucciones:</strong> Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia le ha molestado alguno de los siguientes problemas?
                    </p>
                  </div>

                  {/* Escala de respuesta */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                    <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Escala de respuesta</p>
                    <div className="grid grid-cols-4 gap-3">
                      {scaleLabels.map((label, i) => (
                        <div key={i} className="text-center bg-white border border-slate-200 rounded-sm p-2">
                          <div className="font-bold text-base text-slate-900 mb-1">{i}</div>
                          <div className="text-xs text-slate-600 leading-tight">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preguntas */}
                  {questions.map((q, i) => (
                    <div key={q.id} className="border border-slate-200 rounded-sm p-4 bg-white">
                      <h3 className="font-medium mb-3 text-sm text-slate-900 leading-relaxed">
                        <span className="font-semibold text-slate-700">{i + 1}.</span> {q.text}
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((val) => (
                          <label
                            key={val}
                            className={`flex flex-col items-center p-3 rounded-sm cursor-pointer text-xs border-2 transition-all ${
                              responses[q.id] === val
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q${q.id}`}
                              checked={responses[q.id] === val}
                              onChange={() => handleResponse(q.id, val)}
                              className="mb-2"
                            />
                            <span className="font-bold text-base text-slate-900 mb-1">{val}</span>
                            <span className="text-xs text-center text-slate-600 leading-tight">{scaleLabels[val]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Botones */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setShowResults(true)}
                      disabled={!allAnswered}
                      className={`px-6 py-2.5 rounded-sm font-medium text-sm transition-colors ${
                        allAnswered
                          ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Ver Resultados
                    </button>
                    <button
                      onClick={() => {
                        setResponses({});
                        setClientData({
                          nombre: '',
                          edad: '',
                          fecha: new Date().toISOString().split('T')[0],
                          terapeuta: '',
                          sesion: '',
                          tipo: 'inicial'
                        });
                      }}
                      className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-sm font-medium text-sm transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* Resultados con estilo hospitalario */}
              {sev && (() => {
                const style = getSeverityStyle(sev.lvl);
                return (
                  <div className={`${style.bg} border-l-4 ${style.border} p-5 rounded-sm`}>
                    <h2 className={`text-xl font-semibold mb-2 ${style.title}`}>
                      Puntuación Total: {scores!.total} / 27
                    </h2>
                    <p className={`text-base font-medium ${style.text}`}>
                      Severidad: {sev.lvl} - {sev.desc}
                    </p>
                  </div>
                );
              })()}

              {sui!.risk && (
                <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-sm">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="text-red-600 mr-2" size={20} />
                    <h3 className="font-semibold text-red-900">ALERTA: Riesgo Suicida {sui!.lvl}</h3>
                  </div>
                  <p className="text-sm text-red-800 leading-relaxed">
                    Se detectó respuesta positiva en la pregunta 9 (pensamientos de muerte o autolesión).
                    Se recomienda evaluación clínica inmediata.
                  </p>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-sm p-5">
                <h3 className="font-semibold mb-3 text-slate-900">Interpretación de Puntuaciones</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start"><span className="font-medium mr-2 text-slate-900">0-4:</span> Depresión mínima o ausente</li>
                  <li className="flex items-start"><span className="font-medium mr-2 text-slate-900">5-9:</span> Depresión leve</li>
                  <li className="flex items-start"><span className="font-medium mr-2 text-slate-900">10-14:</span> Depresión moderada</li>
                  <li className="flex items-start"><span className="font-medium mr-2 text-slate-900">15-19:</span> Depresión moderadamente grave</li>
                  <li className="flex items-start"><span className="font-medium mr-2 text-slate-900">20-27:</span> Depresión grave</li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm p-5">
                <h3 className="font-semibold mb-3 text-slate-900">Recomendaciones</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {sev!.lvl === 'Grave' || sev!.lvl === 'Moderadamente Grave'
                    ? 'Se recomienda evaluación clínica inmediata y posible tratamiento farmacológico y/o psicoterapéutico.'
                    : sev!.lvl === 'Moderada'
                    ? 'Se recomienda seguimiento clínico y posible intervención terapéutica.'
                    : sev!.lvl === 'Leve'
                    ? 'Se recomienda seguimiento y posible intervención preventiva.'
                    : 'Seguimiento rutinario recomendado.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={download}
                  className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-sm font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download size={16} />
                  Descargar JSON
                </button>
                <button
                  onClick={submitToServer}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-sm font-medium text-sm transition-colors shadow-sm"
                >
                  Guardar en Historial
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setResponses({});
                  }}
                  className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-sm font-medium text-sm transition-colors"
                >
                  Nuevo Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

