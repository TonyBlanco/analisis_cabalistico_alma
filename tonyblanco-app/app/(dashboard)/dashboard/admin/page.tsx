'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/getUserRole';
import { fetchSession } from '@/lib/session';
import { AdminProWorkspace } from '@/components/admin-pro/AdminProWorkspace';

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      await fetchSession();
      const r = await getUserRole();
      setRole(r);
      setChecking(false);
    };

    run();
  }, []);

  if (checking) {
    return (
      <div className="rounded-md border bg-white p-4 text-sm text-gray-700">
        Verificando acceso…
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="rounded-md border bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-gray-600">
          Este workspace está reservado para administración.
        </p>
        <div className="mt-4">
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            Volver a /dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <AdminProWorkspace />;
}

