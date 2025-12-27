'use client';

import Link from 'next/link';
import Comparator from '@/components/AstrologyStudy/Comparator';
import TrainingModePanel from '@/components/AstrologyStudy/TrainingModePanel';
import ResearchLab from '@/components/AstrologyStudy/ResearchLab';

export default function AstrologyStudyPage() {
  return (
    <main className="px-4 py-6 space-y-6">
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900">
        Módulo observacional/pedagógico dentro del workspace con consultante. No incluye Sandbox ni scoring.
        Para el entorno académico completo usa{' '}
        <Link href="/dashboard/astrology-study" className="text-blue-700 underline font-semibold">
          Astrology Study / Lab
        </Link>{' '}
        (sin consultantes reales).
      </div>
      <Comparator />
      <TrainingModePanel />
      <ResearchLab />
    </main>
  );
}
