'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkMembership, getAuthToken, getUserRole, setUserRole } from '@/lib/auth';

interface TherapistRouteProps {
  children: React.ReactNode;
}

export default function TherapistRoute({ children }: TherapistRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.replace('/login');
          if (!cancelled) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        let role = getUserRole();
        if (!role) {
          const membership = await checkMembership(token);
          if (membership?.user_type) {
            setUserRole(membership.user_type as any);
            role = membership.user_type as any;
          }
        }

        if (role !== 'therapist') {
          router.replace('/login');
          if (!cancelled) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('TherapistRoute auth error:', err);
        router.replace('/login');
        if (!cancelled) {
          setAuthorized(false);
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;
  return <>{children}</>;
}
