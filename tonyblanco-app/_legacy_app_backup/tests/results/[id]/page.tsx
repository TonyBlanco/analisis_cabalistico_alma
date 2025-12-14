'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getTestResult } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';
import CabalisticReport from '@/components/CabalisticReport';

export default function TestResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const resultId = params.id as string;
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const data = await getTestResult(parseInt(resultId));
      setResult(data);
    } catch (err) {
      console.error('Error loading result:', err);
      setError('Error al cargar el resultado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este resultado?')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/tests/results/${resultId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        router.push('/tests/results');
      } else {
        alert('Error al eliminar el resultado');
      }
    } catch (err) {
      console.error('Error deleting result:', err);
      alert('Error al eliminar el resultado');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Resultado no encontrado'}</p>
          <button
            onClick={() => router.push('/tests/results')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Volver al Historial
          </button>
        </div>
      </div>
    );
  }

  const data = result.result_data;
  // If backend wraps the result in { test_type: '...', result: {...} }, extract it
  const payload = data && data.result ? data.result : data;
  const testType = (data && data.test_type) ? data.test_type : result.test_module.test_type;

  const hasKnownSections = Boolean(
    (data && (data.numeros || data.numeros_espirituales || data.numeros_clave || data.compatibilidad || data.deuda_karmica || data.interpretacion || data.orientacion_profesional || data.camino_espiritual)) ||
    (payload && (payload.puntuaciones || payload.puntuacion || payload.interpretacion || payload.numeros_principales))
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
            <h1 className="text-3xl font-bold mb-2">{result.test_module.name}</h1>
            <p className="text-gray-400 mb-4">{result.test_module.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                Cliente: <strong className="text-white">{result.client_name || 'Personal'}</strong>
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                Fecha: <strong className="text-white">
                  {new Date(result.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Nombre analizado */}
        {data.nombre && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">Análisis para:</h3>
            <p className="text-2xl text-purple-400">{data.nombre}</p>
            {data.fecha_nacimiento && (
              <p className="text-gray-400 mt-2">
                Nacimiento: {new Date(data.fecha_nacimiento).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        )}

        {/* Meta de análisis básico cuando no hay números calculados */}
        {testType === 'basic' && !hasKnownSections && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">Estado del análisis</h3>
            <p className="text-gray-300 mb-2">{data.message || 'Análisis procesado'}</p>
            {data.note && <p className="text-gray-400 text-sm mb-2">Nota: {data.note}</p>}
            {data.timestamp && (
              <p className="text-gray-500 text-xs">Marca de tiempo: {data.timestamp}</p>
            )}
            {typeof data.processed !== 'undefined' && (
              <p className="text-gray-400 text-sm mt-2">Procesado: {data.processed ? 'Sí' : 'No'}</p>
            )}
          </div>
        )}

        {/* Reporte Cabalístico Completo (basic/numerology con result.result) */}
        {(testType === 'basic' || testType === 'numerology') && payload && payload.numeros_principales && (
          <CabalisticReport 
            mapa={payload} 
            clientName={result.client_name}
            birthDate={result.client_birth_date}
          />
        )}

        {/* Números calculados */}
        {data.numeros && Object.keys(data.numeros).length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">📊 Números Calculados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.numeros).map(([key, value]: [string, any]) => {
                if (typeof value === 'number') {
                  return (
                    <div key={key} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">{value}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Números espirituales */}
        {data.numeros_espirituales && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🕉️ Números Espirituales</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(data.numeros_espirituales).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-400">{value}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Números clave (carrera) */}
        {data.numeros_clave && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">💼 Números Clave Profesionales</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(data.numeros_clave).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{value}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compatibilidad */}
        {data.compatibilidad && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">💑 Análisis de Compatibilidad</h3>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 rounded-full p-8">
                <p className="text-5xl font-bold">{data.compatibilidad.compatibilidad.score_total}%</p>
              </div>
              <p className="text-gray-400 mt-4">Puntuación Total de Compatibilidad</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h4 className="font-bold mb-2">👤 Persona 1</h4>
                <p className="text-purple-400 mb-2">{data.compatibilidad.persona1.nombre}</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.compatibilidad.persona1.numeros).map(([key, value]: [string, any]) => (
                    <p key={key} className="text-gray-400">
                      {key.replace(/_/g, ' ')}: <strong className="text-white">{value}</strong>
                    </p>
                  ))}
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4">
                <h4 className="font-bold mb-2">👤 Persona 2</h4>
                <p className="text-blue-400 mb-2">{data.compatibilidad.persona2.nombre}</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.compatibilidad.persona2.numeros).map(([key, value]: [string, any]) => (
                    <p key={key} className="text-gray-400">
                      {key.replace(/_/g, ' ')}: <strong className="text-white">{value}</strong>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deuda kármica */}
        {data.deuda_karmica && data.deuda_karmica.tiene_deuda && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">⚠️ Deuda Kármica Detectada</h3>
            <p className="text-red-400 text-lg mb-2">Número: {data.deuda_karmica.numero}</p>
            <p className="text-gray-400">{data.deuda_karmica.significado}</p>
          </div>
        )}

        {/* Interpretación con IA */}
        {data.interpretacion && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🔮 Interpretación Personalizada</h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.interpretacion}
              </div>
            </div>
          </div>
        )}

        {/* Orientación profesional */}
        {data.orientacion_profesional && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">💼 Orientación Profesional</h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.orientacion_profesional}
              </div>
            </div>
          </div>
        )}

        {/* Camino espiritual */}
        {data.camino_espiritual && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🕉️ Camino Espiritual</h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.camino_espiritual}
              </div>
            </div>
          </div>
        )}

        {/* Fallback: mostrar JSON completo cuando no hay secciones conocidas o en modo debug */}
        {(searchParams?.get('debug') === '1' || !hasKnownSections) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🧾 Datos del resultado</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-200 overflow-auto max-h-96">
              {JSON.stringify(result.result_data, null, 2)}
            </pre>
          </div>
        )}

        {/* PAI specific render */}
        {testType === 'pai' && payload && payload.puntuaciones && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">PAI - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Trastorno Límite (BOR)</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuaciones.trastorno_limite.puntuacion_bruta}/{payload.puntuaciones.trastorno_limite.puntuacion_maxima}</p>
                <p className="text-sm text-gray-400">{payload.puntuaciones.trastorno_limite.porcentaje}%</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Trastorno Esquizotípico (SCZ)</h4>
                <p className="text-3xl font-bold text-purple-400">{payload.puntuaciones.trastorno_esquizotipico.puntuacion_bruta}/{payload.puntuaciones.trastorno_esquizotipico.puntuacion_maxima}</p>
                <p className="text-sm text-gray-400">{payload.puntuaciones.trastorno_esquizotipico.porcentaje}%</p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-900/10 p-4 rounded">
              <h4 className="font-bold mb-2">Escalas de Validez</h4>
              <p className="text-sm text-gray-400">Inconsistencia: {payload.escalas_validez?.inconsistencia?.puntuacion} {payload.escalas_validez?.inconsistencia?.valido ? '' : '⚠ Revisar validez'}</p>
              <p className="text-sm text-gray-400">Inconsistencia: {payload.escalas_validez?.inconsistencia?.puntuacion} {payload.escalas_validez?.inconsistencia?.valido ? '' : '⚠ Revisar validez'}</p>
              <p className="text-sm text-gray-400">Simulación: {payload.escalas_validez?.simulacion?.puntuacion} {payload.escalas_validez?.simulacion?.posible_simulacion ? '⚠ Posible simulación' : ''}</p>
            </div>
            {payload.interpretacion && (
              <div className="mt-4 bg-gray-900 p-4 rounded">
                <h4 className="font-bold mb-2">Interpretación</h4>
                <ul className="text-sm space-y-2">
                  {payload.interpretacion.map((txt: string, idx: number) => (
                    <li key={idx} className="text-gray-300">• {txt}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${testType}_${result.client_name || 'cliente'}_${result.id}.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              >
                Descargar JSON
              </button>
            </div>
          </div>
        )}
        {/* BDI-II render */}
        {testType === 'bdi' && payload && payload.puntuaciones && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">BDI-II - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Puntuación Total</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuaciones.total}/63</p>
                <p className="text-sm text-gray-400">{payload.interpretacion?.gravedad} - {payload.interpretacion?.descripcion}</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Desglose</h4>
                <p className="text-sm text-gray-400">Cognitivo-Afectivo: {payload.puntuaciones.cognitivo_afectivo.punt} ({payload.puntuaciones.cognitivo_afectivo.pct}%)</p>
                <p className="text-sm text-gray-400">Somático: {payload.puntuaciones.somatico.punt} ({payload.puntuaciones.somatico.pct}%)</p>
              </div>
            </div>
            {payload.alertas && payload.alertas.riesgo_suicida && (
              <div className="bg-red-100 p-3 rounded mt-4">⚠️ Riesgo suicida: Nivel {payload.alertas.nivel}</div>
            )}
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `BDI2_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}
        
        {/* BAI render */}
        {testType === 'bai' && payload && payload.puntuaciones && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">BAI - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Puntuación Total</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuaciones.total}/63</p>
                <p className="text-sm text-gray-400">{payload.interpretacion?.gravedad} - {payload.interpretacion?.descripcion}</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <h4 className="font-bold mb-2">Síntomas Físicos</h4>
                <p className="text-3xl font-bold text-red-600">{payload.puntuaciones.sintomas_fisicos.punt}</p>
                <p className="text-sm text-gray-400">{payload.puntuaciones.sintomas_fisicos.porcentaje}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <h4 className="font-bold mb-2">Síntomas Cognitivos</h4>
                <p className="text-3xl font-bold text-purple-600">{payload.puntuaciones.sintomas_cognitivos.punt}</p>
                <p className="text-sm text-gray-400">{payload.puntuaciones.sintomas_cognitivos.porcentaje}%</p>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `BAI_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}

        {/* SCL-90 render */}
        {testType === 'scl90' && payload && payload.puntuacion && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">SCL-90-R - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">GSI</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuacion.gsi.toFixed(2)}</p>
                <p className="text-sm text-gray-400">de 4</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">PSDI</h4>
                <p className="text-3xl font-bold text-purple-400">{payload.puntuacion.psdi.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Intensidad</p>
              </div>
              <div className="bg-green-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">PST</h4>
                <p className="text-3xl font-bold text-green-400">{payload.puntuacion.pst}</p>
                <p className="text-sm text-gray-400">Síntomas Positivos</p>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `SCL90_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}

        {/* STAI render */}
        {testType === 'stai' && payload && payload.puntuacion && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">STAI - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Ansiedad Estado</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuacion.estado}</p>
                <p className="text-sm text-gray-400">de 80</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Ansiedad Rasgo</h4>
                <p className="text-3xl font-bold text-purple-400">{payload.puntuacion.rasgo}</p>
                <p className="text-sm text-gray-400">de 80</p>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `STAI_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}

        {/* MCMI-IV render */}
        {testType === 'mcmi-iv' && payload && payload.puntuaciones && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">MCMI-IV - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-900/20 p-4 rounded">
                <h4 className="font-bold mb-2">Puntuación Raw</h4>
                <p className="text-3xl font-bold text-blue-400">{payload.puntuaciones.raw}</p>
                <p className="text-sm text-gray-400">de 195</p>
              </div>
              <div className="bg-white p-4 rounded">
                <h4 className="font-bold mb-2">Escalas (ejemplo)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(payload.puntuaciones.scales).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-2 bg-gray-800 rounded">{key}: <strong className="text-white">{val}</strong></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `MCMI_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}

        {/* SCID-5 render */}
        {testType === 'scid5' && payload && payload.diagnosticos && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">SCID-5-RV - Resultados</h3>
            <p className="text-sm text-gray-400 mb-2">Código de evaluación: <strong className="text-white">{payload.codigo_evaluacion}</strong></p>
            <div className="bg-white p-4 rounded text-sm">
              <h4 className="font-bold mb-2">Diagnósticos Probables</h4>
              {Object.entries(payload.diagnosticos).map(([d, val]: [string, any]) => (
                <p key={d} className={val ? 'text-red-500' : 'text-green-500'}>{d}: {val ? 'Cumple criterios' : 'No cumple'}</p>
              ))}
            </div>
            <div className="mt-4">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `SCID5_${result.client_name || 'cliente'}_${result.id}.json`; a.click();
              }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Descargar JSON</button>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/tests/${result.test_module.code}`)}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Repetir Test
          </button>
          <button
            onClick={() => router.push('/tests/results')}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Ver Historial
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
