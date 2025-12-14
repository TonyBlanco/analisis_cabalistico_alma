/**
 * Determines the active dashboard role based on the current route pathname.
 * This is used ONLY for visual theming and UI context.
 * 
 * @param pathname - Current route pathname (e.g., "/dashboard/therapist")
 * @returns The role identifier or null if no match
 */
export function getActiveDashboardRole(pathname: string): 'admin' | 'therapist' | 'personal' | 'patient' | null {
  if (pathname.startsWith('/dashboard/admin')) {
    return 'admin';
  }
  if (pathname.startsWith('/dashboard/therapist')) {
    return 'therapist';
  }
  if (pathname.startsWith('/dashboard/personal')) {
    return 'personal';
  }
  if (pathname.startsWith('/dashboard/patient')) {
    return 'patient';
  }
  return null;
}

