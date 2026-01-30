'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

interface SHAComputed {
  total_score?: number;
  harmony_index?: number;
  harmony_level?: string;
  harmony_label?: string;
  sefirot_scores?: Record<string, number>;
  recommendations?: string[];
  max_score?: number;
  answered_items?: number;
}

function getSHAComputed(result: TestResult | null): SHAComputed | null {
  if (!result) return null;
  
  const payload: any = result?.result_data;
  
  // Debug log to see structure
  console.log('🔍 SHA Result structure:', JSON.stringify(payload, null, 2));
  
  // Try multiple extraction paths
  // Path 1: Direct from result_data (new v2 format)
  if (payload?.harmony_index !== undefined) {
    console.log('✅ Found v2 format directly in result_data');
    return payload;
  }
  
  // Path 2: Wrapped in result key (some tests wrap like { test_type, result, timestamp })
  if (payload?.result?.harmony_index !== undefined) {
    console.log('✅ Found v2 format in result_data.result');
    return payload.result;
  }
  
  // Path 3: Legacy fallback
  console.warn('⚠️ Could not find SHA harmony data in expected format');
  return payload?.result ?? payload;
}

export default function SHAResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getTestResults({ test_code: 'sha_harmony' });
        const sorted = [...(all || [])].sort((a: any, b: any) => {
          const ad = new Date(a.created_at || 0).getTime();
          const bd = new Date(b.created_at || 0).getTime();
          return bd - ad;
        });
        setResult(sorted[0] || null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar los resultados';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  const computed = useMemo(() => getSHAComputed(result), [result]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">Cargando resultados…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/dashboard/patient')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  // No result or no computed data
  if (!result || !computed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900">SHA Harmony</h1>
          <p className="text-sm text-gray-600 mt-2">
            Aún no hay resultados registrados para este test.
          </p>
          <button
            onClick={() => router.push('/dashboard/patient/tests/sha-harmony')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Realizar test
          </button>
        </div>
      </div>
    );
  }

  // Determine color based on harmony level
  const getHarmonyColor = (level?: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const harmonyColor = getHarmonyColor(computed.harmony_level);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Auditoría de Armonía Sefirótica</h1>
        <p className="text-sm text-gray-600 mt-2">
          Evaluación holística de tu balance interno en las 10 Sefirot del Árbol de la Vida.
        </p>
        {result.created_at && (
          <p className="text-xs text-gray-500 mt-1">
            Completado el {new Date(result.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>

      {/* Harmony Index Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Armonía</h2>
        <div className="text-center space-y-3">
          <div className={`text-5xl font-bold ${harmonyColor}`}>
            {computed.harmony_index !== undefined ? computed.harmony_index.toFixed(1) : 'N/A'}
          </div>
          {computed.harmony_label && (
            <p className={`text-lg font-medium ${harmonyColor}`}>
              {computed.harmony_label}
            </p>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            <p>Puntuación total: {computed.total_score ?? 'N/A'} / {computed.max_score ?? 50}</p>
            {computed.answered_items !== undefined && (
              <p>Preguntas completadas: {computed.answered_items} / 10</p>
            )}
          </div>
          {/* Progress bar */}
          {computed.harmony_index !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(computed.harmony_index / 5) * 100}%`,
                    backgroundColor: computed.harmony_level === 'excellent' ? '#10b981' :
                                   computed.harmony_level === 'good' ? '#3b82f6' :
                                   computed.harmony_level === 'moderate' ? '#f59e0b' : '#f97316'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0</span>
                <span>2.5</span>
                <span>3.5</span>
                <span>4.5</span>
                <span>5.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sefirot Scores */}
      {computed.sefirot_scores && Object.keys(computed.sefirot_scores).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Puntuaciones por Sefirá</h2>
          <div className="space-y-3">
            {Object.entries(computed.sefirot_scores).map(([sefirah, score]) => {
              const scoreNum = Number(score);
              const percentage = (scoreNum / 5) * 100;
              const color = scoreNum >= 4 ? 'bg-green-500' : 
                           scoreNum >= 3 ? 'bg-blue-500' : 
                           scoreNum >= 2 ? 'bg-yellow-500' : 'bg-orange-500';
              
              return (
                <div key={sefirah} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{sefirah}</span>
                    <span className="text-sm font-semibold text-gray-900">{scoreNum} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {computed.recommendations && computed.recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h2>
          <ul className="space-y-3">
            {computed.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Back button */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <button
          onClick={() => router.push('/dashboard/patient')}
          className="px-5 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}
