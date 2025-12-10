"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership } from '@/lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      const membership = await requireMembership(undefined, '/membership-expired');
      
      if (membership) {
        // Redirigir según tipo de usuario
        if (membership.user_type === 'therapist') {
          router.replace('/dashboard/therapist');
        } else {
          router.replace('/dashboard/personal');
        }
      }
      
      setLoading(false);
    };
    
    redirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return null;
}
