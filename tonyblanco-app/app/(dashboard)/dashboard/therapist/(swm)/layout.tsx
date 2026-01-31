import type { ReactNode } from 'react';
import AIAssistantWidget from '@/src/components/therapist/AIAssistantWidget';

export default function TherapistSwmLayout({ children }: { children: ReactNode }) {
  // SWM: workspaces cerrados. No inyectar toolbars/paneles globales.
  // Pero sí incluimos el AIAssistantWidget que debe estar disponible en todo workspace de terapeuta.
  return (
    <>
      {children}
      <AIAssistantWidget />
    </>
  );
}
