'use client';

interface RoleBadgeProps {
  realUserRole: string | null;
  activeDashboardRole?: string | null;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  therapist: 'Terapeuta',
  personal: 'Personal',
  patient: 'Paciente',
};

export default function RoleBadge({ realUserRole, activeDashboardRole }: RoleBadgeProps) {
  if (!realUserRole) return null;

  // If admin is viewing a different dashboard, show simulation info
  const isSimulating = realUserRole === 'admin' && activeDashboardRole && activeDashboardRole !== 'admin';

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className="px-2 py-1 rounded text-xs font-medium text-white"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        {isSimulating 
          ? `Vista activa: ${roleLabels[activeDashboardRole] || activeDashboardRole}`
          : `Rol real: ${roleLabels[realUserRole] || realUserRole}`
        }
      </span>
      {isSimulating && (
        <span className="text-xs text-gray-500 italic">
          Rol real: {roleLabels[realUserRole]}
        </span>
      )}
    </div>
  );
}

