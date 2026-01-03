'use client';

import AstrologyTarotWorkspace from '@/components/AstrologyTarotWorkspace';
import useActiveConsultante from '@/hooks/useActiveConsultante';

export default function AstrologiaTarotPage() {
  const consultante = useActiveConsultante();
  const birthDate = consultante?.fecha_nacimiento ? new Date(consultante.fecha_nacimiento) : null;
  const safeBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : undefined;
  return <AstrologyTarotWorkspace patientId={consultante?.id} patientBirthDate={safeBirthDate} />;
}
