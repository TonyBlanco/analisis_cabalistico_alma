'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getActiveRole, setActiveRole } from '@/lib/role-state';
import { getActiveDashboardRole } from '@/lib/getActiveDashboardRole';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  Home, 
  Sparkles, 
  Clipboard, 
  Book,
  Headphones, 
  Play, 
  GraduationCap, 
  Crown,
  LucideIcon 
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  locked?: boolean;
  badge?: string;
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

  // Initialize from localStorage on client mount (hydration-safe)
  useEffect(() => {
    const stored = getActiveRole();
    if (stored) {
      setRealUserRole(stored);
    }
  }, []);

  useEffect(() => {
    // Get real user role from backend
    getUserRole()
      .then((role) => {
        if (role) {
          setRealUserRole(role);
          // Store in localStorage for persistence
          const stored = getActiveRole();
          if (!stored || stored !== role) {
            setActiveRole(role);
          }
        }
      })
      .catch(() => {
        console.warn('⚠️ No se pudo resolver el rol desde backend, usando fallback local');
        setRealUserRole(getActiveRole());
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
        // Personal: exploration and growth dashboard
        return [
          { href: '/dashboard/personal', label: 'Exploraciones', icon: Sparkles },
          { href: '/dashboard/personal/tests', label: 'Tests personales', icon: Clipboard },
          { href: '/dashboard/personal/resources', label: 'Recursos', icon: Book },
          { href: '/dashboard/personal/audios', label: 'Audios', icon: Headphones },
          { href: '/dashboard/personal/videos', label: 'Videos', icon: Play },
          { href: '/dashboard/personal/courses', label: 'Cursos', icon: GraduationCap, locked: true },
          { href: '/dashboard/personal/premium', label: 'Premium', icon: Crown, locked: true, badge: 'Próximamente' },
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

  // DEBUG: inspeccionar resolución de rol y menú lateral
  console.log('🧭 realUserRole:', realUserRole);
  console.log('🧭 sidebarItems:', sidebarItems);

  return (
    <div className={`flex min-h-screen bg-gray-50 ${themeRole ? `role-${themeRole}` : ''}`}>
      {sidebarItems.length > 0 && <Sidebar items={sidebarItems} />}
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

