'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';

/**
 * Basic Analysis Page (Personal)
 * 
 * Placeholder page for personal self-guided cabalistic analysis tools.
 * This is NOT a clinical tool - it's for personal reflection only.
 */
export default function BasicAnalysisPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      // Only personal and admin (for simulation) can access
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/dashboard',
  });

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Análisis Cabalístico Básico
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Herramienta de auto-reflexión y exploración personal
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/personal')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            Esta herramienta está diseñada para exploración personal y auto-reflexión.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            El análisis cabalístico básico te permite descubrir aspectos de tu nombre y fecha de nacimiento
            desde una perspectiva espiritual y personal.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Esta herramienta está en desarrollo. Próximamente podrás realizar
              análisis personalizados desde aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
