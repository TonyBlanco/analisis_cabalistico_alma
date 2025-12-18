'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  ClipboardCheck,
  FileText,
  Heart, 
  Sparkles, 
  BookOpen, 
  User,
  ChevronDown,
  ChevronRight,
  LucideIcon 
} from 'lucide-react';

interface TherapistSidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface TherapistSidebarSection {
  id: string;
  label: string;
  items: TherapistSidebarItem[];
  defaultOpen?: boolean;
}

/**
 * TherapistSidebar - Clinical Workspace Navigation (Sectioned + Collapsible)
 * 
 * ARCHITECTURE:
 * - Lives ONLY in therapist/layout.tsx
 * - NEVER rendered inside pages
 * - Organized in SECTIONS for better UX
 * - Collapsible sections for tablet optimization
 * 
 * RESPONSIVE BREAKPOINTS (per MOBILE_OPTIMIZATIONS.md):
 * - Mobile: < 640px (hidden/drawer)
 * - Tablet: 640px - 1024px (icon-only + collapsible)
 * - Desktop: > 1024px (full sidebar with sections)
 * 
 * UX RULES:
 * - ✅ Touch targets ≥ 44px
 * - ✅ No sticky behavior
 * - ✅ Icon-first design (tablet)
 * - ✅ Sections collapse on tablet
 * - ❌ No horizontal scroll
 * - ❌ No excessive width on tablet
 */
export default function TherapistSidebar() {
  const pathname = usePathname();
  
  // Collapsed state for each section (only on tablet)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    workspace: false,
    patients: false,
    clinical: false,
    // resources: false, // Future
    // account: false,   // Future
  });
  const [testsOpen, setTestsOpen] = useState(false);
  const [psychTestsOpen, setPsychTestsOpen] = useState(false);
  const [cabalTestsOpen, setCabalTestsOpen] = useState(false);

  const PSYCH_TEST_DOMAINS = [
    {
      label: 'Estado de animo y ansiedad',
      tests: ['PHQ-9', 'GAD-7', 'BAI', 'BDI-II', 'STAI'],
    },
    {
      label: 'Psicopatologia general',
      tests: ['SCL-90', 'SCL-90-R'],
    },
    {
      label: 'Personalidad clinica',
      tests: ['PAI', 'PAI Profesional', 'MCMI-IV'],
    },
    {
      label: 'Entrevistas estructuradas',
      tests: ['SCID-5-RV', 'SCID-5'],
    },
    {
      label: 'Neurodesarrollo',
      tests: ['ADHD'],
    },
    {
      label: 'TOC',
      tests: ['OCD'],
    },
    {
      label: 'Trauma',
      tests: ['PTSD'],
    },
    {
      label: 'Sueno',
      tests: ['Insomnia Index'],
    },
    {
      label: 'Conducta alimentaria',
      tests: ['Eating Disorder Screen'],
    },
    {
      label: 'Sustancias',
      tests: ['Substance Use Screening'],
    },
    {
      label: 'Psicologia',
      tests: ['Screening Psicologico General'],
    },
    {
      label: 'Bienestar',
      tests: ['Wellness Assessment'],
    },
  ];

  const CABALISTIC_TESTS = [
    'Gematria',
    'Analisis Shekinah',
    'Tarot Terapeutico',
    'Numerologia Completa',
    'Astrologia Cabalistica',
    'Astrologia Tecnica (Kerykeion)',
    'Mapa del Alma',
    'Arbol de la Vida',
    'Numero del Alma',
    'Tikun',
    'Mazal',
    '72 Nombres',
    'Shemot',
    'Analisis Cabalistico Completo',
    'Abundancia Financiera',
  ];

  const sections: TherapistSidebarSection[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      defaultOpen: true,
      items: [
        { 
          href: '/dashboard/therapist', 
          label: 'Inicio Clínico', 
          icon: Home 
        },
      ]
    },
    {
      id: 'patients',
      label: 'Pacientes',
      defaultOpen: true,
      items: [
        { 
          href: '/dashboard/therapist/patients', 
          label: 'Gestión', 
          icon: Users 
        },
      ]
    },
    {
      id: 'clinical',
      label: 'Clínica',
      defaultOpen: true,
      items: [
        {
          href: '/dashboard/therapist/bioemotional',
          label: 'Bio-Emoción',
          icon: Heart
        },
        {
          href: '/dashboard/therapist/cabala',
          label: 'Cábala',
          icon: Sparkles
        },
        {
          href: '/dashboard/therapist/tests',
          label: 'Tests',
          icon: ClipboardCheck
        },
        // Future: SCDF, SCID, etc.
        // { 
        //   href: '/dashboard/therapist/evaluations', 
        //   label: 'Evaluaciones', 
        //   icon: ClipboardCheck 
        // },
        // { 
        //   href: '/dashboard/therapist/results', 
        //   label: 'Resultados', 
        //   icon: FileText 
        // },
      ]
    },
    // Future sections:
    // {
    //   id: 'resources',
    //   label: 'Recursos',
    //   defaultOpen: false,
    //   items: [
    //     { href: '/dashboard/therapist/resources', label: 'Herramientas', icon: BookOpen },
    //   ]
    // },
    // {
    //   id: 'account',
    //   label: 'Cuenta',
    //   defaultOpen: false,
    //   items: [
    //     { href: '/dashboard/therapist/settings', label: 'Configuración', icon: User },
    //   ]
    // },
  ];

  const toggleSection = (sectionId: string) => {
    setCollapsed(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden sm:flex sm:flex-col w-16 lg:w-64 bg-white border-r border-gray-200 min-h-screen">
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <h2 className="hidden lg:block text-lg font-semibold text-gray-800">
            Workspace Clínico
          </h2>
          <div className="lg:hidden flex justify-center">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 lg:p-3">
          {sections.map((section) => {
            const isCollapsed = collapsed[section.id];
            const hasActiveItem = section.items.some(
              item => pathname === item.href || pathname?.startsWith(item.href + '/')
            );

            return (
              <div key={section.id} className="mb-3 lg:mb-4">
                {/* Section Header (Desktop only) */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="hidden lg:flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>{section.label}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {/* Divider (Tablet: visual separator) */}
                <div className="lg:hidden h-px bg-gray-200 my-2" />

                {/* Section Items */}
                <div className={`space-y-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const Icon = item.icon;
                    const isTestsItem = item.label === 'Tests';

                    if (isTestsItem) {
                      return (
                        <div key={item.href} className="rounded-md border border-transparent">
                          <button
                            type="button"
                            onClick={() => setTestsOpen((prev) => !prev)}
                            className="
                              flex items-center justify-center lg:justify-start gap-3
                              px-2 lg:px-3 py-3 rounded-md text-sm
                              transition-all min-h-[44px] w-full
                              text-gray-600 hover:bg-gray-50 hover:text-gray-900
                            "
                            title={item.label}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                            <span className="hidden lg:block flex-1">{item.label}</span>
                            <span className="hidden lg:block">
                              {testsOpen ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </span>
                          </button>

                          {testsOpen && (
                            <div className="hidden lg:block ml-10 mt-2 space-y-2">
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setPsychTestsOpen((prev) => !prev)}
                                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                                >
                                  <span>Tests Psicologicos</span>
                                  {psychTestsOpen ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                </button>
                                {psychTestsOpen && (
                                  <div className="mt-2 space-y-3 text-xs text-gray-600">
                                    {PSYCH_TEST_DOMAINS.map((domain) => (
                                      <div key={domain.label}>
                                        <div className="text-[11px] uppercase tracking-wide text-gray-500">
                                          {domain.label}
                                        </div>
                                        <ul className="mt-1 space-y-1">
                                          {domain.tests.map((test) => (
                                            <li key={test} className="py-0.5">
                                              {test}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => setCabalTestsOpen((prev) => !prev)}
                                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                                >
                                  <span>Tests Cabalisticos</span>
                                  {cabalTestsOpen ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                </button>
                                {cabalTestsOpen && (
                                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                                    {CABALISTIC_TESTS.map((test) => (
                                      <li key={test} className="py-0.5">
                                        {test}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center justify-center lg:justify-start gap-3 
                          px-2 lg:px-3 py-3 rounded-md text-sm 
                          transition-all min-h-[44px]
                          ${isActive
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        title={item.label} // Tooltip for compact view
                      >
                        <Icon 
                          className={`
                            w-5 h-5 flex-shrink-0 
                            ${isActive ? 'text-blue-600' : 'text-gray-500'}
                          `} 
                        />
                        {/* Label: hidden on tablet, visible on desktop */}
                        <span className="hidden lg:block flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="hidden lg:block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="hidden lg:block text-xs text-gray-500">
              Modo Clínico Activo
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile: Sidebar hidden, controlled by Header hamburger menu */}
      {/* TODO: Implement mobile drawer if needed */}
    </>
  );
}
