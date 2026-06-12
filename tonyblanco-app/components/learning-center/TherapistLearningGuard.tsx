'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { getUserRole } from '@/lib/getUserRole';
import {
  hasSeenTherapistLearningLanding,
  isLearningCenterPath,
  markTherapistLearningLandingSeen,
  queueTherapistLearningAutotour,
} from '@/lib/therapistOnboarding';

/**
 * Marca la visita al Centro de Aprendizaje y encola el autotour.
 * Ya no redirige al dashboard: el checklist de primeros pasos guía el flujo.
 */
export default function TherapistLearningGuard() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!pathname || !isLearningCenterPath(pathname) || hasSeenTherapistLearningLanding()) {
        return;
      }

      const role = await getUserRole();
      if (cancelled || role !== 'therapist') {
        return;
      }

      markTherapistLearningLandingSeen();
      queueTherapistLearningAutotour();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}