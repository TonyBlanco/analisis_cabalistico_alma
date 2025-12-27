'use client';

import ExtendedChartSelection from '@/components/AstrologyCatalog/ExtendedChartSelection';
import HelpButton from '@/components/AstrologyStudy/HelpButton';

export default function StudyCatalogPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Catálogo académico</p>
          <h2 className="text-xl font-semibold text-gray-900">Extended Chart Selection (sin consultantes reales)</h2>
          <p className="text-sm text-gray-600">No usa endpoints nuevos. Opciones deshabilitadas se muestran como “Próximamente”.</p>
        </div>
        <HelpButton contentId="export" label="¿Cómo exportar/imprimir?" />
      </div>
      <ExtendedChartSelection />
    </section>
  );
}
