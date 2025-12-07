'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServices, getServiceCategories, Service, ServiceCategory } from '@/lib/api';
import { 
  Users, BookOpen, GraduationCap, Calendar, 
  Video, Heart, MessageCircle, Star, Sparkles,
  Check, ArrowRight
} from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getServiceCategories()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory
    ? services.filter(s => s.category_name === selectedCategory)
    : services;

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Users, BookOpen, GraduationCap, Calendar,
      Video, Heart, MessageCircle
    };
    return icons[iconName] || Users;
  };

  const formatPrice = (service: Service) => {
    const priceInfo = service.price_display[currency.toLowerCase() as 'usd' | 'eur'];
    const currencySymbol = currency === 'USD' ? '$' : '€';
    
    if (priceInfo.has_discount) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{currencySymbol}{priceInfo.current}</span>
          <span className="text-lg text-gray-400 line-through">{currencySymbol}{priceInfo.original}</span>
          {priceInfo.discount_label && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
              {priceInfo.discount_label}
            </span>
          )}
        </div>
      );
    }
    
    return <span className="text-2xl font-bold">{currencySymbol}{priceInfo.current}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-400">Cargando servicios...</p>
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

      {/* Header */}
      <div className="relative py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0A0A1F, #000000)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <h1 className="text-5xl md:text-7xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
            Servicios del Alma
          </h1>
          <p className="text-xl text-gray-300 body-font max-w-3xl mx-auto">
            Programas y experiencias de Psicoterapia Kabbalística diseñados para tu transformación personal
          </p>
          
          {/* Currency Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-400 body-font">Moneda:</span>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 rounded body-font transition-all ${
                  currency === 'USD' 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                USD $
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-4 py-2 rounded body-font transition-all ${
                  currency === 'EUR' 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EUR €
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap body-font transition-all ${
                selectedCategory === null
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Todos los Servicios
            </button>
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.display_name)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap body-font transition-all flex items-center gap-2 ${
                    selectedCategory === cat.display_name
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.display_name}
                  <span className="text-xs opacity-70">({cat.services_count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden hover:border-[#D4AF37]/50 transition-all group cursor-pointer"
              onClick={() => router.push(`/services/${service.slug}`)}
            >
              {/* Badge Section */}
              <div className="flex gap-2 p-4 pb-0">
                {service.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs body-font">
                    <Star className="w-3 h-3" />
                    Destacado
                  </span>
                )}
                {service.is_bestseller && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs body-font">
                    <Sparkles className="w-3 h-3" />
                    Más Vendido
                  </span>
                )}
              </div>

              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-semibold title-font mb-2 text-white group-hover:text-[#D4AF37] transition-colors">
                  {service.name}
                </h3>

                {/* Category & Duration */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400 body-font">
                  <span className="text-[#D4AF37]">{service.category_name}</span>
                  <span>•</span>
                  <span>{service.duration_display}</span>
                  {service.platform && (
                    <>
                      <span>•</span>
                      <span>{service.platform}</span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm body-font mb-4 line-clamp-3">
                  {service.short_description}
                </p>

                {/* Benefits */}
                {service.benefits && service.benefits.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {service.benefits.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-400 body-font">
                        <Check className="w-3 h-3 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      {formatPrice(service)}
                      <p className="text-xs text-gray-400 mt-1 body-font">{currency}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all group-hover:gap-3 body-font font-medium">
                      Ver más
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌙</div>
            <p className="text-gray-400 body-font">No hay servicios disponibles en esta categoría</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-[#D4AF37]/20 to-purple-500/20 rounded-3xl p-12 border border-[#D4AF37]/30">
          <div className="text-5xl mb-6">🌟</div>
          <h2 className="text-4xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-300 body-font mb-8 text-lg">
            Agenda una consulta gratuita de 15 minutos para conocer cómo puedo acompañarte en tu proceso
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="px-8 py-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-all body-font font-semibold text-lg"
          >
            Agendar Consulta Gratuita
          </button>
        </div>
      </div>
    </div>
  );
}
