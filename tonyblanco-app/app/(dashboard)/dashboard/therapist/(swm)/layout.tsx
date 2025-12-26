import type { ReactNode } from 'react';

export default function TherapistSwmLayout({ children }: { children: ReactNode }) {
  // SWM: workspaces cerrados. No inyectar toolbars/paneles globales.
  return <>{children}</>;
}
