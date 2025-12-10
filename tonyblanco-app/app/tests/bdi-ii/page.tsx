'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, FileText, User, Clock, AlertTriangle, UserCircle } from 'lucide-react';
import { executeTest, getTestDetail } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import { savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';

export default function BDIIAssessment() {
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
  const [isAvailable, setIsAvailable] = useState(true);

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
    { id: 1, cat: 'CA', text: 'Tristeza', opts: ['No me siento triste', 'Me siento triste gran parte del tiempo', 'Me siento triste todo el tiempo', 'Me siento tan triste que no puedo soportarlo'] },
    { id: 2, cat: 'CA', text: 'Pesimismo', opts: ['No estoy desanimado respecto a mi futuro', 'Me siento más desanimado de lo normal', 'No espero que las cosas funcionen', 'Siento que no hay esperanza'] },
    { id: 3, cat: 'CA', text: 'Fracaso', opts: ['No me siento un fracasado', 'He fracasado más de lo debido', 'Veo muchos fracasos', 'Soy un fracaso total'] },
    { id: 4, cat: 'CA', text: 'Pérdida de placer', opts: ['Disfruto tanto como siempre', 'No disfruto tanto como antes', 'Obtengo muy poco placer', 'No obtengo ningún placer'] },
    { id: 5, cat: 'CA', text: 'Culpa', opts: ['No me siento culpable', 'Me siento culpable a veces', 'Me siento bastante culpable', 'Me siento culpable todo el tiempo'] },
    { id: 6, cat: 'CA', text: 'Castigo', opts: ['No siento que esté siendo castigado', 'Puedo ser castigado', 'Espero ser castigado', 'Siento que estoy siendo castigado'] },
    { id: 7, cat: 'CA', text: 'Disconformidad', opts: ['Siento lo mismo sobre mí', 'He perdido confianza', 'Estoy decepcionado conmigo', 'No me gusto'] },
    { id: 8, cat: 'CA', text: 'Autocrítica', opts: ['No me critico más de lo usual', 'Soy más crítico', 'Me critico por mis errores', 'Me culpo por todo'] },
    { id: 9, cat: 'CA', text: 'Pensamientos suicidas', opts: ['No tengo pensamientos de matarme', 'Pienso en ello pero no lo haría', 'Querría matarme', 'Me mataría si pudiera'] },
    { id: 10, cat: 'CA', text: 'Llanto', opts: ['No lloro más de lo usual', 'Lloro más que antes', 'Lloro por cualquier cosa', 'Quiero llorar pero no puedo'] },
    { id: 11, cat: 'CA', text: 'Agitación', opts: ['No estoy más inquieto', 'Más inquieto que lo usual', 'Difícil quedarme quieto', 'Tengo que estar en movimiento'] },
    { id: 12, cat: 'CA', text: 'Pérdida de interés', opts: ['No he perdido el interés', 'Menos interesado que antes', 'Perdí casi todo el interés', 'Difícil interesarme'] },
    { id: 13, cat: 'CA', text: 'Indecisión', opts: ['Tomo decisiones igual que siempre', 'Me cuesta más decidir', 'Mucha dificultad para decidir', 'No puedo tomar decisiones'] },
    { id: 14, cat: 'CA', text: 'Desvalorización', opts: ['No siento que no valgo', 'No me considero tan valioso', 'Me siento menos valioso', 'No valgo nada'] },
    { id: 15, cat: 'S', text: 'Energía', opts: ['Tengo tanta energía como siempre', 'Menos energía que antes', 'No tengo energía para mucho', 'Sin energía para nada'] },
    { id: 16, cat: 'S', text: 'Sueño', opts: ['Sin cambios en el sueño', 'Duermo un poco más/menos', 'Duermo mucho más/menos', 'Duermo la mayor parte del día / Me despierto muy temprano'] },
    { id: 17, cat: 'S', text: 'Irritabilidad', opts: ['No estoy más irritable', 'Más irritable que lo usual', 'Mucho más irritable', 'Irritable todo el tiempo'] },
    { id: 18, cat: 'S', text: 'Apetito', opts: ['Sin cambios en el apetito', 'Apetito un poco menor/mayor', 'Apetito mucho menor/mayor', 'Sin apetito / Quiero comer todo el tiempo'] },
    { id: 19, cat: 'S', text: 'Concentración', opts: ['Me concentro igual que siempre', 'No tan bien como antes', 'Difícil mantener la atención', 'No puedo concentrarme'] },
    { id: 20, cat: 'S', text: 'Fatiga', opts: ['No más cansado que lo usual', 'Me canso más fácilmente', 'Demasiado cansado para mucho', 'Demasiado cansado para casi todo'] },
    { id: 21, cat: 'S', text: 'Interés sexual', opts: ['Sin cambios', 'Menos interesado', 'Mucho menos interesado', 'Perdí completamente el interés'] }
  ];

  const handleResponse = (qId, val) => {
    setResponses({ ...responses, [qId]: parseInt(val) });
  };

  const calcScores = () => {
    let total = 0, ca = 0, s = 0;
    Object.entries(responses).forEach(([k, v]) => {
      total += v;
      const q = questions.find(q => q.id === parseInt(k));
      if (q) q.cat === 'CA' ? ca += v : s += v;
    });
    return { total, ca, s };
  };

  const getSeverity = (score) => {
    if (score <= 13) return { lvl: 'Mínima', col: 'green', desc: 'Depresión mínima o ausente' };
    if (score <= 19) return { lvl: 'Leve', col: 'yellow', desc: 'Depresión leve' };
    if (score <= 28) return { lvl: 'Moderada', col: 'orange', desc: 'Depresión moderada' };
    return { lvl: 'Grave', col: 'red', desc: 'Depresión grave' };
  };

  const checkSuicide = () => {
    const r = responses[9];
    if (r >= 2) return { risk: true, lvl: r === 3 ? 'ALTO' : 'MODERADO' };
    return { risk: false };
  };

  const genCode = () => {
    const s = calcScores();
    return `BDI2-${Date.now().toString(36)}-${s.total}`;
  };

  const genJSON = () => {
    const s = calcScores();
    const sev = getSeverity(s.total);
    const sui = checkSuicide();
    const time = Math.round((Date.now() - startTime) / 60000);
    
    return {
      instrumento: 'BDI-II',
      codigo: genCode(),
      fecha: clientData.fecha,
      cliente: { nombre: clientData.nombre, edad: parseInt(clientData.edad), terapeuta: clientData.terapeuta, sesion: clientData.sesion, tipo: clientData.tipo },
      tiempo_min: time,
      respuestas: responses,
      puntuaciones: {
        total: s.total,
        maximo: 63,
        cognitivo_afectivo: { punt: s.ca, pct: Math.round((s.ca/42)*100) },
        somatico: { punt: s.s, pct: Math.round((s.s/21)*100) }
      },
      interpretacion: { gravedad: sev.lvl, descripcion: sev.desc, rango: `${s.total}/63` },
      alertas: {
        riesgo_suicida: sui.risk,
        nivel: sui.lvl || 'NINGUNO',
        item_9: responses[9] || 0
      },
      validez: { completo: Object.keys(responses).length === 21, tiempo_ok: time >= 5 && time <= 15 },
      metricas: { alpha: '0.86-0.92', test_retest: '0.93', validez: 'PHQ-9' },
      recomendaciones: genRec(s, sui)
    };
  };

  const genRec = (s, sui) => {
    const r = [];
    if (sui.risk) r.push('URGENTE: Evaluación inmediata riesgo suicida');
    if (s.total >= 29) r.push('Considerar intervención intensiva/psiquiátrica');
    else if (s.total >= 20) r.push('Tratamiento psicoterapéutico activo');
    else if (s.total >= 14) r.push('Intervención psicoterapéutica indicada');
    r.push('Reevaluación periódica cada 2-4 semanas');
    return r;
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BDI-II_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    if (!isAvailable) {
      alert('No tienes acceso para ejecutar este test. Revisa tu plan o contacta con el administrador.');
      return;
    }
    const payload: ExecuteTestRequest = {
      test_module_code: 'bdi-ii',
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
        const scores = calcScores();
        const sev = getSeverity(scores.total);
        const testResult = {
          patientId: patientId,
          testType: 'wellness' as const,
          date: clientData.fecha,
          wellnessData: {
            answers: responses,
            systemScores: [],
            completedIn: Math.round((Date.now() - startTime) / 1000)
          },
          therapistNotes: `BDI-II - Puntuación: ${scores.total}/63 - Severidad: ${sev.lvl}`,
          recommendations: sev.lvl === 'Grave'
            ? ['Evaluación clínica inmediata', 'Tratamiento farmacológico y psicoterapéutico']
            : sev.lvl === 'Moderada'
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

  useEffect(() => {
    getTestDetail('bdi-ii').then(mod => setIsAvailable(!!mod.is_available)).catch(() => {});
  }, []);

  const allFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const allAnswered = Object.keys(responses).length === 21;
  const scores = showResults ? calcScores() : null;
  const sev = showResults ? getSeverity(scores.total) : null;
  const sui = showResults ? checkSuicide() : null;

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
                  BDI-II - Inventario de Depresión de Beck
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
                    <input type="text" value={clientData.nombre} onChange={(e) => setClientData({...clientData, nombre: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Nombre completo del paciente" style={{ fontSize: '14px', fontWeight: '400' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Edad *</label>
                    <input type="number" value={clientData.edad} onChange={(e) => setClientData({...clientData, edad: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Edad en años" style={{ fontSize: '14px', fontWeight: '400' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Fecha de evaluación</label>
                    <input type="date" value={clientData.fecha} onChange={(e) => setClientData({...clientData, fecha: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" style={{ fontSize: '14px', fontWeight: '400' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Terapeuta *</label>
                    <input type="text" value={clientData.terapeuta} onChange={(e) => setClientData({...clientData, terapeuta: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Nombre del terapeuta evaluador" style={{ fontSize: '14px', fontWeight: '400' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Número de sesión</label>
                    <input type="text" value={clientData.sesion} onChange={(e) => setClientData({...clientData, sesion: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Ej: Sesión 1, 2, 3..." style={{ fontSize: '14px', fontWeight: '400' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 uppercase tracking-wide">Tipo de evaluación</label>
                    <select value={clientData.tipo} onChange={(e) => setClientData({...clientData, tipo: e.target.value})} className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-sm text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" style={{ fontSize: '14px', fontWeight: '400' }}>
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
                      <strong className="font-semibold">Instrucciones:</strong> Seleccione la afirmación que mejor describa cómo se ha sentido <strong>DURANTE LAS ÚLTIMAS DOS SEMANAS, INCLUYENDO HOY</strong>.
                    </p>
                  </div>

                  {questions.map((q, i) => (
                    <div key={q.id} className="border border-slate-200 rounded-sm p-4 bg-white">
                      <h3 className="font-medium mb-3 text-sm text-slate-900 leading-relaxed">
                        <span className="font-semibold text-slate-700">{i + 1}.</span> {q.text}
                      </h3>
                      <div className="space-y-2">
                        {q.opts.map((opt, j) => (
                          <label key={j} className={`flex items-start p-3 rounded-sm cursor-pointer text-sm border-2 transition-all ${
                            responses[q.id] === j 
                              ? 'bg-blue-50 border-blue-500 shadow-sm' 
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}>
                            <input type="radio" name={`q${q.id}`} checked={responses[q.id] === j} onChange={() => handleResponse(q.id, j)} className="mt-1 mr-3" />
                            <span className="text-slate-700 leading-relaxed">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setShowResults(true)} disabled={!allAnswered} className={`w-full py-2.5 rounded-sm font-medium text-sm transition-colors ${
                    allAnswered 
                      ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}>
                    {allAnswered ? 'Generar Resultados' : `Responda todas (${Object.keys(responses).length}/21)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {sui.risk && (
                <div className="bg-red-100 border-l-4 border-red-600 p-4">
                  <h3 className="font-bold text-red-800 flex items-center"><AlertTriangle className="mr-2" />ALERTA: RIESGO SUICIDA - NIVEL {sui.lvl}</h3>
                  <p className="text-red-700 text-sm">REQUIERE EVALUACIÓN INMEDIATA</p>
                </div>
              )}

              <div className={`bg-${sev.col}-50 border-l-4 border-${sev.col}-600 p-4`}>
                <h2 className="font-bold">Evaluación Completada</h2>
                <p className="text-sm"><strong>Código:</strong> {genCode()}</p>
                <p className="text-xs text-gray-600">{clientData.nombre} | {clientData.fecha}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`bg-${sev.col}-50 p-4 rounded border-2 border-${sev.col}-300`}>
                  <h3 className="font-bold text-sm">Total</h3>
                  <p className={`text-3xl font-bold text-${sev.col}-600`}>{scores.total}</p>
                  <p className="text-xs">de 63</p>
                  <p className={`font-semibold text-${sev.col}-700 mt-1`}>{sev.lvl}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded border-2 border-purple-300">
                  <h3 className="font-bold text-sm">Cognitivo</h3>
                  <p className="text-3xl font-bold text-purple-600">{scores.ca}</p>
                  <p className="text-xs">de 42</p>
                  <p className="text-xs mt-1">{Math.round((scores.ca/42)*100)}%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded border-2 border-blue-300">
                  <h3 className="font-bold text-sm">Somático</h3>
                  <p className="text-3xl font-bold text-blue-600">{scores.s}</p>
                  <p className="text-xs">de 21</p>
                  <p className="text-xs mt-1">{Math.round((scores.s/21)*100)}%</p>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded border">
                <h3 className="font-bold text-sm mb-2">Recomendaciones Clínicas</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(scores, sui).map((rec, i) => (
                    <li key={i} className="flex items-start"><span className="mr-1">•</span>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button onClick={download} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center">
                <Download className="mr-2" size={18} />Descargar JSON
              </button>
                <button onClick={submitToServer} disabled={!isAvailable} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold">Enviar y Guardar en Historial</button>
                {!isAvailable && (<p className="text-xs text-yellow-300 mt-2">No disponible para tu plan. Contacta a tu administrador para acceso.</p>)}
              </div>

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">{JSON.stringify(genJSON(), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 text-xs text-gray-600">
          <h3 className="font-bold mb-1">Información técnica</h3>
          <p>• <strong>Alpha Cronbach:</strong> 0.86-0.92 | <strong>Test-retest:</strong> 0.93</p>
          <p>• <strong>Validez concurrente:</strong> PHQ-9 | <strong>Estándar de oro</strong> para depresión</p>
        </div>
      </div>
    </div>
  );
}
