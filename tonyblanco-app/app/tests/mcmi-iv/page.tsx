'use client';
import React, { useState } from 'react';
import { Download, FileText, User, Clock, AlertTriangle } from 'lucide-react';
import { executeTest, getTestDetail } from '@/lib/test-api';
import { useEffect } from 'react';
import { ExecuteTestRequest } from '@/lib/test-types';

export default function MCMIIVAssessment() {
  const [clientData, setClientData] = useState({
    nombre: '', edad: '', fecha: new Date().toISOString().split('T')[0],
    terapeuta: '', sesion: '', tipo: 'inicial'
  });
  const [responses, setResponses] = useState({} as Record<number, number>);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [requiresLicense, setRequiresLicense] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [acceptLicense, setAcceptLicense] = useState(false);

  // Placeholders para los 195 ítems; reemplazar con contenido real
  const questions = Array.from({length: 195}, (_, i) => ({
    id: i+1, text: `Ítem ${i+1} (ejemplo: Siento que los demás me controlan - Verdadero/Falso)`
  }));

  const scaleLabels = ['Verdadero', 'Falso'];

  const calcScores = () => {
    // Scoring placeholder: cuenta 'Verdadero' (1); en real, usar base rates para escalas como Avoidant, Depressive, etc.
    const rawScore = Object.values(responses).filter(v => v === 1).length;
    // Simular escalas (ejemplo simple)
    const scales = {
      avoidant: Math.round(rawScore * 0.1),
      depressive: Math.round(rawScore * 0.15),
      histrionic: Math.round(rawScore * 0.12)
    };
    return { rawScore, scales };
  };

  const getSeverity = (br: number) => {
    if (br < 60) return { lvl: 'Normal', col: 'green', desc: 'Normal' };
    if (br < 75) return { lvl: 'Elevada', col: 'yellow', desc: 'Elevada' };
    if (br < 85) return { lvl: 'Prominente', col: 'orange', desc: 'Prominente' };
    return { lvl: 'Severa', col: 'red', desc: 'Severa' };
  };

  const genRec = (scores: any) => {
    const r: string[] = [];
    if (scores.rawScore > 100) r.push('Evaluación detallada para trastornos de personalidad');
    r.push('Interpretar con base rates; consultar manual');
    r.push('Reevaluar si necesario');
    return r;
  };

  const genJSON = () => {
    const scores = calcScores();
    const exampleSev = getSeverity(70); // Ejemplo basado en promedio
    const t = Math.round((Date.now() - startTime) / 60000);
    
    return {
      instrumento: 'MCMI-IV',
      codigo: `MCMI-${Date.now().toString(36)}-${scores.rawScore}`,
      fecha: clientData.fecha,
      cliente: { ...clientData, edad: parseInt(clientData.edad as any) },
      tiempo_min: t,
      respuestas: responses,
      puntuacion: scores,
      interpretacion: { ejemplo: exampleSev.desc },
      validez: { completo: Object.keys(responses).length === 195, tiempo_ok: t >= 20 && t <= 40 },
      metricas: { alpha: '0.80-0.90' },
      recomendaciones: genRec(scores)
    };
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MCMI_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    if (requiresLicense && !acceptLicense) {
      alert('Requiere licencia para ejecutar este test. Confirme la licencia o póngase en contacto con su administrador.');
      return;
    }
    const payload: ExecuteTestRequest = {
      test_module_code: 'mcmi-iv',
      input_data: {
        nombre: clientData.nombre,
        edad: clientData.edad,
        fecha: clientData.fecha,
        terapeuta: clientData.terapeuta,
        responses: responses
      },
      client_name: clientData.nombre,
      client_birth_date: clientData.fecha,
      save_result: true
    };
    try {
      const res = await executeTest(payload);
      alert('Resultado guardado en el historial (ID: ' + (res.result_id || 'N/A') + ')');
    } catch (err: any) {
      alert('Error guardando en servidor: ' + (err.message || err));
    }
  };

  useEffect(() => {
    getTestDetail('mcmi-iv').then(mod => { setRequiresLicense(!!mod.requires_license); setIsAvailable(!!mod.is_available); }).catch(() => {});
  }, []);

  const allFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const allAnswered = Object.keys(responses).length === 195;
  const scores = showResults ? calcScores() : { rawScore: 0, scales: {} };
  const sev = showResults ? getSeverity(70) : null; // Ejemplo

  const handleSet = (id: number, value: number) => setResponses(prev => ({ ...prev, [id]: value }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center mb-4">
            <FileText className="text-indigo-600 mr-2" size={28} />
            <div>
              <h1 className="text-2xl font-bold">MCMI-IV - Inventario Clínico Multiaxial de Millon-IV</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock size={14} className="mr-1" />20-30 min | Adultos | Evaluación de personalidad
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm mb-4">
              <strong className="font-semibold">Nota de Licencia:</strong> El MCMI-IV es un instrumento con derechos de autor; esta versión usa ítems de ejemplo para demostración. Asegúrese de contar con las licencias necesarias antes de desplegar contenido real.
            </div>
          </div>

          {!showResults ? (
            <>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-4">
                <h2 className="font-bold mb-2 flex items-center"><User size={18} className="mr-2" />Datos del Cliente</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={clientData.nombre} onChange={(e) => setClientData({...clientData, nombre: e.target.value})} className="p-2 border rounded text-sm" placeholder="Nombre *" />
                  <input type="number" value={clientData.edad} onChange={(e) => setClientData({...clientData, edad: e.target.value})} className="p-2 border rounded text-sm" placeholder="Edad *" />
                  <input type="date" value={clientData.fecha} onChange={(e) => setClientData({...clientData, fecha: e.target.value})} className="p-2 border rounded text-sm" />
                  <input type="text" value={clientData.terapeuta} onChange={(e) => setClientData({...clientData, terapeuta: e.target.value})} className="p-2 border rounded text-sm" placeholder="Terapeuta *" />
                  <input type="text" value={clientData.sesion} onChange={(e) => setClientData({...clientData, sesion: e.target.value})} className="p-2 border rounded text-sm" placeholder="Sesión" />
                  <select value={clientData.tipo} onChange={(e) => setClientData({...clientData, tipo: e.target.value})} className="p-2 border rounded text-sm">
                    <option value="inicial">Inicial</option>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="final">Final</option>
                  </select>
                </div>
              </div>

              {allFilled && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded text-sm border">
                    <strong>Instrucciones:</strong> Indique si cada afirmación es Verdadero o Falso para usted.
                  </div>

                  <div className="bg-gray-50 p-3 rounded border grid grid-cols-2 gap-2 text-xs text-center">
                    {scaleLabels.map((l, i) => (<div key={i}><div className="font-bold text-lg">{i}</div><div>{l}</div></div>))}
                  </div>

                  {questions.map((q) => (
                    <div key={q.id} className="border rounded p-4 shadow-sm">
                      <div className="flex items-start mb-3">
                        <h3 className="font-semibold text-sm flex-1">{q.id}. {q.text}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[1,0].map(v => (
                          <label key={v} className={`flex flex-col items-center p-2 rounded cursor-pointer border-2 ${responses[q.id] === v ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                            <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => handleSet(q.id, v)} className="mb-1" />
                            <span className="font-bold">{scaleLabels[v]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setShowResults(true)} disabled={!allAnswered} className={`w-full py-3 rounded font-semibold text-white ${allAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}>
                    {allAnswered ? 'Generar Resultados' : `Complete los 195 ítems (${Object.keys(responses).length}/195)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className={`bg-${sev?.col}-50 border-l-4 border-${sev?.col}-600 p-4`}>
                <h2 className="font-bold">Evaluación Completada</h2>
                <p className="text-sm"><strong>Código:</strong> MCMI-{Date.now().toString(36)}-{scores.rawScore}</p>
                <p className="text-xs text-gray-600">{clientData.nombre} | {clientData.fecha}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className={`bg-${sev?.col}-50 p-6 rounded-lg border-2 border-${sev?.col}-400`}>
                  <h3 className="font-bold text-sm">Puntuación Raw (Ejemplo)</h3>
                  <p className={`text-5xl font-bold text-${sev?.col}-600`}>{scores.rawScore}</p>
                  <p className="text-xs text-gray-600">de 195</p>
                  <p className={`font-bold mt-2 text-${sev?.col}-700`}>{sev?.lvl}</p>
                </div>

              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-sm mb-2">Puntuaciones por Escala (Ejemplo)</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.keys(scores.scales).map((scale) => (
                    <div key={scale} className="p-2 rounded bg-white">
                      <span className="font-semibold">{scale}:</span> {scores.scales[scale]}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <h3 className="font-bold text-sm mb-2">Recomendaciones</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(scores).map((r, i) => (
                    <li key={i} className="flex items-start"><span className="mr-2">•</span>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs">
                <h3 className="font-bold mb-1">Rangos Base Rate:</h3>
                <div className="space-y-1">
                  <p><strong>0-59:</strong> Normal | <strong>60-74:</strong> Elevada | <strong>75-84:</strong> Prominente</p>
                  <p><strong>85+:</strong> Severa</p>
                </div>
              </div>

              <button onClick={download} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center">
                <Download className="mr-2" size={18} />Descargar JSON
              </button>
                  <div className="mt-3">
                    {requiresLicense && (
                      <div className="mb-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={acceptLicense} onChange={(e) => setAcceptLicense(e.target.checked)} />
                          <span className="text-sm">He leído y confirmo que tengo la licencia requerida para usar el MCMI-IV</span>
                        </label>
                      </div>
                    )}
                    <button onClick={submitToServer} disabled={!isAvailable || (requiresLicense && !acceptLicense)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold">Enviar y Guardar en Historial</button>
                    {!isAvailable && (
                      <p className="text-xs text-yellow-300 mt-2">No disponible para tu plan. Contacta a tu administrador para acceso.</p>
                    )}
                  </div>

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">{JSON.stringify(genJSON(), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 text-xs">
          <h3 className="font-bold mb-1">Info MCMI-IV</h3>
          <p>• <strong>Alpha:</strong> 0.80-0.90 | <strong>Validez:</strong> Alineada con DSM-5</p>
          <p>• <strong>Punto corte BR:</strong> ≥75 prominente | ≥85 severa</p>
          <p>• <strong>Uso:</strong> Evaluación de trastornos de personalidad</p>
        </div>
      </div>
    </div>
  );
}
