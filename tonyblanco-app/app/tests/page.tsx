'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableTests } from '@/lib/test-api';
import { TestModule } from '@/lib/test-types';
import TestCard from '@/components/TestCard';

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [membershipActive, setMembershipActive] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await getAvailableTests();
      
      setTests(data.tests);
      setUserType(data.user_type);
      setSubscriptionPlan(data.subscription_plan);
      setMembershipActive(data.membership_active);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Error al cargar los tests disponibles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tests disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadTests}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Tests Disponibles
              </h1>
              <p className="text-gray-400">
                Explora y realiza análisis cabalísticos según tu membresía
              </p>
            </div>
            
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>

          {/* Información de membresía */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tipo de Usuario</p>
                  <p className="text-white font-semibold">
                    {userType === 'therapist' ? '💼 Terapeuta' : '👤 Personal'}
                  </p>
                </div>
                
                <div className="h-10 w-px bg-gray-700"></div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Plan Actual</p>
                  <p className="text-white font-semibold">
                    {subscriptionPlan === 'premium' && '⭐ Premium'}
                    {subscriptionPlan === 'professional' && '💼 Profesional'}
                    {subscriptionPlan === 'personal' && '👤 Personal'}
                    {!subscriptionPlan && '🆓 Gratuito'}
                  </p>
                </div>
                
                <div className="h-10 w-px bg-gray-700"></div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <p className={`font-semibold ${membershipActive ? 'text-green-400' : 'text-red-400'}`}>
                    {membershipActive ? '✓ Activa' : '✗ Inactiva'}
                  </p>
                </div>
              </div>
              
              {!membershipActive && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all"
                >
                  Activar Membresía
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de tests */}
        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No hay tests disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                userLevel={subscriptionPlan || 'free'}
              />
            ))}
          </div>
        )}

        {/* Stats rápidas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-2xl font-bold text-white mb-1">
              {tests.filter(t => t.is_available).length}
            </p>
            <p className="text-sm text-gray-400">Tests Disponibles</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-2xl font-bold text-white mb-1">
              {tests.filter(t => t.user_access && t.user_access.uses_count > 0).length}
            </p>
            <p className="text-sm text-gray-400">Tests Realizados</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">🔓</div>
            <p className="text-2xl font-bold text-white mb-1">
              {tests.filter(t => t.user_access?.can_use).length}
            </p>
            <p className="text-sm text-gray-400">Listos para Usar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
