'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTestResults } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';

export default function TestResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await getTestResults();
      setResults(data);
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeLabel = (code: string) => {
    const labels: Record<string, string> = {
      'basic-soul-analysis': '🔮 Análisis Básico del Alma',
      'complete-numerology': '🔢 Numerología Completa',
      'couple-compatibility': '💑 Compatibilidad de Pareja',
      'career-path': '💼 Camino Profesional',
      'spiritual-purpose': '🕉️ Propósito Espiritual',
      'health-karma': '❤️ Karma de Salud',
      'financial-abundance': '💰 Abundancia Financiera',
      'family-constellation': '👨‍👩‍👧‍👦 Constelación Familiar',
      'life-purpose': '🌟 Propósito de Vida',
      'past-life-reading': '⏳ Lectura de Vidas Pasadas',
    };
    return labels[code] || code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Historial de Resultados</h1>
          <p className="text-gray-400">Revisa todos tus análisis guardados</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <p className="text-4xl font-bold text-purple-400 mb-1">{results.length}</p>
            <p className="text-gray-400 text-sm">Tests Realizados</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <p className="text-4xl font-bold text-blue-400 mb-1">
              {new Set(results.map(r => r.test_module.code)).size}
            </p>
            <p className="text-gray-400 text-sm">Tests Diferentes</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
            <p className="text-4xl font-bold text-green-400 mb-1">
              {results.filter(r => r.created_at && 
                new Date(r.created_at).getMonth() === new Date().getMonth()
              ).length}
            </p>
            <p className="text-gray-400 text-sm">Este Mes</p>
          </div>
        </div>

        {/* Debug overlay (optional via ?debug=1) */}
        {searchParams?.get('debug') === '1' && (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-xs overflow-auto">
            <div className="font-bold mb-2">Debug: Primer resultado (si existe)</div>
            <pre className="whitespace-pre-wrap text-yellow-200">
              {results[0] ? JSON.stringify(results[0], null, 2) : 'No hay resultados'}
            </pre>
          </div>
        )}

        {/* Lista de resultados */}
        {results.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-400 mb-4">
              Aún no has realizado ningún test
            </p>
            <button
              onClick={() => router.push('/tests')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Realizar Primer Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 transition-all cursor-pointer"
                onClick={() => router.push(`/tests/results/${result.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {getTestTypeLabel(result.test_module.code)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {result.client_name || 'Análisis Personal'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(result.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Preview del resultado */}
                {result.result_data && (
                  <div className="bg-black/50 rounded-lg p-4 mt-4">
                    {result.result_data.numeros && (
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(result.result_data.numeros).slice(0, 5).map(([key, value]: [string, any]) => (
                          typeof value === 'number' && (
                            <span key={key} className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm">
                              {key.replace('_', ' ')}: <strong>{value}</strong>
                            </span>
                          )
                        ))}
                      </div>
                    )}
                    {result.result_data.interpretacion && (
                      <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                        {result.result_data.interpretacion.slice(0, 150)}...
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-xs">
                      {result.test_module.name}
                    </span>
                  </div>
                  <span className="text-purple-400 text-sm">Ver Detalles →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
