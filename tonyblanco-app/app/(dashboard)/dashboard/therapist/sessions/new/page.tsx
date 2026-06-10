'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Compass,
  Heart,
  Layers,
  Moon,
  Sparkles,
  Stars,
  Users,
} from 'lucide-react';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { getTherapistPatients, type Patient } from '@/lib/patient-api';
import { setActivePatientId } from '@/lib/active-patient';

interface SessionModality {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  featured?: boolean;
}

const MODALITIES: SessionModality[] = [
  {
    id: 'astrologia-tarot',
    label: 'Astrología + Tarot (sesión asistida)',
    description:
      'Flujo híbrido guiado: consentimiento, interpretación asistida por IA y ejercicios.',
    href: '/dashboard/therapist/astrologia-tarot',
    icon: <Sparkles className="h-5 w-5" />,
    featured: true,
  },
  {
    id: 'astrologia',
    label: 'Astrología',
    description: 'Carta natal y lectura astrológica profesional.',
    href: '/dashboard/therapist/astrologia',
    icon: <Stars className="h-5 w-5" />,
  },
  {
    id: 'tarot',
    label: 'Tarot',
    description: 'Tirada y lectura simbólica de tarot.',
    href: '/dashboard/therapist/tarot',
    icon: <Moon className="h-5 w-5" />,
  },
  {
    id: 'cabala-aplicada',
    label: 'Cábala aplicada',
    description: 'Trabajo simbólico sobre el Árbol de la Vida.',
    href: '/dashboard/therapist/cabala-aplicada',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: 'holistica-aplicada',
    label: 'Holística aplicada',
    description: 'Síntesis holística integrada de la sesión.',
    href: '/dashboard/therapist/holistica-aplicada',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: 'correspondencias',
    label: 'Correspondencias',
    description: 'Mapa de correspondencias simbólicas.',
    href: '/dashboard/therapist/correspondencias',
    icon: <Compass className="h-5 w-5" />,
  },
  {
    id: 'transgeneracional-profundo',
    label: 'Transgeneracional profundo',
    description: 'Exploración del sistema familiar y transgeneracional.',
    href: '/dashboard/therapist/transgeneracional-profundo',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'resonancia-ancestral',
    label: 'Resonancia ancestral',
    description: 'Trabajo de resonancia ancestral.',
    href: '/dashboard/therapist/resonancia-ancestral',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'bioemotional',
    label: 'Bioemocional experiencial profunda',
    description: 'Proceso bioemocional experiencial.',
    href: '/dashboard/therapist/bioemotional-experiencial-profunda',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: 'mcmi4-mystic',
    label: 'MCMI-IV místico',
    description: 'Lectura MCMI-IV en clave mística.',
    href: '/dashboard/therapist/mcmi4-mystic',
    icon: <Layers className="h-5 w-5" />,
  },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedModalityId, setSelectedModalityId] = useState<string>('astrologia-tarot');

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoadingRole(false);
      if (!userRole || (userRole !== 'therapist' && userRole !== 'admin')) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['therapist', 'admin'],
    redirectTo: '/dashboard',
  });

  useEffect(() => {
    if (role !== 'therapist' && role !== 'admin') return;
    let cancelled = false;
    setLoadingPatients(true);
    setPatientsError(null);
    getTherapistPatients()
      .then((data) => {
        if (!cancelled) setPatients(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setPatientsError(
            err instanceof Error ? err.message : 'Error al cargar consultantes',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPatients(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const selectedModality = useMemo(
    () => MODALITIES.find((m) => m.id === selectedModalityId) ?? MODALITIES[0],
    [selectedModalityId],
  );

  const handleStart = () => {
    if (selectedPatientId !== null) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      setActivePatientId(selectedPatientId, patient?.full_name ?? null);
    }
    router.push(selectedModality.href);
  };

  if (loadingRole) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'therapist' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Nueva sesión</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Selecciona el consultante y la modalidad para iniciar la sesión.
        </p>
      </div>

      {/* Patient selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Consultante</h2>
        <p className="text-sm text-gray-500 mb-4">
          Opcional. Si lo seleccionas, la sesión se abrirá con ese consultante activo.
        </p>

        {loadingPatients ? (
          <p className="text-sm text-gray-500">Cargando consultantes...</p>
        ) : patientsError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{patientsError}</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">No tienes consultantes registrados aún.</p>
            <button
              type="button"
              onClick={() => router.push('/dashboard/therapist/patients')}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Ir a gestión de consultantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPatientId(null)}
              className={`text-left rounded-md border px-4 py-3 text-sm transition-all ${
                selectedPatientId === null
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Sin consultante (sesión genérica)
            </button>
            {patients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => setSelectedPatientId(patient.id)}
                className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-all ${
                  selectedPatientId === patient.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">{patient.full_name}</span>
                {selectedPatientId === patient.id && (
                  <Check className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modality selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modalidad de sesión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODALITIES.map((modality) => {
            const active = selectedModalityId === modality.id;
            return (
              <button
                key={modality.id}
                type="button"
                onClick={() => setSelectedModalityId(modality.id)}
                className={`text-left rounded-lg border p-4 transition-all ${
                  active
                    ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={active ? 'text-indigo-600' : 'text-gray-500'}>
                    {modality.icon}
                  </span>
                  <span className="font-medium text-gray-900">{modality.label}</span>
                  {modality.featured && (
                    <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      Recomendada
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-gray-500">{modality.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/therapist')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
