'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';

/**
 * Recursos - Panel Paciente
 * 
 * Vista principal: Recursos accesibles para el paciente
 * El paciente solo ve recursos asignados o adquiridos
 */
export default function PatientResourcesPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
      }
    };
    load();
  }, []);

  if (roleLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized || role !== 'patient') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Recursos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Accede a recursos asignados por tu terapeuta o adquiridos
            </p>
          </div>
        </div>
      </div>

      {/* Resource Catalog */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            Catálogo de recursos (en desarrollo)
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Los recursos asignados o adquiridos aparecerán aquí
          </p>
        </div>
      </div>
    </div>
  );
}
