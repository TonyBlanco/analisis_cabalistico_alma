import { redirect } from 'next/navigation';

export default function TherapistPatientsCreateRedirect() {
  redirect('/dashboard/therapist/patients');
}
