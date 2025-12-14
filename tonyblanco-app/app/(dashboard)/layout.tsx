'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getActiveRole, setActiveRole } from '@/lib/role-state';
import { getActiveDashboardRole } from '@/lib/getActiveDashboardRole';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface SidebarItem {
  href: string;
  label: string;
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
        // Personal: ONLY personal dashboard
        return [
          { href: '/dashboard/personal', label: 'Panel Personal' },
        ];
      case 'patient':
        // Patient: ONLY patient dashboard
        return [
          { href: '/dashboard/patient', label: 'Panel de Paciente' },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(realUserRole);

  return (
    <div className={`flex min-h-screen bg-gray-50 ${themeRole ? `role-${themeRole}` : ''}`}>
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col">
        <Header 
          realUserRole={realUserRole} 
          activeDashboardRole={getActiveDashboardRole(pathname)}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

