'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserRole } from '@/lib/getUserRole';
import {
  Sparkles,
  ClipboardList,
  BookOpen,
  Headphones,
  Play,
  GraduationCap,
  Star,
  Lock,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  FolderOpen,
  UserCircle,
  Home,
  TestTube,
  TrendingUp,
  Heart,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('exploraciones');

  useEffect(() => {
    getUserRole().then((role) => {
      setUserRole(role);
    });
  }, []);

  const isPersonalDashboard = userRole === 'personal' && pathname?.startsWith('/dashboard/personal');
  const isTherapistDashboard = userRole === 'therapist' && pathname?.startsWith('/dashboard/therapist');
  const isPatientDashboard = userRole === 'patient' && pathname?.startsWith('/dashboard/patient');

  // Icon mapping for therapist sidebar
  const getTherapistIcon = (label: string) => {
    const iconClass = 'h-4 w-4 flex-shrink-0';
    switch (label) {
      case 'Workspace':
        return <LayoutDashboard className={iconClass} strokeWidth={2} />;
      case 'Pacientes':
        return <Users className={iconClass} strokeWidth={2} />;
      case 'Análisis':
        return <FileText className={iconClass} strokeWidth={2} />;
      case 'Resultados':
        return <BarChart3 className={iconClass} strokeWidth={2} />;
      case 'Recursos':
        return <FolderOpen className={iconClass} strokeWidth={2} />;
      case 'Cuenta':
        return <UserCircle className={iconClass} strokeWidth={2} />;
      default:
        return null;
    }
  };

  // Icon mapping for patient sidebar
  const getPatientIcon = (label: string) => {
    const iconClass = 'h-4 w-4 flex-shrink-0';
    switch (label) {
      case 'Inicio':
        return <Home className={iconClass} strokeWidth={2} />;
      case 'Tests':
        return <TestTube className={iconClass} strokeWidth={2} />;
      case 'Resultados':
        return <BarChart3 className={iconClass} strokeWidth={2} />;
      case 'Recursos':
        return <FolderOpen className={iconClass} strokeWidth={2} />;
      case 'Proceso':
        return <Heart className={iconClass} strokeWidth={2} />;
      case 'Cuenta':
        return <UserCircle className={iconClass} strokeWidth={2} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard/therapist' && item.href !== '/dashboard/patient');
          const icon = isTherapistDashboard 
            ? getTherapistIcon(item.label) 
            : isPatientDashboard 
            ? getPatientIcon(item.label) 
            : null;
          
          return (
            <div key={item.href}>
              <a
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--accent-color)',
                        color: 'white',
                      }
                    : {}
                }
              >
                {icon && (
                  <span style={isActive ? { color: 'white' } : { color: 'inherit' }}>
                    {icon}
                  </span>
                )}
                <span>{item.label}</span>
              </a>

              {/* Personal Navigation - only show when on personal dashboard */}
              {isPersonalDashboard && isActive && (
                <div className="mt-4 ml-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                    Navegación personal
                  </p>
                  {/* Exploraciones */}
                  <button
                    onClick={() => setActiveSection('exploraciones')}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 text-sm ${
                      activeSection === 'exploraciones'
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Sparkles
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeSection === 'exploraciones' ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span>Exploraciones</span>
                  </button>

                  {/* Tests personales */}
                  <button
                    onClick={() => setActiveSection('tests')}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 text-sm ${
                      activeSection === 'tests'
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <ClipboardList
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeSection === 'tests' ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span>Tests personales</span>
                  </button>

                  {/* Recursos */}
                  <button
                    onClick={() => setActiveSection('recursos')}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 text-sm ${
                      activeSection === 'recursos'
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeSection === 'recursos' ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span>Recursos</span>
                  </button>

                  {/* Audios */}
                  <button
                    onClick={() => setActiveSection('audios')}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 text-sm ${
                      activeSection === 'audios'
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Headphones
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeSection === 'audios' ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span>Audios</span>
                  </button>

                  {/* Videos */}
                  <button
                    onClick={() => setActiveSection('videos')}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 text-sm ${
                      activeSection === 'videos'
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Play
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeSection === 'videos' ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span>Videos</span>
                  </button>

                  {/* Divider */}
                  <div className="mt-3 border-t border-gray-200 pt-3 space-y-1">
                    {/* Cursos - Locked */}
                    <button
                      disabled
                      className="w-full text-left px-3 py-2.5 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed flex items-center gap-3 opacity-60 text-sm"
                      title="Próximamente disponible"
                    >
                      <div className="relative h-4 w-4 flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-gray-400" strokeWidth={2} />
                        <Lock className="h-2.5 w-2.5 text-gray-400 absolute -top-0.5 -right-0.5" strokeWidth={2.5} />
                      </div>
                      <span>Cursos</span>
                    </button>

                    {/* Premium - Locked */}
                    <button
                      disabled
                      className="w-full text-left px-3 py-2.5 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed flex items-center gap-3 opacity-60 text-sm"
                      title="Funcionalidad premium en preparación"
                    >
                      <div className="relative h-4 w-4 flex-shrink-0">
                        <Star className="h-4 w-4 text-gray-400" strokeWidth={2} />
                        <Lock className="h-2.5 w-2.5 text-gray-400 absolute -top-0.5 -right-0.5" strokeWidth={2.5} />
                      </div>
                      <span className="flex-1">Premium</span>
                      <span className="text-[10px] text-gray-400">Próximamente</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

