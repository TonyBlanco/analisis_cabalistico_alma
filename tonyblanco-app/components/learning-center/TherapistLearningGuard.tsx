'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getUserRole } from '@/lib/getUserRole';
import {
  hasSeenTherapistLearningLanding,
  isLearningCenterPath,
  markTherapistLearningLandingSeen,
  queueTherapistLearningAutotour,
} from '@/lib/therapistOnboarding';

export default function TherapistLearningGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!pathname || hasSeenTherapistLearningLanding()) {
        return;
      }

      const role = await getUserRole();
      if (cancelled || role !== 'therapist') {
        return;
      }

      if (isLearningCenterPath(pathname)) {
        markTherapistLearningLandingSeen();
        queueTherapistLearningAutotour();
        return;
      }

      if (pathname.startsWith('/dashboard/therapist')) {
        markTherapistLearningLandingSeen();
        queueTherapistLearningAutotour();
        router.replace('/learn');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
