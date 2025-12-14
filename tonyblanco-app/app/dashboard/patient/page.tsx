'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import RoleBadge from '@/components/RoleBadge';
import { 
  User, FileText, Clock, Settings, LogOut,
  ClipboardList, CheckCircle, AlertCircle, ArrowRight, Eye
} from 'lucide-react';
import { getAuthToken, logout } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';
import { getTestResults } from '@/lib/test-api';
import { TestResult } from '@/lib/test-types';
import { isPatientSelfAdministered } from '@/lib/test-execution-modes';

interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  user_type: string;
}

/**
 * Dashboard Patient - SOLO para usuarios con rol 'patient'
 * 
 * REGLAS:
 * - Solo pacientes pueden acceder
 * - Solo ven tests patient_self asignados
 * - NO pueden ver evaluaciones clínicas
 * - NO pueden auto-asignarse tests
 */
export default function PatientDashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [assignedTests, setAssignedTests] = useState<TestResult[]>([]);
  const [completedTests, setCompletedTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Guard estricto: solo pacientes
  const { loading: guardLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
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

        // Cargar resultados de tests (solo patient_self)
        try {
          const allResults = await getTestResults();
          
          // Filtrar solo tests patient_self
          const patientSelfResults = allResults.filter(result => {
            const testCode = result.test_module?.code || result.test_id || '';
            return isPatientSelfAdministered(testCode);
          });

          // Separar por estado (por ahora todos están completados)
          // Future: Implementar estados assigned/in_progress/completed
          setCompletedTests(patientSelfResults);
          setAssignedTests([]); // Por ahora vacío hasta implementar sistema de asignación
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
                  {userProfile?.full_name || userProfile?.first_name || 'Paciente'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Dashboard de Paciente
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
            Este es tu espacio personal. Aquí puedes ver los tests asignados por tu terapeuta
            y acceder a tus resultados. Los tests clínicos y evaluaciones profesionales
            son realizados directamente por tu terapeuta y no aparecen aquí.
          </p>
        </div>

        {/* Assigned Tests Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tests Asignados
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Tests que tu terapeuta ha asignado para que completes por ti mismo.
          </p>

          {assignedTests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No hay tests asignados</p>
              <p className="text-sm text-gray-500">
                Tu terapeuta te asignará tests cuando sea necesario
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {test.test_module?.name || test.test_id || 'Test'}
                      </p>
                      <p className="text-sm text-gray-500">Pendiente de completar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/tests/${test.test_module?.code || test.test_id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Comenzar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tests Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Tests Completados
              </h3>
            </div>
            {completedTests.length > 0 && (
              <button
                onClick={() => router.push('/tests/results')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </button>
            )}
          </div>

          {completedTests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No hay tests completados</p>
              <p className="text-sm text-gray-500">
                Los resultados de tus tests aparecerán aquí una vez completados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTests.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  onClick={() => router.push(`/tests/results/${result.id}`)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
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
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Información Importante
              </h4>
              <p className="text-sm text-blue-800">
                Solo puedes ver y completar tests asignados por tu terapeuta.
                Las evaluaciones clínicas son realizadas directamente por tu terapeuta
                y no aparecen en este dashboard. Si tienes preguntas, contacta a tu terapeuta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
