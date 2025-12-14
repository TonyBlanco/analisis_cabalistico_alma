'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import { Settings, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

/**
 * Layout Aislado para Admin Dashboard
 * 
 * NO reutiliza layouts de therapist o personal
 * Solo accesible para usuarios con rol 'admin'
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  // Guard estricto: solo admins
  const { loading, authorized } = useRoleGuard({
    allowedRoles: ['admin'],
    redirectTo: '/dashboard',
    show403: true
  });

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      router.push('/login?force_login=true');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Aislado - Solo para Admin */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-700" />
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
