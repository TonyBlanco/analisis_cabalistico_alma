'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, FileText, User, Clock, AlertCircle, UserCircle } from 'lucide-react';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import { savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';

export default function BAIAssessment() {
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
  
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  // Cargar datos del paciente si viene desde la página del paciente
  useEffect(() => {
    if (patientId) {
      const patientData = getPatient(patientId);
      if (patientData) {
        setPatient(patientData);
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

  const questions = [
    // Síntomas Físicos (Somáticos)
    { id: 1, cat: 'F', text: 'Torpe o entumecido' },
    { id: 2, cat: 'F', text: 'Acalorado' },
    { id: 3, cat: 'F', text: 'Con temblor en las piernas' },
    { id: 4, cat: 'F', text: 'Incapaz de relajarse' },
    { id: 5, cat: 'F', text: 'Con temor a que ocurra lo peor' },
    { id: 6, cat: 'F', text: 'Mareado, o que se le va la cabeza' },
    { id: 7, cat: 'F', text: 'Con latidos del corazón fuertes y acelerados' },
    { id: 8, cat: 'F', text: 'Inestable' },
    { id: 9, cat: 'F', text: 'Atemorizado o asustado' },
    { id: 10, cat: 'F', text: 'Nervioso' },
    { id: 11, cat: 'F', text: 'Con sensación de bloqueo' },
    { id: 12, cat: 'F', text: 'Con temblores en las manos' },
    { id: 13, cat: 'F', text: 'Inquieto, inseguro' },
    { id: 14, cat: 'F', text: 'Con miedo a perder el control' },
    { id: 15, cat: 'F', text: 'Con sensación de ahogo' },
    { id: 16, cat: 'F', text: 'Con temor a morir' },
    { id: 17, cat: 'F', text: 'Con miedo' },
    
    // Síntomas Cognitivos/Subjetivos
    { id: 18, cat: 'C', text: 'Con problemas digestivos' },
    { id: 19, cat: 'C', text: 'Con desvanecimientos' },
    { id: 20, cat: 'C', text: 'Con rubor facial' },
    { id: 21, cat: 'C', text: 'Con sudores, fríos o calientes' }
  ];

  const scaleLabels = [
    'En absoluto',
    'Levemente (no me molesta mucho)',
    'Moderadamente (fue muy desagradable pero podía soportarlo)',
    'Gravemente (casi no podía soportarlo)'
  ];

  const handleResponse = (qId, val) => {
    setResponses({ ...responses, [qId]: parseInt(val) });
  };

  const calcScores = () => {
    let total = 0, fisico = 0, cognitivo = 0;
    Object.entries(responses).forEach(([k, v]) => {
      total += v;
      const q = questions.find(q => q.id === parseInt(k));
      if (q) q.cat === 'F' ? fisico += v : cognitivo += v;
    });
    return { total, fisico, cognitivo };
  };

  const getSeverity = (score) => {
    if (score <= 7) return { lvl: 'Mínima', col: 'green', desc: 'Ansiedad mínima' };
    if (score <= 15) return { lvl: 'Leve', col: 'blue', desc: 'Ansiedad leve' };
    if (score <= 25) return { lvl: 'Moderada', col: 'yellow', desc: 'Ansiedad moderada' };
    return { lvl: 'Grave', col: 'red', desc: 'Ansiedad grave' };
  };

  const checkPanicSymptoms = () => {
    // Ítems clave de pánico: 7 (palpitaciones), 15 (ahogo), 16 (temor a morir)
    const panic = [7, 15, 16];
    const highPanic = panic.filter(id => responses[id] >= 2).length;
    return highPanic >= 2;
  };

  const checkConsistency = () => {
    const vals = Object.values(responses);
    const allSame = vals.every(v => v === vals[0]);
    const allMax = vals.every(v => v === 3);
    const allMin = vals.every(v => v === 0);
    
    // Verificar correlación esperada entre ítems relacionados
    const nervioso = responses[10] || 0;
    const inquieto = responses[13] || 0;
    const inconsistent = Math.abs(nervioso - inquieto) > 2;
    
    return !allSame && !allMax && !allMin && !inconsistent;
  };

  const genCode = () => {
    const s = calcScores();
    return `BAI-${Date.now().toString(36)}-${s.total}`;
  };

  const genJSON = () => {
    const s = calcScores();
    const sev = getSeverity(s.total);
    const panic = checkPanicSymptoms();
    const time = Math.round((Date.now() - startTime) / 60000);
    const consist = checkConsistency();
    
    return {
      instrumento: 'BAI',
      codigo: genCode(),
      fecha: clientData.fecha,
      cliente: {
        nombre: clientData.nombre,
        edad: parseInt(clientData.edad),
        terapeuta: clientData.terapeuta,
        sesion: clientData.sesion,
        tipo: clientData.tipo
      },
      tiempo_min: time,
      respuestas: responses,
      puntuaciones: {
        total: s.total,
        maximo: 63,
        sintomas_fisicos: {
          punt: s.fisico,
          porcentaje: Math.round((s.fisico/51)*100),
          items: 17
        },
        sintomas_cognitivos: {
          punt: s.cognitivo,
          porcentaje: Math.round((s.cognitivo/12)*100),
          items: 4
        },
        ratio_fisico_cognitivo: s.cognitivo > 0 ? (s.fisico / s.cognitivo).toFixed(2) : 'N/A'
      },
      interpretacion: {
        gravedad: sev.lvl,
        descripcion: sev.desc,
        rango: `${s.total}/63`,
        predominio: s.fisico > s.cognitivo * 1.5 ? 'Síntomas físicos predominantes' : 
                    s.cognitivo > s.fisico * 1.5 ? 'Síntomas cognitivos predominantes' : 
                    'Síntomas mixtos'
      },
      alertas: {
        sintomas_panico: panic,
        patron_fisico_intenso: s.fisico > 35,
        respuestas_extremas: !consist
      },
      validez: {
        cuestionario_completo: Object.keys(responses).length === 21,
        tiempo_razonable: time >= 5 && time <= 15,
        patron_consistente: consist,
        validez_discriminante: 'Se diferencia de depresión (BDI-II) por predominio de síntomas físicos'
      },
      metricas: {
        alpha_cronbach: '0.92',
        test_retest: '0.75',
        validez: 'Discriminante vs depresión'
      },
      items_criticos: {
        palpitaciones: responses[7] || 0,
        ahogo: responses[15] || 0,
        temor_morir: responses[16] || 0,
        perdida_control: responses[14] || 0
      },
      recomendaciones: genRec(s, sev, panic)
    };
  };

  const genRec = (s, sev, panic) => {
    const r = [];
    
    if (panic) {
      r.push('IMPORTANTE: Síntomas de pánico presentes - evaluar trastorno de pánico');
    }
    
    if (s.total >= 26) {
      r.push('Ansiedad grave - considerar intervención inmediata');
      r.push('Evaluar necesidad de tratamiento farmacológico en combinación con psicoterapia');
    } else if (s.total >= 16) {
      r.push('Tratamiento psicoterapéutico activo recomendado (TCC, exposición)');
      r.push('Considerar técnicas de relajación y manejo de ansiedad');
    } else if (s.total >= 8) {
      r.push('Intervención preventiva o psicoeducación recomendada');
      r.push('Enseñar técnicas de respiración y relajación');
    }
    
    if (s.fisico > s.cognitivo * 2) {
      r.push('Predominio físico - trabajar en técnicas de relajación muscular progresiva');
      r.push('Considerar evaluación médica para descartar causas orgánicas');
    }
    
    r.push('Reevaluación cada 2-4 semanas durante tratamiento');
    r.push('Comparar con BDI-II para diagnóstico diferencial ansiedad/depresión');
    
    return r;
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BAI_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
      const payload: ExecuteTestRequest = {
      test_module_code: 'bai',
      input_data: {
        nombre: clientData.nombre,
        edad: clientData.edad,
        fecha: clientData.fecha,
        terapeuta: clientData.terapeuta,
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
          therapistNotes: `BAI - Puntuación: ${scores.total}/63 - Severidad: ${sev.lvl}`,
          recommendations: sev.lvl === 'Grave'
            ? ['Evaluación clínica inmediata', 'Tratamiento farmacológico y psicoterapéutico']
            : sev.lvl === 'Moderada'
            ? ['Tratamiento psicoterapéutico activo', 'Técnicas de relajación']
            : ['Intervención preventiva', 'Psicoeducación']
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
  const allAnswered = Object.keys(responses).length === 21;
  const scores = showResults ? calcScores() : null;
  const sev = showResults ? getSeverity(scores.total) : null;
  const panic = showResults ? checkPanicSymptoms() : false;

  return (
    <div className="min-h-screen bg-slate-50 p-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 mb-4">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center mr-3">
                <FileText className="text-slate-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'system-ui, -apple-system' }}>
                  BAI - Inventario de Ansiedad de Beck
                </h1>
                <p className="text-sm text-slate-600 flex items-center mt-1">
                  <Clock size={14} className="mr-1" />5-10 min | Adolescentes y adultos
                </p>
              </div>
            </div>
          </div>

          {!showResults ? (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center text-base">
                  <User size={18} className="mr-2 text-slate-600" />
                  Datos del Cliente
                </h2>
                
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
                
                <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-sm">
                    <p className="text-sm text-slate-800 leading-relaxed">
                      <strong className="font-semibold">Instrucciones:</strong> A continuación se presenta una lista de síntomas comunes de ansiedad. 
                      Indique cuánto le ha afectado cada síntoma <strong>DURANTE LA ÚLTIMA SEMANA, INCLUYENDO HOY</strong>.
                    </p>
                  </div>

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

                  <button
                    onClick={() => setShowResults(true)}
                    disabled={!allAnswered}
                    className={`w-full py-2.5 rounded-sm font-medium text-sm transition-colors ${
                      allAnswered
                        ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {allAnswered ? 'Generar Resultados' : `Responda todas las preguntas (${Object.keys(responses).length}/21)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {panic && (
                <div className="bg-orange-100 border-l-4 border-orange-600 p-4">
                  <h3 className="font-bold text-orange-800 flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    ALERTA: Síntomas de pánico detectados
                  </h3>
                  <p className="text-orange-700 text-sm">
                    Considerar evaluación para trastorno de pánico
                  </p>
                </div>
              )}

              <div className={`bg-${sev.col}-50 border-l-4 border-${sev.col}-600 p-4`}>
                <h2 className="font-bold text-lg">Evaluación Completada</h2>
                <p className="text-sm mt-1">
                  <strong>Código:</strong> {genCode()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {clientData.nombre} | {clientData.edad} años | {clientData.fecha}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`bg-${sev.col}-50 p-4 rounded border-2 border-${sev.col}-400`}>
                  <h3 className="font-bold text-sm text-gray-700">Puntuación Total</h3>
                  <p className={`text-4xl font-bold text-${sev.col}-600 mt-1`}>
                    {scores.total}
                  </p>
                  <p className="text-xs text-gray-600">de 63 puntos</p>
                  <p className={`font-bold text-${sev.col}-700 mt-2`}>
                    {sev.lvl}
                  </p>
                  <p className="text-xs text-gray-600">{sev.desc}</p>
                </div>

                <div className="bg-red-50 p-4 rounded border-2 border-red-300">
                  <h3 className="font-bold text-sm text-gray-700">Síntomas Físicos</h3>
                  <p className="text-4xl font-bold text-red-600 mt-1">
                    {scores.fisico}
                  </p>
                  <p className="text-xs text-gray-600">de 51 puntos</p>
                  <p className="text-xs text-gray-700 mt-2">
                    {Math.round((scores.fisico/51)*100)}% de la escala
                  </p>
                  <p className="text-xs text-gray-600">17 ítems</p>
                </div>

                <div className="bg-purple-50 p-4 rounded border-2 border-purple-300">
                  <h3 className="font-bold text-sm text-gray-700">Síntomas Cognitivos</h3>
                  <p className="text-4xl font-bold text-purple-600 mt-1">
                    {scores.cognitivo}
                  </p>
                  <p className="text-xs text-gray-600">de 12 puntos</p>
                  <p className="text-xs text-gray-700 mt-2">
                    {Math.round((scores.cognitivo/12)*100)}% de la escala
                  </p>
                  <p className="text-xs text-gray-600">4 ítems</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-2 text-sm">Interpretación Clínica</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Gravedad:</strong> {sev.desc}</p>
                  <p><strong>Rango:</strong> 
                    {sev.lvl === 'Mínima' && ' 0-7 puntos'}
                    {sev.lvl === 'Leve' && ' 8-15 puntos'}
                    {sev.lvl === 'Moderada' && ' 16-25 puntos'}
                    {sev.lvl === 'Grave' && ' 26-63 puntos'}
                  </p>
                  <p><strong>Predominio:</strong> {
                    scores.fisico > scores.cognitivo * 1.5 ? 'Síntomas físicos predominantes' :
                    scores.cognitivo > scores.fisico * 1.5 ? 'Síntomas cognitivos predominantes' :
                    'Síntomas físicos y cognitivos mixtos'
                  }</p>
                  <p><strong>Ratio físico/cognitivo:</strong> {
                    scores.cognitivo > 0 ? (scores.fisico / scores.cognitivo).toFixed(2) : 'N/A'
                  }</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-bold mb-2 text-sm">Ítems Críticos</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded">
                    <strong>Palpitaciones:</strong> {responses[7]}/3
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong>Sensación de ahogo:</strong> {responses[15]}/3
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong>Temor a morir:</strong> {responses[16]}/3
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong>Pérdida de control:</strong> {responses[14]}/3
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <h3 className="font-bold mb-2 text-sm">Recomendaciones Clínicas</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(scores, sev, panic).map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={download}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center"
                >
                  <Download className="mr-2" size={18} />
                  Descargar Resultados (JSON)
                </button>
                <button
                  onClick={submitToServer}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold"
                >
                  Enviar y Guardar en Historial
                </button>
              </div>

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">
                  {JSON.stringify(genJSON(), null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 text-xs text-gray-600">
          <h3 className="font-bold mb-2">Información Técnica del BAI</h3>
          <div className="space-y-1">
            <p>• <strong>Alpha Cronbach:</strong> 0.92 (alta consistencia interna)</p>
            <p>• <strong>Test-retest:</strong> 0.75 (estabilidad temporal adecuada)</p>
            <p>• <strong>Validez discriminante:</strong> Se diferencia claramente de depresión (BDI-II)</p>
            <p>• <strong>Población:</strong> Adolescentes y adultos (13+ años)</p>
            <p>• <strong>Tiempo:</strong> 5-10 minutos de aplicación</p>
            <p>• <strong>Uso:</strong> Screening, diagnóstico y seguimiento de ansiedad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
