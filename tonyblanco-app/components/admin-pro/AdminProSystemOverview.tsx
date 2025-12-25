'use client';

import type { AdminWorkspaceContractV2_1 } from '@/lib/contracts/adminWorkspace.v2_1';

function StatCard(props: { label: string; value: number | string | undefined; hint?: string }) {
  const { label, value, hint } = props;
  return (
    <div className="bg-white border border-slate-200 rounded-md p-3">
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-slate-900">{value ?? '—'}</div>
      {hint ? <div className="mt-0.5 text-xs text-slate-600">{hint}</div> : null}
    </div>
  );
}

export function AdminProSystemOverview(props: { contract: AdminWorkspaceContractV2_1 }) {
  const { contract } = props;
  const total = contract.stats.users_total;
  const byRole = contract.stats.users_by_role;

  const extras = contract.stats.extras ? Object.entries(contract.stats.extras).slice(0, 6) : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard label="Usuarios" value={total} />
      <StatCard label="Admins" value={byRole?.admin} />
      <StatCard label="Terapeutas" value={byRole?.therapist} />
      <StatCard label="Personal" value={byRole?.personal} />
      <StatCard label="Pacientes" value={byRole?.patient} />
      {/* Keep unknown as derived field if present */}
      {typeof byRole?.unknown === 'number' ? <StatCard label="Desconocidos" value={byRole?.unknown} /> : null}

      {extras.length ? (
        <div className="col-span-2 grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-5">
          {extras.map(([key, value]) => (
            <StatCard key={key} label={key} value={value} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
