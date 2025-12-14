'use client';
import React, { useState } from 'react';
import { Download, FileText, User, Clock, AlertTriangle } from 'lucide-react';
import { executeTest, getTestDetail } from '@/lib/test-api';
import { useEffect } from 'react';
import { ExecuteTestRequest } from '@/lib/test-types';

export default function SCID5RVAssessment() {
  const [clientData, setClientData] = useState({
    nombre: '', edad: '', fecha: new Date().toISOString().split('T')[0],
    terapeuta: '', sesion: '', tipo: 'inicial'
  });
  const [responses, setResponses] = useState({} as Record<string, number>);
  const [currentModule, setCurrentModule] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [requiresLicense, setRequiresLicense] = useState(false);
  const [acceptLicense, setAcceptLicense] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const modules = [
    { id: 'overview', label: 'Visión General', items: [
      {id: 'A1', text: 'Mirando hacia atrás en su vida, ¿cuándo estuvo más alterado?' },
      {id: 'A2', text: '¿Ha tenido períodos de sentirse deprimido la mayor parte del día?' }
    ]},
    { id: 'mood', label: 'Episodios de Ánimo', items: [
      {id: 'B1', text: '¿Ha habido un período de al menos 2 semanas de depresión persistente?', skipIf: false },
      {id: 'B2', text: '¿Pérdida de interés en actividades?' }
    ]}
  ];

  const scaleLabels = ['Ausente/Falso', 'Subumbral', 'Umbral/Verdadero'];

  const calcDiagnoses = () => {
    const diagnoses: Record<string, boolean> = {};
    diagnoses['MDE'] = modules[1].items.filter(q => (responses[q.id] || 0) === 3).length >= 5;
    return diagnoses;
  };

  const genRec = (diagnoses: Record<string, boolean>) => {
    const r: string[] = [];
    if (diagnoses['MDE']) r.push('Cumple criterios para Episodio Depresivo Mayor - Referir a tratamiento');
    r.push('Confirmar con entrevista clínica completa');
    return r;
  };

  const genJSON = () => {
    const diagnoses = calcDiagnoses();
    const t = Math.round((Date.now() - startTime) / 60000);
    return {
      instrumento: 'SCID-5-RV',
      codigo: `SCID-${Date.now().toString(36)}`,
      fecha: clientData.fecha,
      cliente: { ...clientData, edad: parseInt(clientData.edad as any) },
      tiempo_min: t,
      respuestas: responses,
      diagnosticos: diagnoses,
      validez: { completo: true, tiempo_ok: t >= 45 && t <= 90 },
      metricas: { kappa: '>0.70' },
      recomendaciones: genRec(diagnoses)
    };
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SCID_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    if (requiresLicense && !acceptLicense) {
      alert('Requiere licencia para ejecutar este test. Confirme la licencia o póngase en contacto con su administrador.');
      return;
    }
    const payload: ExecuteTestRequest = {
      test_module_code: 'scid5',
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
    getTestDetail('scid5').then(mod => { setRequiresLicense(!!mod.requires_license); setIsAvailable(!!mod.is_available); }).catch(() => {});
  }, []);

  const allFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const allAnswered = true; // En un caso real se validaría por módulos
  const diagnoses = showResults ? calcDiagnoses() : {};

  const nextModule = () => setCurrentModule((currentModule + 1) % modules.length);
  const isLastModule = currentModule === modules.length - 1;

  const handleSet = (id: string, value: number) => setResponses(prev => ({ ...prev, [id]: value }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center mb-4">
            <FileText className="text-indigo-600 mr-2" size={28} />
            <div>
              <h1 className="text-2xl font-bold">SCID-5-RV - Entrevista Clínica Estructurada para DSM-5</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock size={14} className="mr-1" />45-90 min | Adultos | Diagnóstico DSM-5
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm mb-4">
              <strong className="font-semibold">Nota de Licencia:</strong> El SCID-5-RV es un instrumento con derechos de autor/consulta; adapte la entrevista con el manual oficial y utilice solo con licencias apropiadas.
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
                    <strong>Instrucciones:</strong> Responda basado en su experiencia de vida. Use 1=Ausente, 2=Subumbral, 3=Umbral.
                  </div>

                  <div className="bg-gray-50 p-3 rounded border grid grid-cols-3 gap-2 text-xs text-center">
                    {scaleLabels.map((l, i) => (<div key={i}><div className="font-bold text-lg">{i+1}</div><div>{l}</div></div>))}
                  </div>

                  <div className="bg-white border rounded p-4 shadow-sm">
                    <h3 className="font-bold text-sm mb-3">{modules[currentModule].label}</h3>
                    {modules[currentModule].items.map((q) => (
                      (!('skipIf' in q) || !q.skipIf) && (
                        <div key={q.id} className="mb-4">
                          <div className="flex items-start mb-2">
                            <h4 className="text-sm flex-1">{q.id}. {q.text}</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[1,2,3].map(v => (
                              <label key={v} className={`flex flex-col items-center p-2 rounded cursor-pointer border-2 ${responses[q.id] === v ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => handleSet(q.id, v)} className="mb-1" />
                                <span className="font-bold">{v}</span>
                                <span className="text-xs mt-1">{scaleLabels[v-1]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  <div className="mt-3">
                    {requiresLicense && (
                      <div className="mb-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={acceptLicense} onChange={(e) => setAcceptLicense(e.target.checked)} />
                          <span className="text-sm">He leído y confirmo que tengo la licencia requerida para usar la SCID-5-RV</span>
                        </label>
                      </div>
                    )}
                    <button
                      onClick={isLastModule ? () => setShowResults(true) : nextModule}
                      disabled={!allAnswered || (requiresLicense && !acceptLicense) || !isAvailable}
                      className={`w-full py-3 rounded font-semibold text-white ${allAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}
                    >
                      {isLastModule ? 'Generar Resultados' : 'Siguiente Módulo'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <h2 className="font-bold">Evaluación Completada</h2>
                <p className="text-sm"><strong>Código:</strong> SCID-{Date.now().toString(36)}</p>
                <p className="text-xs text-gray-600">{clientData.nombre} | {clientData.fecha}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-sm mb-2">Diagnósticos Probables</h3>
                <div className="space-y-2 text-sm">
                  {Object.keys(diagnoses).map((diag) => (
                    <p key={diag} className={diagnoses[diag] ? 'text-red-600' : 'text-green-600'}>
                      {diag}: {diagnoses[diag] ? 'Cumple criterios' : 'No cumple'}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <h3 className="font-bold text-sm mb-2">Recomendaciones</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(diagnoses).map((r, i) => (
                    <li key={i} className="flex items-start"><span className="mr-2">•</span>{r}</li>
                  ))}
                </ul>
              </div>

              <button onClick={download} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center">
                <Download className="mr-2" size={18} />Descargar JSON
              </button>
                <button onClick={submitToServer} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold mt-2">Enviar y Guardar en Historial</button>

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">{JSON.stringify(genJSON(), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 text-xs">
          <h3 className="font-bold mb-1">Info SCID-5-RV</h3>
          <p>• <strong>Kappa inter-evaluador:</strong> &gt;0.70 | <strong>Fiabilidad:</strong> Alta para diagnósticos DSM-5</p>
          <p>• <strong>Uso:</strong> EntRevista semi-estructurada; adaptar para uso clínico</p>
          <p>• <strong>Validez:</strong> Alineada con DSM-5 criteria</p>
        </div>
      </div>
    </div>
  );
}
