'use client';

import type { AdminWorkspaceContractV2 } from '@/lib/contracts/adminWorkspace.v2';

function StatCard(props: { label: string; value: number | string | undefined; hint?: string }) {
  const { label, value, hint } = props;
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value ?? '—'}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-gray-600">{hint}</div> : null}
    </div>
  );
}

export function AdminProSystemOverview(props: { contract: AdminWorkspaceContractV2 }) {
  const { contract } = props;
  const total = contract.stats.users_total;
  const byRole = contract.stats.users_by_role;

  const extras = contract.stats.extras ? Object.entries(contract.stats.extras).slice(0, 6) : [];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Usuarios" value={total} />
      <StatCard label="Admins" value={byRole?.admin} />
      <StatCard label="Terapeutas" value={byRole?.therapist} />
      <StatCard label="Personal" value={byRole?.personal} />
      <StatCard label="Pacientes" value={byRole?.patient} />
      <StatCard label="Desconocidos" value={byRole?.unknown} />

      {extras.length ? (
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-3 lg:col-span-6 lg:grid-cols-6">
          {extras.map(([key, value]) => (
            <StatCard key={key} label={key} value={value} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
