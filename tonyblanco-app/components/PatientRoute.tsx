'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isPatient, getUserRole } from '@/lib/auth';

interface PatientRouteProps {
  children: React.ReactNode;
}

export default function PatientRoute({ children }: PatientRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const role = getUserRole();
      if (role !== 'patient' && !isPatient()) {
        // Si no es paciente, redirigir a login
        router.push('/login');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

