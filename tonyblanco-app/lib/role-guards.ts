'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'therapist' | 'personal' | 'patient';

interface RoleGuardOptions {
  currentUserRole: Role | null | undefined;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function useRoleGuard({
  currentUserRole,
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    if (!currentUserRole) return;

    if (!allowedRoles.includes(currentUserRole)) {
      router.replace(redirectTo);
    }
  }, [currentUserRole, allowedRoles, redirectTo, router]);

  return {
    authorized: !!currentUserRole && allowedRoles.includes(currentUserRole),
  };
}

