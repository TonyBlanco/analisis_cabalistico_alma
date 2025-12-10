'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServices, getServiceCategories, getTests, Service, ServiceCategory, Test } from '@/lib/api';
import { 
  Users, BookOpen, GraduationCap, Calendar, 
  Video, Heart, MessageCircle, Star, Sparkles,
  Check, ArrowRight, TestTube2, Layers, TrendingUp,
  Brain, Activity, Target, ChevronRight, Lock, ShoppingBag,
  Wrench, Crown, Zap
} from 'lucide-react';
import {
  MARKETPLACE_RESOURCES,
  getResourcesByAccess,
  type RequiredAccess,
  type ResourceCategory,
} from '@/lib/marketplace-types';

interface MarketplaceItem {
  id: string;
  type: 'service' | 'test' | 'resource';
  name: string;
  slug?: string;
  code?: string;
  url?: string;
  category: string;
  categoryDisplay: string;
  icon: string;
  shortDescription: string;
  priceUSD?: number;
  priceEUR?: number;
  hasDiscount?: boolean;
  discountPriceUSD?: number;
  discountPriceEUR?: number;
  isFree?: boolean;
  isPopular?: boolean;
  benefits?: string[];
  requiredAccess?: RequiredAccess;
  isPremium?: boolean;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'service' | 'test' | 'resource'>('all');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userAccessLevel, setUserAccessLevel] = useState<RequiredAccess>('free');

  useEffect(() => {
    loadData();
    loadUserAccess();
  }, []);

  const loadUserAccess = () => {
    // Aquí deberías obtener el nivel de acceso del usuario desde la API
    // Por ahora lo simulamos desde localStorage
    const token = localStorage.getItem('userToken');
    if (token) {
      // Simular que el usuario tiene acceso personal
      setUserAccessLevel('personal');
    }
  };

  const loadData = async () => {
    try {
      const [servicesData, categoriesData, testsData] = await Promise.all([
        getServices(),
        getServiceCategories(),
        getTests()
      ]);

      // Convertir servicios a items del marketplace
      const serviceItems: MarketplaceItem[] = servicesData.map(service => ({
        id: `service-${service.id}`,
        type: 'service' as const,
        name: service.name,
        slug: service.slug,
        category: service.category_name,
        categoryDisplay: getCategoryDisplay(service.category_name),
        icon: getCategoryIcon(service.category_name),
        shortDescription: service.short_description,
        priceUSD: service.price_usd,
        priceEUR: service.price_eur,
        hasDiscount: service.has_discount,
        discountPriceUSD: service.discount_price_usd,
        discountPriceEUR: service.discount_price_eur,
        isFree: false,
        isPopular: service.is_featured,
        benefits: service.benefits
      }));

      // Convertir tests a items del marketplace
      const testItems: MarketplaceItem[] = testsData.map(test => ({
        id: `test-${test.id}`,
        type: 'test' as const,
        name: test.name,
        code: test.code,
        category: 'tests',
        categoryDisplay: 'Tests Psicológicos',
        icon: 'TestTube2',
        shortDescription: test.description,
        isFree: test.is_free,
        isPopular: test.is_popular,
        benefits: test.benefits
      }));

      // Convertir recursos del sistema a items del marketplace
      const resourceItems: MarketplaceItem[] = MARKETPLACE_RESOURCES.map(resource => ({
        id: `resource-${resource.id}`,
        type: 'resource' as const,
        name: resource.name,
        category: resource.category,
        categoryDisplay: getCategoryDisplay(resource.category),
        icon: resource.icon,
        url: resource.url,
        shortDescription: resource.description,
        priceUSD: resource.price,
        isFree: !resource.isPremium,
        isPopular: resource.isNew,
        isPremium: resource.isPremium,
        requiredAccess: resource.requiredAccess,
        benefits: resource.features
      }));

      const allItems = [...serviceItems, ...testItems, ...resourceItems];
      setItems(allItems);

      // Extraer categorías únicas
      const uniqueCategories = Array.from(new Set(allItems.map(item => item.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplay = (category: string): string => {
    const displayMap: Record<string, string> = {
      tests: 'Tests Psicológicos',
      angels: '72 Ángeles',
      interpretations: 'Interpretaciones IA',
      tools: 'Herramientas',
      education: 'Formación',
      sesiones: 'Sesiones',
      lecturas: 'Lecturas',
      talleres: 'Talleres',
      contenido: 'Contenido',
      acompanamiento: 'Acompañamiento',
      comunidad: 'Comunidad'
    };
    return displayMap[category] || category;
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      'sesiones': 'Users',
      'lecturas': 'BookOpen',
      'formacion': 'GraduationCap',
      'talleres': 'Calendar',
      'contenido': 'Video',
      'acompanamiento': 'Heart',
      'comunidad': 'MessageCircle',
      'tests': 'TestTube2',
      'angels': 'Sparkles',
      'interpretations': 'Brain',
      'tools': 'Wrench',
      'education': 'GraduationCap'
    };
    return iconMap[categoryName] || 'Star';
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Users, BookOpen, GraduationCap, Calendar,
      Video, Heart, MessageCircle, TestTube2,
      Star, Brain, Activity, Target, Sparkles,
      Wrench, Crown, Zap
    };
    return icons[iconName] || Star;
  };

  const accessHierarchy: Record<RequiredAccess, number> = {
    free: 0,
    personal: 1,
    professional: 2,
    premium: 3
  };

  const canAccess = (requiredAccess?: RequiredAccess): boolean => {
    if (!requiredAccess) return true;
    return accessHierarchy[userAccessLevel] >= accessHierarchy[requiredAccess];
  };

  const formatPrice = (item: MarketplaceItem) => {
    if (item.isFree || item.type === 'test') {
      return <span className="text-2xl font-bold text-[#D4AF37]">GRATIS</span>;
    }

    const price = currency === 'USD' ? item.priceUSD : item.priceEUR;
    const discountPrice = currency === 'USD' ? item.discountPriceUSD : item.discountPriceEUR;
    const currencySymbol = currency === 'USD' ? '$' : '€';

    if (item.hasDiscount && discountPrice) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#D4AF37]">{currencySymbol}{discountPrice}</span>
          <span className="text-lg text-gray-400 line-through">{currencySymbol}{price}</span>
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">OFERTA</span>
        </div>
      );
    }

    return <span className="text-2xl font-bold text-[#D4AF37]">{currencySymbol}{price}</span>;
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleItemClick = (item: MarketplaceItem) => {
    // Verificar acceso para recursos
    if (item.type === 'resource' && item.requiredAccess && !canAccess(item.requiredAccess)) {
      router.push('/pricing');
      return;
    }

    if (item.type === 'service') {
      router.push(`/booking/${item.slug}`);
    } else if (item.type === 'test') {
      router.push(`/tests/${item.code}`);
    } else if (item.type === 'resource') {
      // Si tiene URL personalizada, usarla; si no, ruta genérica
      const targetUrl = item.url || `/marketplace/resource/${item.id}`;
      router.push(targetUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-400">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  const stats = {
    services: items.filter(i => i.type === 'service').length,
    tests: items.filter(i => i.type === 'test').length,
    resources: items.filter(i => i.type === 'resource').length,
    total: items.length
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4" style={{ background: 'linear-gradient(to bottom, #0A0A1F, #000000)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6 animate-pulse">🌟</div>
            <h1 className="text-5xl md:text-7xl font-light title-font mb-6" style={{ color: '#D4AF37' }}>
              Marketplace del Alma
            </h1>
            <p className="text-xl text-gray-300 body-font max-w-3xl mx-auto mb-8">
              Descubre todos nuestros servicios de Psicoterapia Kabbalística y tests psicológicos profesionales
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D4AF37]">{stats.services}</div>
                <div className="text-sm text-gray-400">Servicios</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D4AF37]">{stats.tests}</div>
                <div className="text-sm text-gray-400">Tests</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D4AF37]">{stats.resources}</div>
                <div className="text-sm text-gray-400">Recursos</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D4AF37]">{stats.total}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Buscar servicios o tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Type Filter */}
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'all' 
                    ? 'bg-[#D4AF37] text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setSelectedType('service')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'service' 
                    ? 'bg-[#D4AF37] text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Servicios ({stats.services})
              </button>
              <button
                onClick={() => setSelectedType('test')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'test' 
                    ? 'bg-[#D4AF37] text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tests ({stats.tests})
              </button>
              <button
                onClick={() => setSelectedType('resource')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'resource' 
                    ? 'bg-[#D4AF37] text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Recursos ({stats.resources})
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Moneda:</span>
              <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currency === 'USD' 
                      ? 'bg-[#D4AF37] text-black font-bold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USD $
                </button>
                <button
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currency === 'EUR' 
                      ? 'bg-[#D4AF37] text-black font-bold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EUR €
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                  : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-[#D4AF37]'
              }`}
            >
              Todas las Categorías
            </button>
            {categories.map(category => {
              const count = items.filter(i => i.category === category).length;
              const displayName = items.find(i => i.category === category)?.categoryDisplay || category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                      : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-[#D4AF37]'
                  }`}
                >
                  {displayName} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No se encontraron resultados</h3>
            <p className="text-gray-400">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const IconComponent = getIconComponent(item.icon);
              const hasAccess = canAccess(item.requiredAccess);
              const isLocked = item.type === 'resource' && !hasAccess;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative ${
                    isLocked 
                      ? 'opacity-75 hover:border-orange-500 hover:shadow-orange-500/20' 
                      : 'hover:border-[#D4AF37] hover:shadow-[#D4AF37]/20'
                  }`}
                >
                  {/* Lock Badge para recursos sin acceso */}
                  {isLocked && (
                    <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                      <Lock className="w-3 h-3" />
                      <span className="uppercase">{item.requiredAccess}</span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isLocked 
                        ? 'bg-orange-500/10 group-hover:bg-orange-500/20' 
                        : 'bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${isLocked ? 'text-orange-400' : 'text-[#D4AF37]'}`} />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {item.isPopular && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Popular</span>
                        </div>
                      )}
                      {item.type === 'test' && (
                        <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                          TEST
                        </div>
                      )}
                      {item.type === 'resource' && (
                        <div className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full text-xs font-bold">
                          RECURSO
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-semibold mb-2 text-white transition-colors ${
                    isLocked ? 'group-hover:text-orange-400' : 'group-hover:text-[#D4AF37]'
                  }`}>
                    {item.name}
                  </h3>

                  {/* Category */}
                  <div className="text-sm text-gray-400 mb-3">{item.categoryDisplay}</div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {item.shortDescription}
                  </p>

                  {/* Benefits */}
                  {item.benefits && item.benefits.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {item.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isLocked ? 'text-orange-400' : 'text-[#D4AF37]'}`} />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>{formatPrice(item)}</div>
                    <button className={`flex items-center gap-1 group-hover:gap-2 transition-all ${
                      isLocked ? 'text-orange-400' : 'text-[#D4AF37]'
                    }`}>
                      {isLocked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Upgrade</span>
                        </>
                      ) : (
                        <>
                          {item.type === 'test' ? 'Realizar' : item.type === 'resource' ? 'Ver' : 'Ver más'}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade Section - Solo para usuarios sin premium */}
      {userAccessLevel !== 'premium' && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-orange-900/30 via-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-3xl border border-orange-500/30 p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-orange-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 title-font bg-gradient-to-r from-[#D4AF37] via-orange-400 to-[#D4AF37] bg-clip-text text-transparent">
                Desbloquea Todo el Potencial
              </h2>
              
              <p className="text-center text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Accede a recursos exclusivos para profesionales y amplía tus capacidades con herramientas avanzadas
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                  <TestTube2 className="w-8 h-8 text-[#D4AF37] mb-3" />
                  <h3 className="font-bold text-white mb-2">Tests Profesionales</h3>
                  <p className="text-sm text-gray-400">PAI, MCMI-IV, SCID-5 y más herramientas clínicas validadas</p>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                  <Sparkles className="w-8 h-8 text-[#D4AF37] mb-3" />
                  <h3 className="font-bold text-white mb-2">72 Ángeles Completo</h3>
                  <p className="text-sm text-gray-400">Sistema completo de invocación y conexión angelical</p>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                  <Brain className="w-8 h-8 text-[#D4AF37] mb-3" />
                  <h3 className="font-bold text-white mb-2">IA Avanzada</h3>
                  <p className="text-sm text-gray-400">Interpretaciones profesionales ilimitadas con IA</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-orange-500 hover:from-orange-500 hover:to-[#D4AF37] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#D4AF37]/50 flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Ver Planes Premium
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setSelectedType('resource')}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700 hover:border-[#D4AF37]"
                >
                  Ver Recursos Disponibles
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  <span className="text-[#D4AF37] font-bold">Tu nivel actual:</span> {userAccessLevel.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Lato', sans-serif; }
      `}</style>
    </div>
  );
}
