'use client';

import { useRoleGuard } from '@/lib/role-guards';

/**
 * Patient Process Page
 *
 * Route: /dashboard/patient/process
 *
 * Shows patient's therapeutic process overview.
 * Patient-only access.
 */
export default function PatientProcessPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!authorized || role !== 'patient') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Proceso</h1>
        <p className="text-gray-600 mt-2">
          Visualiza el seguimiento de tu proceso terapéutico.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">
          Esta sección está en desarrollo. Próximamente podrás ver el seguimiento de tu proceso terapéutico.
        </p>
      </div>
    </div>
  );
}
