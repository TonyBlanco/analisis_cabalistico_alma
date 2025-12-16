'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { fetchSession } from '@/lib/session';

/**
 * Dashboard Root - Role-based redirector
 *
 * Esta página NO renderiza contenido.
 * Siempre obtiene el rol desde /api/me y redirige a:
 * - admin     → /dashboard/admin
 * - therapist → /dashboard/therapist
 * - personal  → /dashboard/personal
 * - patient   → /dashboard/patient
 *
 * Seguridad adicional:
 * - Fuerza fetchSession() en montaje para validar token con backend.
 * - Limpia estado específico de rol susceptible a contaminación entre dashboards.
 */
export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      // Siempre validar sesión primero (sin confiar en caché local)
      await fetchSession();

      // Limpieza defensiva de estado específico de rol (sin tocar authToken)
      if (typeof window !== 'undefined') {
        try {
          const ls = window.localStorage;
          ls.removeItem('therapist_active_patient_id');
          ls.removeItem('therapist_active_patient_name');
        } catch {
          // ignore
        }
      }

      const userRole = await getUserRole();

      switch (userRole) {
        case 'admin':
          router.replace('/dashboard/admin');
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
          router.replace('/login');
          break;
      }
    };

    handleRedirect();
  }, [router]);

  // Esta página nunca debería renderizar contenido visible
  return null;
}
