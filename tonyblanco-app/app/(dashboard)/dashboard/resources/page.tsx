'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import TherapistResourcesPage from '@/components/Resources/TherapistResourcesPage';
import PersonalResourcesPage from '@/components/Resources/PersonalResourcesPage';
import PatientResourcesPage from '@/components/Resources/PatientResourcesPage';
import AdminResourcesPage from '@/components/Resources/AdminResourcesPage';

/**
 * Resources Page Router
 * 
 * Routes to role-specific resources pages:
 * - Therapist: Manage and assign resources
 * - Personal: View available resources
 * - Patient: View assigned resources (read-only)
 */
export default function ResourcesPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['therapist', 'personal', 'patient', 'admin'],
    redirectTo: '/dashboard',
  });

  if (loading || !role) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Route to role-specific component
  if (role === 'admin') {
    return <AdminResourcesPage />;
  } else if (role === 'therapist') {
    return <TherapistResourcesPage />;
  } else if (role === 'personal') {
    return <PersonalResourcesPage />;
  } else if (role === 'patient') {
    return <PatientResourcesPage />;
  }

  return null;
}
