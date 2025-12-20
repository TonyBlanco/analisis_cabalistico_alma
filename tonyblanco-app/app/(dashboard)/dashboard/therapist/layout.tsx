'use client';

import TherapistSidebar from './components/TherapistSidebar';
import { PanelManagerProvider } from '@/components/TherapistWorkspace/PanelManagerContext';
import PanelDock from '@/components/TherapistWorkspace/PanelDock';

/**
 * Therapist Layout
 * 
 * ARCHITECTURE NOTE:
 * This layout is self-contained and replaces the main dashboard layout
 * for therapist routes. The parent layout only renders the Header and passes
 * children to avoid sidebar duplication.
 * 
 * RESPONSIVE:
 * - Desktop (lg+): Full sidebar (w-64) + main content
 * - Tablet (sm-lg): Compact sidebar (w-16) + main content
 * - Mobile (<sm): Sidebar hidden, accessible via Header hamburger
 */
export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelManagerProvider>
      <div className="flex min-h-screen bg-gray-50">
        <TherapistSidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <PanelDock />
        </div>
      </div>
    </PanelManagerProvider>
  );
}
