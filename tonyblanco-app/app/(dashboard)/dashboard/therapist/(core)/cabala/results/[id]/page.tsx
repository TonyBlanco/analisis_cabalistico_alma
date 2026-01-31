'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getTestResult } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

/**
 * Therapist Result Detail View
 * 
 * Shows cabalistic analysis result with:
 * - Result data
 * - Symbolic explanation
 * - Clinical interpretation
 * - Editable clinician notes
 */
export default function TherapistCabalisticResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params?.id ? parseInt(params.id as string) : null;

  const [role, setRole] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      // Only therapist and admin (for simulation) can access
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
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
      setResult(resultData);
      setNotes(resultData.notes || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resultado';
      setError(errorMessage);
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!resultId || !result) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/tests/results/${resultId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al guardar notas');
      }

      const updatedResult = await response.json();
      setResult(updatedResult);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar notas';
      setError(errorMessage);
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
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
              onClick={() => router.push('/dashboard/therapist')}
              className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Volver al workspace
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
  const clientName = result.client_name || result.test_module?.name || 'Sin nombre';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              {result.test_module?.name || 'Análisis Cabalístico'}
            </h1>
            <p className="text-sm text-gray-600">
              Consultante: <span className="font-medium">{clientName}</span>
            </p>
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
            onClick={() => router.push('/dashboard/therapist')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">✓ Notas guardadas correctamente</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Result Data */}
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
              <h3 className="text-md font-medium text-gray-900 mb-2">Interpretación Integrativa</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{resultData.interpretacion_clinica}</div>
            </div>
          )}
          {resultData.conclusiones && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Conclusiones</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{resultData.conclusiones}</div>
            </div>
          )}
          {/* Display other result_data fields */}
          {Object.keys(resultData).map((key) => {
            if (['analisis_simbólico', 'interpretacion_clinica', 'conclusiones'].includes(key)) {
              return null;
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

      {/* Therapist Notes Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas del Terapeuta</h2>
        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors resize-y"
            placeholder="Agrega tus notas del terapeuta, observaciones o interpretaciones adicionales aquí..."
          />
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.push('/dashboard/therapist')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {saving ? 'Guardando...' : 'Guardar notas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
