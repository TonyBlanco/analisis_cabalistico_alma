import type { AdminProApiResult } from '../admin-pro-api';

export type AdminSystemStatus = 'ok' | 'degraded' | 'unknown';

export type AdminSectionKind = 'system' | 'users' | 'platform' | 'lms' | 'config';

export type AdminRole = 'admin' | 'therapist' | 'personal' | 'patient' | 'visitor' | 'unknown';

export type AdminWorkspaceContractV2_1 = {
  meta: { version: 'admin-workspace.v2.1'; generated_at: string };
  system: {
    status: AdminSystemStatus;
    checks: Array<{ key: string; label: string; status: AdminSystemStatus; detail?: string }>;
    last_refresh_ms: number;
  };
  stats: {
    users_total?: number;
    users_by_role?: Record<string, number>;
    extras?: Record<string, number | string>;
  };
  users: {
    items: AdminUserRow[];
    capabilities: { can_patch_role: boolean; can_patch_active: boolean; can_delete: boolean };
  };
  ui: {
    sections: Array<{ id: string; title: string; enabled: boolean; kind: AdminSectionKind }>;
    density: 'compact';
  };
};

export type AdminUserRow = {
  id: number;
  email: string;
  username?: string;
  role: AdminRole;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
  flags?: string[];
};

const warned = new Set<string>();

function warnOnce(key: string, ...args: any[]) {
  if (warned.has(key)) return;
  warned.add(key);
  // Required by spec: warn on unexpected backend shapes.
  // eslint-disable-next-line no-console
  console.warn(...args);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function normalizeRole(raw: unknown): AdminRole {
  if (raw === 'admin' || raw === 'therapist' || raw === 'personal' || raw === 'patient' || raw === 'visitor') return raw;
  return 'unknown';
}

function extractUsersArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (isObject(raw)) {
    const candidates = ['results', 'users', 'items', 'data'];
    for (const key of candidates) {
      const value = (raw as any)[key];
      if (Array.isArray(value)) return value;
    }
  }

  warnOnce('admin.users.shape', '[AdminPro] Unexpected /api/admin/users/ shape. Rendering empty list.', raw);
  return [];
}

function normalizeUserRow(raw: unknown): AdminUserRow | null {
  if (!isObject(raw)) return null;

  const id = asNumber((raw as any).id);
  const email = (raw as any).email;

  if (typeof id !== 'number' || typeof email !== 'string') return null;

  const usernameValue = (raw as any).username;
  const username = typeof usernameValue === 'string' && usernameValue.trim() ? usernameValue : undefined;

  const profile = isObject((raw as any).profile) ? ((raw as any).profile as Record<string, unknown>) : undefined;
  const roleCandidate = profile?.user_type ?? profile?.role ?? (raw as any).user_type ?? (raw as any).role;
  let role = normalizeRole(roleCandidate);
  if (role === 'unknown' && profile && (profile as any).is_admin === true) {
    role = 'admin';
  }
  if (role === 'unknown' && ((raw as any).is_staff === true || (raw as any).is_superuser === true)) {
    role = 'admin';
  }

  const isActive = (raw as any).is_active;
  const is_active = typeof isActive === 'boolean' ? isActive : false;

  const createdCandidate = (raw as any).created_at ?? (raw as any).date_joined;
  const created_at = typeof createdCandidate === 'string' && createdCandidate.trim() ? createdCandidate : undefined;

  const lastLoginCandidate = (raw as any).last_login;
  const last_login = typeof lastLoginCandidate === 'string' && lastLoginCandidate.trim() ? lastLoginCandidate : undefined;

  const flags: string[] = [];
  if ((raw as any).is_staff === true) flags.push('staff');
  if ((raw as any).is_superuser === true) flags.push('superuser');
  if (profile && (profile as any).is_admin === true) flags.push('is_admin');

  return {
    id,
    email,
    username,
    role,
    is_active,
    created_at,
    last_login,
    flags: flags.length ? flags : undefined,
  };
}

function computeUsersByRole(rows: AdminUserRow[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const u of rows) {
    const key = u.role;
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

function deriveStatsFromStatsEndpoint(statsData: unknown): {
  users_total?: number;
  users_by_role?: Record<string, number>;
  extras?: Record<string, number | string>;
} {
  if (!isObject(statsData)) return {};

  const raw = statsData as Record<string, unknown>;

  const users_total = asNumber(raw.total_users ?? raw.users_total ?? raw.users);

  const users_by_role: Record<string, number> = {};
  const therapists = asNumber(raw.therapists);
  const personal = asNumber(raw.personal_users ?? raw.personal);
  const patients = asNumber(raw.patients);
  const admins = asNumber(raw.admins);

  if (typeof admins === 'number') users_by_role.admin = admins;
  if (typeof therapists === 'number') users_by_role.therapist = therapists;
  if (typeof personal === 'number') users_by_role.personal = personal;
  if (typeof patients === 'number') users_by_role.patient = patients;

  const extras: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'total_users' || key === 'users_total' || key === 'users') continue;
    if (key === 'therapists' || key === 'personal_users' || key === 'personal' || key === 'patients' || key === 'admins') continue;

    if (typeof value === 'number' && Number.isFinite(value)) extras[key] = value;
    if (typeof value === 'string' && value.trim()) extras[key] = value;
  }

  return {
    users_total,
    users_by_role: Object.keys(users_by_role).length ? users_by_role : undefined,
    extras: Object.keys(extras).length ? extras : undefined,
  };
}

function statusFromResult(result: AdminProApiResult<unknown> | undefined): AdminSystemStatus {
  if (!result) return 'unknown';
  if (result.ok) return 'ok';
  if (result.status === 0) return 'degraded';
  return 'degraded';
}

export function buildAdminWorkspaceContractV2_1(args: {
  check?: AdminProApiResult<unknown>;
  stats?: AdminProApiResult<unknown>;
  users?: AdminProApiResult<unknown>;
  last_refresh_ms: number;
  capabilities: { can_patch_role: boolean; can_patch_active: boolean; can_delete: boolean };
}): AdminWorkspaceContractV2_1 {
  const generated_at = new Date().toISOString();

  const checks: AdminWorkspaceContractV2_1['system']['checks'] = [];

  checks.push({
    key: 'admin_check',
    label: 'Admin check',
    status: statusFromResult(args.check),
    detail: !args.check ? undefined : args.check.ok ? undefined : args.check.error,
  });

  checks.push({
    key: 'admin_stats',
    label: 'Stats',
    status: statusFromResult(args.stats),
    detail: !args.stats ? undefined : args.stats.ok ? undefined : args.stats.error,
  });

  checks.push({
    key: 'admin_users',
    label: 'Users',
    status: statusFromResult(args.users),
    detail: !args.users ? undefined : args.users.ok ? undefined : args.users.error,
  });

  let status: AdminSystemStatus = 'unknown';
  if (checks.some((c) => c.status === 'degraded')) status = 'degraded';
  else if (checks.some((c) => c.status === 'ok')) status = 'ok';

  const rawUsers = args.users && args.users.ok ? args.users.data : undefined;
  const items = extractUsersArray(rawUsers).map(normalizeUserRow).filter(Boolean) as AdminUserRow[];

  const fromStats = args.stats && args.stats.ok ? deriveStatsFromStatsEndpoint(args.stats.data) : {};

  const derivedUsersTotal = typeof fromStats.users_total === 'number' ? fromStats.users_total : items.length;
  const derivedUsersByRole = fromStats.users_by_role ?? computeUsersByRole(items);

  const sections: AdminWorkspaceContractV2_1['ui']['sections'] = [
    { id: 'dashboard', title: 'Dashboard', enabled: true, kind: 'system' },
    { id: 'health', title: 'Salud operativa', enabled: true, kind: 'system' },
    { id: 'audit', title: 'Auditoría', enabled: true, kind: 'system' },

    { id: 'users', title: 'Usuarios', enabled: true, kind: 'users' },
    { id: 'roles', title: 'Roles & Permisos', enabled: true, kind: 'users' },
    { id: 'tokens', title: 'Tokens / Sesiones', enabled: true, kind: 'users' },

    { id: 'tests', title: 'Catálogo de Tests', enabled: true, kind: 'platform' },
    { id: 'services', title: 'Servicios', enabled: true, kind: 'platform' },
    { id: 'bookings', title: 'Reservas', enabled: true, kind: 'platform' },

    { id: 'courses', title: 'Cursos', enabled: true, kind: 'lms' },
    { id: 'lessons', title: 'Lecciones', enabled: true, kind: 'lms' },
    { id: 'resources', title: 'Recursos', enabled: true, kind: 'lms' },

    { id: 'flags', title: 'Flags', enabled: true, kind: 'config' },
    { id: 'versions', title: 'Versiones', enabled: true, kind: 'config' },
  ];

  return {
    meta: { version: 'admin-workspace.v2.1', generated_at },
    system: { status, checks, last_refresh_ms: args.last_refresh_ms },
    stats: {
      users_total: derivedUsersTotal,
      users_by_role: derivedUsersByRole,
      extras: fromStats.extras,
    },
    users: {
      items,
      capabilities: args.capabilities,
    },
    ui: {
      sections,
      density: 'compact',
    },
  };
}
