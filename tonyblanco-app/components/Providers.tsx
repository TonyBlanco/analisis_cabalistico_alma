'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';

/**
 * Client-side providers wrapper
 * Wraps the app with all necessary context providers
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
