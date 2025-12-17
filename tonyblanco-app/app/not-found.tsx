'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * Custom 404 Page
 * 
 * Clinical, calm, and reassuring tone.
 * SMART: Detects if user is logged in and redirects to their dashboard.
 */
export default function NotFound() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a stored role/token
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('activeRole');
        
        if (token && role) {
          setUserRole(role);
        }
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const getHomeRoute = () => {
    switch (userRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'therapist':
        return '/dashboard/therapist';
      case 'personal':
        return '/dashboard/personal';
      case 'patient':
        return '/dashboard/patient';
      default:
        return '/login';
    }
  };

  const getHomeLabel = () => {
    if (!userRole) return 'Ir al inicio';
    
    switch (userRole) {
      case 'admin':
        return 'Volver al panel de administración';
      case 'therapist':
        return 'Volver a mi workspace';
      case 'personal':
        return 'Volver a mi panel';
      case 'patient':
        return 'Volver a mi panel';
      default:
        return 'Ir al inicio';
    }
  };

  const handleGoHome = () => {
    router.push(getHomeRoute());
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 mb-4">
          <span className="text-3xl font-bold text-violet-600">404</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Página no encontrada
        </h1>

        {/* Body */}
        <div className="space-y-4 text-gray-600 leading-relaxed max-w-lg mx-auto">
          <p className="text-lg">
            La página que buscas no existe o ha sido movida.
          </p>
          <p className="text-base">
            No te preocupes, puedes volver a tu panel principal o regresar a la página anterior.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </button>

          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white text-base font-medium rounded-xl hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Home className="w-5 h-5" />
            {isLoading ? 'Cargando...' : getHomeLabel()}
          </button>
        </div>

        {/* Logged in indicator */}
        {userRole && (
          <p className="text-sm text-gray-500 pt-4">
            Sesión activa como <span className="font-medium capitalize">{userRole}</span>
          </p>
        )}
      </div>
    </div>
  );
}
