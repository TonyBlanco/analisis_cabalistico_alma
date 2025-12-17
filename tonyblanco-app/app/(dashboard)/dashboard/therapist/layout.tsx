'use client';

import TherapistSidebar from './components/TherapistSidebar';

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
    <div className="flex min-h-screen bg-gray-50">
      <TherapistSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
