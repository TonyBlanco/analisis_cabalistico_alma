'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';
import PatientAssignedTestsSection from '@/components/PatientAssignedTestsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import DisclaimerModal from '@/components/DisclaimerModal';

/**
 * Patient Dashboard
 * 
 * PHASE 1: Route & Access Control
 * PHASE 2: Patient Context (read-only)
 */
export default function PatientDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [therapist, setTherapist] = useState<any>(null);
  const [showFirstLoginDisclaimer, setShowFirstLoginDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Check if patient has accepted disclaimer on first login
  useEffect(() => {
    if (role === 'patient' && typeof window !== 'undefined') {
      const accepted = localStorage.getItem('patient_disclaimer_accepted');
      if (!accepted) {
        setShowFirstLoginDisclaimer(true);
      } else {
        setDisclaimerAccepted(true);
      }
    }
  }, [role]);

  useEffect(() => {
    // Fetch user session to get patient context
    fetchSession().then((session) => {
      if (session.user) {
        setUser(session.user);
        // Extract patient_id and therapist if available
        if (session.user.patient_id) {
          setPatientId(session.user.patient_id);
        }
        if (session.user.therapist) {
          setTherapist(session.user.therapist);
        }
      }
    });

    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      
      // If no role or not patient, redirect
      if (!userRole || userRole !== 'patient') {
        router.replace('/login');
      }
    });
  }, [router]);

  // Use role guard hook
  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  // Show loading state while checking role
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // If role is not patient, don't render (guard will redirect)
  if (role !== 'patient') {
    return null;
  }

  // D) Patient First Login Disclaimer
  // Block dashboard until disclaimer is accepted
  if (showFirstLoginDisclaimer && !disclaimerAccepted) {
    return (
      <DisclaimerModal
        open={true}
        type="patient_first_login"
        onAccept={() => {
          localStorage.setItem('patient_disclaimer_accepted', 'true');
          setDisclaimerAccepted(true);
          setShowFirstLoginDisclaimer(false);
        }}
        cancelable={false}
      />
    );
  }

  // Don't render dashboard until disclaimer is accepted
  if (!disclaimerAccepted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Bienvenido
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {user?.full_name || user?.first_name || 'Usuario'}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Rol: Paciente
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Welcome & Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu información</h2>
        
        <div className="space-y-4">
          {therapist && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Tu terapeuta</p>
              <p className="text-base text-gray-900">
                {therapist.full_name || therapist.username || 'No disponible'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contacta a tu terapeuta si tienes preguntas sobre tus tests o resultados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Assigned Tests */}
      <PatientAssignedTestsSection />

      {/* Section 3: Results */}
      <PatientResultsSection />
    </div>
  );
}
