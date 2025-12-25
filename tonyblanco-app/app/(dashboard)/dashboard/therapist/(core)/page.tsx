'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import PatientPicker from '@/components/PatientPicker';
import TherapistClinicalDashboard from '@/components/TherapistClinicalDashboard';
import type { Patient } from '@/lib/patient-api';

export default function TherapistDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchSession().then(() => {
      getUserRole().then((userRole) => {
        setRole(userRole);
        if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
          router.replace('/dashboard');
        }
      });
    });
  }, [router]);

  const handlePatientSelected = (patient: Patient) => {
    console.log('Patient selected:', patient);
    setSelectedPatient(patient);
    setPickerOpen(false);
  };

  if (role && role !== 'therapist' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <TherapistClinicalDashboard 
        onChangePatient={() => setPickerOpen(true)}
        patientId={selectedPatient?.id}
        patientName={selectedPatient?.legal_full_name || selectedPatient?.full_name || selectedPatient?.email}
      />

      <PatientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelected}
      />
    </div>
  );
}
