'use client';

import { useMemo, useState } from 'react';
import type { AdminRole, AdminWorkspaceContractV1 } from '../../lib/contracts/adminWorkspace.v1';

type UserItem = NonNullable<AdminWorkspaceContractV1['users']>['items'][number];

export function AdminUsersTable(props: {
  enabled: boolean;
  users?: AdminWorkspaceContractV1['users'];
  onSetActive: (id: number, nextActive: boolean) => Promise<void>;
  onSetRole: (id: number, role: AdminRole) => Promise<void>;
  onViewDetail: (user: UserItem) => void;
  busyUserIds?: Set<number>;
}) {
  const { enabled, users, onSetActive, onSetRole, onViewDetail, busyUserIds } = props;

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
  const [expanded, setExpanded] = useState(true);

  const filtered = useMemo(() => {
    const items = users?.items || [];
    const q = query.trim().toLowerCase();

    return items.filter((u) => {
      const matchesQuery =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.username ? u.username.toLowerCase().includes(q) : false);

      const matchesRole = !roleFilter || u.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  return (
    <section id="admin-panel-users" className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Usuarios</h2>
          <p className="mt-1 text-sm text-gray-600">Búsqueda local, filtro por rol y acciones básicas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Users</span>
        </div>
      </div>

      {!expanded ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">Sección contraída.</div>
      ) : !enabled ? (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          No disponible (el endpoint no respondió o devolvió error).
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar usuario (email/username)"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full rounded-md border px-3 py-2 text-sm sm:w-56"
              >
                <option value="">Filtrar por rol</option>
                <option value="admin">admin</option>
                <option value="therapist">therapist</option>
                <option value="personal">personal</option>
                <option value="patient">patient</option>
              </select>
            </div>
            <div className="text-xs text-gray-600">Mostrando {filtered.length} usuarios</div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Rol</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Activo</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {filtered.map((u) => {
                  const busy = !!busyUserIds?.has(u.id);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{u.email}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{u.username || '—'}</td>
                      <td className="px-3 py-2">
                        <select
                          disabled={busy}
                          value={u.role || ''}
                          onChange={(e) => {
                            const next = e.target.value as AdminRole;
                            if (next) onSetRole(u.id, next);
                          }}
                          className="w-40 rounded-md border px-2 py-1 text-sm"
                        >
                          <option value="" disabled>
                            —
                          </option>
                          <option value="admin">admin</option>
                          <option value="therapist">therapist</option>
                          <option value="personal">personal</option>
                          <option value="patient">patient</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {u.is_active === null ? '—' : u.is_active ? 'Sí' : 'No'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onViewDetail(u)}
                            className="rounded-md border px-2 py-1 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Ver detalle
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onSetActive(u.id, true)}
                            className="rounded-md border px-2 py-1 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Activar
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onSetActive(u.id, false)}
                            className="rounded-md border px-2 py-1 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-600">
                      No hay resultados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
