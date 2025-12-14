'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth';

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
    const userRole = getUserRole() as 'admin' | 'therapist' | 'personal' | 'patient' | null;

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
        // Role cannot be determined, redirect to login
        router.replace('/login');
        break;
    }
  }, [router]);

  // Return null - this page should never render
  return null;
}
