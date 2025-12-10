"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, FileText, User, Clock, AlertTriangle, UserCircle } from 'lucide-react';
import { executeTest, getTestDetail } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';
import { getPatient } from '@/lib/patient-storage';
import { savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';

export default function STAIAssessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [clientData, setClientData] = useState({
    nombre: '', edad: '', fecha: new Date().toISOString().split('T')[0],
    terapeuta: '', sesion: '', tipo: 'inicial'
  });
  const [responses, setResponses] = useState({} as Record<number, number>);
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
    
    getTestDetail('stai').then(mod => setIsAvailable(!!mod.is_available)).catch(() => {});
  }, [patientId]);

  const stateQuestions = [
    { id: 1, text: 'Me siento calmado', reverse: true },
    { id: 2, text: 'Me siento seguro', reverse: true },
    { id: 3, text: 'Me siento tenso', reverse: false },
    { id: 4, text: 'Me siento agobiado', reverse: false },
    { id: 5, text: 'Me siento a gusto', reverse: true },
    { id: 6, text: 'Me siento alterado', reverse: false },
    { id: 7, text: 'Me preocupan posibles desgracias', reverse: false },
    { id: 8, text: 'Me siento satisfecho', reverse: true },
    { id: 9, text: 'Me siento asustado', reverse: false },
    { id: 10, text: 'Me siento cómodo', reverse: true },
    { id: 11, text: 'Me siento confiado en mí mismo', reverse: true },
    { id: 12, text: 'Me siento nervioso', reverse: false },
    { id: 13, text: 'Estoy inquieto', reverse: false },
    { id: 14, text: 'Me siento indeciso', reverse: false },
    { id: 15, text: 'Estoy relajado', reverse: true },
    { id: 16, text: 'Me siento contento', reverse: true },
    { id: 17, text: 'Estoy preocupado', reverse: false },
    { id: 18, text: 'Me siento confuso', reverse: false },
    { id: 19, text: 'Me siento firme', reverse: true },
    { id: 20, text: 'Me siento a gusto', reverse: true },
  ];

  const traitQuestions = [
    { id: 21, text: 'Me siento a gusto', reverse: true },
    { id: 22, text: 'Me siento nervioso e inquieto', reverse: false },
    { id: 23, text: 'Me siento satisfecho conmigo mismo', reverse: true },
    { id: 24, text: 'Desearía ser tan feliz como otros parecen serlo', reverse: false },
    { id: 25, text: 'Siento como si fuera un fracaso', reverse: false },
    { id: 26, text: 'Me siento descansado', reverse: true },
    { id: 27, text: 'Soy calmado, fresco y sereno', reverse: true },
    { id: 28, text: 'Siento que las dificultades se acumulan y no puedo superarlas', reverse: false },
    { id: 29, text: 'Me preocupo demasiado por cosas que no importan', reverse: false },
    { id: 30, text: 'Soy feliz', reverse: true },
    { id: 31, text: 'Tengo pensamientos perturbadores', reverse: false },
    { id: 32, text: 'Me falta confianza en mí mismo', reverse: false },
    { id: 33, text: 'Me siento seguro', reverse: true },
    { id: 34, text: 'Tomo decisiones fácilmente', reverse: true },
    { id: 35, text: 'Me siento inadecuado', reverse: false },
    { id: 36, text: 'Soy contento', reverse: true },
    { id: 37, text: 'Algunos pensamientos sin importancia me pasan por la mente y me molestan', reverse: false },
    { id: 38, text: 'Tomo las decepciones tan a pecho que no puedo quitármelas de encima', reverse: false },
    { id: 39, text: 'Soy una persona estable', reverse: true },
    { id: 40, text: 'Me altero cuando pienso en mis asuntos e intereses recientes', reverse: false },
  ];

  const stateScale = ['Nada', 'Un poco', 'Bastante', 'Mucho'];
  const traitScale = ['Casi nunca', 'Algunas veces', 'A menudo', 'Casi siempre'];

  const calcScore = (questions: { id: number, reverse?: boolean }[]) => {
    return questions.reduce((s, q) => {
      const val = responses[q.id] || 0;
      if (!val) return s;
      // Values are 1-4 in UI; reversed means 5 - value
      const value = q.reverse ? (5 - val) : val;
      return s + value;
    }, 0);
  };

  const getSeverity = (score: number) => {
    if (score < 39) return { lvl: 'Baja', col: 'green', desc: 'Ansiedad baja' };
    if (score < 45) return { lvl: 'Moderada', col: 'yellow', desc: 'Ansiedad moderada' };
    return { lvl: 'Alta', col: 'red', desc: 'Ansiedad alta' };
  };

  const genRec = (state: number, trait: number, stateSev: any, traitSev: any) => {
    const r: string[] = [];
    if (state >= 45 || trait >= 45) r.push('🚨 Evaluación detallada recomendada para ansiedad clínica');
    if (trait >= 45) r.push('Terapia a largo plazo para ansiedad rasgo');
    if (state >= 45) r.push('Técnicas de relajación inmediata para ansiedad estado');
    if (state >= 39 || trait >= 39) r.push('Monitoreo y psicoeducación');
    r.push('Reevaluar cada 2-4 semanas');
    return r;
  };

  const genJSON = () => {
    const stateScore = calcScore(stateQuestions);
    const traitScore = calcScore(traitQuestions);
    const stateSev = getSeverity(stateScore);
    const traitSev = getSeverity(traitScore);
    const t = Math.round((Date.now() - startTime) / 60000);

    return {
      instrumento: 'STAI',
      codigo: `STAI-${Date.now().toString(36)}-${stateScore}-${traitScore}`,
      fecha: clientData.fecha,
      cliente: { ...clientData, edad: parseInt(clientData.edad as any) },
      tiempo_min: t,
      respuestas: responses,
      puntuacion: { estado: stateScore, rasgo: traitScore, max: 80 },
      interpretacion: { estado: stateSev.desc, rasgo: traitSev.desc },
      validez: { completo: Object.keys(responses).length === 40, tiempo_ok: t >= 5 && t <= 15 },
      metricas: { alpha: '0.86-0.95', test_retest: '0.65-0.75' },
      recomendaciones: genRec(stateScore, traitScore, stateSev, traitSev)
    };
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STAI_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    if (!isAvailable) {
      alert('No tienes acceso para ejecutar este test. Revisa tu plan o contacta con el administrador.');
      return;
    }
    const payload: ExecuteTestRequest = {
      test_module_code: 'stai',
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
        const stateScore = calcScore(stateQuestions);
        const traitScore = calcScore(traitQuestions);
        const testResult = {
          patientId: patientId,
          testType: 'wellness' as const,
          date: clientData.fecha,
          wellnessData: {
            answers: responses,
            systemScores: [],
            completedIn: Math.round((Date.now() - startTime) / 1000)
          },
          therapistNotes: `STAI - Estado: ${stateScore}/80, Rasgo: ${traitScore}/80`,
          recommendations: stateScore >= 45 || traitScore >= 45
            ? ['Evaluación detallada recomendada', 'Terapia a largo plazo']
            : ['Monitoreo y psicoeducación']
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
  const allAnswered = Object.keys(responses).length === 40;
  const stateScore = showResults ? calcScore(stateQuestions) : 0;
  const traitScore = showResults ? calcScore(traitQuestions) : 0;
  const stateSev = showResults ? getSeverity(stateScore) : null;
  const traitSev = showResults ? getSeverity(traitScore) : null;

  const handleSet = (id: number, value: number) => setResponses(prev => ({ ...prev, [id]: value }));

  return (
    <div className="min-h-screen bg-slate-50 p-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 mb-4">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center mr-3">
                <FileText className="text-slate-600" size={24} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: 'system-ui, -apple-system' }}>
                  STAI - Inventario de Ansiedad Estado-Rasgo
                </h1>
                <p className="text-sm text-slate-600 flex items-center mt-1">
                  <Clock size={14} className="mr-1" />5-10 min | Adultos | Diferencia estado vs. rasgo
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-sm text-sm mt-4">
              <strong className="font-semibold">Nota de Licencia:</strong> El STAI es un instrumento con derechos de autor; use ítems oficiales solo si dispone de las licencias correspondientes.
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
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-sm">
                    <p className="text-sm text-slate-800 leading-relaxed">
                      <strong className="font-semibold">Instrucciones:</strong> Responda según cómo se siente <strong>AHORA</strong> (Estado) y cómo se siente <strong>GENERALMENTE</strong> (Rasgo).
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-3 text-base">Sección Estado (Cómo se siente AHORA)</h3>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm grid grid-cols-4 gap-2 text-xs text-center mb-4">
                      {stateScale.map((l, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-sm p-2">
                          <div className="font-bold text-base text-slate-900 mb-1">{i+1}</div>
                          <div className="text-slate-600 leading-tight">{l}</div>
                        </div>
                      ))}
                    </div>
                    {stateQuestions.map((q) => (
                      <div key={q.id} className="mb-4 border-b border-slate-100 pb-4 last:border-b-0">
                        <h4 className="font-medium mb-3 text-sm text-slate-900 leading-relaxed">
                          <span className="font-semibold text-slate-700">{q.id}.</span> {q.text}
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {[1,2,3,4].map(v => (
                            <label key={v} className={`flex flex-col items-center p-3 rounded-sm cursor-pointer text-xs border-2 transition-all ${
                              responses[q.id] === v 
                                ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}>
                              <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => handleSet(q.id, v)} className="mb-2" />
                              <span className="font-bold text-base text-slate-900 mb-1">{v}</span>
                              <span className="text-xs text-center text-slate-600 leading-tight">{stateScale[v-1]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-3 text-base">Sección Rasgo (Cómo se siente GENERALMENTE)</h3>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm grid grid-cols-4 gap-2 text-xs text-center mb-4">
                      {traitScale.map((l, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-sm p-2">
                          <div className="font-bold text-base text-slate-900 mb-1">{i+1}</div>
                          <div className="text-slate-600 leading-tight">{l}</div>
                        </div>
                      ))}
                    </div>
                    {traitQuestions.map((q) => (
                      <div key={q.id} className="mb-4 border-b border-slate-100 pb-4 last:border-b-0">
                        <h4 className="font-medium mb-3 text-sm text-slate-900 leading-relaxed">
                          <span className="font-semibold text-slate-700">{q.id}.</span> {q.text}
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {[1,2,3,4].map(v => (
                            <label key={v} className={`flex flex-col items-center p-3 rounded-sm cursor-pointer text-xs border-2 transition-all ${
                              responses[q.id] === v 
                                ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}>
                              <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => handleSet(q.id, v)} className="mb-2" />
                              <span className="font-bold text-base text-slate-900 mb-1">{v}</span>
                              <span className="text-xs text-center text-slate-600 leading-tight">{traitScale[v-1]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setShowResults(true)} disabled={!allAnswered} className={`w-full py-2.5 rounded-sm font-medium text-sm transition-colors ${
                    allAnswered 
                      ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}>
                    {allAnswered ? 'Generar Resultados' : `Complete las 40 preguntas (${Object.keys(responses).length}/40)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className={`bg-${Math.max(stateScore, traitScore) >= 45 ? 'red' : 'yellow'}-50 border-l-4 border-${Math.max(stateScore, traitScore) >= 45 ? 'red' : 'yellow'}-600 p-4`}>
                <h2 className="font-bold">Evaluación Completada</h2>
                <p className="text-sm"><strong>Código:</strong> STAI-{Date.now().toString(36)}-{stateScore}-{traitScore}</p>
                <p className="text-xs text-gray-600">{clientData.nombre} | {clientData.fecha}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`bg-${stateSev?.col}-50 p-6 rounded-lg border-2 border-${stateSev?.col}-400`}>
                  <h3 className="font-bold text-sm">Ansiedad Estado</h3>
                  <p className={`text-5xl font-bold text-${stateSev?.col}-600`}>{stateScore}</p>
                  <p className="text-xs text-gray-600">de 80</p>
                  <p className={`font-bold mt-2 text-${stateSev?.col}-700`}>{stateSev?.lvl}</p>
                </div>

                <div className={`bg-${traitSev?.col}-50 p-6 rounded-lg border-2 border-${traitSev?.col}-400`}>
                  <h3 className="font-bold text-sm">Ansiedad Rasgo</h3>
                  <p className={`text-5xl font-bold text-${traitSev?.col}-600`}>{traitScore}</p>
                  <p className="text-xs text-gray-600">de 80</p>
                  <p className={`font-bold mt-2 text-${traitSev?.col}-700`}>{traitSev?.lvl}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-sm mb-2">Respuestas por Ítem</h3>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[...stateQuestions, ...traitQuestions].map((q) => (
                    <div key={q.id} className={`p-2 rounded ${(responses[q.id] || 0) >= 3 ? 'bg-yellow-100' : 'bg-white'}`}>
                      <span className="font-semibold">{q.id}.</span> {responses[q.id] || 0}/4
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <h3 className="font-bold text-sm mb-2">Recomendaciones</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(stateScore, traitScore, stateSev, traitSev).map((r, i) => (
                    <li key={i} className="flex items-start"><span className="mr-2">•</span>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs">
                <h3 className="font-bold mb-1">Rangos:</h3>
                <div className="space-y-1">
                  <p><strong>20-38:</strong> Baja | <strong>39-44:</strong> Moderada | <strong>45-80:</strong> Alta</p>
                </div>
              </div>

              <button onClick={download} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center">
                <Download className="mr-2" size={18} />Descargar JSON
              </button>
                <button onClick={submitToServer} disabled={!isAvailable} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold mt-2">Enviar y Guardar en Historial</button>
                {!isAvailable && (<p className="text-xs text-yellow-300 mt-2">No disponible para tu plan. Contacta a tu administrador para acceso.</p>)}

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">{JSON.stringify(genJSON(), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4 text-xs">
          <h3 className="font-semibold mb-2 text-slate-900">Info STAI</h3>
          <p className="text-slate-700 mb-1">• <strong>Alpha:</strong> 0.86-0.95 | <strong>Test-retest:</strong> 0.65-0.75 | <strong>Sensibilidad:</strong> Alta para distinción estado-rasgo</p>
          <p className="text-slate-700 mb-1">• <strong>Punto corte:</strong> ≥45 ansiedad clínica | ≥39 monitoreo</p>
          <p className="text-slate-700">• <strong>Validez:</strong> Concurrente con otros medidas de ansiedad</p>
        </div>
      </div>
    </div>
  );
}
