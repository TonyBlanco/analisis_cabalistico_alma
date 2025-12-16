'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole, UserRole as SessionUserRole } from '@/lib/getUserRole';

type Role = 'admin' | 'therapist' | 'personal' | 'patient';

interface RoleGuardOptions {
  allowedRoles: Role[];
  redirectTo?: string;
}

interface RoleGuardResult {
  role: SessionUserRole;
  loading: boolean;
  authorized: boolean;
}

/**
 * useRoleGuard
 *
 * Seguridad:
 * - Siempre obtiene el rol desde /api/me vía getUserRole() (nunca de props, storage ni caché manual).
 * - No renderiza contenido autorizado hasta que la llamada se resuelve.
 * - Si el rol no está permitido o no existe, redirige a redirectTo.
 */
export function useRoleGuard({
  allowedRoles,
  redirectTo = '/login',
}: RoleGuardOptions): RoleGuardResult {
  const router = useRouter();
  const [role, setRole] = useState<SessionUserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkRole = async () => {
      try {
        const userRole = await getUserRole();
        if (cancelled) return;

        setRole(userRole);
        setLoading(false);

        // Si no hay rol o no está permitido, redirigir
        if (!userRole || !allowedRoles.includes(userRole as Role)) {
          router.replace(redirectTo);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        if (!cancelled) {
          setRole(null);
          setLoading(false);
          router.replace(redirectTo);
        }
      }
    };

    checkRole();

    return () => {
      cancelled = true;
    };
  }, [allowedRoles, redirectTo, router]);

  const authorized = !!role && allowedRoles.includes(role as Role);

  return {
    role,
    loading,
    authorized,
  };
}
