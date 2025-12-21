import ClinicalContextHeader from '@/components/clinical/ClinicalContextHeader';

export default function TherapistRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClinicalContextHeader />
      {children}
    </>
  );
}
