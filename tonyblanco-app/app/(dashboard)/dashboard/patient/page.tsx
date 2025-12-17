'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';
import PatientAssignedTestsSection from '@/components/PatientAssignedTestsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import DisclaimerModal from '@/components/DisclaimerModal';
import TherapeuticConsentModal from '@/components/TherapeuticConsentModal';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

/**
 * Patient Dashboard
 *
 * Acceso sólo para rol `patient` (derivado desde /api/me).
 */
export default function PatientDashboard() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [user, setUser] = useState<any>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [therapist, setTherapist] = useState<any>(null);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showFirstLoginDisclaimer, setShowFirstLoginDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Fetch de sesión para contexto de paciente (independiente del rol)
  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (session.user) {
        setUser(session.user);
        if (session.user.patient_id) {
          setPatientId(session.user.patient_id);
        }
        if (session.user.therapist) {
          setTherapist(session.user.therapist);
        }
      }

      // UserProfile como fuente de verdad para consentimiento
      try {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          setConsentAcceptedAt(null);
          return;
        }
        const res = await fetch(`${API_URL}/profile/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });
        if (res.ok) {
          const profile = await res.json();
          setConsentAcceptedAt(profile.consent_accepted_at || null);
        } else if (session.user && session.user.consent_accepted_at) {
          // Fallback suave a /api/me si el nuevo endpoint falla
          setConsentAcceptedAt(session.user.consent_accepted_at);
        } else {
          setConsentAcceptedAt(null);
        }
      } catch (e) {
        console.warn('No se pudo leer /profile/me/ para consentimiento, usando /me', e);
        if (user && (user as any).consent_accepted_at) {
          setConsentAcceptedAt((user as any).consent_accepted_at);
        } else {
          setConsentAcceptedAt(null);
        }
      }
    };

    load();
  }, []);

  // Consentimiento terapéutico obligatorio antes de cualquier otra cosa
  useEffect(() => {
    if (role === 'patient') {
      // Mostrar modal solo si el backend indica que nunca se aceptó
      if (!consentAcceptedAt) {
        setShowConsentModal(true);
      } else {
        setShowConsentModal(false);
      }
    }
  }, [role, consentAcceptedAt]);

  // Disclaimer de primera vez, sólo cuando el rol es `patient` y el consentimiento ya fue aceptado
  useEffect(() => {
    if (role === 'patient' && typeof window !== 'undefined' && consentAcceptedAt) {
      const accepted = localStorage.getItem('patient_disclaimer_accepted');
      if (!accepted) {
        setShowFirstLoginDisclaimer(true);
      } else {
        setDisclaimerAccepted(true);
      }
    }
  }, [role, consentAcceptedAt]);

  const handleAcceptConsent = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        return;
      }
      const response = await fetch(`${API_URL}/profile/me/consent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // Si ya estaba aceptado, consideramos el consentimiento como presente y ocultamos modal
        if (
          response.status === 400 &&
          (data.detail || '').toString().toLowerCase().includes('ya había sido aceptado')
        ) {
          setConsentAcceptedAt(data.consent_accepted_at || new Date().toISOString());
          setShowConsentModal(false);
          return;
        }
        console.error('Error al registrar consentimiento terapéutico', data);
        return;
      }

      const profile = await response.json();
      setConsentAcceptedAt(profile.consent_accepted_at || new Date().toISOString());
      setShowConsentModal(false);

      // Refrescar sesión para coherencia global
      await fetchSession();
    } catch (error) {
      console.error('Error al registrar consentimiento terapéutico:', error);
    }
  };

  // Estado de carga inicial: hasta que el guard resuelva el rol
  if (roleLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autorizado, el guard ya habrá lanzado redirect
  if (!authorized || role !== 'patient') {
    return null;
  }

  // Mientras no se haya aceptado el consentimiento, bloqueamos el dashboard
  if (!consentAcceptedAt) {
    return (
      <TherapeuticConsentModal
        isOpen={showConsentModal}
        onAccept={handleAcceptConsent}
        type="analysis"
      />
    );
  }

  // Disclaimer de primer login
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

      {/* Section 1: Información */}
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

      {/* Section 2: Tests asignados */}
      <PatientAssignedTestsSection />

      {/* Section 3: Resultados */}
      <PatientResultsSection />
    </div>
  );
}
