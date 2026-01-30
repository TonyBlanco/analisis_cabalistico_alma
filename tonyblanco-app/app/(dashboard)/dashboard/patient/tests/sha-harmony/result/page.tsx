'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getTestResults } from '@/lib/test-api';
import type { TestResult } from '@/lib/test-types';

interface SHAComputed {
  total_score?: number;
  harmony_index?: number;
  sefirot_scores?: Record<string, number>;
  recommendations?: string[];
}

function getSHAComputed(result: TestResult | null): SHAComputed | null {
  const payload: any = result?.result_data;
  // result_data from /execute is wrapped: { test_type, result, timestamp }
  const computed = payload?.result ?? payload;
  return computed || null;
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Resultados SHA</h1>
        <p className="text-sm text-gray-600 mt-2">
          Tu Auditoría de Armonía Sefirótica ha sido completada.
        </p>
      </div>

      {computed && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Armonía</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {computed.harmony_index ? computed.harmony_index.toFixed(1) : 'N/A'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Puntuación total: {computed.total_score || 'N/A'}
              </p>
            </div>
          </div>

          {computed.sefirot_scores && Object.keys(computed.sefirot_scores).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Puntuaciones por Sefirá</h2>
              <div className="space-y-3">
                {Object.entries(computed.sefirot_scores).map(([sefirah, score]) => (
                  <div key={sefirah} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{sefirah}</span>
                    <span className="text-sm font-medium text-gray-900">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {computed.recommendations && computed.recommendations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h2>
              <ul className="space-y-2">
                {computed.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <button
          onClick={() => router.push('/dashboard/patient')}
          className="px-5 py-2 text-sm font-medium text-white rounded-md"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}
