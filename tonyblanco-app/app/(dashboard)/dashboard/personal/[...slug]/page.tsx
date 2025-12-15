'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import {
  getTestDetail,
  getTestResults,
  getTestResult,
  executeTest,
} from '@/lib/test-api';
import type { TestModule, TestResult, ExecuteTestResponse } from '@/lib/test-types';

const CLINICAL_TYPES = new Set([
  'pai',
  'scl90',
  'stai',
  'mcmi-iv',
  'scid5',
  'bdi',
  'bai',
]);

interface PersonalTestRunnerPageProps {
  params: {
    slug: string[];
  };
}

export default function PersonalTestRunnerPage({ params }: PersonalTestRunnerPageProps) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [test, setTest] = useState<TestModule | null>(null);
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
  const testCode = slugArray[0];

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/dashboard',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!testCode) {
        setLoading(false);
        setError('Exploración no encontrada.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const module = await getTestDetail(testCode);
        setTest(module);

        // Cargar último resultado guardado de este test para el usuario actual
        try {
          const results = await getTestResults({ test_code: testCode });
          if (results.length > 0) {
            // Ordenar por fecha de creación descendente
            const sorted = [...results].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
            setLatestResult(sorted[0]);
          }
        } catch (err) {
          console.warn('Error cargando resultados previos para exploración personal:', err);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo cargar la exploración seleccionada.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [testCode]);

  const isClinicalTest = useMemo(() => {
    if (!test) return false;
    return CLINICAL_TYPES.has(test.test_type);
  }, [test]);

  const handleRunExploration = async () => {
    if (!test) return;
    setExecuting(true);
    setError(null);

    try {
      const response: ExecuteTestResponse = await executeTest({
        test_module_code: test.code,
        input_data: {},
        save_result: true,
      });

      // Si el backend devuelve un ID de resultado, recargar desde /tests/results/
      if (response.result_id) {
        try {
          const fullResult = await getTestResult(response.result_id);
          setLatestResult(fullResult);
        } catch (err) {
          console.warn('No se pudo recargar el resultado completo, usando respuesta directa.', err);
          setLatestResult((prev) =>
            prev
              ? {
                  ...prev,
                  result_data: response.result,
                }
              : null,
          );
        }
      } else {
        // Fallback: actualizar datos del último resultado en memoria
        setLatestResult((prev) =>
          prev
            ? {
                ...prev,
                result_data: response.result,
              }
            : null,
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo completar la exploración personal.';
      setError(message);
    } finally {
      setExecuting(false);
    }
  };

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Preparando tu exploración personal...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <p className="text-sm text-gray-700">
            No se encontró la exploración que estás buscando.
          </p>
          <button
            onClick={() => router.push('/dashboard/personal')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver al Panel Personal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              {test.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Exploración personal basada en símbolos y patrones cabalísticos.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Exploración personal
              </span>
              {test.estimated_duration && (
                <span className="text-xs text-gray-500">
                  Duración estimada: {test.estimated_duration} min
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/personal')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Execution panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        {isClinicalTest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Esta herramienta está reservada para contextos profesionales y no se puede ejecutar
              desde el Panel Personal.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Al iniciar la exploración, el sistema generará una interpretación simbólica basada en
              tus datos de perfil. No es un diagnóstico ni una evaluación clínica.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleRunExploration}
              disabled={executing}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: !executing ? 'var(--accent-color)' : undefined }}
            >
              {executing ? 'Generando exploración...' : 'Iniciar nueva exploración'}
            </button>
            <p className="mt-2 text-[11px] text-gray-500">
              Uso educativo y de autoconocimiento. Si estás atravesando una situación de salud
              mental compleja, te recomendamos buscar acompañamiento profesional.
            </p>
          </>
        )}
      </div>

      {/* Latest result */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Mis exploraciones con este test</h2>
        {!latestResult ? (
          <p className="text-sm text-gray-500">
            Aún no hay resultados guardados para esta exploración. Cuando completes una, aparecerá
            aquí de forma resumida.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              Última exploración: {new Date(latestResult.created_at).toLocaleString('es-ES')}
            </p>
            <div className="mt-2 border border-gray-200 rounded-md p-3 bg-gray-50 max-h-80 overflow-auto">
              <p className="text-xs text-gray-500 mb-2">
                Interpretación simbólica (contenido generado automáticamente, no clínico):
              </p>
              <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                {JSON.stringify(latestResult.result_data, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

