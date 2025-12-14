'use client';

import TherapistRoute from '@/components/TherapistRoute';
import IntegrativeInterview from './components/IntegrativeInterview';

export default function IntegrativeClinicalInterviewPage() {
  return (
    <TherapistRoute>
      <IntegrativeInterview />
    </TherapistRoute>
  );
}

