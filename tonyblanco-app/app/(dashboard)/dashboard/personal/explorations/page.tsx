'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import PersonalResultsSection from '@/components/PersonalResultsSection';

/**
 * Personal Explorations Page
 * 
 * Shows saved exploration results for personal users.
 */
export default function PersonalExplorationsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/login');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'personal' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Mis exploraciones
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Revisa tus exploraciones anteriores y profundiza en tus resultados
        </p>
      </div>

      <PersonalResultsSection />
    </div>
  );
}
