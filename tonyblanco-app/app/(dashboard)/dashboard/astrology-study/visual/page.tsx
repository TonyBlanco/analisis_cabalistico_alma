'use client';

import AstrologyVisualPro from '@/components/AstrologyWorkspace/AstrologyVisualPro';
import { useStudyContext } from '@/components/AstrologyStudy/StudyContextProvider';

export default function StudyVisualPage() {
  const { defaultChart } = useStudyContext();

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Visual Pro (sample)</p>
        <h2 className="text-xl font-semibold text-gray-900">Carta de estudio sin consultante real</h2>
        <p className="text-sm text-gray-600">Usa datos simulados; controles son solo visuales. No recalcula motor ni toca backend.</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AstrologyVisualPro chart={defaultChart} hasRealConsultante={false} />
      </div>
    </section>
  );
}
