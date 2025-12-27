'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AstrologyModeProvider } from '@/components/AstrologyMode/AstrologyModeContext';
import AstrologyModeSwitch from '@/components/AstrologyMode/AstrologyModeSwitch';
import ModeBanner from '@/components/AstrologyMode/ModeBanner';
import { StudyContextProvider } from '@/components/AstrologyStudy/StudyContextProvider';
import { SandboxContextProvider } from '@/components/AstrologyStudy/SandboxContextProvider';
import AstrologyHolisticDisclaimer from '@/components/AstrologyWorkspace/AstrologyHolisticDisclaimer';

const NAV = [
  { href: '/dashboard/astrology-study', label: 'Resumen' },
  { href: '/dashboard/astrology-study/catalog', label: 'Catálogo' },
  { href: '/dashboard/astrology-study/visual', label: 'Visual Pro (sample)' },
  { href: '/dashboard/astrology-study/compare', label: 'Comparador' },
  { href: '/dashboard/astrology-study/research', label: 'Research Lab' },
  { href: '/dashboard/astrology-study/sandbox', label: 'Sandbox (sim)' },
];

export default function AstrologyStudyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AstrologyModeProvider>
      <StudyContextProvider>
        <SandboxContextProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Astrology Study / Lab</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Academic Mode</h1>
                  </div>
                  <div className="text-xs text-gray-600 text-right">
                    <p>Datos simulados / research</p>
                    <p>Sin consultantes reales. Sin endpoints nuevos.</p>
                  </div>
                </div>
                <AstrologyModeSwitch />
                <ModeBanner />
                <AstrologyHolisticDisclaimer />
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  Entorno académico. Datos simulados. No uso terapéutico ni médico.
                </div>
                <nav className="flex flex-wrap gap-2 text-sm">
                  {NAV.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-md border px-3 py-2 ${
                          active ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">{children}</main>
          </div>
        </SandboxContextProvider>
      </StudyContextProvider>
    </AstrologyModeProvider>
  );
}
