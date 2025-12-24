'use client';

import AstrologyWorkspace from '@/components/AstrologyWorkspace';

/**
 * Página del workspace de Astrología.
 * 
 * ALCANCE:
 * - Solo TAB VISUAL habilitado
 * - Conexión con backend GET/POST
 * - Datos desde perfil del paciente
 * - Sin correspondencias, sin síntesis, sin IA
 */
export default function AstrologyPage() {
  return <AstrologyWorkspace />;
}
