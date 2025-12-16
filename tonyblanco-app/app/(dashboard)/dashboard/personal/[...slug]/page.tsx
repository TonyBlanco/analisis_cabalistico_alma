'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';

/**
 * Catch-all route for personal dashboard unknown paths
 * 
 * Redirects unknown routes to /dashboard/personal instead of showing 404.
 * This prevents 404 from triggering any logout behavior.
 */
export default function PersonalCatchAllPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to personal dashboard for any unknown route
    router.replace('/dashboard/personal');
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500">Redirigiendo...</p>
      </div>
    </div>
  );
}
