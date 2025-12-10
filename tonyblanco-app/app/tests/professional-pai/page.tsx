"use client";

import React, { useState, useEffect } from 'react';
import { Download, FileText, User } from 'lucide-react';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';

export default function PAIAssessment() {
  const [clientData, setClientData] = useState({
    nombre: '',
    edad: '',
    fecha: new Date().toISOString().split('T')[0],
    terapeuta: ''
  });
  
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [serverResult, setServerResult] = useState<any | null>(null);
   const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAllowed(false);
        return;
      }
      try {
        const res = await fetch('http://127.0.0.1:8000/api/check-membership/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          setAllowed(false);
          return;
        }
        const data = await res.json();
        setAllowed(data.user_type === 'therapist' && data.can_access_dashboard);
      } catch (err) {
        console.error('Error checking membership:', err);
        setAllowed(false);
      }
    };
    checkMembership();
  }, []);

  const questions = [
    { id: 'INF_1', category: 'Validez', text: 'A veces me siento confundido/a sobre quién soy realmente', scale: 'Inconsistencia' },
    { id: 'INF_2', category: 'Validez', text: 'Mis opiniones cambian frecuentemente', scale: 'Inconsistencia' },
    { id: 'BOR_1', category: 'Límite', text: 'Mis relaciones son muy intensas pero inestables', scale: 'BOR' },
    { id: 'BOR_2', category: 'Límite', text: 'Tengo miedo intenso de ser abandonado/a', scale: 'BOR' },
    { id: 'BOR_3', category: 'Límite', text: 'Mi estado de ánimo cambia rápidamente durante el día', scale: 'BOR' },
    { id: 'BOR_4', category: 'Límite', text: 'A veces actúo impulsivamente sin pensar en las consecuencias', scale: 'BOR' },
    { id: 'BOR_5', category: 'Límite', text: 'He tenido comportamientos autodestructivos', scale: 'BOR' },
    { id: 'BOR_6', category: 'Límite', text: 'Siento un vacío crónico en mi interior', scale: 'BOR' },
    { id: 'SCZ_1', category: 'Esquizotípico', text: 'A veces tengo experiencias perceptivas inusuales', scale: 'SCZ' },
    { id: 'SCZ_2', category: 'Esquizotípico', text: 'Me siento incómodo/a en situaciones sociales', scale: 'SCZ' },
    { id: 'SCZ_3', category: 'Esquizotípico', text: 'Tengo creencias o pensamientos que otros consideran extraños', scale: 'SCZ' },
    { id: 'SCZ_4', category: 'Esquizotípico', text: 'Prefiero estar solo/a la mayor parte del tiempo', scale: 'SCZ' },
    { id: 'SCZ_5', category: 'Esquizotípico', text: 'A veces siento que hay fuerzas especiales que me afectan', scale: 'SCZ' },
    { id: 'SCZ_6', category: 'Esquizotípico', text: 'Mi forma de hablar puede parecer peculiar o vaga', scale: 'SCZ' },
    { id: 'MAL_1', category: 'Validez', text: 'Nunca he mentido en mi vida', scale: 'Simulación' },
    { id: 'MAL_2', category: 'Validez', text: 'Siempre soy completamente honesto/a en todo momento', scale: 'Simulación' },
  ];

  const handleClientDataChange = (field: string, value: string) => {
    setClientData({ ...clientData, [field]: value });
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const calculateScores = () => {
    const scores: any = { BOR: 0, SCZ: 0, Inconsistencia: 0, Simulacion: 0 };

    Object.entries(responses).forEach(([key, value]) => {
      if (key.startsWith('BOR_')) scores.BOR += Number(value);
      else if (key.startsWith('SCZ_')) scores.SCZ += Number(value);
      else if (key.startsWith('INF_')) scores.Inconsistencia += Number(value);
      else if (key.startsWith('MAL_')) scores.Simulacion += Number(value);
    });

    return scores;
  };

  const generateResultCode = () => {
    const scores = calculateScores();
    const timestamp = Date.now().toString(36);
    const hash = Object.values(scores).join('');
    return `PAI-${timestamp}-${hash}`;
  };

  const generateJSON = (serverRes?: any) => {
    const scores = calculateScores();
    const resultCode = serverRes?.codigo_evaluacion || generateResultCode();

    return {
      codigo_evaluacion: resultCode,
      fecha_evaluacion: clientData.fecha,
      datos_cliente: {
        nombre: clientData.nombre,
        edad: Number(clientData.edad),
        terapeuta: clientData.terapeuta
      },
      respuestas: responses,
      puntuaciones: {
        trastorno_limite: {
          puntuacion_bruta: scores.BOR,
          puntuacion_maxima: 24,
          porcentaje: Math.round((scores.BOR / 24) * 100)
        },
        trastorno_esquizotipico: {
          puntuacion_bruta: scores.SCZ,
          puntuacion_maxima: 24,
          porcentaje: Math.round((scores.SCZ / 24) * 100)
        }
      },
      escalas_validez: {
        inconsistencia: {
          puntuacion: scores.Inconsistencia,
          valido: scores.Inconsistencia < 6
        },
        simulacion: {
          puntuacion: scores.Simulacion,
          posible_simulacion: scores.Simulacion > 6
        }
      },
      interpretacion: getInterpretation(scores)
    };
  };

  const getInterpretation = (scores: any) => {
    const interpretation: string[] = [];
    if (scores.BOR >= 12) interpretation.push('Indicadores significativos de rasgos límite de personalidad');
    else if (scores.BOR >= 8) interpretation.push('Indicadores moderados de rasgos límite');
    if (scores.SCZ >= 12) interpretation.push('Indicadores significativos de rasgos esquizotípicos');
    else if (scores.SCZ >= 8) interpretation.push('Indicadores moderados de rasgos esquizotípicos');
    if (scores.Inconsistencia >= 6) interpretation.push('ALERTA: Patrón de respuestas inconsistente - revisar validez');
    if (scores.Simulacion > 6) interpretation.push('ALERTA: Posible simulación o exageración de síntomas');
    return interpretation;
  };

  const downloadJSON = (serverRes?: any) => {
    const data = generateJSON(serverRes);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAI_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length === questions.length) {
      // Call backend to compute and save
      const payload: ExecuteTestRequest = {
        test_module_code: 'professional-pai',
        input_data: {
          nombre: clientData.nombre,
          edad: clientData.edad,
          fecha: clientData.fecha,
          terapeuta: clientData.terapeuta,
          responses
        },
        client_name: clientData.nombre,
        client_birth_date: clientData.fecha,
        save_result: true
      };
      try {
        const res = await executeTest(payload);
        setServerResult(res?.result || null);
        setShowResults(true);
      } catch (err: any) {
        alert('Error ejecutando PAI: ' + (err.message || err));
      }
    }
  };

  const allFieldsFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const allQuestionsAnswered = Object.keys(responses).length === questions.length;

  return (
   <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <FileText className="text-blue-600 mr-3" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">PAI - Inventario de Evaluación de Personalidad</h1>
              <p className="text-gray-600">Evaluación clínica para adultos</p>
            </div>
          </div>

          {!showResults ? (
            allowed === null ? (
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                </div>
              </div>
            ) : (
            <>
            allowed === false ? (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded">
                <h3 className="font-bold text-red-600 mb-2">Acceso restringido</h3>
                <p className="text-sm text-gray-700">Este test está reservado para profesionales. Si crees que deberías tener acceso, por favor actualiza tu plan o contáctanos.</p>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                <h2 className="font-bold text-lg mb-3 flex items-center"><User size={20} className="mr-2" /> Datos del Cliente</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre completo</label>
                    <input type="text" value={clientData.nombre} onChange={(e) => handleClientDataChange('nombre', e.target.value)} className="w-full p-2 border rounded" placeholder="Nombre del cliente" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Edad</label>
                    <input type="number" value={clientData.edad} onChange={(e) => handleClientDataChange('edad', e.target.value)} className="w-full p-2 border rounded" placeholder="Edad" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de evaluación</label>
                    <input type="date" value={clientData.fecha} onChange={(e) => handleClientDataChange('fecha', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Terapeuta</label>
                    <input type="text" value={clientData.terapeuta} onChange={(e) => handleClientDataChange('terapeuta', e.target.value)} className="w-full p-2 border rounded" placeholder="Nombre del terapeuta" />
                  </div>
                </div>
              </div>
              {allFieldsFilled && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700 mb-2"><strong>Instrucciones:</strong> Indique la frecuencia con la que experimenta cada afirmación</p>
                    <div className="flex gap-4 text-sm"><span><strong>0</strong>=Nunca</span><span><strong>1</strong>=Rara vez</span><span><strong>2</strong>=A veces</span><span><strong>3</strong>=Frecuentemente</span><span><strong>4</strong>=Siempre</span></div>
                  </div>
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border-b pb-4">
                      <p className="font-medium mb-3 text-gray-800">{idx + 1}. {q.text}</p>
                      <div className="flex gap-4">
                        {[0, 1, 2, 3, 4].map((value) => (
                          <label key={value} className="flex items-center cursor-pointer"><input type="radio" name={q.id} value={value} checked={responses[q.id] === value} onChange={() => handleResponse(q.id, value)} className="mr-2" /><span className="text-sm">{value}</span></label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button onClick={handleSubmit} disabled={!allQuestionsAnswered} className={`w-full py-3 rounded-lg font-semibold text-white ${allQuestionsAnswered ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>Generar Resultados</button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-600 p-6">
                <h2 className="text-xl font-bold mb-2">Evaluación Completada</h2>
                <p className="text-gray-700 mb-4"><strong>Código de evaluación:</strong> {serverResult?.codigo_evaluacion || generateResultCode()}</p>
                <p className="text-sm text-gray-600">Cliente: {clientData.nombre} | Fecha: {clientData.fecha}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded"><h3 className="font-bold mb-2">Trastorno Límite (BOR)</h3><p className="text-3xl font-bold text-blue-600">{(serverResult?.puntuaciones?.trastorno_limite?.puntuacion_bruta || calculateScores().BOR)}/24</p><p className="text-sm text-gray-600">{Math.round(((serverResult?.puntuaciones?.trastorno_limite?.porcentaje) || Math.round((calculateScores().BOR / 24) * 100)))}%</p></div>
                <div className="bg-purple-50 p-4 rounded"><h3 className="font-bold mb-2">Trastorno Esquizotípico (SCZ)</h3><p className="text-3xl font-bold text-purple-600">{(serverResult?.puntuaciones?.trastorno_esquizotipico?.puntuacion_bruta || calculateScores().SCZ)}/24</p><p className="text-sm text-gray-600">{Math.round(((serverResult?.puntuaciones?.trastorno_esquizotipico?.porcentaje) || Math.round((calculateScores().SCZ / 24) * 100)))}%</p></div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4"><h3 className="font-bold mb-2">Escalas de Validez</h3><p className="text-sm"><strong>Inconsistencia:</strong> {(serverResult?.escalas_validez?.inconsistencia?.puntuacion || calculateScores().Inconsistencia)} {(serverResult?.escalas_validez?.inconsistencia?.puntuacion >= 6 || calculateScores().Inconsistencia >= 6) && <span className="text-red-600 ml-2">⚠ Revisar validez</span>}</p><p className="text-sm"><strong>Simulación:</strong> {(serverResult?.escalas_validez?.simulacion?.puntuacion || calculateScores().Simulacion)} {(serverResult?.escalas_validez?.simulacion?.posible_simulacion || calculateScores().Simulacion > 6) && <span className="text-red-600 ml-2">⚠ Posible exageración</span>}</p></div>
              <div className="bg-gray-50 p-4 rounded"><h3 className="font-bold mb-3">Interpretación Clínica</h3><ul className="space-y-2 text-sm">{((serverResult?.interpretacion) || getInterpretation(calculateScores())).map((interp: any, idx: number) => (<li key={idx} className="flex items-start"><span className="mr-2">•</span><span>{interp}</span></li>))}</ul></div>
              <button onClick={() => downloadJSON(serverResult)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center"><Download size={20} className="mr-2" /> Descargar Resultados (JSON)</button>
              <div className="bg-gray-100 p-4 rounded"><h3 className="font-bold mb-2 text-sm">Vista previa JSON:</h3><pre className="text-xs overflow-auto max-h-64 bg-white p-3 rounded">{JSON.stringify(serverResult || generateJSON(serverResult), null, 2)}</pre></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
