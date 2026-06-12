import { apiUrl, getAuthHeaders } from '@/lib/api';

export interface TherapistOnboardingSteps {
  profile_complete: boolean;
  has_patient: boolean;
  has_tree_analysis: boolean;
}

export interface TherapistOnboardingResponse {
  steps: TherapistOnboardingSteps;
  all_backend_complete: boolean;
}

export async function fetchTherapistOnboarding(): Promise<TherapistOnboardingResponse> {
  const res = await fetch(apiUrl('therapist/onboarding/'), {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${text}`);
  }

  return res.json() as Promise<TherapistOnboardingResponse>;
}