'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Star, Book, Calendar, Clock, Crown, Lock, Bell } from 'lucide-react';
import angelsData from '@/data/seventyTwoAngels.json';
import AngelCalendar from '@/components/AngelCalendar';
import {
  getAngelName,
  getAngelAttribute,
  formatPresidingDates,
  ANGELIC_ORDERS,
  getAngelsByOrder,
  extractInvocationInfo,
  translateGodName,
  type Angel
} from '@/lib/angels-system';

export default function SeventyTwoAngelsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string>('all');
  const [selectedAngel, setSelectedAngel] = useState<Angel | null>(null);
  const [userHasAccess, setUserHasAccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Verificar acceso del usuario
    const checkAccess = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Obtener perfil del usuario
          const profileResponse = await fetch('http://127.0.0.1:8000/api/me/', {
            headers: { 'Authorization': `Token ${token}` }
          });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            setUserProfile(profile);
            
            // Verificar membresía
            const membershipResponse = await fetch('http://127.0.0.1:8000/api/check-membership/', {
              headers: { 'Authorization': `Token ${token}` }
            });
            if (membershipResponse.ok) {
              const membership = await membershipResponse.json();
              // Acceso si es supertony, superuser, staff, o tiene plan premium
              const hasAccess = 
                profile.username === 'supertony' ||
                membership.is_superuser ||
                membership.subscription_plan === 'premium';
              setUserHasAccess(hasAccess);
            }
          }
        } catch (error) {
          console.error('Error checking access:', error);
        }
      }
    };
    
    checkAccess();
  }, []);

  const angels = angelsData as Angel[];

  // Filtrar ángeles
  const filteredAngels = angels.filter(angel => {
    const matchesSearch = searchQuery === '' ||
      angel.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      angel.name.he.includes(searchQuery);
    
    const matchesOrder = selectedOrder === 'all' || angel.angelicOrderId === selectedOrder;
    
    return matchesSearch && matchesOrder;
  });

  const angelOrders = Object.values(ANGELIC_ORDERS).sort((a, b) => a.choir - b.choir);

  if (!userHasAccess) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4 title-font">
                Los 72 Ángeles de la Cábala
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                El Shem ha-Mephorash: El Nombre de 72 Letras
              </p>
            </div>
          </div>
        </div>

        {/* Contenido bloqueado */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-orange-900/30 via-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-3xl border border-orange-500/30 p-12 text-center relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-4 title-font">
                Contenido Premium
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Accede al sistema completo de los 72 Ángeles de la Cábala con sus invocaciones, 
                atributos divinos y períodos de influencia.
              </p>

              {/* Características */}
              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <Star className="w-6 h-6 text-purple-400 mb-2" />
                  <h3 className="font-bold text-white mb-1">72 Ángeles Completos</h3>
                  <p className="text-sm text-gray-400">
                    Nombres en hebreo, atributos divinos y enseñanzas de cada ángel
                  </p>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <Book className="w-6 h-6 text-purple-400 mb-2" />
                  <h3 className="font-bold text-white mb-1">Invocaciones y Salmos</h3>
                  <p className="text-sm text-gray-400">
                    Horas favorables, salmos asociados y métodos de invocación
                  </p>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <Calendar className="w-6 h-6 text-purple-400 mb-2" />
                  <h3 className="font-bold text-white mb-1">Calendarios de Presidencia</h3>
                  <p className="text-sm text-gray-400">
                    Fechas específicas en las que cada ángel ejerce su influencia
                  </p>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <Crown className="w-6 h-6 text-purple-400 mb-2" />
                  <h3 className="font-bold text-white mb-1">9 Órdenes Angélicos</h3>
                  <p className="text-sm text-gray-400">
                    Jerarquía celestial completa desde Serafines hasta Ángeles
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Desbloquear Acceso Premium
                </button>
                
                <button
                  onClick={() => window.location.href = '/marketplace'}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700 hover:border-purple-500"
                >
                  Ver en Marketplace
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                <span className="text-purple-400 font-bold">$49.99</span> • Acceso ilimitado de por vida
              </p>
            </div>
          </div>

          {/* Vista previa de 3 ángeles */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Vista Previa</h3>
            <p className="text-center text-gray-400 mb-8">Explora estos 3 ángeles gratuitamente</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {angels.slice(0, 3).map((angel, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {angel.name.en}
                    </h4>
                    <p className="text-lg text-purple-300 font-hebrew">
                      {angel.name.he}
                    </p>
                  </div>
                  
                  <div className="bg-purple-950/30 rounded-lg p-3">
                    <p className="text-xs text-purple-400 mb-1">Atributo</p>
                    <p className="text-sm text-white">
                      {getAngelAttribute(angel, 'en')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx global>{`
          .title-font { font-family: 'Cormorant Garamond', serif; }
          .font-hebrew {
            font-family: 'David Libre', 'Times New Roman', serif;
            letter-spacing: 0.05em;
          }
        `}</style>
      </div>
    );
  }

  // Contenido completo para usuarios premium
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 title-font">
              Los 72 Ángeles de la Cábala
            </h1>
            <p className="text-xl text-gray-300">
              El Shem ha-Mephorash: El Nombre de 72 Letras
            </p>
          </div>

          {/* Búsqueda y filtros */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre (en inglés o hebreo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  showCalendar
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {showCalendar ? 'Ocultar Calendario' : 'Ver Calendario'}
              </button>

              <button
                onClick={() => router.push('/notifications')}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Notificaciones
              </button>
            </div>

            {/* Filtro por orden angélico */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedOrder('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedOrder === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                Todos los Ángeles
              </button>
              {angelOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedOrder === order.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {order.name.es}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendario Angélico */}
      {showCalendar && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AngelCalendar />
        </div>
      )}

      {/* Grid de ángeles */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-gray-400 mb-6">
          Mostrando {filteredAngels.length} de {angels.length} ángeles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAngels.map((angel, idx) => {
            const angelicOrder = ANGELIC_ORDERS[angel.angelicOrderId];
            const dates = formatPresidingDates(angel.presidesOver);
            
            return (
              <div
                key={idx}
                onClick={() => router.push(`/angels/${angel.name.en.toLowerCase()}`)}
                className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-700 hover:border-purple-500 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {angel.name.en}
                    </h3>
                    <p className="text-lg text-purple-300 font-hebrew">
                      {angel.name.he}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-950/30 rounded-lg p-3">
                    <p className="text-xs text-purple-400 mb-1">Atributo Divino</p>
                    <p className="text-sm text-white line-clamp-2">
                      {getAngelAttribute(angel, 'en')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Sparkles className="w-3 h-3" />
                    <span>{angelicOrder?.name.es}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {dates.slice(0, 2).map((date, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full"
                      >
                        {date}
                      </span>
                    ))}
                    {dates.length > 2 && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                        +{dates.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalle del ángel */}
      {selectedAngel && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAngel(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedAngel.name.en}
                  </h2>
                  <p className="text-2xl text-purple-300 font-hebrew">
                    {selectedAngel.name.he}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAngel(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-950/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-2">Atributo Divino</p>
                  <p className="text-white text-lg">
                    {getAngelAttribute(selectedAngel, 'en')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-purple-300 text-sm mb-2">Nombre de Dios</p>
                    <p className="text-white font-bold">
                      {translateGodName(selectedAngel.godName)}
                    </p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-purple-300 text-sm mb-2">Orden Angélico</p>
                    <p className="text-white font-bold">
                      {ANGELIC_ORDERS[selectedAngel.angelicOrderId]?.name.es}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-950/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm font-semibold mb-3">
                    Días de Presidencia
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formatPresidingDates(selectedAngel.presidesOver).map((date, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-900/30 text-blue-200 text-sm rounded-full border border-blue-500/30"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-950/20 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-semibold mb-3">
                    Enseñanzas e Influencia
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedAngel.text.en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .font-hebrew {
          font-family: 'David Libre', 'Times New Roman', serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
