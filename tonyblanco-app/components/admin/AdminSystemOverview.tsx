'use client';

import { AdminStats } from '@/lib/admin-api';
import { Users, Activity, FileText, TrendingUp, Calendar } from 'lucide-react';

interface AdminSystemOverviewProps {
  stats: AdminStats | null;
}

/**
 * Sección de Resumen del Sistema - KPIs (solo conteos)
 */
export default function AdminSystemOverview({ stats }: AdminSystemOverviewProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Usuarios Totales',
      value: stats.total_users,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Terapeutas',
      value: stats.therapists,
      icon: Activity,
      color: 'green',
    },
    {
      label: 'Usuarios Personales',
      value: stats.personal_users,
      icon: Users,
      color: 'gray',
    },
    {
      label: 'Membresías Activas',
      value: stats.active_memberships,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Tests Disponibles',
      value: stats.total_tests,
      icon: FileText,
      color: 'orange',
    },
    {
      label: 'Tests Ejecutados',
      value: stats.total_test_results,
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'Fichas Totales',
      value: stats.total_fichas,
      icon: FileText,
      color: 'gray',
    },
    {
      label: 'Nuevos Esta Semana',
      value: stats.new_users_this_week,
      icon: Calendar,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${colorClasses[card.color as keyof typeof colorClasses]} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/admin/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Django Admin</p>
              <p className="text-sm text-gray-600">Panel completo de administración</p>
            </div>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/admin/courses/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Gestión de Cursos</p>
              <p className="text-sm text-gray-600">LMS y contenido educativo</p>
            </div>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/admin/api/testmodule/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Módulos de Tests</p>
              <p className="text-sm text-gray-600">Configurar tests disponibles</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
