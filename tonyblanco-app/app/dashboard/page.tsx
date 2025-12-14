"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership } from '@/lib/auth';
import { getUserStrictRole } from '@/lib/role-guards';

/**
 * Dashboard Raíz - Redirección Estricta por Rol
 * 
 * PRINCIPIO: Un usuario tiene UN SOLO rol activo a la vez
 * - admin → /admin
 * - therapist → /dashboard/therapist
 * - personal → /dashboard/personal
 * - patient → /dashboard/patient
 */
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      const membership = await requireMembership(undefined, '/membership-expired');
      
      if (!membership) {
        setLoading(false);
        return;
      }

      // Obtener rol estricto del usuario
      const strictRole = await getUserStrictRole();
      
      if (!strictRole) {
        // Si no se puede determinar el rol, redirigir a login
        router.replace('/login');
        setLoading(false);
        return;
      }

      // Redirigir según rol estricto
      switch (strictRole) {
        case 'admin':
          router.replace('/admin');
          break;
        case 'therapist':
          router.replace('/dashboard/therapist');
          break;
        case 'personal':
          router.replace('/dashboard/personal');
          break;
        case 'patient':
          router.replace('/dashboard/patient');
          break;
        default:
          // Fallback seguro
          router.replace('/dashboard/personal');
      }
      
      setLoading(false);
    };
    
    redirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return null;
}
