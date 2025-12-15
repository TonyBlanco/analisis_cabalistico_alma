'use client';

import { useEffect, useState } from 'react';
import { fetchSession } from '@/lib/session';
import { useRoleGuard } from '@/lib/role-guards';
import { getAvailableTests } from '@/lib/test-api';
import PersonalTestsSection from '@/components/PersonalTestsSection';
import UpgradeCTASection from '@/components/UpgradeCTASection';
import PersonalResourcesSection from '@/components/PersonalResourcesSection';

export default function PersonalDashboard() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  const [userName, setUserName] = useState<string>('');
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
  }, []);

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

  if (roleLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authorized || (role !== 'personal' && role !== 'admin')) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Section 1: Personal Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Estado de acceso</p>
              <p className="text-sm text-gray-600">
                {subscriptionStatus?.active ? (
                  <span className="text-green-600 font-medium">
                    Plan {subscriptionStatus.plan}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Exploración básica activa (sin acompañamiento clínico)
                  </span>
                )}
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
        </div>

        {/* Section 2: Personal Tests */}
        <PersonalTestsSection />

        {/* Section 3: Personal Resources */}
        <PersonalResourcesSection />

        {/* Section 4: Upgrade CTA */}
        <UpgradeCTASection />
      </div>
    </div>
  );
}
