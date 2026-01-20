'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import PatientPicker from '@/components/PatientPicker';
import ActivePatientIndicator from '@/components/ActivePatientIndicator';
import TherapistClinicalDashboard from '@/components/TherapistClinicalDashboard';
import type { Patient } from '@/lib/patient-api';
import { getActivePatient, setActivePatientId } from '@/lib/active-patient';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/api';

const API_URL = getApiBaseUrl();

export default function TherapistDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingAutoRestore, setLoadingAutoRestore] = useState(true);

  // Auto-restore last selected patient from localStorage
  useEffect(() => {
    const activePatient = getActivePatient();

    if (activePatient && activePatient.id) {
      // Fetch full patient data from API
      const token = getAuthToken();
      if (token) {
        fetch(`${API_URL}/therapist/patients/${activePatient.id}/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error('Patient not found');
            return res.json();
          })
          .then((patient) => {
            setSelectedPatient(patient);
            console.log('Auto-restored patient:', patient);
          })
          .catch((err) => {
            console.error('Failed to auto-restore patient:', err);
            // Clear invalid patient from localStorage
            localStorage.removeItem('activePatient');
          })
          .finally(() => {
            setLoadingAutoRestore(false);
          });
      } else {
        setLoadingAutoRestore(false);
      }
    } else {
      setLoadingAutoRestore(false);
    }
  }, []);

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

    // Save to localStorage for auto-restore
    const patientName = patient.legal_full_name || patient.full_name || patient.email || null;
    setActivePatientId(patient.id, patientName);

    setPickerOpen(false);
  };

  if (role && role !== 'therapist' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ActivePatientIndicator onSelectPatient={() => setPickerOpen(true)} />

      {loadingAutoRestore ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Cargando último consultante...</div>
        </div>
      ) : (
        <TherapistClinicalDashboard
          onChangePatient={() => setPickerOpen(true)}
          patientId={selectedPatient?.id}
          patientName={selectedPatient?.legal_full_name || selectedPatient?.full_name || selectedPatient?.email}
        />
      )}

      <PatientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelected}
      />
    </div>
  );
}
