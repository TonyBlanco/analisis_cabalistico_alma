'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Users, TrendingUp, LogOut, Eye, EyeOff, Download, GraduationCap, BookOpen, Package, Settings } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useRoleGuard } from '@/lib/role-guards';
import RoleBadge from '@/components/RoleBadge';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  full_name: string;
  user_type: string;
  is_admin: boolean;
  profile?: {
    subscription_status: string;
    current_patients_count: number;
    fichas_created_this_month: number;
    subscription_plan?: string;
    membership_active?: boolean;
    membership_expires?: string;
    full_name?: string;
  };
}

interface AdminStats {
  total_users: number;
  therapists: number;
  personal_users: number;
  total_fichas: number;
  active_subscriptions: number;
  total_courses?: number;
  total_enrollments?: number;
  total_course_revenue?: number;
  total_tests?: number;
  total_test_results?: number;
}

/**
 * Panel de Administración - SOLO para usuarios con rol 'admin'
 * 
 * REGLAS:
 * - Solo admins pueden acceder
 * - NO pueden ejecutar tests clínicos
 * - NO pueden actuar como pacientes
 * - Acceso de solo lectura a datos clínicos
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'tests'>('overview');

  // Guard estricto: solo admins
  const { loading: guardLoading, authorized } = useRoleGuard({
    allowedRoles: ['admin'],
    redirectTo: '/dashboard',
    show403: true
  });

  useEffect(() => {
    if (authorized) {
      checkAuth();
    }
  }, [authorized]);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Verificar que el usuario es admin
      const response = await fetch(`${API_BASE_URL}/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (!userData.is_admin) {
          router.push('/dashboard');
          return;
        }
        setIsAdmin(true);
        setIsAuthenticated(true);
        fetchStats();
        fetchUsers();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/stats/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const activateMembership = async (userId: number) => {
    const plan = prompt('Plan de membresía (personal/professional/premium):');
    const months = prompt('Duración en meses:', '1');

    if (!plan || !months) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payments/activate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          subscription_plan: plan,
          duration_months: parseInt(months),
        }),
      });

      if (response.ok) {
        alert('Membresía activada correctamente');
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error activating membership:', error);
      alert('Error al activar membresía');
    }
  };

  const grantTestAccess = async (userId: number) => {
    const testCode = prompt('Código del test (ej: complete-numerology):');
    const uses = prompt('Número de usos (dejar vacío para ilimitado):', '');

    if (!testCode) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tests/grant-access/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          test_code: testCode,
          special_uses: uses ? parseInt(uses) : null,
        }),
      });

      if (response.ok) {
        alert('Acceso especial otorgado');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error granting test access:', error);
      alert('Error al otorgar acceso');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        alert('Usuario eliminado correctamente');
        fetchUsers();
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExportUsers = () => {
    const csv = [
      ['ID', 'Usuario', 'Email', 'Nombre Completo', 'Tipo', 'Suscripción'].join(','),
      ...users.map(u => [
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.user_type,
        u.profile?.subscription_status || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.user_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (guardLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Acceso denegado. Solo administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            {/* Role Badge - MANDATORY */}
            <RoleBadge />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex gap-4">
            {[
              { id: 'overview', label: '📊 Resumen', icon: BarChart3 },
              { id: 'users', label: '👥 Usuarios', icon: Users },
              { id: 'courses', label: '🎓 Cursos LMS', icon: GraduationCap },
              { id: 'tests', label: '📝 Tests', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Usuarios Totales"
                value={stats.total_users}
                color="blue"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Terapeutas"
                value={stats.therapists}
                color="green"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Usuarios Personales"
                value={stats.personal_users}
                color="purple"
              />
              <StatCard
                icon={<BarChart3 className="w-6 h-6" />}
                label="Fichas Totales"
                value={stats.total_fichas}
                color="yellow"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Suscripciones Activas"
                value={stats.active_subscriptions}
                color="red"
              />
            </div>

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <button
                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/admin/`, '_blank')}
                className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-xl p-6 text-left transition-all transform hover:scale-105"
              >
                <Settings className="w-10 h-10 mb-3" />
                <h3 className="text-lg font-bold mb-2">Django Admin</h3>
                <p className="text-sm opacity-90">Panel completo de administración</p>
              </button>

              <button
                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/admin/courses/`, '_blank')}
                className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-xl p-6 text-left transition-all transform hover:scale-105"
              >
                <GraduationCap className="w-10 h-10 mb-3" />
                <h3 className="text-lg font-bold mb-2">Gestionar Cursos</h3>
                <p className="text-sm opacity-90">Crear y editar cursos LMS</p>
              </button>

              <button
                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/admin/api/testmodule/`, '_blank')}
                className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 rounded-xl p-6 text-left transition-all transform hover:scale-105"
              >
                <BookOpen className="w-10 h-10 mb-3" />
                <h3 className="text-lg font-bold mb-2">Tests Modulares</h3>
                <p className="text-sm opacity-90">Configurar tests y módulos</p>
              </button>

              <button
                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/admin/api/service/`, '_blank')}
                className="bg-gradient-to-br from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 rounded-xl p-6 text-left transition-all transform hover:scale-105"
              >
                <Package className="w-10 h-10 mb-3" />
                <h3 className="text-lg font-bold mb-2">Servicios</h3>
                <p className="text-sm opacity-90">Gestionar servicios y bookings</p>
              </button>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Gestión de Usuarios
              </h2>
              <button
                onClick={handleExportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por usuario, email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todos</option>
                <option value="personal">Personales</option>
                <option value="therapist">Terapeutas</option>
              </select>
            </div>

            {/* Tabla de Usuarios Mejorada */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                    <th className="text-left px-4 py-3 font-semibold">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold">Estado</th>
                    <th className="text-left px-4 py-3 font-semibold">Expira</th>
                    <th className="text-left px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{user.profile?.full_name || user.username}</p>
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.user_type === 'therapist'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-blue-900 text-blue-200'
                          }`}>
                            {user.user_type === 'therapist' ? '💼 Terapeuta' : '👤 Personal'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            {user.profile?.subscription_plan || 'free'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.profile?.membership_active
                              ? 'bg-green-900 text-green-200'
                              : 'bg-red-900 text-red-200'
                          }`}>
                            {user.profile?.membership_active ? '✓ Activa' : '✗ Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {user.profile?.membership_expires 
                            ? new Date(user.profile.membership_expires).toLocaleDateString('es-ES')
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => activateMembership(user.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-xs rounded transition"
                              title="Activar membresía"
                            >
                              ✓ Activar
                            </button>
                            <button
                              onClick={() => grantTestAccess(user.id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-xs rounded transition"
                              title="Otorgar acceso a test"
                            >
                              🎁 Test
                            </button>
                            {user.username !== 'supertony' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-xs rounded transition"
                                title="Eliminar usuario"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🎓 Sistema LMS - Gestión de Cursos</h2>
            <div className="grid gap-6">
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-2xl font-bold">{stats.total_courses || 0}</p>
                    <p className="text-sm text-gray-400">Cursos Publicados</p>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-2xl font-bold">{stats.total_enrollments || 0}</p>
                    <p className="text-sm text-gray-400">Inscripciones Totales</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                    <p className="text-2xl font-bold">${stats.total_course_revenue || 0}</p>
                    <p className="text-sm text-gray-400">Ingresos por Cursos</p>
                  </div>
                </div>
              )}

              {/* Admin Links */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">🔧 Administración de Cursos</h3>
                <p className="text-gray-400 mb-4">
                  Gestiona todo el sistema LMS desde el panel de Django. Crea cursos, módulos, lecciones, 
                  sube recursos, gestiona inscripciones y mucho más.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href={`${API_BASE_URL.replace('/api', '')}/admin/courses/course/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-center"
                  >
                    <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Ver Cursos</p>
                  </a>
                  <a
                    href={`${API_BASE_URL.replace('/api', '')}/admin/courses/course/add/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center"
                  >
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Crear Curso Nuevo</p>
                  </a>
                  <a
                    href={`${API_BASE_URL.replace('/api', '')}/admin/courses/courseenrollment/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Ver Inscripciones</p>
                  </a>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2 text-blue-400">📚 Características del LMS</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• <strong>Cursos Completos:</strong> Crea cursos con módulos, lecciones, videos, PDFs y recursos</li>
                  <li>• <strong>Multimedia:</strong> Integración con YouTube, Vimeo, Wistia y videos personalizados</li>
                  <li>• <strong>Progreso del Estudiante:</strong> Tracking automático de progreso y tiempo dedicado</li>
                  <li>• <strong>Certificados:</strong> Emisión automática al completar el curso</li>
                  <li>• <strong>Sistema de Precios:</strong> Cursos gratuitos o de pago en USD/EUR con descuentos</li>
                  <li>• <strong>Reseñas:</strong> Sistema de calificaciones y comentarios de estudiantes</li>
                </ul>
              </div>

              {/* Category Management */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">📁 Gestión de Categorías</h3>
                <div className="flex gap-4">
                  <a
                    href={`${API_BASE_URL.replace('/api', '')}/admin/courses/coursecategory/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    📂 Ver Categorías
                  </a>
                  <a
                    href={`${API_BASE_URL.replace('/api', '')}/admin/courses/coursecategory/add/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    ➕ Nueva Categoría
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Tests Modulares</h2>
            <div className="grid gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">📊 Estadísticas de Tests</h3>
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-2xl font-bold">{stats.total_tests}</p>
                      <p className="text-sm text-gray-400">Tests Disponibles</p>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-2xl font-bold">{stats.total_test_results}</p>
                      <p className="text-sm text-gray-400">Tests Realizados</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">🔧 Administración de Tests</h3>
                <p className="text-gray-400 mb-4">
                  Para gestionar los módulos de tests (activar/desactivar, cambiar límites, configurar precios), 
                  accede al panel de administración de Django:
                </p>
                <div className="flex gap-4">
                  <a
                    href="http://127.0.0.1:8000/admin/api/testmodule/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    🔗 Gestionar Tests
                  </a>
                  <a
                    href="http://127.0.0.1:8000/admin/api/usertestaccess/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    👥 Ver Accesos
                  </a>
                  <a
                    href="http://127.0.0.1:8000/admin/api/testresult/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    📊 Ver Resultados
                  </a>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2 text-yellow-400">💡 Guía Rápida</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• <strong>Activar Membresía:</strong> Usa el botón "✓ Activar" en la tabla de usuarios</li>
                  <li>• <strong>Otorgar Test Especial:</strong> Usa el botón "🎁 Test" para dar acceso temporal a un test específico</li>
                  <li>• <strong>Códigos de Tests:</strong> basic-analysis, complete-numerology, couple-compatibility, etc.</li>
                  <li>• <strong>Planes:</strong> personal (€29), professional (€49/mes), premium (€99/mes)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-900 border-blue-700 text-blue-200',
    green: 'bg-green-900 border-green-700 text-green-200',
    purple: 'bg-purple-900 border-purple-700 text-purple-200',
    yellow: 'bg-yellow-900 border-yellow-700 text-yellow-200',
    red: 'bg-red-900 border-red-700 text-red-200',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-75">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
