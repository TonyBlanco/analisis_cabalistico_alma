'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  id: number;
  test_name: string;
  test_code: string;
  status: 'pending' | 'completed' | 'expired';
  assigned_at: string;
  completed_at?: string;
  score?: number;
  summary?: string;
  details?: Record<string, any>;
}

/**
 * Individual Test Result Page for Patients
 * Shows detailed result of a specific test
 */
export default function PatientResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Implement actual API call to fetch result details
        // For now, show a placeholder
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Placeholder - in production, fetch from backend
        // const response = await fetch(`/api/patient/results/${resultId}`, {
        //   headers: { Authorization: `Token ${token}` }
        // });
        
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, show that the endpoint isn't implemented yet
        setError('Los resultados detallados estarán disponibles próximamente.');
        
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
  }, [resultId, router]);

  const handleGoBack = () => {
    router.push('/dashboard/patient/results');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="ml-3 text-gray-600">Cargando resultado...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a resultados</span>
        </button>

        {/* Error/Coming Soon Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Resultado #{resultId}
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver todos los resultados
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a resultados</span>
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No se encontró el resultado solicitado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver a resultados</span>
      </button>

      {/* Result Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {result.test_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Asignado: {new Date(result.assigned_at).toLocaleDateString('es-ES')}
              </span>
              {result.completed_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Completado: {new Date(result.completed_at).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : result.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {result.status === 'completed' ? 'Completado' : result.status === 'pending' ? 'Pendiente' : 'Expirado'}
          </div>
        </div>
      </div>

      {/* Result Content */}
      {result.status === 'completed' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Resultados
          </h2>
          
          {result.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen</h3>
              <p className="text-gray-600">{result.summary}</p>
            </div>
          )}

          {result.score !== undefined && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Puntuación</h3>
              <div className="text-3xl font-bold text-violet-600">{result.score}%</div>
            </div>
          )}
        </div>
      )}

      {result.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Test pendiente</h2>
          <p className="text-gray-600 mb-4">
            Aún no has completado este test. Accede desde la sección de Tests para realizarlo.
          </p>
          <button
            onClick={() => router.push('/dashboard/patient/tests')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Ir a Tests
          </button>
        </div>
      )}
    </div>
  );
}
