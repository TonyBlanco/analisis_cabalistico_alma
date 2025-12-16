'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';

/**
 * Proceso - Panel Paciente
 * 
 * Vista principal: Información del proceso terapéutico
 * El paciente ve el estado de su proceso, no herramientas de control
 */
export default function PatientProcessPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [user, setUser] = useState<any>(null);
  const [therapist, setTherapist] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
        if (session.user.therapist) {
          setTherapist(session.user.therapist);
        }
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
              Mi Proceso
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Información sobre tu proceso de acompañamiento
            </p>
          </div>
        </div>
      </div>

      {/* Process Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {/* Estado del proceso */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Estado</h3>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              En acompañamiento
            </div>
          </div>

          {/* Terapeuta */}
          {therapist && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tu terapeuta</h3>
              <p className="text-base text-gray-900">
                {therapist.full_name || therapist.username || 'No disponible'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contacta a tu terapeuta si tienes preguntas sobre tu proceso.
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Información</h3>
            <p className="text-sm text-gray-600">
              Tu terapeuta gestiona tu proceso de acompañamiento. Aquí puedes consultar
              el estado general y la información relevante para ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
