'use client';

import { useMemo, useState } from 'react';
import type { AdminRole, AdminUserRow, AdminWorkspaceContractV2 } from '@/lib/contracts/adminWorkspace.v2';
import { AdminProUserActionsMenu } from './AdminProUserActionsMenu';

function StatusBadge(props: { active: boolean }) {
  const { active } = props;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        active ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-700'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
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
      className="h-8 w-full rounded-md border bg-white px-2 text-xs text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50"
      value={value}
      onChange={(e) => onChange(e.target.value as AdminRole)}
      disabled={disabled}
      title={title}
    >
      <option value="admin">admin</option>
      <option value="therapist">therapist</option>
      <option value="personal">personal</option>
      <option value="patient">patient</option>
      <option value="unknown">unknown</option>
    </select>
  );
}

export function AdminProUsersTable(props: {
  users: AdminUserRow[];
  capabilities: AdminWorkspaceContractV2['users']['capabilities'];
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
    <div className="rounded-md border bg-white">
      <div className="flex flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar email o username…"
            className="h-8 w-64 max-w-full rounded-md border bg-white px-2 text-xs text-gray-900"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-8 rounded-md border bg-white px-2 text-xs text-gray-900"
          >
            <option value="">Rol (todos)</option>
            <option value="admin">admin</option>
            <option value="therapist">therapist</option>
            <option value="personal">personal</option>
            <option value="patient">patient</option>
            <option value="unknown">unknown</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="h-8 rounded-md border bg-white px-2 text-xs text-gray-900"
          >
            <option value="">Estado (todos)</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="text-xs text-gray-600">
          Resultados: <span className="font-medium text-gray-900">{filtered.length}</span>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                Email
              </th>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                Username
              </th>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                Rol
              </th>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                Estado
              </th>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-600">
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
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border-b px-3 py-2 text-xs text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.email}</span>
                      {u.flags?.length ? (
                        <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {u.flags.join(', ')}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-b px-3 py-2 text-xs text-gray-700">{u.username ?? '—'}</td>
                  <td className="border-b px-3 py-2">
                    <RoleSelect
                      value={u.role}
                      onChange={(next) => onSetRole(u, next)}
                      disabled={!canPatchRole || busy || u.role === 'unknown'}
                      title={!canPatchRole ? 'No permitido' : u.role === 'unknown' ? 'Rol desconocido (no editable)' : undefined}
                    />
                  </td>
                  <td className="border-b px-3 py-2">
                    <StatusBadge active={u.is_active} />
                  </td>
                  <td className="border-b px-3 py-2">
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
                <td colSpan={5} className="px-3 py-10 text-center text-xs text-gray-600">
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
