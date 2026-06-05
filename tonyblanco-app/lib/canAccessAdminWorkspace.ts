import { fetchSession } from './session';

/** Panel /dashboard/admin — independiente del rol de navegación (therapist, personal, …). */
export async function canAccessAdminWorkspace(): Promise<boolean> {
  const session = await fetchSession();
  if (!session.isAuthenticated || !session.user) return false;
  const u = session.user as Record<string, unknown>;
  if (u.can_access_admin_workspace === true) return true;
  if (u.is_admin === true || u.is_superuser === true) return true;
  return false;
}