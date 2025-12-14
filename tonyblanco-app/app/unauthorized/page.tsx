'use client';

import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-4">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso No Autorizado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-amber-900 mb-1">
                Separación Estricta de Roles
              </p>
              <p className="text-xs text-amber-700">
                Cada cuenta tiene un único rol (admin, terapeuta, personal, paciente).
                No puedes acceder a dashboards de otros roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            Ir a mi Dashboard
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="flex-1"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
