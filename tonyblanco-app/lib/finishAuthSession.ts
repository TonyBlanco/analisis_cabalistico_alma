import { setAuthToken, setUserRole, type UserRole } from '@/lib/auth';
import { getUserRole, type UserRole as ResolvedRole } from '@/lib/getUserRole';

export function dashboardPathForRole(role: ResolvedRole | null): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'therapist':
      return '/dashboard/therapist';
    case 'personal':
      return '/dashboard/personal';
    case 'patient':
      return '/dashboard/patient';
    default:
      return '/dashboard';
  }
}

/** Guarda token y devuelve la ruta del dashboard según /api/me/. */
export async function completeAuthFromToken(
  token: string,
  hintedRole?: string
): Promise<string> {
  setAuthToken(token);
  if (
    hintedRole === 'therapist' ||
    hintedRole === 'personal' ||
    hintedRole === 'patient'
  ) {
    setUserRole(hintedRole as UserRole);
  } else if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
  }
  const role = await getUserRole();
  return dashboardPathForRole(role);
}