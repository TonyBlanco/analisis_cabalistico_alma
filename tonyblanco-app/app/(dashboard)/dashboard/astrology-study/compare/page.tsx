'use client';

import Comparator from '@/components/AstrologyStudy/Comparator';
import HelpButton from '@/components/AstrologyStudy/HelpButton';

export default function StudyComparePage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Comparador académico</p>
          <h2 className="text-xl font-semibold text-gray-900">Carta vs Carta (JSON o datos simulados)</h2>
          <p className="text-sm text-gray-600">No recalcula motor. Sin consultantes reales. Solo observación estructural.</p>
        </div>
        <HelpButton contentId="compare" />
      </div>
      <Comparator />
    </section>
  );
}
