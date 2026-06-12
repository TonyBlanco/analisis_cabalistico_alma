import ClinicalContextHeader from '@/components/clinical/ClinicalContextHeader';
import TherapistLearningGuard from '@/components/learning-center/TherapistLearningGuard';

export default function TherapistRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TherapistLearningGuard />
      <ClinicalContextHeader />
      {children}
    </>
  );
}
