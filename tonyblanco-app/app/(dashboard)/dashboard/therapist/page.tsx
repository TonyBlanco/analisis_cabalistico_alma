'use client';

import { useEffect, useState } from 'react';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRouter } from 'next/navigation';
import ActivePatientIndicator from '@/components/ActivePatientIndicator';
import PatientPicker from '@/components/PatientPicker';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import ClinicalEvaluationsSection from '@/components/ClinicalEvaluationsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import { Patient } from '@/lib/patient-api';

export default function TherapistDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUserName(session.user.username || '');
      }
    });
    getUserRole().then((userRole) => {
      setRole(userRole);
      // STRICT: Only therapist and admin (for simulation) can access
      // Admin can simulate, but should NOT see admin-specific options
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  const isAdmin = role === 'admin';

  const handleSelectPatient = () => {
    setPickerOpen(true);
  };

  const handlePatientSelected = (patient: Patient) => {
    // Patient is already set in PatientPicker via setActivePatientId
    // Just close the picker - ActivePatientIndicator will update via event listener
    console.log('Patient selected:', patient);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Workspace Clínico
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Panel profesional del terapeuta</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Rol activo: Terapeuta
            </span>
            {isAdmin && (
              <span className="text-xs text-gray-500 italic">
                Vista simulada (Admin)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Patient Indicator */}
      <ActivePatientIndicator onSelectPatient={handleSelectPatient} />

      {/* Patient Picker Modal */}
      <PatientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelected}
      />

      {/* Main Workspace - Patient Context Only */}
      <div className="space-y-6">
        {/* Section 1: Assigned Tests (patient_self) */}
        {/* Shows tests assigned to active patient with status: pending / completed */}
        <AssignedTestsSection />

        {/* Section 2: Clinical Evaluations (therapist_clinical) */}
        {/* Run SCDF, Run Integrative Interview, Results are READ-ONLY after save */}
        <ClinicalEvaluationsSection />

        {/* Section 3: Results Panel */}
        {/* List results per patient, expandable detail view, clear separation between test types */}
        <PatientResultsSection />
      </div>

      {/* Footer - Removed for cleaner UI */}
    </div>
  );
}
