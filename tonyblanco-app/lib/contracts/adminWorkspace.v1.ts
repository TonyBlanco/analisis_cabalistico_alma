import type { AdminApiResult } from '../admin-api';

export type AdminRole = 'admin' | 'therapist' | 'personal' | 'patient';
export type AdminSystemStatus = 'ok' | 'degraded' | 'unknown';

export interface AdminWorkspaceContractV1 {
  meta: {
    generated_at: string;
    version: 'admin-workspace.v1';
  };
  system: {
    status: AdminSystemStatus;
    checks: Array<{ name: string; status: AdminSystemStatus; detail?: string }>;
  };
  stats?: {
    users_total?: number;
    users_by_role?: Partial<Record<AdminRole, number>>;
    activity?: unknown;
  };
  users?: {
    items: Array<{
      id: number;
      email: string;
      username?: string;
      role: AdminRole | null;
      is_active: boolean | null;
      created_at?: string;
    }>;
    paging?: {
      count?: number;
      next?: string | null;
      previous?: string | null;
    };
  };
  ui: {
    panels: Array<{
      key: 'stats' | 'users' | 'health' | 'placeholders';
      title: string;
      enabled: boolean;
      description: string;
    }>;
  };
}

function toIsoNow(): string {
  return new Date().toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAdminRole(value: unknown): value is AdminRole {
  return value === 'admin' || value === 'therapist' || value === 'personal' || value === 'patient';
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function unwrapUsersPayload(payload: unknown): { items: unknown[]; paging?: any } {
  if (Array.isArray(payload)) {
    return { items: payload };
  }

  if (isObject(payload) && Array.isArray((payload as any).results)) {
    return {
      items: (payload as any).results,
      paging: {
        count: (payload as any).count,
        next: (payload as any).next,
        previous: (payload as any).previous,
      },
    };
  }

  // Unknown shape
  return { items: [] };
}

type ContractUserItem = NonNullable<AdminWorkspaceContractV1['users']>['items'][number];

function normalizeUser(raw: unknown): ContractUserItem | null {
  if (!isObject(raw)) return null;

  const id = typeof (raw as any).id === 'number' ? (raw as any).id : null;
  const email = typeof (raw as any).email === 'string' ? (raw as any).email : '';
  const username = typeof (raw as any).username === 'string' ? (raw as any).username : undefined;

  if (id === null || !email) return null;

  // Role best-effort (do not invent)
  const profile = isObject((raw as any).profile) ? (raw as any).profile : undefined;
  const roleCandidate =
    (profile && ((profile as any).user_type ?? (profile as any).role)) ??
    (raw as any).user_type ??
    (raw as any).role;

  const role = isAdminRole(roleCandidate) ? roleCandidate : null;

  // is_active is not present in some admin endpoints; keep null if missing
  const isActiveValue = (raw as any).is_active;
  const is_active = typeof isActiveValue === 'boolean' ? isActiveValue : null;

  // created_at best-effort
  const createdAtValue = (raw as any).created_at ?? (raw as any).date_joined;
  const created_at = typeof createdAtValue === 'string' ? createdAtValue : undefined;

  return {
    id,
    email,
    username,
    role,
    is_active,
    created_at,
  };
}

function statusFromCheckResult(check: AdminApiResult<unknown> | undefined): AdminSystemStatus {
  if (!check) return 'unknown';
  if (check.ok) return 'ok';

  // If endpoint doesn't exist or network error, treat as unknown (fallback: show "Conectado")
  if (check.status === 0 || check.status === 404) return 'unknown';

  return 'degraded';
}

export function buildAdminWorkspaceContract(args: {
  check?: AdminApiResult<unknown>;
  stats?: AdminApiResult<unknown>;
  users?: AdminApiResult<unknown>;
}): AdminWorkspaceContractV1 {
  const generated_at = toIsoNow();

  const systemStatus = statusFromCheckResult(args.check);
  const checks: AdminWorkspaceContractV1['system']['checks'] = [];

  if (!args.check) {
    checks.push({ name: 'admin_check', status: 'unknown', detail: 'No ejecutado' });
  } else if (args.check.ok) {
    checks.push({ name: 'admin_check', status: 'ok' });
  } else {
    checks.push({ name: 'admin_check', status: systemStatus, detail: args.check.error });
  }

  const panels: AdminWorkspaceContractV1['ui']['panels'] = [
    {
      key: 'stats',
      title: 'Resumen del sistema',
      enabled: !!args.stats?.ok,
      description: 'Métricas globales (si están disponibles).',
    },
    {
      key: 'users',
      title: 'Usuarios',
      enabled: !!args.users?.ok,
      description: 'Gestión básica de usuarios (read-mostly).',
    },
    {
      key: 'health',
      title: 'Salud operativa',
      enabled: true,
      description: 'Estado del sistema derivado de /api/admin/check/.',
    },
    {
      key: 'placeholders',
      title: 'Paneles (placeholder)',
      enabled: true,
      description: 'Secciones selladas sin endpoints admin disponibles.',
    },
  ];

  const contract: AdminWorkspaceContractV1 = {
    meta: {
      generated_at,
      version: 'admin-workspace.v1',
    },
    system: {
      status: systemStatus,
      checks,
    },
    ui: {
      panels,
    },
  };

  // Stats normalization
  if (args.stats?.ok && isObject(args.stats.data)) {
    const stats = args.stats.data as any;

    const users_total = getNumber(stats.total_users ?? stats.users_total);

    const users_by_role: Partial<Record<AdminRole, number>> = {};

    const therapists = getNumber(stats.therapists);
    if (therapists !== undefined) users_by_role.therapist = therapists;

    const personalUsers = getNumber(stats.personal_users);
    if (personalUsers !== undefined) users_by_role.personal = personalUsers;

    contract.stats = {
      users_total,
      users_by_role: Object.keys(users_by_role).length ? users_by_role : undefined,
    };
  }

  // Users normalization
  if (args.users?.ok) {
    const { items: rawItems, paging } = unwrapUsersPayload(args.users.data);
    const items = rawItems.map(normalizeUser).filter(Boolean) as ContractUserItem[];

    // If we can derive users_by_role from users list, enrich stats.users_by_role
    if (items.length) {
      const derived: Partial<Record<AdminRole, number>> = {};
      for (const item of items) {
        const role = item.role;
        if (!role) continue;
        derived[role] = (derived[role] || 0) + 1;
      }

      if (Object.keys(derived).length) {
        contract.stats = contract.stats || {};
        contract.stats.users_by_role = contract.stats.users_by_role || {};
        contract.stats.users_by_role = { ...derived, ...contract.stats.users_by_role };
      }

      if (contract.stats?.users_total === undefined) {
        contract.stats = contract.stats || {};
        contract.stats.users_total = items.length;
      }
    }

    contract.users = {
      items,
      paging: paging && (paging.count !== undefined || paging.next !== undefined || paging.previous !== undefined) ? paging : undefined,
    };
  }

  return contract;
}
