'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';

/**
 * Cuenta - Panel Paciente
 * 
 * Vista simple: Perfil del paciente, preferencias
 * ❌ Nada clínico aquí
 */
export default function PatientAccountPage() {
  const router = useRouter();
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (session.user) {
        // Redirect to account page (existing)
        router.replace('/dashboard/account');
      }
    };
    if (authorized && role === 'patient') {
      load();
    }
  }, [authorized, role, router]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-sm text-gray-500">Redirigiendo a tu cuenta...</p>
      </div>
    </div>
  );
}
