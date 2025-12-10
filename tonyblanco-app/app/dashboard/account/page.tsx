'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership, MembershipStatus } from '@/lib/auth';
import { geocodeCity } from '@/lib/geocoding-api';
import { User, CreditCard, MapPin, FileText, Activity, Clock, Download, Edit2, Save, X } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  full_name: string;
  user_type: string;
  subscription_status: string;
  subscription_plan?: string;
  birth_date?: string;
  phone?: string;
  birth_data?: {
    full_name?: string;
    birth_date?: string;
    birth_time?: string;
    birth_city?: string;
    birth_country?: string;
    birth_latitude?: number;
    birth_longitude?: number;
    is_locked?: boolean;
  };
  membership_expires?: string;
  current_patients_count?: number;
  fichas_created_this_month?: number;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  test_name?: string;
}

interface PaymentHistory {
  id: number;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  description: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string>('');
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadAccountData = async () => {
      const membershipData = await requireMembership(['personal', 'therapist'], '/membership-expired');
      if (membershipData) {
        setMembership(membershipData);
        
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            // Load user profile
                  const profileResponse = await fetch('http://127.0.0.1:8000/api/me/', {
              headers: { 'Authorization': `Token ${token}` }
            });
            if (profileResponse.ok) {
              const userData = await profileResponse.json();
              setUserProfile(userData);
              setEditForm({
                first_name: userData.first_name,
                email: userData.email,
                phone: userData.phone || '',
                birth_city: userData.birth_data?.birth_city || '',
                birth_country: userData.birth_data?.birth_country || '',
                birth_time: userData.birth_data?.birth_time || '',
                birth_latitude: userData.birth_data?.birth_latitude || '',
                birth_longitude: userData.birth_data?.birth_longitude || '',
              });
            }

            // Load activity logs (test results as activity)
            const resultsResponse = await fetch('http://127.0.0.1:8000/api/tests/results/', {
              headers: { 'Authorization': `Token ${token}` }
            });
            if (resultsResponse.ok) {
              const results = await resultsResponse.json();
              const activityLogs: ActivityLog[] = results.map((r: any) => ({
                id: r.id,
                action: 'Test Realizado',
                description: `${r.test_module_name} - ${r.client_name || 'Sin nombre'}`,
                timestamp: r.created_at,
                test_name: r.test_module_name
              }));
              setActivity(activityLogs);
            }

            // Mock payments (replace with real endpoint when available)
            const mockPayments: PaymentHistory[] = [
              {
                id: 1,
                amount: '29.00',
                currency: 'EUR',
                status: 'completed',
                payment_method: 'Tarjeta',
                created_at: '2025-12-01T10:00:00Z',
                description: 'Plan Personal - Mensual'
              },
              {
                id: 2,
                amount: '29.00',
                currency: 'EUR',
                status: 'completed',
                payment_method: 'Tarjeta',
                created_at: '2025-11-01T10:00:00Z',
                description: 'Plan Personal - Mensual'
              }
            ];
            setPayments(mockPayments);

          } catch (error) {
            console.error('Error loading account data:', error);
          }
        }
      }
      setLoading(false);
    };
    loadAccountData();
    
    // Cleanup timeout al desmontar
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Update user profile (this would need a backend endpoint)
      const response = await fetch('http://127.0.0.1:8000/api/me/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        alert('Perfil actualizado correctamente');
        setEditMode(false);
        // Reload profile
                    const profileResponse = await fetch('http://127.0.0.1:8000/api/me/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUserProfile(userData);
        }
      } else {
        alert('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar los cambios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando información de cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold title-font" style={{ color: '#D4AF37' }}>
                  <User className="inline w-5 h-5 mr-2" />
                  Perfil
                </h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-[#D4AF37] hover:text-[#B8941F] flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditForm({
                          first_name: userProfile?.first_name,
                          email: userProfile?.email,
                          phone: userProfile?.phone || '',
                        });
                      }}
                      className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Usuario</label>
                  <div className="text-white font-semibold">@{userProfile?.username}</div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Nombre Completo</label>
                  <div className="text-white font-semibold">{userProfile?.full_name || 'No configurado'}</div>
                  {userProfile?.birth_data?.is_locked && (
                    <p className="text-xs text-yellow-400 mt-1">🔒 Bloqueado</p>
                  )}
                </div>

                {!editMode ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Email</label>
                      <div className="text-white">{userProfile?.email}</div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Teléfono</label>
                      <div className="text-white">{userProfile?.phone || 'No configurado'}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fecha de Nacimiento</label>
                  {!editMode ? (
                    <>
                      <div className="text-white">
                        {userProfile?.birth_data?.birth_date 
                          ? new Date(userProfile.birth_data.birth_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                          : userProfile?.birth_date 
                            ? new Date(userProfile.birth_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'No configurada'
                        }
                      </div>
                      {userProfile?.birth_data?.birth_time && (
                        <div className="text-sm text-gray-400 mt-1">Hora: {userProfile.birth_data.birth_time}</div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={userProfile?.birth_data?.birth_date || userProfile?.birth_date || ''}
                        onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                      />
                      <input
                        type="time"
                        value={editForm.birth_time || ''}
                        onChange={(e) => setEditForm({...editForm, birth_time: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                        placeholder="HH:MM (formato 24h)"
                      />
                      <p className="text-xs text-gray-500">Hora de nacimiento (formato 24h, ej: 20:00 para 8:00 PM)</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    Lugar de Nacimiento
                  </label>
                  {!editMode ? (
                    <div className="text-white">
                      {userProfile?.birth_data?.birth_city || 'No configurado'}
                      {userProfile?.birth_data?.birth_country && `, ${userProfile.birth_data.birth_country}`}
                      {(userProfile?.birth_data?.birth_latitude && userProfile?.birth_data?.birth_longitude) && (
                        <div className="text-xs text-gray-400 mt-1">
                          Coordenadas: {userProfile.birth_data.birth_latitude}, {userProfile.birth_data.birth_longitude}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.birth_city || ''}
                          onChange={(e) => {
                            const city = e.target.value;
                            setEditForm((prev: any) => ({...prev, birth_city: city}));
                            setGeocodingError('');
                            
                            // Limpiar timeout anterior
                            if (geocodeTimeoutRef.current) {
                              clearTimeout(geocodeTimeoutRef.current);
                            }
                            
                            // Limpiar coordenadas si cambia la ciudad
                            if (city !== userProfile?.birth_data?.birth_city) {
                              setEditForm((prev: any) => ({
                                ...prev,
                                birth_city: city,
                                birth_latitude: undefined,
                                birth_longitude: undefined
                              }));
                            }
                            
                            // Geocodificar automáticamente con debounce (800ms)
                            if (city.length >= 3) {
                              // Capturar valores actuales antes del setTimeout
                              const cityToGeocode = city;
                              const countryToUse = editForm.birth_country || '';
                              
                              geocodeTimeoutRef.current = setTimeout(async () => {
                                setGeocodingLoading(true);
                                try {
                                  const geoResult = await geocodeCity(cityToGeocode, countryToUse);
                                  if (geoResult && geoResult.success) {
                                    setEditForm((prev: any) => ({
                                      ...prev,
                                      birth_city: cityToGeocode,
                                      birth_latitude: geoResult.latitude,
                                      birth_longitude: geoResult.longitude,
                                      birth_country: geoResult.country || prev.birth_country
                                    }));
                                    setGeocodingError('');
                                  } else {
                                    setGeocodingError('No se pudo encontrar la ciudad. Verifica el nombre.');
                                  }
                                } catch (error) {
                                  console.error('Error geocodificando:', error);
                                  setGeocodingError('Error al calcular coordenadas. Intenta de nuevo.');
                                } finally {
                                  setGeocodingLoading(false);
                                }
                              }, 800);
                            } else {
                              setGeocodingLoading(false);
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                          placeholder="Ciudad (se calculan coordenadas automáticamente)"
                        />
                        {geocodingLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4AF37]"></div>
                          </div>
                        )}
                      </div>
                      {geocodingError && (
                        <p className="text-xs text-red-400">{geocodingError}</p>
                      )}
                      <input
                        type="text"
                        value={editForm.birth_country || ''}
                        onChange={async (e) => {
                          const country = e.target.value;
                          setEditForm({...editForm, birth_country: country});
                          
                          // Si hay ciudad y no hay coordenadas, geocodificar con el nuevo país
                          if (editForm.birth_city && editForm.birth_city.length >= 3 && !editForm.birth_latitude) {
                            setGeocodingLoading(true);
                            try {
                              const geoResult = await geocodeCity(editForm.birth_city, country);
                              if (geoResult && geoResult.success) {
                                setEditForm((prev: any) => ({
                                  ...prev,
                                  birth_country: country,
                                  birth_latitude: geoResult.latitude,
                                  birth_longitude: geoResult.longitude
                                }));
                                setGeocodingError('');
                              }
                            } catch (error) {
                              console.error('Error geocodificando:', error);
                            } finally {
                              setGeocodingLoading(false);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                        placeholder="País (opcional, ayuda a precisar)"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.0001"
                            value={editForm.birth_latitude || ''}
                            onChange={(e) => setEditForm({...editForm, birth_latitude: parseFloat(e.target.value) || ''})}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            placeholder={geocodingLoading ? "Calculando..." : "Latitud (auto)"}
                            readOnly={geocodingLoading}
                          />
                          {editForm.birth_latitude && !geocodingLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">✓</span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.0001"
                            value={editForm.birth_longitude || ''}
                            onChange={(e) => setEditForm({...editForm, birth_longitude: parseFloat(e.target.value) || ''})}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            placeholder={geocodingLoading ? "Calculando..." : "Longitud (auto)"}
                            readOnly={geocodingLoading}
                          />
                          {editForm.birth_longitude && !geocodingLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">✓</span>
                          )}
                        </div>
                      </div>
                        <p className="text-xs text-gray-500">
                          💡 Ingresa la ciudad y las coordenadas se calcularán automáticamente. Puedes editarlas manualmente si lo necesitas.
                        </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Tipo de Usuario</label>
                  <div className="inline-block px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-300">
                    {userProfile?.user_type === 'personal' ? '👤 Personal' : '👨‍⚕️ Terapeuta'}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
              <h2 className="text-xl font-bold title-font mb-4" style={{ color: '#D4AF37' }}>
                <CreditCard className="inline w-5 h-5 mr-2" />
                Suscripción
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Plan Actual</label>
                  <div className="text-white font-semibold text-lg">
                    {userProfile?.subscription_plan === 'personal' ? 'Plan Personal' :
                     userProfile?.subscription_plan === 'professional' ? 'Plan Profesional' :
                     userProfile?.subscription_plan === 'premium' ? 'Plan Premium' :
                     'Plan Trial'}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Estado</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    userProfile?.subscription_status === 'active' ? 'bg-green-900/30 border border-green-500/30 text-green-300' :
                    userProfile?.subscription_status === 'trial' ? 'bg-blue-900/30 border border-blue-500/30 text-blue-300' :
                    'bg-gray-900/30 border border-gray-500/30 text-gray-300'
                  }`}>
                    {userProfile?.subscription_status === 'active' ? '✓ Activa' :
                     userProfile?.subscription_status === 'trial' ? '🎁 Trial' :
                     'Inactiva'}
                  </div>
                </div>

                {userProfile?.membership_expires && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Expira</label>
                    <div className="text-white">
                      {new Date(userProfile.membership_expires).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all"
                  >
                    Mejorar Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            {userProfile?.user_type === 'personal' && (
              <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
                <h2 className="text-xl font-bold title-font mb-4" style={{ color: '#D4AF37' }}>
                  <Activity className="inline w-5 h-5 mr-2" />
                  Uso Este Mes
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Tests Realizados</label>
                    <div className="text-2xl font-bold text-white">
                      {userProfile?.fichas_created_this_month || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Payments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
              <h2 className="text-xl font-bold title-font mb-4" style={{ color: '#D4AF37' }}>
                <Clock className="inline w-5 h-5 mr-2" />
                Actividad Reciente
              </h2>

              {activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-[#D4AF37]/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{log.action}</div>
                        <div className="text-sm text-gray-400">{log.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold title-font" style={{ color: '#D4AF37' }}>
                  <CreditCard className="inline w-5 h-5 mr-2" />
                  Historial de Pagos
                </h2>
                <button className="text-sm text-[#D4AF37] hover:text-[#B8941F] flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-xs text-gray-400 font-normal pb-3">Fecha</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-3">Descripción</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-3">Método</th>
                        <th className="text-right text-xs text-gray-400 font-normal pb-3">Monto</th>
                        <th className="text-center text-xs text-gray-400 font-normal pb-3">Estado</th>
                        <th className="text-center text-xs text-gray-400 font-normal pb-3">Factura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-3 text-sm text-gray-300">
                            {new Date(payment.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-sm text-white">{payment.description}</td>
                          <td className="py-3 text-sm text-gray-400">{payment.payment_method}</td>
                          <td className="py-3 text-sm text-white text-right font-semibold">
                            {payment.amount} {payment.currency}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                              payment.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                              'bg-red-900/30 text-red-300'
                            }`}>
                              {payment.status === 'completed' ? 'Completado' :
                               payment.status === 'pending' ? 'Pendiente' :
                               'Fallido'}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button className="text-[#D4AF37] hover:text-[#B8941F] text-sm">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay pagos registrados</p>
                </div>
              )}
            </div>

            {/* Reports Section */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl p-6">
              <h2 className="text-xl font-bold title-font mb-4" style={{ color: '#D4AF37' }}>
                <FileText className="inline w-5 h-5 mr-2" />
                Informes y Documentos
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/tests/results')}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left group"
                >
                  <FileText className="w-8 h-8 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-white">Mis Análisis</div>
                  <div className="text-sm text-gray-400 mt-1">Ver todos los análisis realizados</div>
                </button>

                <button className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left group">
                  <Download className="w-8 h-8 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-white">Descargar Datos</div>
                  <div className="text-sm text-gray-400 mt-1">Exportar toda tu información</div>
                </button>

                <button className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left group">
                  <CreditCard className="w-8 h-8 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-white">Facturas</div>
                  <div className="text-sm text-gray-400 mt-1">Descargar facturas de pago</div>
                </button>

                <button className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-[#D4AF37]/50 transition-colors text-left group">
                  <Activity className="w-8 h-8 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-white">Reporte de Actividad</div>
                  <div className="text-sm text-gray-400 mt-1">Historial completo de uso</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
