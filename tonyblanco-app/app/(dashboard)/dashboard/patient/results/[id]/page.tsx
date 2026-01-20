'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTestResult } from '@/lib/test-api';
import ReadableResult from '@/components/test-results/ReadableResult';

export default function PatientResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const numericId = Number(resultId);
      if (!Number.isFinite(numericId)) {
        setError('ID de resultado invalido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getTestResult(numericId);
        setResult(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el resultado';
        setError(errorMessage);
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  const handleGoBack = () => {
    router.push('/dashboard/patient/results');
  };

  const testName =
    result?.test_module?.name ||
    result?.test_module_name ||
    result?.test_name ||
    'Resultado';
  const testCode =
    result?.test_module?.code ||
    result?.test_module_code ||
    result?.test_code;
  const completedAt = result?.completed_at || result?.created_at || result?.updated_at;
  const payload = result?.result_data ?? result?.summary ?? result?.details ?? result;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver a resultados</span>
      </button>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-600">Cargando resultado...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Resultado #{resultId}
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-600">No se encontro el resultado solicitado.</p>
        </div>
      )}

      {!loading && !error && result && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{testName}</h1>
            {testCode && (
              <p className="text-sm text-gray-500 mb-2">Codigo: {testCode}</p>
            )}
            {completedAt && (
              <p className="text-sm text-gray-500">
                Fecha: {formatDate(completedAt)}
              </p>
            )}
          </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resultado</h2>
            <ReadableResult resultData={payload} resultId={result?.id} showRaw={false} />
            <p className="text-xs text-gray-500 mt-3">
              Si no aparecen detalles adicionales, consulta con tu terapeuta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value: unknown): string {
  if (!value) return 'No disponible';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

