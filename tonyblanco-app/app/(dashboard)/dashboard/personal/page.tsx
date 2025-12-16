'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { getAvailableTests } from '@/lib/test-api';
import PersonalExplorationsSection from '@/components/PersonalExplorationsSection';
import PersonalResultsSection from '@/components/PersonalResultsSection';
import UpgradeCTASection from '@/components/UpgradeCTASection';

export default function PersonalDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    plan: string;
    active: boolean;
  } | null>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUserName(session.user.username || '');
      }
    });
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      // Allow admin or personal access
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/login');
      }
    });
  }, [router]);

  useEffect(() => {
    if (role === 'personal' || role === 'admin') {
      fetchSubscriptionInfo();
    }
  }, [role]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await getAvailableTests();
      setSubscriptionStatus({
        plan: response.subscription_plan || 'free',
        active: response.membership_active || false,
      });
    } catch (err) {
      console.warn('Error fetching subscription info:', err);
      setSubscriptionStatus({
        plan: 'free',
        active: false,
      });
    }
  };

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'personal' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Section 1: Personal Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Panel Personal
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Herramientas de auto-reflexión y crecimiento personal
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Cuenta Personal
            </span>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Estado de suscripción</p>
              <p className="text-sm text-gray-600">
                {subscriptionStatus?.active ? (
                  <span className="text-green-600 font-medium">Plan {subscriptionStatus.plan}</span>
                ) : (
                  <span className="text-gray-500">Plan básico</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Available Explorations */}
      <PersonalExplorationsSection />

      {/* Section 3: My Explorations (Results) */}
      <PersonalResultsSection />

      {/* Section 4: Upgrade CTA */}
      <UpgradeCTASection />
    </div>
  );
}
