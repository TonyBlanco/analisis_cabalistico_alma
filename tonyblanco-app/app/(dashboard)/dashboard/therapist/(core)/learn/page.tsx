import { getLearningCenterCatalog } from '@/components/learning-center';
import { LearningCenterView } from '@/components/learning-center';

export default async function TherapistLearningCenterPage() {
  const catalog = await getLearningCenterCatalog();

  return <LearningCenterView catalog={catalog} />;
}
