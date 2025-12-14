'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';

/**
 * Dashboard Root - Role-based redirector
 * 
 * This page does NOT render content.
 * It redirects users to their role-specific dashboard:
 * - admin     → /dashboard/admin
 * - therapist → /dashboard/therapist
 * - personal  → /dashboard/personal
 * - patient   → /dashboard/patient
 * 
 * If role cannot be determined, redirects to /login
 */
export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const userRole = await getUserRole();

      switch (userRole) {
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        case 'therapist':
          router.replace('/dashboard/therapist');
          break;
        case 'personal':
          router.replace('/dashboard/personal');
          break;
        case 'patient':
          router.replace('/dashboard/patient');
          break;
        default:
          // Role cannot be determined
          if (process.env.NODE_ENV === 'development') {
            // In development, redirect to admin dashboard for dev bypass
            router.replace('/dashboard/admin');
          } else {
            // In production, redirect to login
            router.replace('/login');
          }
          break;
      }
    };

    handleRedirect();
  }, [router]);

  // Return null - this page should never render
  return null;
}

