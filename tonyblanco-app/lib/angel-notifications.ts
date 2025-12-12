/**
 * Sistema de notificaciones para días de presidencia angélica
 */

import { Angel } from './angels-system';

export interface AngelNotification {
  id: string;
  date: Date;
  angel: Angel;
  enabled: boolean;
  time: string; // HH:MM formato 24h
  type: 'daily' | 'morning' | 'evening' | 'custom';
}

export interface NotificationSettings {
  enabled: boolean;
  time: string;
  sound: boolean;
  vibration: boolean;
  showOnLockScreen: boolean;
}

// Guardar notificaciones en localStorage
export function saveNotifications(notifications: AngelNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('angelNotifications', JSON.stringify(notifications));
}

// Cargar notificaciones desde localStorage
export function loadNotifications(): AngelNotification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('angelNotifications');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((n: any) => ({
      ...n,
      date: new Date(n.date)
    }));
  } catch {
    return [];
  }
}

// Verificar si el navegador soporta notificaciones
export async function checkNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Solicitar permiso para notificaciones
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Mostrar notificación
export function showAngelNotification(angel: Angel): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(`✨ ${angel.name.en} - ${angel.name.he}`, {
    body: `Hoy es día de presidencia del ángel ${angel.name.en}. Es un momento propicio para su invocación y meditación.`,
    icon: '/images/angel-icon.png',
    badge: '/images/angel-badge.png',
    tag: `angel-${angel.name.en}`,
    requireInteraction: false,
    silent: false,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/angels/${angel.name.en.toLowerCase()}`;
    notification.close();
  };

  // Auto-cerrar después de 10 segundos
  setTimeout(() => notification.close(), 10000);
}

// Programar notificación diaria
export function scheduleAngelNotification(
  angel: Angel,
  date: Date,
  time: string = '09:00'
): void {
  if (typeof window === 'undefined') return;

  const [hours, minutes] = time.split(':').map(Number);
  const notificationDate = new Date(date);
  notificationDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const timeUntilNotification = notificationDate.getTime() - now.getTime();

  if (timeUntilNotification > 0) {
    setTimeout(() => {
      showAngelNotification(angel);
    }, timeUntilNotification);
  }
}

// Verificar y mostrar notificaciones del día actual
export function checkTodayNotifications(angels: Angel[]): void {
  if (!angels || !Array.isArray(angels)) return;
  
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const todayAngel = angels.find(angel => 
    angel?.presidesOver && 
    Array.isArray(angel.presidesOver) &&
    angel.presidesOver.some(([m, d]) => m === month && d === day)
  );

  if (todayAngel) {
    const notifications = loadNotifications();
    const hasNotification = notifications.some(n => 
      n.angel?.name?.en === todayAngel.name?.en &&
      n.enabled &&
      new Date(n.date).toDateString() === today.toDateString()
    );

    if (hasNotification) {
      showAngelNotification(todayAngel);
    }
  }
}

// Obtener próximas fechas de presidencia de un ángel
export function getUpcomingPresidingDates(angel: Angel, count: number = 5): Date[] {
  if (!angel?.presidesOver || !Array.isArray(angel.presidesOver)) {
    return [];
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const dates: Date[] = [];

  // Convertir las fechas de presidencia a objetos Date del año actual y siguiente
  const presidingDates: Date[] = [];
  for (let year of [currentYear, currentYear + 1]) {
    for (const [month, day] of angel.presidesOver) {
      presidingDates.push(new Date(year, month - 1, day));
    }
  }

  // Filtrar fechas futuras y ordenar
  const futureDates = presidingDates
    .filter(date => date > today)
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, count);

  return futureDates;
}

// Activar notificaciones para un ángel específico
export function enableAngelNotifications(
  angel: Angel,
  settings: NotificationSettings = {
    enabled: true,
    time: '09:00',
    sound: true,
    vibration: true,
    showOnLockScreen: true
  }
): void {
  const upcomingDates = getUpcomingPresidingDates(angel);
  const notifications = loadNotifications();

  upcomingDates.forEach(date => {
    const notification: AngelNotification = {
      id: `${angel.name.en}-${date.toISOString()}`,
      date,
      angel,
      enabled: true,
      time: settings.time,
      type: 'morning'
    };

    // Agregar si no existe ya
    if (!notifications.find(n => n.id === notification.id)) {
      notifications.push(notification);
      scheduleAngelNotification(angel, date, settings.time);
    }
  });

  saveNotifications(notifications);
}

// Desactivar notificaciones para un ángel
export function disableAngelNotifications(angelName: string): void {
  const notifications = loadNotifications();
  const updated = notifications.map(n => 
    n.angel.name.en === angelName ? { ...n, enabled: false } : n
  );
  saveNotifications(updated);
}

// Obtener estadísticas de notificaciones
export function getNotificationStats(): {
  total: number;
  active: number;
  upcoming: number;
  today: number;
} {
  const notifications = loadNotifications();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: notifications.length,
    active: notifications.filter(n => n.enabled).length,
    upcoming: notifications.filter(n => new Date(n.date) > new Date()).length,
    today: notifications.filter(n => {
      const nDate = new Date(n.date);
      nDate.setHours(0, 0, 0, 0);
      return nDate.getTime() === today.getTime() && n.enabled;
    }).length
  };
}

// Inicializar sistema de notificaciones
export async function initNotificationSystem(angels: Angel[]): Promise<boolean> {
  if (!angels || !Array.isArray(angels) || angels.length === 0) {
    console.warn('initNotificationSystem: No se proporcionaron ángeles válidos');
    return false;
  }

  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    // Verificar notificaciones del día
    checkTodayNotifications(angels);
    
    // Configurar verificación diaria
    setInterval(() => {
      checkTodayNotifications(angels);
    }, 3600000); // Cada hora
    
    return true;
  }
  
  return false;
}
