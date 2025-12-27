'use client';

import AstrologyWorkspace from '@/components/AstrologyWorkspace';

/**
 * Página del workspace de Astrología.
 *
 * ALCANCE:
 * - Modo Observacional: solo Visual (sin correspondencias, sin síntesis)
 * - Modo Training / Investigativo (opt-in): habilita Correspondencias + Síntesis (uso educativo / no médico)
 * - Conexión con backend GET/POST para carta natal (sin cambios de backend)
 */
export default function AstrologyPage() {
  return <AstrologyWorkspace />;
}
