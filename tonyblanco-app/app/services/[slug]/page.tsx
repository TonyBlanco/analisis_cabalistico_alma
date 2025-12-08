'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getService, Service } from '@/lib/api';
import {
  ArrowLeft, Check, Clock, Users, Calendar,
  Video, Star, Sparkles, Shield, Heart
} from 'lucide-react';

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadService();
    }
  }, [slug]);

  const loadService = async () => {
    try {
      const data = await getService(slug);
      setService(data);
    } catch (error) {
      console.error('Error cargando servicio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = () => {
    if (!service) return null;
    const priceInfo = service.price_display[currency.toLowerCase() as 'usd' | 'eur'];
    const currencySymbol = currency === 'USD' ? '$' : '€';
    
    return (
      <div className="flex items-center gap-3">
        {priceInfo.has_discount && (
          <span className="text-lg sm:text-2xl text-gray-400 line-through">{currencySymbol}{priceInfo.original}</span>
        )}
        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: '#D4AF37' }}>
          {currencySymbol}{priceInfo.current}
        </span>
        {priceInfo.has_discount && priceInfo.discount_label && (
          <span className="px-2 py-1 sm:px-3 bg-red-500 text-white rounded-full text-xs sm:text-sm body-font">
            {priceInfo.discount_label}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-400">Cargando servicio...</p>
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

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Spartan:wght@300;400;500;600&display=swap');
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors body-font text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a servicios
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          
          {/* Left Column - Info */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {service.is_featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs sm:text-sm body-font">
                  <Star className="w-4 h-4" />
                  Destacado
                </span>
              )}
              {service.is_bestseller && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500/20 text-purple-400 rounded-full text-xs sm:text-sm body-font">
                  <Sparkles className="w-4 h-4" />
                  Más Vendido
                </span>
              )}
            </div>

            {/* Category */}
            <p className="text-[#D4AF37] body-font mb-2">{service.category_name}</p>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light title-font mb-3 sm:mb-4">
              {service.name}
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 body-font mb-4 sm:mb-6">
              {service.short_description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-gray-400 body-font text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                <span>{service.duration_display}</span>
              </div>
              {service.platform && (
                <div className="flex items-center gap-2 text-gray-400 body-font text-sm sm:text-base">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span>{service.platform}</span>
                </div>
              )}
              {service.max_participants && (
                <div className="flex items-center gap-2 text-gray-400 body-font text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span>Máx. {service.max_participants} personas</span>
                </div>
              )}
              {service.requires_booking && (
                <div className="flex items-center gap-2 text-gray-400 body-font text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span>Requiere reserva</span>
                </div>
              )}
            </div>

            {/* Full Description */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
              <h2 className="text-xl sm:text-2xl title-font mb-3 sm:mb-4" style={{ color: '#D4AF37' }}>
                Descripción
              </h2>
              <p className="text-sm sm:text-base text-gray-300 body-font leading-relaxed">
                {service.full_description}
              </p>
            </div>

          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div className="lg:sticky lg:top-8 bg-slate-900/50 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#D4AF37]/30">
              
              {/* Currency Toggle */}
              <div className="flex gap-2 bg-slate-800 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 px-4 py-2 rounded body-font transition-all ${
                    currency === 'USD' 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USD $
                </button>
                <button
                  onClick={() => setCurrency('EUR')}
                  className={`flex-1 px-4 py-2 rounded body-font transition-all ${
                    currency === 'EUR' 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EUR €
                </button>
              </div>

              {/* Price */}
              <div className="mb-6">
                {formatPrice()}
                <p className="text-gray-400 text-sm mt-2 body-font">{currency}</p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => router.push(`/booking/${service.slug}`)}
                className="w-full py-3 sm:py-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-base sm:text-lg mb-4 sm:mb-6">
                {service.requires_booking ? 'Reservar Ahora' : 'Adquirir Ahora'}
              </button>

              {/* Trust Badges */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-800">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 body-font">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <span>Pago seguro (Stripe, PayPal, Bizum)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 body-font">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <span>Garantía de satisfacción</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 body-font">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] flex-shrink-0" />
                  <span>Más de 500 almas acompañadas</span>
                </div>
              </div>

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold title-font mb-2 sm:mb-3" style={{ color: '#D4AF37' }}>
                    Beneficios
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {service.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 body-font">
                        <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Includes */}
              {service.includes && service.includes.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold title-font mb-2 sm:mb-3" style={{ color: '#D4AF37' }}>
                    Incluye
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {service.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300 body-font">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Services */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="bg-gradient-to-br from-[#D4AF37]/10 to-purple-500/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center border border-[#D4AF37]/20">
          <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🌟</div>
          <h2 className="text-2xl sm:text-3xl font-light title-font mb-3 sm:mb-4" style={{ color: '#D4AF37' }}>
            ¿Tienes dudas sobre este servicio?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 body-font mb-4 sm:mb-6">
            Contáctame y con gusto responderé todas tus preguntas
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-sm sm:text-base">
            Contactar a Tony
          </button>
        </div>
      </div>
    </div>
  );
}
