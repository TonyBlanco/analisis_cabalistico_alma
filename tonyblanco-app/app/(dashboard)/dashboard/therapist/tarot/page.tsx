'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy redirect: /dashboard/therapist/tarot → /(swm)/astrologia-tarot
 * 
 * La ruta oficial del workspace Tarot está en el módulo SWM.
 * Este redirect mantiene compatibilidad con enlaces antiguos.
 */
export default function TarotLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/therapist/astrologia-tarot');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-sm text-gray-600">Redirigiendo al workspace de Tarot...</p>
      </div>
    </div>
  );
}

