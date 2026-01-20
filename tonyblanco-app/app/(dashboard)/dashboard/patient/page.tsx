'use client';

import React, { useEffect, useState, useRef } from 'react';
import PatientNotesList from '@/components/PatientNotes/PatientNotesList';
import PendingAssignmentsSection from '@/components/PendingAssignmentsSection';
import MCMI4ReflectionCard from '@/components/MCMI4ReflectionCard';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { getUserProfile, acceptConsent, acknowledgeProfileUpdate } from '@/lib/api';
import TherapeuticConsentModal from '@/components/TherapeuticConsentModal';
import ProfileUpdateNotice from '@/components/ProfileUpdateNotice';

export default function PatientHome() {
  const [profileComplete, setProfileComplete] = useState(true);
  const [pendingTests, setPendingTests] = useState(2);
  const [newResults, setNewResults] = useState(1);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  const [showProfileUpdateNotice, setShowProfileUpdateNotice] = useState(false);
  const [lastTherapistUpdate, setLastTherapistUpdate] = useState<string | null>(null);
  const [showReflectionCard, setShowReflectionCard] = useState(false);
  const [checkingReflection, setCheckingReflection] = useState(true);
  const fetchedConsentRef = useRef(false);
  const fetchedReflectionRef = useRef(false);

  // Check consent status (once)
  useEffect(() => {
    if (fetchedConsentRef.current) return;
    fetchedConsentRef.current = true;

    const checkConsent = async () => {
      try {
        const profile = await getUserProfile();
        
        // Show consent modal if not accepted
        if (!profile.consent_accepted_at) {
          setShowConsentModal(true);
        }
        
        // Show profile update notice if therapist updated profile
        if (profile.profile_updated_by_therapist) {
          setShowProfileUpdateNotice(true);
          setLastTherapistUpdate(profile.last_therapist_update || null);
        }
      } catch (error: any) {
        console.error('Error checking consent:', error);
        
        // Handle 401 - user not authenticated, but don't block dashboard
        if (error.status === 401) {
          console.warn('Usuario no autenticado. Modales no se mostrarán.');
        }
        // Non-blocking: allow dashboard to load even if consent check fails
      } finally {
        setConsentLoading(false);
      }
    };

    checkConsent();
  }, []);

  // Check if MCMI-4 signal is completed but reflection is not
  useEffect(() => {
    if (fetchedReflectionRef.current) return;
    fetchedReflectionRef.current = true;

    const checkReflectionStatus = async () => {
      try {
        // Check if mcmi4-signal exists
        const signalRes = await fetch('/api/tests/results/?test_code=mcmi4-signal', {
          credentials: 'include'
        }).catch(() => null);
        
        if (!signalRes || !signalRes.ok) {
          setCheckingReflection(false);
          return;
        }

        const signalData = await signalRes.json().catch(() => null);
        const hasSignal = signalData?.results && signalData.results.length > 0;

        if (!hasSignal) {
          setCheckingReflection(false);
          return;
        }

        // Check if mcmi4-reflection exists
        const reflectionRes = await fetch('/api/tests/results/?test_code=mcmi4-reflection', {
          credentials: 'include'
        }).catch(() => null);

        if (reflectionRes && reflectionRes.ok) {
          const reflectionData = await reflectionRes.json().catch(() => null);
          const hasReflection = reflectionData?.results && reflectionData.results.length > 0;

          // Show card if signal exists but reflection doesn't
          if (!hasReflection) {
            setShowReflectionCard(true);
          }
        }
      } catch (error) {
        // Silently fail - reflection card is optional
      } finally {
        setCheckingReflection(false);
      }
    };

    checkReflectionStatus();
  }, []);

  const handleReflectionComplete = () => {
    setShowReflectionCard(false);
    // Optionally show success message
    alert('✅ Reflexión completada exitosamente. Tu terapeuta podrá verla pronto.');
  };

  const handleConsentAccept = async () => {
    try {
      await acceptConsent();
      setShowConsentModal(false);
    } catch (error) {
      console.error('Error accepting consent:', error);
      // Still close modal - user can retry from profile page if needed
      setShowConsentModal(false);
    }
  };

  const handleProfileUpdateAcknowledge = async () => {
    try {
      await acknowledgeProfileUpdate();
      setShowProfileUpdateNotice(false);
    } catch (error) {
      console.error('Error acknowledging profile update:', error);
      // Still close modal - non-critical
      setShowProfileUpdateNotice(false);
    }
  };

  return (
    <>
      {/* Consent Modal (patient only, shown once if not accepted) */}
      <TherapeuticConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onClose={() => setShowConsentModal(false)}
        type="test"
      />

      {/* Profile Update Notice (shown once if therapist updated profile) */}
      <ProfileUpdateNotice
        isOpen={showProfileUpdateNotice}
        onAcknowledge={handleProfileUpdateAcknowledge}
        lastUpdate={lastTherapistUpdate}
      />
      
    <div className="max-w-5xl mx-auto space-y-6">
      {/* MCMI-4 Reflection Card (shown if signal completed but reflection pending) */}
      {showReflectionCard && !checkingReflection && (
        <MCMI4ReflectionCard
          onComplete={handleReflectionComplete}
          onDismiss={() => setShowReflectionCard(false)}
        />
      )}

      {/* Bienvenida */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenido a tu espacio</h1>
        <p className="text-gray-600">
          Este es tu panel personal de acompañamiento. Aquí puedes ver tus tests, resultados y recursos asignados.
        </p>
      </div>

      {/* Estado del proceso */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">Estado del proceso</h2>
        </div>
        <p className="text-gray-700">En acompañamiento terapéutico</p>
      </div>

      {/* Avisos importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Perfil */}
        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-amber-900">Perfil incompleto</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Completa tu información para análisis más precisos
            </p>
            <a
              href="/dashboard/patient/account"
              className="text-sm text-amber-600 font-medium hover:text-amber-700"
            >
              Completar ahora →
            </a>
          </div>
        )}

        {/* Nuevos resultados */}
        {newResults > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Nuevos resultados</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              {newResults} resultado{newResults > 1 ? 's' : ''} disponible{newResults > 1 ? 's' : ''}
            </p>
            <a
              href="/dashboard/patient/results"
              className="text-sm text-green-600 font-medium hover:text-green-700"
            >
              Ver resultados →
            </a>
          </div>
        )}
      </div>

      {/* Tests Pendientes (real data from assignments) */}
      <PendingAssignmentsSection />

      {/* Mensaje del terapeuta: listado real de mensajes para el paciente */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Mensaje de tu terapeuta</h2>
        </div>
        <div>
          {/* Component that fetches /api/patient-notes/ for authenticated patient */}
          {/* This is a minimal, read-only list and does not affect therapist UI */}
          {/* eslint-disable-next-line @next/next/no-async-client-component */}
          <React.Suspense fallback={<p className="text-gray-600 text-sm">Cargando mensajes…</p>}>
            {/* import dynamically to keep file small */}
            {/* @ts-ignore */}
            <PatientNotesList />
          </React.Suspense>
        </div>
      </div>
    </div>
    </>
  );
}
