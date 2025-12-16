'use client';

import { useEffect, useState, useRef } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { fetchSession } from '@/lib/session';
import { getProfile, acceptConsent } from '@/lib/api';
import PatientAssignedTestsSection from '@/components/PatientAssignedTestsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import DisclaimerModal from '@/components/DisclaimerModal';
import TherapeuticConsentModal from '@/components/TherapeuticConsentModal';

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
  const [profileLoading, setProfileLoading] = useState(true);
  
  // CRITICAL: useRef to ensure session fetch runs ONLY ONCE on mount
  const hasLoadedSessionRef = useRef(false);

  // Fetch de sesión para contexto de paciente (independiente del rol)
  // CRITICAL: Run ONLY ONCE on mount
  useEffect(() => {
    // CRITICAL: Only run once on mount
    if (hasLoadedSessionRef.current) {
      return;
    }
    hasLoadedSessionRef.current = true;

    const load = async () => {
      try {
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
        // Use getProfile from api.ts - it never throws, returns error object on failure
        const profileResponse = await getProfile();
        
        if (profileResponse && typeof profileResponse === 'object' && 'error' in profileResponse && profileResponse.error) {
          // Network error or backend unavailable - use session as fallback
          console.warn('No se pudo leer /profile/me/ para consentimiento, usando /me', (profileResponse as any).message);
          if (session.user && (session.user as any).consent_accepted_at) {
            setConsentAcceptedAt((session.user as any).consent_accepted_at);
          } else {
            // If no consent in session either, assume not accepted (will show modal)
            setConsentAcceptedAt(null);
          }
        } else {
          // Success - use profile data
          const profile = profileResponse as any;
          setConsentAcceptedAt(profile.consent_accepted_at || null);
        }
      } catch (error) {
        // Extra safety - should never reach here since getProfile never throws
        console.error('Unexpected error loading patient dashboard:', error);
        setConsentAcceptedAt(null);
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, []); // CRITICAL: Empty deps - run ONLY on mount

  // Consentimiento terapéutico obligatorio antes de cualquier otra cosa
  // CRITICAL: Use ref to prevent loops - only update when values actually change
  const prevConsentRef = useRef<string | null>(null);
  useEffect(() => {
    // Only update if consentAcceptedAt actually changed
    if (prevConsentRef.current === consentAcceptedAt) {
      return;
    }
    prevConsentRef.current = consentAcceptedAt;

    // Only set modal state after profile has loaded
    if (!profileLoading && role === 'patient') {
      // Mostrar modal solo si el backend indica que nunca se aceptó
      if (consentAcceptedAt === null) {
        setShowConsentModal(true);
      } else {
        setShowConsentModal(false);
      }
    }
  }, [role, consentAcceptedAt, profileLoading]);

  // Disclaimer de primera vez, sólo cuando el rol es `patient` y el consentimiento ya fue aceptado
  // CRITICAL: Use ref to prevent loops - only check once per consent state
  const prevDisclaimerCheckRef = useRef<string | null>(null);
  useEffect(() => {
    // Only check if consentAcceptedAt actually changed
    if (prevDisclaimerCheckRef.current === consentAcceptedAt) {
      return;
    }
    prevDisclaimerCheckRef.current = consentAcceptedAt;

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
      // Use acceptConsent from api.ts - it never throws, returns error object on failure
      const response = await acceptConsent();

      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        const errorResponse = response as any;
        
        // Si ya estaba aceptado, consideramos el consentimiento como presente y ocultamos modal
        if (
          errorResponse.status === 400 &&
          (errorResponse.message || '').toString().toLowerCase().includes('ya había sido aceptado')
        ) {
          // Try to get current profile to get consent_accepted_at
          const profileResponse = await getProfile();
          if (profileResponse && typeof profileResponse === 'object' && !('error' in profileResponse)) {
            const profile = profileResponse as any;
            setConsentAcceptedAt(profile.consent_accepted_at || new Date().toISOString());
          } else {
            setConsentAcceptedAt(new Date().toISOString());
          }
          setShowConsentModal(false);
          return;
        }
        
        console.error('Error al registrar consentimiento terapéutico', errorResponse);
        return;
      }

      // Success - update state
      const profile = response as any;
      setConsentAcceptedAt(profile.consent_accepted_at || new Date().toISOString());
      setShowConsentModal(false);

      // Refrescar sesión para coherencia global (non-blocking)
      fetchSession().catch(err => console.warn('Error refreshing session:', err));
    } catch (error) {
      // Extra safety - should never reach here since acceptConsent never throws
      console.error('Error inesperado al registrar consentimiento terapéutico:', error);
    }
  };

  // Guard simplificado: validar SOLO role === 'patient'
  // NO redirigir pacientes desde /dashboard/patient
  // Las condiciones de acceso adicionales (consent, disclaimer) están dentro del contenido
  
  // Estado de carga: mientras se resuelve el rol o el perfil
  if (roleLoading || profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si el rol NO es 'patient' después de cargar, mostrar mensaje (el guard ya redirigió)
  // Pero NO bloquear si role === 'patient'
  // IMPORTANT: If role is null (network error), allow render to continue
  // Components will handle empty states gracefully
  if (role !== null && role !== 'patient') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              No tienes acceso a esta sección. Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If role is null (network error) but we have a token, allow render
  // Components will show empty states if data fails to load
  // If role === 'patient', continue with normal flow
  // NO verificar 'authorized' aquí - el guard solo valida el rol

  // Mientras no se haya aceptado el consentimiento, mostrar modal sobre fondo visible
  // CRITICAL: Always show modal if consentAcceptedAt is null (after loading is complete)
  if (consentAcceptedAt === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            {showConsentModal ? 'Por favor, acepta el consentimiento terapéutico para continuar.' : 'Cargando consentimiento...'}
          </p>
        </div>
        <TherapeuticConsentModal
          isOpen={showConsentModal}
          onAccept={handleAcceptConsent}
          onClose={() => {
            // Modal should not be closable, but if it is, ensure we show it again
            if (!consentAcceptedAt) {
              setShowConsentModal(true);
            }
          }}
          type="analysis"
        />
      </div>
    );
  }

  // Disclaimer de primer login - mostrar sobre fondo visible
  if (showFirstLoginDisclaimer && !disclaimerAccepted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Preparando tu dashboard...</p>
        </div>
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
      </div>
    );
  }

  // Si el disclaimer aún no está aceptado pero no se está mostrando, mostrar estado de carga
  if (!disclaimerAccepted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
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
