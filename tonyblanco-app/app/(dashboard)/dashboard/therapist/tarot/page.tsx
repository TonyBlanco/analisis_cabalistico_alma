'use client';

import dynamic from 'next/dynamic';
import useActiveConsultante from '@/hooks/useActiveConsultante';

// Restore the canonical Tarot workspace shell (sidebar + sections) on this route.
const AstrologyTarotWorkspace = dynamic(
  () => import('@/components/AstrologyTarotWorkspace').then((m) => m.default),
  { ssr: false },
);

export default function TarotPage() {
  const consultante = useActiveConsultante();
  const birthDate = consultante?.fecha_nacimiento ? new Date(consultante.fecha_nacimiento) : null;
  const safeBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : undefined;

  return (
    <div className="min-h-screen">
      <AstrologyTarotWorkspace patientId={consultante?.id} patientBirthDate={safeBirthDate} />
    </div>
  );
}

