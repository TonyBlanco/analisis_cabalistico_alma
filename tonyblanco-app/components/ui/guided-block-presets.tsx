'use client';

import { GuidedBlock, type GuidedBlockProps } from './guided-block';

// ─── SWM v3 Consent Presets ───────────────────────────────────────────────────

interface ConsentPresetProps {
  level: 1 | 2 | 3 | 4;
  patientProfileHref?: string;
  compact?: boolean;
  className?: string;
}

const SWM_CONSENT_LEVELS: Record<
  1 | 2 | 3 | 4,
  { title: string; description: string; steps: GuidedBlockProps['steps'] }
> = {
  1: {
    title: 'Consentimiento nivel 1 — Observacional',
    description:
      'El consultante debe autorizar el acceso observacional para que puedas ver datos de perfil y síntesis básica.',
    steps: [
      { label: 'Ve al perfil del consultante' },
      { label: 'Solicita y registra el consentimiento nivel 1 (observacional)' },
      { label: 'El consultante confirma desde su panel' },
    ],
  },
  2: {
    title: 'Consentimiento nivel 2 — Interpretación',
    description:
      'Se requiere autorización para generar interpretaciones simbólicas asistidas por IA sobre los datos del consultante.',
    steps: [
      { label: 'Asegúrate de que el nivel 1 (observacional) ya está activo' },
      { label: 'Solicita el consentimiento nivel 2 (interpretación)' },
      { label: 'El consultante lo confirma desde su panel de consentimientos' },
    ],
  },
  3: {
    title: 'Consentimiento nivel 3 — Notas de sesión',
    description:
      'Para generar y guardar notas de sesión asistida se necesita autorización explícita del consultante.',
    steps: [
      { label: 'Verifica que los niveles 1 y 2 están activos' },
      { label: 'Solicita el consentimiento nivel 3 (notas de sesión)' },
      { label: 'El consultante acepta desde su panel' },
    ],
  },
  4: {
    title: 'Consentimiento nivel 4 — Ejercicios terapéuticos',
    description:
      'La asignación de ejercicios interactivos requiere el nivel más alto de autorización del consultante.',
    steps: [
      { label: 'Verifica que los niveles 1–3 están activos' },
      { label: 'Solicita el consentimiento nivel 4 (ejercicios)' },
      { label: 'El consultante acepta; los ejercicios estarán disponibles de inmediato' },
    ],
  },
};

export function SWMConsentBlock({
  level,
  patientProfileHref,
  compact,
  className,
}: ConsentPresetProps) {
  const config = SWM_CONSENT_LEVELS[level];
  return (
    <GuidedBlock
      variant="consent"
      role="therapist"
      title={config.title}
      description={config.description}
      steps={config.steps}
      actions={
        patientProfileHref
          ? [{ label: 'Ir al perfil del consultante', href: patientProfileHref }]
          : undefined
      }
      compact={compact}
      className={className}
    />
  );
}

// ─── Locked / Non-clinical Role Preset ───────────────────────────────────────

interface LockedPresetProps {
  featureName?: string;
  compact?: boolean;
  className?: string;
}

export function LockedClinicalBlock({
  featureName = 'esta función',
  compact,
  className,
}: LockedPresetProps) {
  return (
    <GuidedBlock
      variant="locked"
      role="therapist"
      title={`Acceso restringido — ${featureName}`}
      description="Esta función requiere un perfil clínico verificado. Si eres terapeuta, solicita que tu cuenta sea habilitada."
      steps={compact ? undefined : [
        { label: 'Contacta al administrador de la plataforma' },
        { label: 'Proporciona tu número de colegiado o credencial profesional' },
        { label: 'Una vez verificado, el acceso se habilitará automáticamente' },
      ]}
      compact={compact}
      className={className}
    />
  );
}
