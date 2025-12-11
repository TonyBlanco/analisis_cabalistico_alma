'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership, MembershipStatus } from '@/lib/auth';
import { 
  Users, Calendar, FileText, Activity, 
  Settings, Bell, Search, Menu, X,
  Plus, TrendingUp, Clock,
  UserPlus, ClipboardList, BarChart3, Archive
} from 'lucide-react';

export default function TherapistDashboard() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const membershipData = await requireMembership(['therapist'], '/membership-expired');
      if (membershipData) {
        setMembership(membershipData);
      }
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Activity className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-semibold text-gray-900">
                  Camino del Alma
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Usuario</p>
                  <p className="text-xs text-gray-500 capitalize">{membership.subscription_plan || 'premium'}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out lg:w-64`}>
          <nav className="px-3 py-4 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Principal
            </div>
            <a href="/dashboard/therapist" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
              <Activity className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <a href="/therapist/patients" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <Users className="mr-3 h-5 w-5" />
              Pacientes
            </a>
            <a href="/therapist/sessions" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <Calendar className="mr-3 h-5 w-5" />
              Sesiones
            </a>
            <a href="/calcular" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <FileText className="mr-3 h-5 w-5" />
              Análisis
            </a>

            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6">
              Herramientas
            </div>
            <a href="/tests" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <ClipboardList className="mr-3 h-5 w-5" />
              Tests Modulares
            </a>
            <a href="/therapist/reports" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <BarChart3 className="mr-3 h-5 w-5" />
              Reportes
            </a>
            <a href="/therapist/archive" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <Archive className="mr-3 h-5 w-5" />
              Archivo
            </a>

            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6">
              Configuración
            </div>
            <a href="/settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <Settings className="mr-3 h-5 w-5" />
              Configuración
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
              <p className="text-sm text-gray-600">Pacientes Activos</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
              <p className="text-sm text-gray-600">Sesiones este mes</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
              <p className="text-sm text-gray-600">Fichas Creadas</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">0%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">0%</h3>
              <p className="text-sm text-gray-600">Tasa de Retención</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/tests')}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-sm transition-all"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                📊 Tests Modulares
              </button>
              <button
                onClick={() => router.push('/therapist/patients/new')}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm transition-all"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                + Nuevo Paciente
              </button>
              <button
                onClick={() => router.push('/therapist/sessions/new')}
                className="flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                + Registrar Sesión
              </button>
              <button
                onClick={() => router.push('/calcular')}
                className="flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition-all"
              >
                <FileText className="h-5 w-5 mr-2" />
                + Nuevo Análisis
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay actividad reciente</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Comienza agregando tu primer paciente
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Próximas Sesiones</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay sesiones programadas</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Las sesiones aparecerán aquí
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
