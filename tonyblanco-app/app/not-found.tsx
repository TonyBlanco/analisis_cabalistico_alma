'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * 404 Not Found Page
 * 
 * IMPORTANT: This page should NEVER trigger logout.
 * It only shows a message and offers navigation options.
 */
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  // If we're in a dashboard route, redirect to dashboard instead of showing 404
  useEffect(() => {
    if (pathname?.startsWith('/dashboard')) {
      router.replace('/dashboard');
    }
  }, [pathname, router]);

  // Don't redirect if we're already handling it
  if (pathname?.startsWith('/dashboard')) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Página no encontrada</p>
      <a
        href="/"
        className="inline-block px-6 py-3 rounded-md text-white font-medium transition-colors"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Volver al inicio
      </a>
    </div>
  );
}

