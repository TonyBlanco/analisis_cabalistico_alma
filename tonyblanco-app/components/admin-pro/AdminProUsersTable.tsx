'use client';

import { useMemo, useState } from 'react';
import type { AdminRole, AdminUserRow, AdminWorkspaceContractV2_1 } from '@/lib/contracts/adminWorkspace.v2_1';
import { AdminProUserActionsMenu } from './AdminProUserActionsMenu';

function StatusBadge(props: { active: boolean }) {
  const { active } = props;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function RoleBadge(props: { role: AdminRole }) {
  const { role } = props;
  const map: Record<AdminRole, string> = {
    admin: 'border-red-200 bg-red-50 text-red-700',
    therapist: 'border-blue-200 bg-blue-50 text-blue-700',
    personal: 'border-slate-200 bg-slate-50 text-slate-700',
    patient: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    visitor: 'border-slate-200 bg-slate-50 text-slate-700',
    unknown: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[role]}`}>{role}</span>
  );
}

function RoleSelect(props: {
  value: AdminRole;
  onChange: (next: AdminRole) => void;
  disabled: boolean;
  title?: string;
}) {
  const { value, onChange, disabled, title } = props;
  return (
    <select
      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50"
      value={value}
      onChange={(e) => onChange(e.target.value as AdminRole)}
      disabled={disabled}
      title={title}
    >
      <option value="admin">admin</option>
      <option value="therapist">therapist</option>
      <option value="personal">personal</option>
      <option value="patient">patient</option>
      <option value="visitor">visitor</option>
      <option value="unknown">unknown</option>
    </select>
  );
}

export function AdminProUsersTable(props: {
  users: AdminUserRow[];
  capabilities: AdminWorkspaceContractV2_1['users']['capabilities'];
  busyUserIds: Set<number>;
  onView: (user: AdminUserRow) => void;
  onSetActive: (user: AdminUserRow, nextActive: boolean) => void;
  onSetRole: (user: AdminUserRow, nextRole: AdminRole) => void;
  onDelete: (user: AdminUserRow) => void;
}) {
  const { users, capabilities, busyUserIds, onView, onSetActive, onSetRole, onDelete } = props;

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
  const [activeFilter, setActiveFilter] = useState<'active' | 'inactive' | ''>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      if (q) {
        const hay = `${u.email} ${u.username ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (roleFilter) {
        if (u.role !== roleFilter) return false;
      }
      if (activeFilter) {
        if (activeFilter === 'active' && !u.is_active) return false;
        if (activeFilter === 'inactive' && u.is_active) return false;
      }
      return true;
    });
  }, [users, query, roleFilter, activeFilter]);

  return (
    <div className="bg-white border border-slate-200 rounded-md">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar email o username…"
            className="h-8 w-64 max-w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
          >
            <option value="">Rol (todos)</option>
            <option value="admin">admin</option>
            <option value="therapist">therapist</option>
            <option value="personal">personal</option>
            <option value="patient">patient</option>
            <option value="visitor">visitor</option>
            <option value="unknown">unknown</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
          >
            <option value="">Estado (todos)</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="text-xs text-slate-600">
          Resultados: <span className="font-medium text-slate-900">{filtered.length}</span>
        </div>
      </div>

      <div className="max-h-[min(70dvh,720px)] overflow-auto pr-1 [scrollbar-gutter:stable]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Email
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Username
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Rol
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Estado
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Operaciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const busy = busyUserIds.has(u.id);
              const canPatchRole = capabilities.can_patch_role;
              const canPatchActive = capabilities.can_patch_active;
              const canDelete = capabilities.can_delete;

              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-3 py-2 text-xs text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.email}</span>
                      {u.flags?.length ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {u.flags.join(', ')}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-xs text-slate-700">{u.username ?? '—'}</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <div className="min-w-[140px]">
                        <RoleSelect
                          value={u.role}
                          onChange={(next) => onSetRole(u, next)}
                          disabled={!canPatchRole || busy || u.role === 'unknown'}
                          title={!canPatchRole ? 'No permitido' : u.role === 'unknown' ? 'Rol desconocido (no editable)' : undefined}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <StatusBadge active={u.is_active} />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <AdminProUserActionsMenu
                      onView={() => onView(u)}
                      onToggleActive={() => onSetActive(u, !u.is_active)}
                      onDelete={() => onDelete(u)}
                      canToggleActive={canPatchActive}
                      canDelete={canDelete}
                      isActive={u.is_active}
                      busy={busy}
                    />
                  </td>
                </tr>
              );
            })}

            {!filtered.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-xs text-slate-600">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
