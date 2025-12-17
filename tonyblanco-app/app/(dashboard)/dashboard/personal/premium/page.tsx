'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { Sparkles, Lock, Check } from 'lucide-react';

/**
 * Personal Premium Page
 * 
 * Shows premium features (disabled / coming soon).
 */
export default function PersonalPremiumPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/login');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'personal' && role !== 'admin') {
    return null;
  }

  const premiumFeatures = [
    {
      title: 'Exploraciones ilimitadas',
      description: 'Realiza todas las exploraciones que necesites sin límites',
    },
    {
      title: 'Contenido exclusivo',
      description: 'Accede a videos, audios y recursos premium',
    },
    {
      title: 'Análisis avanzados',
      description: 'Herramientas de análisis más profundas y detalladas',
    },
    {
      title: 'Soporte prioritario',
      description: 'Atención personalizada para tus consultas',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
              Premium
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Funcionalidades avanzadas próximamente
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Funcionalidades Premium
          </h2>
          <p className="text-sm text-gray-600">
            Estas funcionalidades estarán disponibles próximamente
          </p>
        </div>

        <div className="space-y-4">
          {premiumFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">Próximamente</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Trabajar con un terapeuta profesional te da acceso a todas estas funcionalidades y más. 
              <a href="/register/therapist" className="underline ml-1">Explora nuestras opciones de acompañamiento</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

