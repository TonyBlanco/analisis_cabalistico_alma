'use client';

import dynamic from 'next/dynamic';

// Tarot workspace lives under Therapist (core) layout so it gets the therapist sidebar.
const AstrologyTarotWorkspace = dynamic(
  () => import('@/components/AstrologyTarotWorkspace').then((m) => m.default),
  { ssr: false },
);

export default function TarotPage() {
  return <AstrologyTarotWorkspace />;
}

