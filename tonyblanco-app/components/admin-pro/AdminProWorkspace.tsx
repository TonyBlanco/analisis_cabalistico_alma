'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminCheck, deleteAdminUser, getAdminStats, getAdminUsers, patchAdminUser } from '@/lib/admin-pro-api';
import confirmAction from '@/lib/confirm';
import {
  buildAdminWorkspaceContractV2_1,
  type AdminRole,
  type AdminUserRow,
  type AdminWorkspaceContractV2_1,
} from '@/lib/contracts/adminWorkspace.v2_1';
import { AdminProHeader } from './AdminProHeader';
import { AdminProSidebar } from './AdminProSidebar';
import { AdminProSystemOverview } from './AdminProSystemOverview';
import { AdminProUsersTable } from './AdminProUsersTable';
import { AdminProUserDrawer } from './AdminProUserDrawer';
import { AdminProDomainPanels } from './AdminProDomainPanels';

type Caps = AdminWorkspaceContractV2_1['users']['capabilities'];

const initialCaps: Caps = { can_patch_role: true, can_patch_active: true, can_delete: true };

export function AdminProWorkspace() {
  const [capabilities, setCapabilities] = useState<Caps>(initialCaps);
  const [contract, setContract] = useState<AdminWorkspaceContractV2_1>(() =>
    buildAdminWorkspaceContractV2_1({ last_refresh_ms: 0, capabilities: initialCaps })
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [busyUserIds, setBusyUserIds] = useState<Set<number>>(() => new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<AdminUserRow | null>(null);

  const sections = contract.ui.sections;

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

  const updateUserInState = (id: number, patch: Partial<AdminUserRow>) => {
    setContract((prev) => {
      const items = prev.users.items.map((u) => (u.id === id ? { ...u, ...patch } : u));
      return { ...prev, users: { ...prev.users, items } };
    });
  };

  const removeUserFromState = (id: number) => {
    setContract((prev) => {
      const items = prev.users.items.filter((u) => u.id !== id);
      return { ...prev, users: { ...prev.users, items } };
    });
  };

  const refresh = async (initial = false) => {
    setActionError(null);
    if (initial) setLoading(true);
    setRefreshing(true);

    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const [checkRes, statsRes, usersRes] = await Promise.all([adminCheck(), getAdminStats(), getAdminUsers()]);

    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const ms = Math.max(0, Math.round(end - start));

    const next = buildAdminWorkspaceContractV2_1({
      check: checkRes,
      stats: statsRes,
      users: usersRes,
      last_refresh_ms: ms,
      capabilities,
    });

    setContract(next);
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    refresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToTop = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return true;
  }, []);

  const [toTopVisible, setToTopVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setToTopVisible(window.scrollY > 250);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll as any);
    }
  }, []);

  const handleView = (user: AdminUserRow) => {
    setDrawerUser(user);
    setDrawerOpen(true);
  };

  const handleSetActive = async (user: AdminUserRow, nextActive: boolean) => {
    setActionError(null);

    await withBusy(user.id, async () => {
      const prev = user.is_active;
      updateUserInState(user.id, { is_active: nextActive });

      const res = await patchAdminUser(user.id, { is_active: nextActive });
      if (!res.ok) {
        updateUserInState(user.id, { is_active: prev });
        if (res.status === 403 || res.status === 405) {
          setCapabilities((c) => ({ ...c, can_patch_active: false }));
        }
        setActionError(`No se pudo actualizar is_active: ${res.error}`);
      }
    });
  };

  const handleSetRole = async (user: AdminUserRow, nextRole: AdminRole) => {
    setActionError(null);

    // ADMIN is not a clinical actor. Keep role set within sealed roles.
    if (nextRole !== 'admin' && nextRole !== 'therapist' && nextRole !== 'personal' && nextRole !== 'patient') {
      setActionError('Rol no permitido');
      return;
    }

    await withBusy(user.id, async () => {
      const prev = user.role;
      updateUserInState(user.id, { role: nextRole });

      // Best-effort PATCH: backend may use nested profile or direct user_type.
      const first = await patchAdminUser(user.id, { profile: { user_type: nextRole } });
      if (first.ok) return;

      if (first.status === 400) {
        const second = await patchAdminUser(user.id, { user_type: nextRole } as any);
        if (second.ok) return;

        updateUserInState(user.id, { role: prev });
        if (second.status === 403 || second.status === 405) {
          setCapabilities((c) => ({ ...c, can_patch_role: false }));
        }
        setActionError(`No se pudo cambiar el rol: ${second.error}`);
        return;
      }

      updateUserInState(user.id, { role: prev });
      if (first.status === 403 || first.status === 405) {
        setCapabilities((c) => ({ ...c, can_patch_role: false }));
      }
      setActionError(`No se pudo cambiar el rol: ${first.error}`);
    });
  };


  const handleDelete = async (user: AdminUserRow) => {
    setActionError(null);

    const ok = await confirmAction(`Eliminar usuario ID ${user.id}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    await withBusy(user.id, async () => {
      const snapshot = contract.users.items;
      removeUserFromState(user.id);
      if (drawerUser?.id === user.id) {
        setDrawerOpen(false);
        setDrawerUser(null);
      }

      const res = await deleteAdminUser(user.id);
      if (!res.ok) {
        setContract((prev) => ({ ...prev, users: { ...prev.users, items: snapshot } }));
        if (res.status === 403 || res.status === 405) {
          setCapabilities((c) => ({ ...c, can_delete: false }));
        }
        setActionError(`No se pudo eliminar el usuario: ${res.error}`);
      }
    });
  };

  // keep contract.users.capabilities in sync with runtime capability detection
  useEffect(() => {
    setContract((prev) => ({ ...prev, users: { ...prev.users, capabilities } }));
  }, [capabilities]);

  const headerOffsetPx = 56;

  if (loading) {
    return <div className="bg-white border border-slate-200 rounded-md p-4 text-sm text-slate-700">Cargando administración…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminProHeader
        status={contract.system.status}
        lastUpdated={lastUpdated}
        onRefresh={() => refresh(false)}
        refreshing={refreshing}
      />

      <div className="mx-auto flex max-w-7xl gap-0 px-3 pt-16 sm:px-6">
        <AdminProSidebar sections={sections} headerOffsetPx={headerOffsetPx} />

        <main className="w-full px-3 pb-10 md:px-6">
          {actionError ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {actionError}
            </div>
          ) : null}

          <section id="dashboard" className="scroll-mt-24">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">System Overview</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">Control center</div>
              </div>
              <div className="text-[11px] text-slate-600">
                Generado: <span className="font-medium text-slate-900">{contract.meta.generated_at}</span>
              </div>
            </div>
            <AdminProSystemOverview contract={contract} />
          </section>

          <section id="users" className="mt-6 scroll-mt-24">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Usuarios</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">Gestión y operaciones</div>
              </div>
              <div className="text-[11px] text-slate-600">
                Capabilities:{' '}
                <span className="font-medium text-slate-900">
                  role={String(contract.users.capabilities.can_patch_role)} · active={String(contract.users.capabilities.can_patch_active)} · delete={String(
                    contract.users.capabilities.can_delete
                  )}
                </span>
              </div>
            </div>

            <AdminProUsersTable
              users={contract.users.items}
              capabilities={contract.users.capabilities}
              busyUserIds={busyUserIds}
              onView={handleView}
              onSetActive={handleSetActive}
              onSetRole={handleSetRole}
              onDelete={handleDelete}
            />
          </section>

          <div className="mt-6">
            <div className="mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Dominios del sistema</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">Paneles (Django-like)</div>
            </div>
            <AdminProDomainPanels contract={contract} />
          </div>
        </main>
      </div>

      <AdminProUserDrawer open={drawerOpen} user={drawerUser} onClose={() => (setDrawerOpen(false), setDrawerUser(null))} />

      {showToTop && toTopVisible ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 z-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          Ir arriba
        </button>
      ) : null}
    </div>
  );
}
