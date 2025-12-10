'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';
import {
  loadNotifications,
  saveNotifications,
  checkNotificationPermission,
  requestNotificationPermission,
  getNotificationStats,
  type AngelNotification
} from '@/lib/angel-notifications';

export default function AngelNotificationsPanel() {
  const [notifications, setNotifications] = useState<AngelNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0, today: 0 });
  const [defaultTime, setDefaultTime] = useState('09:00');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loaded = loadNotifications();
    setNotifications(loaded);
    
    const perm = await checkNotificationPermission();
    setPermission(perm);
    
    const statistics = getNotificationStats();
    setStats(statistics);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
    }
  };

  const handleToggleNotification = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
    setStats(getNotificationStats());
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
    setStats(getNotificationStats());
  };

  const handleUpdateTime = (id: string, time: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, time } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleUpdateAllTimes = () => {
    const updated = notifications.map(n => ({ ...n, time: defaultTime }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      setNotifications([]);
      saveNotifications([]);
      setStats({ total: 0, active: 0, upcoming: 0, today: 0 });
    }
  };

  // Filtrar notificaciones futuras
  const upcomingNotifications = notifications
    .filter(n => new Date(n.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notificaciones Angélicas</h2>
              <p className="text-purple-300 text-sm">Días de presidencia programados</p>
            </div>
          </div>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg transition-colors border border-red-500/30 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar todo
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
            <p className="text-purple-300 text-sm mb-1">Activas</p>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
            <p className="text-blue-300 text-sm mb-1">Próximas</p>
            <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
          </div>
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-300 text-sm mb-1">Hoy</p>
            <p className="text-2xl font-bold text-white">{stats.today}</p>
          </div>
        </div>
      </div>

      {/* Configuración de permisos */}
      {permission !== 'granted' && (
        <div className="p-6 bg-orange-900/20 border-b border-orange-500/30">
          <div className="flex items-start gap-4">
            <BellOff className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-bold mb-2">Permisos de notificación requeridos</h3>
              <p className="text-gray-300 text-sm mb-4">
                Para recibir recordatorios en los días de presidencia angélica, necesitamos tu permiso para enviar notificaciones.
              </p>
              <button
                onClick={handleRequestPermission}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors"
              >
                Activar notificaciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuración global */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold">Configuración Global</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-gray-300 text-sm mb-2 block">Hora predeterminada para notificaciones</label>
            <input
              type="time"
              value={defaultTime}
              onChange={(e) => setDefaultTime(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button
            onClick={handleUpdateAllTimes}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Aplicar a todas
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Próximas notificaciones ({upcomingNotifications.length})
        </h3>

        {upcomingNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tienes notificaciones programadas</p>
            <p className="text-sm mt-2">Activa notificaciones desde el calendario angélico</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-slate-900/50 rounded-lg p-4 border transition-all ${
                  notification.enabled
                    ? 'border-purple-500/30'
                    : 'border-slate-700 opacity-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icono del ángel */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-bold">{notification.angel.name.en}</h4>
                        <p className="text-purple-300 text-sm font-hebrew">{notification.angel.name.he}</p>
                      </div>
                      
                      <button
                        onClick={() => handleToggleNotification(notification.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          notification.enabled
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                            : 'bg-slate-800 text-gray-500 hover:bg-slate-700'
                        }`}
                      >
                        {notification.enabled ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(notification.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <input
                          type="time"
                          value={notification.time}
                          onChange={(e) => handleUpdateTime(notification.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                          disabled={!notification.enabled}
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="ml-auto p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .font-hebrew {
          font-family: 'David Libre', 'Times New Roman', serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
