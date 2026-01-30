import type { ReactNode } from 'react';

export default function TherapistConfigLayout({ children }: { children: ReactNode }) {
  // Workspace cerrado: no inyectar paneles externos
  return <>{children}</>;
}
