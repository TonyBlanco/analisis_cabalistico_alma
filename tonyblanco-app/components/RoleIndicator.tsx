'use client';

import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/getUserRole';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  therapist: 'Terapeuta',
  personal: 'Personal',
  patient: 'Consultante',
};

export default function RoleIndicator() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  if (!role) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Modo: {roleLabels[role] || role}
      </div>
    </div>
  );
}

