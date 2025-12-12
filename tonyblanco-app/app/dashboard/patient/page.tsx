'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientRoute from '@/components/PatientRoute';
import { getAuthToken, getUserRole, getUsername } from '@/lib/auth';
import { Activity, FileText, Calendar, User, Sparkles, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface TestResult {
  id: number;
  test_id: string;
  score: number;
  clinical_diagnosis: string;
  angel_remedy: string;
  created_at: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Cargar datos del usuario
    const userUsername = getUsername();
    setUsername(userUsername);
    setLoading(false);

    // Cargar resultados de tests
    loadTestResults(token);
  }, [router]);

  const loadTestResults = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/results/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.slice(0, 5)); // Mostrar últimos 5
      }
    } catch (error) {
      console.error('Error cargando resultados:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientRoute>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#D4AF37' }}>
              Hola, {username || 'Paciente'} 👋
            </h1>
            <p className="text-gray-400">Tu espacio personal de seguimiento y crecimiento</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tests Completados</p>
                  <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>0</p>
                </div>
                <Activity className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Resultados Guardados</p>
                  <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>0</p>
                </div>
                <FileText className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Próxima Sesión</p>
                  <p className="text-lg font-semibold text-gray-300">-</p>
                </div>
                <Calendar className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>
          </div>

          {/* Sección: Mis Tareas */}
          <div className="mb-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#D4AF37' }}>
              <CheckCircle className="w-6 h-6" />
              Mis Tareas
            </h2>
            <p className="text-gray-400 mb-4">
              Tests recomendados por tu terapeuta o disponibles para ti.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/tests')}
                className="w-full bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
              >
                <Activity className="w-6 h-6" />
                Ver Catálogo de Tests
              </button>
              <p className="text-sm text-gray-500 text-center mt-2">
                Explora los 15 tests disponibles y encuentra el que mejor se adapte a ti
              </p>
            </div>
          </div>

          {/* Sección: Mi Camino */}
          <div className="mb-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#D4AF37' }}>
              <Sparkles className="w-6 h-6" />
              Mi Camino
            </h2>
            <p className="text-gray-400 mb-4">
              Tu historial de tests realizados. Cada resultado es un paso en tu camino de crecimiento.
            </p>
            
            {loadingResults ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando tu historial...</p>
              </div>
            ) : testResults.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aún no has completado ningún test</p>
                <p className="text-sm text-gray-500 mb-4">Comienza tu camino realizando tu primer test</p>
                <button
                  onClick={() => router.push('/tests')}
                  className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-all"
                >
                  Ver Tests Disponibles
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((testResult) => (
                  <div
                    key={testResult.id}
                    onClick={() => router.push(`/dashboard/patient/results/${testResult.id}`)}
                    className="bg-slate-800/50 hover:bg-slate-800/70 p-4 rounded-lg border border-slate-600 cursor-pointer transition-all hover:border-[#D4AF37]/50 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                          <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                            {testResult.test_id.toUpperCase()}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            Ángel: <span className="text-[#D4AF37] font-semibold">{testResult.angel_remedy}</span>
                          </span>
                          <span className="text-gray-500">
                            {new Date(testResult.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4AF37] mb-1">
                          {testResult.score}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-sm text-gray-300 italic">
                        "Tu guía espiritual está lista. Haz clic para ver tu análisis completo."
                      </p>
                    </div>
                  </div>
                ))}
                {testResults.length >= 5 && (
                  <button
                    onClick={() => router.push('/dashboard/patient/results')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-600"
                  >
                    Ver Todos los Resultados
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="mt-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: '#D4AF37' }} />
              Mi Perfil
            </h2>
            <p className="text-gray-400 mb-4">
              Gestiona tu información personal y preferencias.
            </p>
            <button
              onClick={() => router.push('/dashboard/account')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all border border-slate-600"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </PatientRoute>
  );
}

