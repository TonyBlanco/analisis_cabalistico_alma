'use client';

import PatientSidebar from './components/PatientSidebar';

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
