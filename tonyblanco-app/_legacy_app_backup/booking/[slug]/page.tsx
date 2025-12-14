'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getService, createBooking, getAvailableSlots, getBlockedDates, Service, getAuthToken } from '@/lib/api';
import { ArrowLeft, Calendar, Clock, CreditCard, Check, AlertCircle } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_notes: '',
    scheduled_date: '',
    scheduled_time: '',
    payment_method: 'stripe' as 'stripe' | 'paypal' | 'bizum' | 'transfer'
  });

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (slug) {
      loadService();
      loadAvailability();
    }
  }, [slug]);

  const loadService = async () => {
    try {
      const data = await getService(slug);
      setService(data);
    } catch (error) {
      console.error('Error cargando servicio:', error);
      setError('No se pudo cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const [slots, blocked] = await Promise.all([
        getAvailableSlots(),
        getBlockedDates()
      ]);
      setAvailableSlots(slots as any[]);
      setBlockedDates((blocked as any[]).map((b: any) => b.date));
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.includes(dateStr);
  };

  const isDateAvailable = (date: Date): boolean => {
    if (date < new Date()) return false;
    if (isDateBlocked(date)) return false;
    
    const dayOfWeek = date.getDay();
    return availableSlots.some(slot => slot.day_of_week === dayOfWeek);
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDayOfWeek) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(new Date(year, month, day));
          day++;
        }
      }
      calendar.push(week);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setFormData({ ...formData, scheduled_date: date.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validaciones
    if (!service) {
      setError('Servicio no encontrado');
      setSubmitting(false);
      return;
    }

    if (service.requires_booking && (!formData.scheduled_date || !formData.scheduled_time)) {
      setError('Por favor selecciona una fecha y hora');
      setSubmitting(false);
      return;
    }

    if (!formData.client_name || !formData.client_email) {
      setError('Por favor completa todos los campos requeridos');
      setSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        router.push(`/login?redirect=/booking/${slug}`);
        return;
      }

      const scheduledDateTime = service.requires_booking 
        ? `${formData.scheduled_date}T${formData.scheduled_time}:00`
        : undefined;

      const bookingData = {
        service: service.id,
        scheduled_date: scheduledDateTime,
        timezone: 'Europe/Madrid',
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        client_notes: formData.client_notes,
        currency: currency,
        payment_method: formData.payment_method
      };

      const booking = await createBooking(bookingData);

      // Redirigir según método de pago
      if (formData.payment_method === 'stripe') {
        // Aquí iría la integración con Stripe Checkout
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else if (formData.payment_method === 'paypal') {
        // Aquí iría la integración con PayPal
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        // Para otros métodos, mostrar confirmación
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }

    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌙</div>
          <p className="text-gray-400 mb-6">Servicio no encontrado</p>
          <button
            onClick={() => router.push('/services')}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F]"
          >
            Ver todos los servicios
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            ¡Reserva Confirmada!
          </h2>
          <p className="text-gray-300 mb-6">
            Te hemos enviado un email con los detalles de tu reserva.
            Nos pondremos en contacto contigo pronto.
          </p>
          <button
            onClick={() => router.push('/my-bookings')}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F]"
          >
            Ver mis reservas
          </button>
        </div>
      </div>
    );
  }

  const calendar = generateCalendar();
  const price = service.price_display[currency.toLowerCase() as 'usd' | 'eur'];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors body-font text-sm sm:text-base mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light title-font mb-2" style={{ color: '#D4AF37' }}>
            Reservar: {service.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 body-font">{service.category_name} • {service.duration_display}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Calendar Section - Solo si requiere reserva */}
            {service.requires_booking && (
              <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <h2 className="text-lg sm:text-xl font-semibold title-font mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  Selecciona Fecha y Hora
                </h2>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 rounded-lg hover:bg-slate-700 body-font text-sm sm:text-base"
                  >
                    ←
                  </button>
                  <span className="text-base sm:text-lg body-font capitalize">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 rounded-lg hover:bg-slate-700 body-font text-sm sm:text-base"
                  >
                    →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-xs sm:text-sm text-gray-400 body-font">
                      {day}
                    </div>
                  ))}
                  {calendar.map((week, i) => (
                    week.map((date, j) => (
                      <button
                        key={`${i}-${j}`}
                        type="button"
                        onClick={() => date && handleDateSelect(date)}
                        disabled={!date || !isDateAvailable(date)}
                        className={`
                          aspect-square rounded-lg body-font text-sm transition-all
                          ${!date ? 'invisible' : ''}
                          ${date && isDateAvailable(date) ? 'hover:bg-[#D4AF37] hover:text-black cursor-pointer' : ''}
                          ${date && !isDateAvailable(date) ? 'text-gray-600 cursor-not-allowed' : ''}
                          ${selectedDate && date && date.toDateString() === selectedDate.toDateString() 
                            ? 'bg-[#D4AF37] text-black' 
                            : 'bg-slate-800'}
                        `}
                      >
                        {date?.getDate()}
                      </button>
                    ))
                  ))}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      Horarios Disponibles
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {getAvailableTimesForDate(selectedDate).map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, scheduled_time: slot.start_time })}
                          className={`
                            px-4 py-2 rounded-lg body-font transition-all
                            ${formData.scheduled_time === slot.start_time 
                              ? 'bg-[#D4AF37] text-black' 
                              : 'bg-slate-800 hover:bg-slate-700'}
                          `}
                        >
                          {slot.start_time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold title-font mb-4">
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 body-font">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white body-font focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37] body-font"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37] body-font"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 body-font">Notas (opcional)</label>
                  <textarea
                    value={formData.client_notes}
                    onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37] body-font resize-none"
                    placeholder="¿Algo que quieras compartir antes de la sesión?"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold title-font mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                Método de Pago
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'stripe' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.payment_method === 'stripe' 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold body-font mb-1">Tarjeta</div>
                  <div className="text-xs text-gray-400">Visa, Mastercard, etc.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'paypal' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.payment_method === 'paypal' 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold body-font mb-1">PayPal</div>
                  <div className="text-xs text-gray-400">Pago seguro</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'bizum' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.payment_method === 'bizum' 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold body-font mb-1">Bizum</div>
                  <div className="text-xs text-gray-400">Solo España</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'transfer' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.payment_method === 'transfer' 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold body-font mb-1">Transferencia</div>
                  <div className="text-xs text-gray-400">Bancaria</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 body-font text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-slate-900/50 rounded-2xl p-6 border border-[#D4AF37]/30 space-y-6">
              
              {/* Currency Toggle */}
              <div className="flex gap-1 sm:gap-2 bg-slate-800 p-1 rounded-lg mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded body-font transition-all text-xs sm:text-sm ${
                    currency === 'USD' 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USD $
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`flex-1 px-3 py-2 rounded body-font transition-all text-sm ${
                    currency === 'EUR' 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EUR €
                </button>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="text-sm text-gray-400 body-font mb-2">Servicio</h3>
                <p className="font-semibold body-font">{service.name}</p>
              </div>

              {selectedDate && formData.scheduled_time && (
                <div>
                  <h3 className="text-sm text-gray-400 body-font mb-2">Fecha y Hora</h3>
                  <p className="font-semibold body-font">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-400">{formData.scheduled_time}</p>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 body-font">Subtotal</span>
                  <span className="font-semibold">
                    {currency === 'USD' ? '$' : '€'}{price.current}
                  </span>
                </div>
                {price.has_discount && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-400 body-font">Descuento</span>
                    <span className="text-green-500">
                      -{currency === 'USD' ? '$' : '€'}{(price.original - price.current).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span style={{ color: '#D4AF37' }}>
                    {currency === 'USD' ? '$' : '€'}{price.current}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 sm:py-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Procesando...' : 'Confirmar Reserva'}
              </button>

              <p className="text-[10px] sm:text-xs text-gray-400 text-center body-font">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
