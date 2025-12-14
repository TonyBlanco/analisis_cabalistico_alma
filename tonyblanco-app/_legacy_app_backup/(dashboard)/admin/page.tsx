'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/role-guards';
import { checkAdminAccess, getAdminStats, AdminStats } from '@/lib/admin-api';
import { BarChart3, Users, ClipboardList, GraduationCap, Activity } from 'lucide-react';
import AdminSystemOverview from '@/components/admin/AdminSystemOverview';
import AdminUsersManagement from '@/components/admin/AdminUsersManagement';
import AdminTherapistsGovernance from '@/components/admin/AdminTherapistsGovernance';
import AdminTestGovernance from '@/components/admin/AdminTestGovernance';
import AdminLMSIntegration from '@/components/admin/AdminLMSIntegration';

type AdminSection = 'system' | 'users' | 'therapists' | 'tests' | 'courses';

/**
 * Admin Dashboard - Panel de Administración
 * 
 * Solo accesible para usuarios con rol 'admin'
 * Estilo: Sobrio, profesional, clínico
 * Aislado de otros dashboards
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('system');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard estricto: solo admins
  const { authorized } = useRoleGuard({
    currentUserRole: getUserRole() as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['admin'],
    redirectTo: '/dashboard'
  });

  useEffect(() => {
    const loadData = async () => {
      if (!authorized) return;

      try {
        // Verificar acceso de admin
        const hasAccess = await checkAdminAccess();
        if (!hasAccess) {
          router.push('/dashboard');
          return;
        }

        // Cargar estadísticas
        const statsData = await getAdminStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authorized) {
      loadData();
    }
  }, [authorized, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const sections = [
    { id: 'system' as AdminSection, label: 'Resumen del Sistema', icon: BarChart3 },
    { id: 'users' as AdminSection, label: 'Usuarios y Roles', icon: Users },
    { id: 'therapists' as AdminSection, label: 'Terapeutas y Licencias', icon: Activity },
    { id: 'tests' as AdminSection, label: 'Tests', icon: ClipboardList },
    { id: 'courses' as AdminSection, label: 'LMS', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                    activeSection === section.id
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'system' && <AdminSystemOverview stats={stats} />}
        {activeSection === 'users' && <AdminUsersManagement />}
        {activeSection === 'therapists' && <AdminTherapistsGovernance />}
        {activeSection === 'tests' && <AdminTestGovernance />}
        {activeSection === 'courses' && <AdminLMSIntegration />}
      </div>
    </div>
  );
}
