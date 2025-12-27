'use client';

import SandboxPanel from '@/components/AstrologyStudy/SandboxPanel';
import HelpButton from '@/components/AstrologyStudy/HelpButton';

export default function StudySandboxPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Sandbox simulado</p>
          <h2 className="text-xl font-semibold text-gray-900">Scoring didáctico (solo datos simulados)</h2>
          <p className="text-sm text-gray-600">
            Simulación educativa. No aplica a personas reales. No usa endpoints ni consultantes reales.
          </p>
        </div>
        <HelpButton contentId="sandbox" />
      </div>
      <SandboxPanel />
    </section>
  );
}
