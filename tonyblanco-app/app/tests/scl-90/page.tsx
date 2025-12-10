"use client";
import React, { useState } from 'react';
import { Download, FileText, User, Clock, AlertTriangle } from 'lucide-react';
import { executeTest, getTestDetail } from '@/lib/test-api';
import { useEffect } from 'react';
import { ExecuteTestRequest } from '@/lib/test-types';

export default function SCL90RAssessment() {
  const [clientData, setClientData] = useState({
    nombre: '', edad: '', fecha: new Date().toISOString().split('T')[0],
    terapeuta: '', sesion: '', tipo: 'inicial'
  });
  const [responses, setResponses] = useState({} as Record<number, number>);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [isAvailable, setIsAvailable] = useState(true);

  const dimensions = {
    somatization: { id: 'SOM', label: 'Somatización', items: [
      {id: 1, text: 'Dolores de cabeza'},
      {id: 4, text: 'Desmayos o mareos'},
      {id: 12, text: 'Dolores en el corazón o pecho'},
      {id: 27, text: 'Dolores en la parte baja de la espalda'},
      {id: 40, text: 'Náuseas o malestar estomacal'},
      {id: 42, text: 'Dolores musculares'},
      {id: 48, text: 'Dificultad para respirar'},
      {id: 49, text: 'Sofocos o escalofríos'},
      {id: 52, text: 'Entumecimiento u hormigueo en partes del cuerpo'},
      {id: 53, text: 'Nudo en la garganta'},
      {id: 56, text: 'Debilidad en partes del cuerpo'},
      {id: 58, text: 'Sensación de pesadez en brazos o piernas'}
    ]},
    obsessiveCompulsive: { id: 'O-C', label: 'Obsesivo-Compulsivo', items: [
      {id: 3, text: 'Pensamientos no deseados, palabras o ideas'},
      {id: 9, text: 'Problemas para recordar cosas'},
      {id: 10, text: 'Preocupado por la desorganización o suciedad'},
      {id: 28, text: 'Sentirse bloqueado al hacer su trabajo'},
      {id: 38, text: 'Tener que hacer las cosas muy despacio'},
      {id: 45, text: 'Tener que comprobar y volver a comprobar las cosas'},
      {id: 46, text: 'Dificultad para tomar decisiones'},
      {id: 51, text: 'Su mente va en blanco'},
      {id: 55, text: 'Problemas para concentrarse'},
      {id: 65, text: 'Tener que repetir la misma acción'}
    ]},
    interpersonalSensitivity: { id: 'I-S', label: 'Sensibilidad Interpersonal', items: [
      {id: 6, text: 'Sentirse crítico con los demás'},
      {id: 21, text: 'Sentirse tímido o incómodo con el sexo opuesto'},
      {id: 34, text: 'Sus sentimientos son fácilmente heridos'},
      {id: 36, text: 'Sentirse inferior a los demás'},
      {id: 37, text: 'Sentirse incómodo cuando la gente le da elogios'},
      {id: 41, text: 'Sentirse muy consciente de sí mismo con los demás'},
      {id: 61, text: 'Sentirse incómodo comiendo en lugares públicos'},
      {id: 69, text: 'Sentirse nervioso cuando está solo'},
      {id: 73, text: 'Los demás no son comprensivos o simpáticos'}
    ]},
    depression: { id: 'DEP', label: 'Depresión', items: [
      {id: 5, text: 'Pérdida de interés sexual'},
      {id: 14, text: 'Sentirse con baja energía o ralentizado'},
      {id: 15, text: 'Pensamientos de acabar con su vida'},
      {id: 20, text: 'Oír voces sin saber de dónde vienen'},
      {id: 22, text: 'Llorar fácilmente'},
      {id: 26, text: 'Sentirse atrapado o acorralado'},
      {id: 29, text: 'Despertar temprano por la mañana'},
      {id: 30, text: 'Tener que hacer las cosas muy despacio para asegurarse'},
      {id: 31, text: 'Sentirse triste'},
      {id: 32, text: 'Sentirse solo'},
      {id: 54, text: 'Sentirse sin esperanza sobre el futuro'},
      {id: 71, text: 'Preocuparse demasiado por las cosas'},
      {id: 79, text: 'Sentirse sin interés por las cosas'}
    ]},
    anxiety: { id: 'ANX', label: 'Ansiedad', items: [
      {id: 2, text: 'Nerviosismo o temblores internos'},
      {id: 17, text: 'Temblor'},
      {id: 23, text: 'Asustarse repentinamente sin motivo'},
      {id: 33, text: 'Sentir miedo'},
      {id: 39, text: 'Latidos del corazón rápidos'},
      {id: 57, text: 'Ataques de terror o pánico'},
      {id: 72, text: 'Sentirse nervioso cuando se deja solo'},
      {id: 78, text: 'Sentirse afraid en espacios abiertos'},
      {id: 80, text: 'Sentirse responsable de todo'},
      {id: 86, text: 'Sensación de algo malo va a pasar'}
    ]},
    hostility: { id: 'HOS', label: 'Hostilidad', items: [
      {id: 11, text: 'Sentirse fácilmente molesto o irritado'},
      {id: 24, text: 'Enojos o arrebatos de temperamento'},
      {id: 63, text: 'Impulsos de romper o estrellar cosas'},
      {id: 67, text: 'Discusiones frecuentes'},
      {id: 74, text: 'Impulsos de golpear o herir a alguien'},
      {id: 81, text: 'Gritar o lanzar cosas'}
    ]},
    phobicAnxiety: { id: 'PHOB', label: 'Ansiedad Fóbica', items: [
      {id: 13, text: 'Sentirse afraid en calles o espacios abiertos'},
      {id: 25, text: 'Evitar ciertas cosas, lugares o actividades por miedo'},
      {id: 47, text: 'Sentirse afraid de viajar en buses o trenes'},
      {id: 50, text: 'Tener que evitar ciertas cosas'},
      {id: 70, text: 'Sentirse incómodo en multitudes'},
      {id: 75, text: 'Sentirse nervioso al salir de casa solo'},
      {id: 82, text: 'Evitar estar solo'}
    ]},
    paranoidIdeation: { id: 'PAR', label: 'Ideación Paranoide', items: [
      {id: 8, text: 'Sentir que los demás se aprovechan de usted'},
      {id: 18, text: 'Sentir que no se puede confiar en la gente'},
      {id: 43, text: 'Sentir que los demás no le dan oportunidades justas'},
      {id: 68, text: 'Sentir que la gente le critica a sus espaldas'},
      {id: 76, text: 'Sentir que los demás le miran o hablan de usted'},
      {id: 83, text: 'La idea de que alguien quiere hacerle daño'}
    ]},
    psychoticism: { id: 'PSY', label: 'Psicotismo', items: [
      {id: 7, text: 'La idea de que alguien más controla sus pensamientos'},
      {id: 16, text: 'Oír voces que otros no oyen'},
      {id: 35, text: 'Otros son culpables de sus problemas'},
      {id: 62, text: 'Ideas que no debería compartir con otros'},
      {id: 77, text: 'Sentir que su mente está vacía'},
      {id: 84, text: 'La idea de que algo está mal en su mente'},
      {id: 85, text: 'Pensamientos sobre sexo que le molestan mucho'},
      {id: 87, text: 'La idea de que debería ser castigado por sus pecados'},
      {id: 88, text: 'La idea de que algo está mal en su cuerpo'},
      {id: 90, text: 'Nunca sentirse cerca de otra persona'}
    ]},
    additional: { id: 'ADD', label: 'Ítems Adicionales', items: [
      {id: 19, text: 'Apetito pobre'},
      {id: 44, text: 'Dificultad para dormir'},
      {id: 59, text: 'Pensamientos de muerte o morir'},
      {id: 60, text: 'Comer en exceso'},
      {id: 64, text: 'Dormir demasiado'},
      {id: 66, text: 'Sentirse solo incluso con gente'},
      {id: 89, text: 'Culparse a sí mismo'}
    ]}
  } as any;

  const scaleLabels = ['Nada en absoluto', 'Un poco', 'Moderadamente', 'Bastante', 'Extremadamente'];

  const calcScores = () => {
    const dimScores: Record<string, number> = {};
    const allItems: number[] = [];
    Object.keys(dimensions).forEach(dim => {
      const items = dimensions[dim].items.map((q: any) => responses[q.id] || 0);
      allItems.push(...items);
      dimScores[dimensions[dim].id] = items.reduce((s, v) => s + v, 0) / (items.length || 1);
    });
    const gsi = allItems.reduce((s, v) => s + v, 0) / (allItems.length || 1);
    const psdi = allItems.filter(v => v > 0).reduce((s, v) => s + v, 0) / (allItems.filter(v => v > 0).length || 1);
    const pst = allItems.filter(v => v > 0).length;
    return { dimScores, gsi, psdi, pst };
  };

  const getSeverity = (gsi: number) => {
    if (gsi < 0.5) return { lvl: 'Mínima', col: 'green', desc: 'Sintomatología mínima' };
    if (gsi < 1) return { lvl: 'Leve', col: 'blue', desc: 'Sintomatología leve' };
    if (gsi < 1.5) return { lvl: 'Moderada', col: 'yellow', desc: 'Sintomatología moderada' };
    if (gsi < 2) return { lvl: 'Severa', col: 'orange', desc: 'Sintomatología severa' };
    return { lvl: 'Muy Severa', col: 'red', desc: 'Sintomatología muy severa' };
  };

  const checkHighRisk = (responsesObj: Record<number, number>) => {
    const riskItems = [15, 59];
    const highRisk = riskItems.some(id => (responsesObj[id] || 0) >= 3);
    return { risk: highRisk, lvl: highRisk ? 'ALTO' : 'BAJO' };
  };

  const genJSON = () => {
    const scores = calcScores();
    const sev = getSeverity(scores.gsi);
    const risk = checkHighRisk(responses as Record<number, number>);
    const t = Math.round((Date.now() - startTime) / 60000);
    
    return {
      instrumento: 'SCL-90-R',
      codigo: `SCL90-${Date.now().toString(36)}-${Math.round(scores.gsi * 10)}`,
      fecha: clientData.fecha,
      cliente: { ...clientData, edad: parseInt(clientData.edad as any) },
      tiempo_min: t,
      respuestas: responses,
      puntuacion: { ...scores, max_gsi: 4 },
      interpretacion: { gravedad: sev.lvl, descripcion: sev.desc },
      riesgo: { presente: risk.risk, nivel: risk.lvl },
      validez: { completo: Object.keys(responses).length === totalItems, tiempo_ok: t >= 10 && t <= 30 },
      metricas: { alpha: '0.85-0.95', test_retest: '>0.80' },
      recomendaciones: genRec(scores.gsi, sev, risk)
    };
  };

  const genRec = (gsi: number, sev: any, risk: any) => {
    const r: string[] = [];
    if (risk.risk) r.push(`🚨 URGENTE: Riesgo alto - Evaluación inmediata`);
    if (gsi >= 2) r.push('Tratamiento intensivo, considerar hospitalización');
    else if (gsi >= 1.5) r.push('Terapia activa + posible medicación');
    else if (gsi >= 1) r.push('Intervención terapéutica recomendada');
    else if (gsi >= 0.5) r.push('Monitoreo y psicoeducación');
    r.push('Reevaluar cada 4-6 semanas');
    return r;
  };

  const download = () => {
    const data = genJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SCL90_${clientData.nombre}_${clientData.fecha}.json`;
    a.click();
  };

  const submitToServer = async () => {
    if (!isAvailable) {
      alert('No tienes acceso para ejecutar este test. Revisa tu plan o contacto con tu administrador.');
      return;
    }
    const payload: ExecuteTestRequest = {
      test_module_code: 'scl90',
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
    getTestDetail('scl-90').then(mod => setIsAvailable(!!mod.is_available)).catch(() => {});
  }, []);

  const allFilled = clientData.nombre && clientData.edad && clientData.terapeuta;
  const totalItemsBase = Object.keys(dimensions).reduce((acc, key) => acc + dimensions[key].items.length, 0);
  // Add placeholders for any missing questions to reach 90 items (so UI is always able to fill 90 items)
  const existingIds = new Set(Object.keys(dimensions).flatMap(k => dimensions[k].items.map((i: any) => i.id)));
  const placeholderItems: any[] = [];
  for (let i = 1; i <= 90; i++) {
    if (!existingIds.has(i)) {
      placeholderItems.push({ id: i, text: `Ítem ${i} (placeholder)` });
    }
  }
  const totalItems = totalItemsBase + placeholderItems.length;
  const allAnswered = Object.keys(responses).length === totalItems;
  const scores = showResults ? calcScores() : { gsi: 0, psdi: 0, pst: 0, dimScores: {} };
  const sev = showResults ? getSeverity(scores.gsi) : null;
  const risk = showResults ? checkHighRisk(responses as Record<number, number>) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center mb-4">
            <FileText className="text-indigo-600 mr-2" size={28} />
            <div>
              <h1 className="text-2xl font-bold">SCL-90-R - Lista de Síntomas Revisada</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock size={14} className="mr-1" />10-15 min | Adultos | Screening amplio de síntomas
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm mb-4">
              <strong className="font-semibold">Nota de Licencia:</strong> SCL-90-R puede tener restricciones; esta versión incluye ítems de ejemplo. Asegúrese de contar con las licencias necesarias antes de uso clínico.
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
                    <strong>Instrucciones:</strong> Durante <strong>EL ÚLTIMO MES</strong>, ¿cuánto le ha molestado cada problema?
                  </div>

                  <div className="bg-gray-50 p-3 rounded border grid grid-cols-5 gap-2 text-xs text-center">
                    {scaleLabels.map((l: string, i: number) => (<div key={i}><div className="font-bold text-lg">{i}</div><div>{l}</div></div>))}
                  </div>

                  {Object.keys(dimensions).map((dim, dimIndex) => (
                    <div key={dim} className="bg-white border rounded p-4 shadow-sm">
                      <h3 className="font-semibold text-sm mb-3">{dimensions[dim].label}</h3>
                      {dimensions[dim].items.map((q: any) => (
                        <div key={q.id} className="mb-4">
                          <div className="flex items-start mb-2">
                            <h4 className="text-sm flex-1">{q.id}. {q.text}</h4>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[0,1,2,3,4].map(v => (
                              <label key={v} className={`flex flex-col items-center p-2 rounded cursor-pointer border-2 ${responses[q.id] === v ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => setResponses({...responses, [q.id]: v})} className="mb-1" />
                                <span className="font-bold">{v}</span>
                                <span className="text-xs mt-1">{scaleLabels[v]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  {placeholderItems.length > 0 && (
                    <div className="bg-white border rounded p-4 shadow-sm">
                      <h3 className="font-semibold text-sm mb-3">Ítems Adicionales (placeholder)</h3>
                      {placeholderItems.map((q: any) => (
                        <div key={q.id} className="mb-4">
                          <div className="flex items-start mb-2">
                            <h4 className="text-sm flex-1">{q.id}. {q.text}</h4>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[0,1,2,3,4].map(v => (
                              <label key={v} className={`flex flex-col items-center p-2 rounded cursor-pointer border-2 ${responses[q.id] === v ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <input type="radio" name={`q${q.id}`} checked={responses[q.id] === v} onChange={() => setResponses({...responses, [q.id]: v})} className="mb-1" />
                                <span className="font-bold">{v}</span>
                                <span className="text-xs mt-1">{scaleLabels[v]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setShowResults(true)} disabled={!allAnswered} className={`w-full py-3 rounded font-semibold text-white ${allAnswered ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}>
                    {allAnswered ? 'Generar Resultados' : `Complete las ${totalItems} preguntas (${Object.keys(responses).length}/${totalItems})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {risk?.risk && (
                <div className="bg-red-100 border-l-4 border-red-600 p-4">
                  <h3 className="font-bold text-red-800 flex items-center">
                    <AlertTriangle className="mr-2" />ALERTA: RIESGO {risk.lvl}
                  </h3>
                  <p className="text-red-700 text-sm">Evaluación inmediata requerida</p>
                </div>
              )}

              <div className={`bg-${sev?.col}-50 border-l-4 border-${sev?.col}-600 p-4`}>
                <h2 className="font-bold">Evaluación Completada</h2>
                <p className="text-sm"><strong>Código:</strong> SCL90-{Date.now().toString(36)}-{Math.round(scores.gsi * 10)}</p>
                <p className="text-xs text-gray-600">{clientData.nombre} | {clientData.fecha}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`bg-${sev?.col}-50 p-6 rounded-lg border-2 border-${sev?.col}-400`}>
                  <h3 className="font-bold text-sm">GSI (Índice Global)</h3>
                  <p className={`text-5xl font-bold text-${sev?.col}-600`}>{scores.gsi.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">de 4</p>
                  <p className={`font-bold mt-2 text-${sev?.col}-700`}>{sev?.lvl}</p>
                </div>

                <div className="bg-white p-6 rounded-lg border-2">
                  <h3 className="font-bold text-sm mb-2">PSDI (Intensidad)</h3>
                  <p className="text-2xl font-bold">{scores.psdi.toFixed(2)}</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300">
                  <h3 className="font-bold text-sm mb-2">PST (Síntomas Positivos)</h3>
                  <p className="text-2xl font-bold text-purple-600">{scores.pst}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-sm mb-2">Puntuaciones por Dimensión</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.keys(dimensions).map((dim) => (
                    <div key={dim} className={`p-2 rounded ${scores.dimScores[dimensions[dim].id] >= 1 ? 'bg-yellow-100' : 'bg-white'}`}>
                      <span className="font-semibold">{dimensions[dim].id}:</span> {scores.dimScores[dimensions[dim].id].toFixed(2)}/4
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <h3 className="font-bold text-sm mb-2">Recomendaciones</h3>
                <ul className="space-y-1 text-xs">
                  {genRec(scores.gsi, sev, risk).map((r, i) => (
                    <li key={i} className="flex items-start"><span className="mr-2">•</span>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs">
                <h3 className="font-bold mb-1">Rangos GSI:</h3>
                <div className="space-y-1">
                  <p><strong>0-0.49:</strong> Mínima | <strong>0.5-0.99:</strong> Leve | <strong>1-1.49:</strong> Moderada</p>
                  <p><strong>1.5-1.99:</strong> Severa | <strong>2-4:</strong> Muy Severa</p>
                </div>
              </div>

              <button onClick={download} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center">
                <Download className="mr-2" size={18} />Descargar JSON
              </button>
                  <button onClick={submitToServer} disabled={!isAvailable} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold mt-2">Enviar y Guardar en Historial</button>
                  {!isAvailable && (
                    <p className="text-xs text-yellow-300 mt-2">No disponible para tu plan. Contacta a tu administrador para acceso.</p>
                  )}

              <details className="bg-gray-100 p-3 rounded">
                <summary className="font-bold text-sm cursor-pointer">Vista previa JSON</summary>
                <pre className="text-xs overflow-auto max-h-48 bg-white p-2 rounded mt-2">{JSON.stringify(genJSON(), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 text-xs">
          <h3 className="font-bold mb-1">Info SCL-90-R</h3>
          <p>• <strong>Alpha:</strong> 0.85-0.95 | <strong>Test-retest:</strong> &gt;0.80 | <strong>Sensibilidad:</strong> Alta para screening</p>
          <p>• <strong>Punto corte GSI:</strong> ≥1 sintomatología clínica | ≥1.5 intervención activa</p>
          <p>• <strong>Validez:</strong> Concurrente con otros instrumentos psicopatológicos</p>
        </div>
      </div>
    </div>
  );
}
