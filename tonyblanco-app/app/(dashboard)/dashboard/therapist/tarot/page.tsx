'use client';

import dynamic from 'next/dynamic';

// Restore the canonical Tarot workspace shell (sidebar + sections) on this route.
const AstrologyTarotWorkspace = dynamic(
  () => import('@/components/AstrologyTarotWorkspace').then((m) => m.default),
  { ssr: false },
);

export default function TarotPage() {
  return (
    <div className="min-h-screen">
      <AstrologyTarotWorkspace />
    </div>
  );
}

