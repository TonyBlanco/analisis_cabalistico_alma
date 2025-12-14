'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getTestResult } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';

/**
 * Patient Result Detail View (Read-Only)
 * 
 * Shows cabalistic analysis result for patient:
 * - Result data (read-only)
 * - Therapist interpretation (read-only)
 * - Therapist notes (if visible, read-only)
 * - No edit controls
 * - No re-run buttons
 * - No AI audit data
 */
export default function PatientCabalisticResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params?.id ? parseInt(params.id as string) : null;

  const [role, setRole] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      // Only patient can access
      if (userRole && userRole !== 'patient') {
        router.replace('/dashboard');
      }
    });

    if (resultId) {
      fetchResult();
    }
  }, [resultId, router]);

  const fetchResult = async () => {
    if (!resultId) return;

    setLoading(true);
    setError(null);

    try {
      const resultData = await getTestResult(resultId);
      
      // Security: Backend enforces access control - if we get here, patient has access
      // The backend should enforce this via TestResultDetailView._can_access_result
      setResult(resultData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultado';
      setError(errorMessage);
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => router.push('/dashboard/patient')}
              className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Volver a mi dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const resultData = result.result_data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              {result.test_module?.name || 'Análisis Cabalístico'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(result.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/patient')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Result Data (Read-Only) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Análisis</h2>
        <div className="prose max-w-none">
          {resultData.analisis_simbólico && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Análisis Simbólico</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{resultData.analisis_simbólico}</div>
            </div>
          )}
          {resultData.interpretacion_clinica && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Interpretación Clínica</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{resultData.interpretacion_clinica}</div>
            </div>
          )}
          {resultData.conclusiones && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Conclusiones</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{resultData.conclusiones}</div>
            </div>
          )}
          {/* Display other result_data fields (read-only) */}
          {Object.keys(resultData).map((key) => {
            if (['analisis_simbólico', 'interpretacion_clinica', 'conclusiones', 'ai_audit', 'raw_data'].includes(key)) {
              return null; // Hide AI audit and raw data from patients
            }
            const value = resultData[key];
            if (typeof value === 'string' && value.length > 0) {
              return (
                <div key={key} className="mb-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{value}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Therapist Notes (Read-Only, if visible) */}
      {result.notes && result.notes.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas de tu Terapeuta</h2>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.notes}</div>
        </div>
      )}
    </div>
  );
}
