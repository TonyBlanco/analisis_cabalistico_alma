'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserBookings, getAuthToken, removeAuthToken, User, Booking } from '@/lib/api';
import { 
  Calendar, Clock, CreditCard, LogOut, User as UserIcon, 
  Mail, Phone, Package, CheckCircle, XCircle, AlertCircle,
  ArrowLeft, ExternalLink
} from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile'>('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login?redirect=/my-bookings');
        return;
      }

      const [userData, bookingsData] = await Promise.all([
        getCurrentUser(),
        getUserBookings()
      ]);

      setUser(userData);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error cargando dashboard:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        removeAuthToken();
        router.push('/login?redirect=/my-bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
      confirmed: { label: 'Confirmada', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      completed: { label: 'Completada', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
      canceled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400', icon: XCircle },
      rescheduled: { label: 'Reprogramada', color: 'bg-purple-500/20 text-purple-400', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const badges = {
      trial: { label: 'Prueba', color: 'bg-purple-500/20 text-purple-400' },
      active: { label: 'Activa', color: 'bg-green-500/20 text-green-400' },
      canceled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400' },
      expired: { label: 'Expirada', color: 'bg-gray-500/20 text-gray-400' }
    };

    const badge = badges[status as keyof typeof badges] || badges.trial;

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-400">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && b.scheduled_date && new Date(b.scheduled_date) > new Date()
  ).slice(0, 3);

  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || (b.scheduled_date && new Date(b.scheduled_date) < new Date())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 sm:mb-4 body-font text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
            <h1 className="text-3xl sm:text-4xl font-light title-font mb-2" style={{ color: '#D4AF37' }}>
              Mi Espacio del Alma
            </h1>
            <p className="text-sm sm:text-base text-gray-400 body-font">Bienvenido/a, {user.profile.full_name}</p>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-4 md:mt-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all body-font text-sm"
            >
              ✨ <span className="hidden sm:inline">Crear</span> Ficha
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all body-font text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-6 py-2 sm:py-3 body-font transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'overview'
                ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 sm:px-6 py-2 sm:py-3 body-font transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'bookings'
                ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mis Reservas ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 sm:px-6 py-2 sm:py-3 body-font transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'profile'
                ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mi Perfil
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 body-font">Total Reservas</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 body-font">Próximas</p>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 body-font">Fichas {user.profile.user_type === 'personal' ? 'Usadas' : 'Ilimitadas'}</p>
                    <p className="text-2xl font-bold">
                      {user.profile.user_type === 'personal' 
                        ? `${user.profile.fichas_created_this_month}/${user.profile.max_fichas_per_month}`
                        : '∞'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#D4AF37]/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold title-font" style={{ color: '#D4AF37' }}>
                  Estado de Suscripción
                </h2>
                {getSubscriptionBadge(user.profile.subscription_status)}
              </div>
              <div className="space-y-2 text-sm sm:text-base text-gray-300 body-font">
                <p>Tipo de cuenta: <strong className="text-white">{user.profile.user_type === 'therapist' ? 'Terapeuta Profesional' : 'Usuario Personal'}</strong></p>
                {user.profile.subscription_end_date && (
                  <p>Válida hasta: <strong className="text-white">{new Date(user.profile.subscription_end_date).toLocaleDateString('es-ES')}</strong></p>
                )}
                {user.profile.user_type === 'personal' && (
                  <p>Fichas este mes: <strong className="text-white">{user.profile.fichas_created_this_month} de {user.profile.max_fichas_per_month}</strong></p>
                )}
              </div>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold title-font mb-4" style={{ color: '#D4AF37' }}>
                  Próximas Sesiones
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-semibold body-font">{booking.service_name}</p>
                        {booking.scheduled_date && (
                          <p className="text-sm text-gray-400">
                            {new Date(booking.scheduled_date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.meeting_link && (
                          <a
                            href={booking.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all"
                            title="Unirse a la reunión"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/services')}
                className="p-4 sm:p-6 bg-gradient-to-br from-[#D4AF37]/20 to-purple-500/20 rounded-xl sm:rounded-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-left"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✨</div>
                <h3 className="text-lg sm:text-xl font-semibold title-font mb-1 sm:mb-2">Explorar Servicios</h3>
                <p className="text-xs sm:text-sm text-gray-400 body-font">Descubre todos los programas disponibles</p>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl border border-blue-500/30 hover:border-blue-500 transition-all text-left"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🌙</div>
                <h3 className="text-lg sm:text-xl font-semibold title-font mb-1 sm:mb-2">Crear Análisis</h3>
                <p className="text-xs sm:text-sm text-gray-400 body-font">Genera un nuevo mapa kabbalístico</p>
              </button>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="text-4xl sm:text-5xl mb-4">📅</div>
                <p className="text-sm sm:text-base text-gray-400 body-font mb-4 sm:mb-6">No tienes reservas aún</p>
                <button
                  onClick={() => router.push('/services')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-sm sm:text-base"
                >
                  Explorar Servicios
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold title-font">{booking.service_name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      {booking.scheduled_date && (
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="body-font text-sm">
                            {new Date(booking.scheduled_date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="body-font text-sm">
                          {booking.currency} {booking.amount_paid} - {booking.payment_method}
                        </span>
                      </div>

                      {booking.client_notes && (
                        <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1 body-font">Notas:</p>
                          <p className="text-sm text-gray-300 body-font">{booking.client_notes}</p>
                        </div>
                      )}

                      {booking.meeting_link && (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-sm"
                        >
                          Unirse a la Reunión
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 body-font">
                      Reserva #{booking.id}
                      <br />
                      {new Date(booking.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold title-font mb-6" style={{ color: '#D4AF37' }}>
                Información Personal
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Nombre Completo</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span>{user.profile.full_name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>

                {user.profile.phone && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 body-font">Teléfono</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{user.profile.phone}</span>
                    </div>
                  </div>
                )}

                {user.profile.birth_date && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 body-font">Fecha de Nacimiento</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{new Date(user.profile.birth_date).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                )}

                {user.profile.user_type === 'therapist' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 body-font">Profesión</label>
                      <div className="p-3 bg-slate-800 rounded-lg">
                        <span>{user.profile.profession}</span>
                      </div>
                    </div>

                    {user.profile.specialization && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 body-font">Especialización</label>
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <span>{user.profile.specialization}</span>
                        </div>
                      </div>
                    )}

                    {user.profile.years_of_experience && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 body-font">Años de Experiencia</label>
                        <div className="p-3 bg-slate-800 rounded-lg">
                          <span>{user.profile.years_of_experience} años</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold mb-2">Zona de Peligro</h3>
              <p className="text-sm text-gray-400 mb-4 body-font">
                Las acciones aquí son permanentes y no se pueden deshacer.
              </p>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all body-font">
                Eliminar Cuenta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
