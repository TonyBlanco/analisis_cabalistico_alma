'use client';

import PatientSidebar from './components/PatientSidebar';

/**
 * Patient Layout
 * 
 * ARCHITECTURE NOTE:
 * This layout is self-contained and replaces the main dashboard layout
 * for patient routes. The parent layout only renders the Header and passes
 * children to avoid sidebar duplication.
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
