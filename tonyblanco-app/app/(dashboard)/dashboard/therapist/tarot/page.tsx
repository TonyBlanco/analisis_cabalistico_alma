'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Load the existing AstrologyTarotWorkspace (reused as Tarot workspace)
const AstrologyTarotWorkspace = dynamic(
  () => import('@/components/AstrologyTarotWorkspace').then((m) => m.default),
  { ssr: false }
);


export default function TarotPage() {
  return (
    <div className="min-h-screen p-6">
      <AstrologyTarotWorkspace />
    </div>
  );
}
