'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminCheck, deleteAdminUser, getAdminStats, getAdminUserDetail, getAdminUsers, patchAdminUser } from '../../lib/admin-api';
import { buildAdminWorkspaceContract, type AdminRole, type AdminWorkspaceContractV1 } from '../../lib/contracts/adminWorkspace.v1';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminStatsCard } from './AdminStatsCard';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminHealthCard } from './AdminHealthCard';
import { AdminPlaceholderPanels } from './AdminPlaceholderPanels';
import { AdminUserDetailDrawer } from './AdminUserDetailDrawer';

type UserItem = NonNullable<AdminWorkspaceContractV1['users']>['items'][number];

export function AdminWorkspace() {
  const [contract, setContract] = useState<AdminWorkspaceContractV1>(() =>
    buildAdminWorkspaceContract({ check: undefined, stats: undefined, users: undefined })
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserItem | null>(null);

  const [busyUserIds, setBusyUserIds] = useState<Set<number>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const panelsEnabled = useMemo(() => {
    const byKey: Record<string, boolean> = {};
    for (const p of contract.ui.panels) byKey[p.key] = p.enabled;
    return byKey;
  }, [contract.ui.panels]);

  const refresh = async () => {
    setLoading(true);
    setActionError(null);

    const [checkRes, statsRes, usersRes] = await Promise.all([adminCheck(), getAdminStats(), getAdminUsers()]);

    const nextContract = buildAdminWorkspaceContract({
      check: checkRes,
      stats: statsRes,
      users: usersRes,
    });

    setContract(nextContract);
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withBusy = async (userId: number, fn: () => Promise<void>) => {
    setBusyUserIds((prev) => new Set(prev).add(userId));
    try {
      await fn();
    } finally {
      setBusyUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const updateUserInState = (userId: number, patch: Partial<UserItem>) => {
    setContract((prev) => {
      if (!prev.users) return prev;
      const items = prev.users.items.map((u) => (u.id === userId ? { ...u, ...patch } : u));
      return {
        ...prev,
        users: {
          ...prev.users,
          items,
        },
      };
    });

    setLastUpdated(new Date().toLocaleString());
  };

  const removeUserFromState = (userId: number) => {
    setContract((prev) => {
      if (!prev.users) return prev;
      const items = prev.users.items.filter((u) => u.id !== userId);
      return {
        ...prev,
        users: {
          ...prev.users,
          items,
        },
      };
    });
    setLastUpdated(new Date().toLocaleString());
  };

  const handleSetActive = async (id: number, nextActive: boolean) => {
    setActionError(null);

    await withBusy(id, async () => {
      // Optimistic UI: only if we already know current state
      const current = contract.users?.items.find((u) => u.id === id);
      const hadKnownState = current?.is_active !== null && typeof current?.is_active === 'boolean';
      const prevActive = current?.is_active ?? null;

      if (hadKnownState) updateUserInState(id, { is_active: nextActive });

      const res = await patchAdminUser(id, { is_active: nextActive });
      if (!res.ok) {
        if (hadKnownState) updateUserInState(id, { is_active: prevActive });
        const msg = `No se pudo actualizar is_active: ${res.error}`;
        setActionError(msg);
        return;
      }

      // If backend doesn't return state, keep optimistic; otherwise leave as-is
      if (!hadKnownState) updateUserInState(id, { is_active: nextActive });
    });
  };

  const handleSetRole = async (id: number, role: AdminRole) => {
    setActionError(null);

    await withBusy(id, async () => {
      const current = contract.users?.items.find((u) => u.id === id);
      const prevRole = current?.role ?? null;

      updateUserInState(id, { role });

      // Best-effort PATCH: backend may not support role updates via this endpoint.
      const res = await patchAdminUser(id, { profile: { user_type: role } });
      if (!res.ok) {
        updateUserInState(id, { role: prevRole });
        const msg = `No se pudo cambiar el rol: ${res.error}`;
        setActionError(msg);
      }
    });
  };

  const handleUpdateEmail = async (id: number, nextEmail: string) => {
    setActionError(null);

    await withBusy(id, async () => {
      const current = contract.users?.items.find((u) => u.id === id);
      const prevEmail = current?.email ?? '';

      // Optimistic update
      if (prevEmail) updateUserInState(id, { email: nextEmail });

      const res = await patchAdminUser(id, { email: nextEmail });
      if (!res.ok) {
        if (prevEmail) updateUserInState(id, { email: prevEmail });
        const msg = `No se pudo actualizar email: ${res.error}`;
        setActionError(msg);
        return;
      }

      // If backend returns detail, best-effort refresh user fields
      const detail = await getAdminUserDetail(id);
      if (detail.ok) {
        const raw: any = detail.data;
        const email = typeof raw?.email === 'string' ? raw.email : nextEmail;
        const username = typeof raw?.username === 'string' ? raw.username : undefined;
        const is_active = typeof raw?.is_active === 'boolean' ? raw.is_active : null;
        const createdAtValue = raw?.created_at ?? raw?.date_joined;
        const created_at = typeof createdAtValue === 'string' ? createdAtValue : undefined;
        const profile = raw && typeof raw === 'object' && raw.profile && typeof raw.profile === 'object' ? raw.profile : null;
        const roleCandidate = profile ? (profile as any).user_type : raw?.user_type;
        const role = roleCandidate === 'admin' || roleCandidate === 'therapist' || roleCandidate === 'personal' || roleCandidate === 'patient' ? roleCandidate : null;
        updateUserInState(id, { email, username, is_active, created_at, role });
      }
    });
  };

  import confirmAction from '../../lib/confirm';

  const handleDeleteUser = async (id: number) => {
    setActionError(null);

    const ok = await confirmAction(`Eliminar usuario ID ${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    await withBusy(id, async () => {
      // Optimistic remove
      const snapshot = contract.users?.items;
      removeUserFromState(id);
      if (drawerUser?.id === id) {
        setDrawerOpen(false);
        setDrawerUser(null);
      }

      const res = await deleteAdminUser(id);
      if (!res.ok) {
        // Restore snapshot on failure
        if (snapshot) {
          setContract((prev) => {
            if (!prev.users) return prev;
            return {
              ...prev,
              users: {
                ...prev.users,
                items: snapshot,
              },
            };
          });
        }
        const msg = `No se pudo eliminar el usuario: ${res.error}`;
        setActionError(msg);
      }
    });
  };

  const handleViewDetail = async (user: UserItem) => {
    setActionError(null);
    setDrawerUser(user);
    setDrawerOpen(true);

    // Best-effort: fetch detail to show freshest data.
    await withBusy(user.id, async () => {
      const detail = await getAdminUserDetail(user.id);
      if (!detail.ok) return;

      const raw: any = detail.data;
      const email = typeof raw?.email === 'string' ? raw.email : user.email;
      const username = typeof raw?.username === 'string' ? raw.username : user.username;
      const is_active = typeof raw?.is_active === 'boolean' ? raw.is_active : user.is_active;
      const createdAtValue = raw?.created_at ?? raw?.date_joined;
      const created_at = typeof createdAtValue === 'string' ? createdAtValue : user.created_at;
      const profile = raw && typeof raw === 'object' && raw.profile && typeof raw.profile === 'object' ? raw.profile : null;
      const roleCandidate = profile ? (profile as any).user_type : raw?.user_type;
      const role = roleCandidate === 'admin' || roleCandidate === 'therapist' || roleCandidate === 'personal' || roleCandidate === 'patient' ? roleCandidate : null;

      const merged: UserItem = {
        ...user,
        email,
        username,
        is_active,
        created_at,
        role,
      };
      setDrawerUser(merged);
      updateUserInState(user.id, merged);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader status={contract.system.status} lastUpdated={lastUpdated} />

      <div className="mx-auto flex max-w-7xl">
        <AdminSidebar />

        <main className="w-full px-4 py-6 sm:px-6">
          {loading ? (
            <div className="rounded-md border bg-white p-4 text-sm text-gray-700">Cargando administración…</div>
          ) : null}

          {actionError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}

          <div className="space-y-4">
            <AdminStatsCard enabled={!!panelsEnabled.stats} stats={contract.stats} />
            <AdminUsersTable
              enabled={!!panelsEnabled.users}
              users={contract.users}
              onSetActive={handleSetActive}
              onSetRole={handleSetRole}
              onViewDetail={handleViewDetail}
              busyUserIds={busyUserIds}
            />
            <AdminHealthCard system={contract.system} />
            <AdminPlaceholderPanels />
          </div>
        </main>
      </div>

      <AdminUserDetailDrawer
        open={drawerOpen}
        user={drawerUser}
        onClose={() => setDrawerOpen(false)}
        onSetActive={handleSetActive}
        onUpdateEmail={handleUpdateEmail}
        onSetRole={handleSetRole}
        onDeleteUser={handleDeleteUser}
        busy={drawerUser ? busyUserIds.has(drawerUser.id) : false}
        error={actionError}
      />
    </div>
  );
}
