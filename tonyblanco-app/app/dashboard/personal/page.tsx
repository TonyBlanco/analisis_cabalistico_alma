'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireMembership, MembershipStatus } from '@/lib/auth';
import { Sparkles, BookOpen, Heart, TrendingUp } from 'lucide-react';

interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  user_type: string;
  birth_date?: string;
  birth_data?: {
    full_name?: string;
    birth_date?: string;
    birth_time?: string;
    birth_city?: string;
    birth_country?: string;
    birth_latitude?: number;
    birth_longitude?: number;
    is_locked?: boolean;
    unlock_requested?: boolean;
  }
}

interface UserStats {
  total_tests: number;
  tests_this_month: number;
  available_tests: number;
  total_results: number;
}

export default function PersonalDashboard() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBirthData, setEditingBirthData] = useState(false);
  const [birthForm, setBirthForm] = useState<any>({});
  const [sendingUnlock, setSendingUnlock] = useState(false);
  const [unlockToken, setUnlockToken] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      const membershipData = await requireMembership(['personal'], '/membership-expired');
      if (membershipData) {
        setMembership(membershipData);
        
        // Cargar datos del usuario
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            // Cargar perfil
            const profileResponse = await fetch('http://127.0.0.1:8000/api/me/', {
              headers: {
                'Authorization': `Token ${token}`
              }
            });
            if (profileResponse.ok) {
              const userData = await profileResponse.json();
              setUserProfile(userData);
              setBirthForm(userData.birth_data || { full_name: userData.full_name, birth_date: userData.birth_date });
            }
            
            // Cargar estadísticas
            const statsResponse = await fetch('http://127.0.0.1:8000/api/tests/stats/', {
              headers: {
                'Authorization': `Token ${token}`
              }
            });
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              setUserStats(stats);
            }
          } catch (error) {
            console.error('Error cargando datos:', error);
          }
        }
      }
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4AF37' }} />
        <h2 className="text-4xl md:text-5xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
          Bienvenido{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}
        </h2>
        <p className="text-xl text-gray-400 body-font max-w-2xl mx-auto">
          Tu espacio personal para el análisis cabalístico y crecimiento espiritual
        </p>
        {userProfile?.full_name && (
          <p className="text-sm text-gray-500 mt-2">
            Los análisis usarán tu nombre registrado: <strong className="text-[#D4AF37]">{userProfile.full_name}</strong>
          </p>
        )}
        {(userProfile?.birth_data?.birth_date || userProfile?.birth_date) && (
          <p className="text-sm text-gray-500 mt-1">
            Fecha de nacimiento registrada: <strong className="text-[#D4AF37]">
              {(() => {
                const dateStr = userProfile?.birth_data?.birth_date || userProfile?.birth_date;
                if (!dateStr) return '';
                try {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                } catch {
                  return dateStr;
                }
              })()}
            </strong>
          </p>
        )}
        {userProfile?.birth_data?.is_locked && (
          <p className="text-sm text-yellow-400 mt-1">🔒 Tus datos de nacimiento están bloqueados para futuros cambios</p>
        )}
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => router.push('/tests/results')}
            className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20 cursor-pointer hover:bg-slate-900/70 transition-all"
          >
            <BookOpen className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">{userStats?.total_results || 0}</h3>
            <p className="text-gray-400 text-sm body-font">Análisis Realizados</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20">
            <Heart className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">{userStats?.tests_this_month || 0}</h3>
            <p className="text-gray-400 text-sm body-font">Tests Este Mes</p>
          </div>

          <div 
            onClick={() => router.push('/tests')}
            className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-[#D4AF37]/20 cursor-pointer hover:bg-slate-900/70 transition-all"
          >
            <TrendingUp className="w-8 h-8 mb-3" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-1">{userStats?.available_tests || 0}</h3>
            <p className="text-gray-400 text-sm body-font">Tests Disponibles</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-md p-12 rounded-2xl border-2 border-[#D4AF37]/30 text-center mb-8">
          <h3 className="text-3xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            ¿Listo para descubrir tu Árbol de la Vida?
          </h3>
          <p className="text-gray-300 body-font mb-6 max-w-2xl mx-auto">
            Genera tu primer análisis cabalístico completo y comienza tu viaje de autoconocimiento
          </p>
          <button
            onClick={() => router.push('/tests')}
            className="px-12 py-4 bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] hover:from-[#B8941F] hover:to-[#D4AF37] text-black font-bold rounded-lg transition-all text-lg body-font"
          >
            Crear Mi Análisis
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20">
            <h3 className="text-2xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
              Tests Disponibles
            </h3>
            <p className="text-gray-400 body-font mb-4">
              Explora y realiza tests cabalísticos modulares según tu membresía
            </p>
            <button
              onClick={() => router.push('/tests')}
              className="px-6 py-3 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              Ver Tests →
            </button>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20">
            <h3 className="text-2xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
              Mis Análisis
            </h3>
            <p className="text-gray-400 body-font mb-4">
              Accede a todos tus análisis cabalísticos guardados
            </p>
            <button
              onClick={() => router.push('/tests/results')}
              className="px-6 py-3 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              Ver Mis Análisis →
            </button>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20">
            <h3 className="text-2xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
              Recursos
            </h3>
            <p className="text-gray-400 body-font mb-4">
              Guías, meditaciones y ejercicios para tu crecimiento
            </p>
            <button
              className="px-6 py-3 bg-slate-800 border border-[#D4AF37]/30 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all body-font"
            >
              Explorar Recursos →
            </button>
          </div>
        </div>

        {/* Birth Data Card */}
        <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-xl border border-[#D4AF37]/20">
          <h3 className="text-2xl font-light title-font mb-4" style={{ color: '#D4AF37' }}>
            Datos de Nacimiento
          </h3>
          <p className="text-gray-400 mb-4">Tus datos se usan en todos los análisis personales.</p>
          {userProfile?.birth_data ? (
            <div>
              <p className="text-gray-200">Nombre: <strong className="text-white">{userProfile.birth_data.full_name || userProfile.full_name}</strong></p>
              <p className="text-gray-200">Fecha: <strong className="text-white">
                {(() => {
                  try {
                    if (!userProfile.birth_data?.birth_date) return 'No configurado';
                    const date = new Date(userProfile.birth_data.birth_date);
                    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                  } catch {
                    return userProfile.birth_data?.birth_date || 'No configurado';
                  }
                })()}
              </strong></p>
              {userProfile.birth_data.birth_time && (
                <p className="text-gray-200">Hora: <strong className="text-white">{userProfile.birth_data.birth_time}</strong></p>
              )}
              {userProfile.birth_data.birth_city && (
                <p className="text-gray-200">Ciudad: <strong className="text-white">{userProfile.birth_data.birth_city}</strong></p>
              )}

              {userProfile.birth_data.is_locked ? (
                <div className="mt-4">
                  <p className="text-yellow-400">🔒 Datos bloqueados</p>
                  {userProfile.birth_data.unlock_requested && (
                    <p className="text-yellow-300">Solicitud de desbloqueo enviada. Revisa tu email.</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-4 py-2 bg-purple-600 rounded-lg"
                      onClick={async () => {
                        // Send unlock email
                        setSendingUnlock(true);
                        try {
                          const token = localStorage.getItem('authToken');
                          const res = await fetch('http://127.0.0.1:8000/api/me/birth-data/send-unlock-email/', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Token ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          if (res.ok) alert('Solicitud de desbloqueo enviada por email (revisar bandeja).');
                          else alert('No se pudo enviar la solicitud.');
                        } catch (err) {
                          alert('Error al solicitar desbloqueo');
                        } finally {
                          setSendingUnlock(false);
                        }
                      }}
                    >Solicitar desbloqueo</button>

                    <button
                      className="px-4 py-2 bg-green-600 rounded-lg"
                      onClick={async () => {
                        // Simulate payment confirmation route
                        const token = localStorage.getItem('authToken');
                        const res = await fetch('http://127.0.0.1:8000/api/me/birth-data/unlock/', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ payment_confirmed: true })
                        });
                        if (res.ok) {
                          alert('Datos desbloqueados (simulado por pago). Por favor recarga la página.');
                          location.reload();
                        } else {
                          alert('No fue posible desbloquear.');
                        }
                      }}
                    >Desbloquear via pago</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    className="px-4 py-2 bg-[#D4AF37] rounded-lg text-black"
                    onClick={() => setEditingBirthData(true)}
                  >Editar datos</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-400">No has completado tus datos de nacimiento.</p>
              <button className="px-4 py-2 bg-[#D4AF37] rounded-lg text-black mt-4" onClick={() => setEditingBirthData(true)}>Completar ahora</button>
            </div>
          )}

          {editingBirthData && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400">Nombre completo</label>
                <input className="w-full px-3 py-2 bg-gray-800 rounded-lg" value={birthForm.full_name || ''} onChange={(e) => setBirthForm({...birthForm, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Fecha de nacimiento</label>
                <input type="date" className="w-full px-3 py-2 bg-gray-800 rounded-lg" value={birthForm.birth_date || ''} onChange={(e) => setBirthForm({...birthForm, birth_date: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 rounded-lg" onClick={async () => {
                  const token = localStorage.getItem('authToken');
                  try {
                    const res = await fetch('http://127.0.0.1:8000/api/me/birth-data/', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(birthForm)
                    });
                    if (res.ok) {
                      alert('Datos guardados.');
                      setEditingBirthData(false);
                      location.reload();
                    } else {
                      alert('Error guardando datos');
                    }
                  } catch (err) { alert('Error guardando datos'); }
                }}>Guardar</button>
                <button className="px-4 py-2 bg-gray-700 rounded-lg" onClick={() => setEditingBirthData(false)}>Cancelar</button>
              </div>
            </div>
          )}
                    {userProfile?.birth_data?.unlock_requested && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-400 mb-2">¿Recibiste el email con el token? Introduce aquí el token para desbloquear:</p>
                        <div className="flex gap-2">
                          <input className="w-full px-3 py-2 bg-gray-800 rounded-lg" placeholder="Token" value={unlockToken} onChange={(e) => setUnlockToken(e.target.value)} />
                          <button className="px-4 py-2 bg-green-600 rounded-lg" onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            try {
                              const res = await fetch('http://127.0.0.1:8000/api/me/birth-data/unlock/', {
                                method: 'POST', headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: unlockToken })
                              });
                              if (res.ok) {
                                alert('Token confirmado, datos desbloqueados');
                                location.reload();
                              } else {
                                const text = await res.json();
                                alert('No se pudo desbloquear: ' + (text.error || 'Error')); 
                              }
                            } catch (err) { alert('Error al confirmar token'); }
                          }}>Confirmar token</button>
                        </div>
                      </div>
                    )}
          {editingBirthData && (
            <div className="flex items-center gap-3 mt-4">
              <input id="lock" type="checkbox" checked={birthForm.is_locked || false} onChange={(e) => setBirthForm({...birthForm, is_locked: e.target.checked})} />
              <label className="text-sm text-gray-400" htmlFor="lock">Bloquear mis datos (impide edición sin verificación)</label>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
