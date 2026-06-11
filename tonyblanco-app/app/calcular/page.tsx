'use client';

import dynamic from 'next/dynamic';

const CabalaAnalyzer = dynamic(() => import('@/src/components/cabala_analyzer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      Cargando analizador cabalístico…
    </div>
  ),
});

export default function CalcularPage() {
  return <CabalaAnalyzer />;
}