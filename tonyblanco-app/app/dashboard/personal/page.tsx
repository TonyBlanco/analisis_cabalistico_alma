'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import RoleBadge from '@/components/RoleBadge';
import { 
  User, FileText, Clock, Settings, LogOut,
  BookOpen, Activity, TrendingUp, ArrowRight
} from 'lucide-react';
import { getAuthToken, logout } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';
import { getTestResults } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';

interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  user_type: string;
}

interface UserStats {
  total_tests: number;
  tests_this_month: number;
  available_tests: number;
  total_results: number;
}

/**
 * Dashboard Personal - SOLO para usuarios con rol 'personal'
 * 
 * REGLAS:
 * - Solo usuarios personales pueden acceder
 * - NO pueden ver pacientes
 * - NO pueden ejecutar tests clínicos
 * - Solo tests patient_self disponibles
 */
export default function PersonalDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Guard estricto: solo usuarios personales
  const { loading: guardLoading, authorized } = useRoleGuard({
    allowedRoles: ['personal'],
    redirectTo: '/dashboard'
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!authorized) return;

      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Cargar perfil del usuario
        const profileResponse = await fetch(`${API_BASE_URL}/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUserProfile(userData);
        }

        // Cargar estadísticas
        const statsResponse = await fetch(`${API_BASE_URL}/tests/stats/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setUserStats(stats);
        }

        // Cargar resultados recientes
        try {
          const results = await getTestResults();
          setRecentResults(results.slice(0, 5)); // Últimos 5
        } catch (error) {
          console.error('Error cargando resultados:', error);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authorized) {
      loadUserData();
    }
  }, [authorized, router]);

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      router.push('/login?force_login=true');
    }
  };

  if (guardLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {userProfile?.full_name || userProfile?.first_name || 'Usuario'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Dashboard Personal
                </p>
              </div>
              <RoleBadge />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/account')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Bienvenido
          </h2>
          <p className="text-gray-600 text-sm">
            Este es tu espacio personal para realizar análisis y tests disponibles según tu membresía.
            Los tests clínicos y evaluaciones profesionales no están disponibles en este dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tests Disponibles</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {userStats.available_tests || 0}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tests Realizados</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {userStats.total_results || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Este Mes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {userStats.tests_this_month || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {userStats.total_tests || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Personal Tools Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Herramientas Disponibles
            </h3>
            <button
              onClick={() => router.push('/tests')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Accede a tests y análisis personales. Estos tests son auto-administrados y están diseñados para uso personal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/tests')}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Catálogo de Tests</p>
                  <p className="text-sm text-gray-500">Explorar tests disponibles</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/tests/results')}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Mis Resultados</p>
                  <p className="text-sm text-gray-500">Ver historial de tests</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h3>
            {recentResults.length > 0 && (
              <button
                onClick={() => router.push('/tests/results')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todo
              </button>
            )}
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No hay actividad reciente</p>
              <p className="text-sm text-gray-500 mb-4">
                Comienza realizando tu primer test
              </p>
              <button
                onClick={() => router.push('/tests')}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Ver Tests Disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => router.push(`/tests/results/${result.id}`)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {result.test_module?.name || result.test_id || 'Test'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.created_at 
                          ? new Date(result.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
