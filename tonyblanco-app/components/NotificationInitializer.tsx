'use client';

import { useEffect } from 'react';
import { initNotificationSystem } from '@/lib/angel-notifications';
import angelsData from '@/data/seventyTwoAngels.json';

export default function NotificationInitializer() {
  useEffect(() => {
    // Inicializar el sistema de notificaciones después de que el componente se monte
    if (typeof window !== 'undefined') {
      // Esperar 2 segundos antes de inicializar para no interferir con la carga inicial
      const timer = setTimeout(() => {
        // angelsData es directamente el array, no necesita .angels
        initNotificationSystem(angelsData as any);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Este componente no renderiza nada
  return null;
}
