'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getActiveRole, setActiveRole } from '@/lib/role-state';
import { getActiveDashboardRole } from '@/lib/getActiveDashboardRole';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, BookOpen, FileText, FolderOpen, Music, Video, GraduationCap, Star, Home, TestTube, BarChart3, User, Workflow, Menu, X } from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  locked?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [realUserRole, setRealUserRole] = useState<string | null>(null);
  const [themeRole, setThemeRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    // Get real user role from backend
    getUserRole().then((role) => {
      if (role) {
        setRealUserRole(role);
        // Store in localStorage for persistence
        const stored = getActiveRole();
        if (!stored || stored !== role) {
          setActiveRole(role);
        }
      }
      setRoleLoading(false);
    }).catch(() => {
      setRoleLoading(false);
    });
  }, []);

  useEffect(() => {
    // Determine theme role based on route and user role
    if (realUserRole) {
      const activeDashboardRole = getActiveDashboardRole(pathname);
      
      // If user is admin, use dashboard role for theming (visual simulation)
      // Otherwise, use real user role
      const calculatedThemeRole = (realUserRole === 'admin' && activeDashboardRole) 
        ? activeDashboardRole 
        : realUserRole;
      
      setThemeRole(calculatedThemeRole);
    }
  }, [pathname, realUserRole]);

  useEffect(() => {
    // Apply theme role class to body and wrapper
    if (themeRole) {
      document.body.className = document.body.className
        .replace(/role-\w+/g, '')
        .trim();
      document.body.classList.add(`role-${themeRole}`);
    }
  }, [themeRole]);

  // Listen for invalid token events and redirect to login
  useEffect(() => {
    const handleInvalidToken = () => {
      console.warn('🔄 Token inválido detectado - redirigiendo a login');
      router.replace('/login');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:invalid-token', handleInvalidToken);

      return () => {
        window.removeEventListener('auth:invalid-token', handleInvalidToken);
      };
    }
  }, [router]);

  // Filter sidebar items based on user role (security: prevent admin leakage)
  const getSidebarItems = (userRole: string | null): SidebarItem[] => {
    if (!userRole) return [];

    switch (userRole) {
      case 'admin':
        // Admin can see all dashboards for simulation
        return [
          { href: '/dashboard/admin', label: 'Administración' },
          { href: '/dashboard/therapist', label: 'Terapeuta' },
          { href: '/dashboard/personal', label: 'Personal' },
          { href: '/dashboard/patient', label: 'Paciente' },
        ];
      case 'therapist':
        // Therapist: ONLY therapist dashboard + patients management
        return [
          { href: '/dashboard/therapist', label: 'Workspace Clínico' },
          { href: '/dashboard/therapist/patients', label: 'Pacientes' },
        ];
      case 'personal':
        // Personal: Complete navigation menu with icons
        return [
          { href: '/dashboard/personal', label: 'Exploraciones', icon: Sparkles },
          { href: '/dashboard/personal/tests', label: 'Tests personales', icon: BookOpen },
          { href: '/dashboard/personal/explorations', label: 'Mis exploraciones', icon: FileText },
          { href: '/dashboard/resources', label: 'Recursos', icon: FolderOpen },
          { href: '/dashboard/personal/audios', label: 'Audios', icon: Music },
          { href: '/dashboard/personal/videos', label: 'Videos', icon: Video },
          { href: '/dashboard/personal/courses', label: 'Cursos', icon: GraduationCap, locked: true },
          { href: '/dashboard/personal/premium', label: 'Premium', icon: Star, locked: true },
        ];
      case 'patient':
        // Patient: EXACT sidebar items (level 1 only)
        return [
          { href: '/dashboard/patient', label: 'Inicio', icon: Home },
          { href: '/dashboard/patient/tests', label: 'Tests', icon: TestTube },
          { href: '/dashboard/patient/results', label: 'Resultados', icon: BarChart3 },
          { href: '/dashboard/patient/resources', label: 'Recursos', icon: FolderOpen },
          { href: '/dashboard/patient/process', label: 'Proceso', icon: Workflow },
          { href: '/dashboard/patient/account', label: 'Cuenta', icon: User },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(realUserRole);

  return (
    <div className={`flex min-h-screen bg-gray-50 ${themeRole ? `role-${themeRole}` : ''}`}>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar items={sidebarItems} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col lg:ml-0">
        <Header 
          realUserRole={realUserRole} 
          activeDashboardRole={getActiveDashboardRole(pathname)}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

