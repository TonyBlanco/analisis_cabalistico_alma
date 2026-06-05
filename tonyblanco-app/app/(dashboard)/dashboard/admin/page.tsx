'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { canAccessAdminWorkspace } from '@/lib/canAccessAdminWorkspace';
import { fetchSession } from '@/lib/session';
import { AdminProWorkspace } from '@/components/admin-pro/AdminProWorkspace';
import { resetPageScroll } from '@/lib/reset-page-scroll';

export default function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    resetPageScroll();
    const run = async () => {
      await fetchSession();
      setAllowed(await canAccessAdminWorkspace());
      setChecking(false);
    };

    run();
  }, []);

  if (checking) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 text-sm text-slate-700">
        Verificando acceso…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-6">
        <h1 className="text-xl font-semibold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-600">
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

