'use client';

import ResearchLab from '@/components/AstrologyStudy/ResearchLab';
import HelpButton from '@/components/AstrologyStudy/HelpButton';

export default function StudyResearchPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Research Lab</p>
          <h2 className="text-xl font-semibold text-gray-900">Patrones en dataset simulado</h2>
          <p className="text-sm text-gray-600">Exploración descriptiva; sin inferencia ni consultantes reales.</p>
        </div>
        <HelpButton contentId="research" />
      </div>
      <ResearchLab />
    </section>
  );
}
