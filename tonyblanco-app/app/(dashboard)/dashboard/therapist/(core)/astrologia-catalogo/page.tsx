'use client';

import Link from 'next/link';
import ExtendedChartSelection from '@/components/AstrologyCatalog/ExtendedChartSelection';

export default function AstrologyCatalogPage() {
  return (
    <main className="px-4 py-6 space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
        Catálogo dentro del workspace terapéutico. Sin Sandbox ni scoring. Para el entorno académico usa{' '}
        <Link href="/dashboard/astrology-study" className="text-blue-700 underline font-semibold">
          Astrology Study / Lab
        </Link>
        .
      </div>
      <ExtendedChartSelection />
    </main>
  );
}
