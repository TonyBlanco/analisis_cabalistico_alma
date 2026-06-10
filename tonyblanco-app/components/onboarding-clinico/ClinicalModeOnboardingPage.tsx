'use client';

import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, RefreshCcw, ShieldCheck, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ClinicalOnboardingApiError,
  type ClinicalModeRequestPayload,
  type ClinicalModeRequestResponse,
  requestClinicalMode,
} from '@/lib/clinical-onboarding-api';
import { fetchMyProfile, type MyProfile } from '@/lib/profile-api';
import { BetaFeedbackForm } from './BetaFeedbackForm';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

interface StatusItem {
  key: keyof Pick<MyProfile, 'clinical_mode_requested' | 'clinical_mode_enabled' | 'can_use_clinical_lexicon'>;
  label: string;
  description: string;
}

const statusItems: StatusItem[] = [
  {
    key: 'clinical_mode_requested',
    label: 'Solicitud clínica registrada',
    description: 'Refleja si tu petición quedó registrada para revisión administrativa.',
  },
  {
    key: 'clinical_mode_enabled',
    label: 'Modo clínico activado',
    description: 'Se activa tras validación administrativa de la credencial clínica.',
  },
  {
    key: 'can_use_clinical_lexicon',
    label: 'Lexicón clínico permitido',
    description: 'Indica si tu cuenta puede usar vocabulario clínico ampliado en el modo híbrido.',
  },
];

const initialFormState: ClinicalModeRequestPayload = {
  license_number: '',
  specialty: '',
  professional_body: '',
  responsible_use_accepted: false,
  anti_fraud_rail_accepted: false,
  notes: '',
};

export function ClinicalModeOnboardingPage() {
  const [profileState, setProfileState] = useState<LoadState>('idle');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);

  const [formData, setFormData] = useState<ClinicalModeRequestPayload>(initialFormState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const loadProfile = useCallback(async () => {
    setProfileState('loading');
    setProfileError(null);

    try {
      const nextProfile = await fetchMyProfile();
      setProfile(nextProfile);
      setProfileState('success');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'No se pudo cargar el perfil.');
      setProfileState('error');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const statusSummary = useMemo(() => {
    if (profile?.clinical_mode_enabled) {
      return {
        tone: 'enabled' as const,
        title: 'Modo clínico activo',
        description:
          'Tu cuenta ya está habilitada. Aquí puedes revisar flags clínicos y dejar feedback de la beta médica.',
      };
    }

    if (profile?.clinical_mode_requested) {
      return {
        tone: 'pending' as const,
        title: 'Solicitud en revisión',
        description:
          'La solicitud ya quedó registrada. La activación real sigue dependiendo de la validación administrativa de tu credencial clínica.',
      };
    }

    return {
      tone: 'locked' as const,
      title: 'Pendiente de verificación clínica',
      description:
        'Completa tu credencial profesional y acepta el uso responsable para pedir acceso al modo clínico híbrido.',
    };
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitMessage(null);

    if (!formData.license_number.trim() || !formData.specialty.trim()) {
      setSubmitError('Introduce tu número de colegiado/licencia y la especialidad antes de enviar.');
      return;
    }

    if (!formData.responsible_use_accepted || !formData.anti_fraud_rail_accepted) {
      setSubmitError('Debes aceptar el uso responsable y el rail anti-fraude para continuar.');
      return;
    }

    setSubmitState('submitting');

    try {
      const response = await requestClinicalMode({
        license_number: formData.license_number.trim(),
        specialty: formData.specialty.trim(),
        professional_body: formData.professional_body?.trim() || undefined,
        responsible_use_accepted: formData.responsible_use_accepted,
        anti_fraud_rail_accepted: formData.anti_fraud_rail_accepted,
        notes: formData.notes?.trim() || undefined,
      });

      handleSuccessfulRequest(response);
    } catch (error) {
      setSubmitError(resolveClinicalRequestError(error));
      setSubmitState('idle');
    }
  }

  function handleSuccessfulRequest(response: ClinicalModeRequestResponse) {
    setSubmitState('success');
    setSubmitMessage(response.message);

    if (response.status === 'backend_pending') {
      return;
    }

    setProfile((currentProfile) => ({
      ...(currentProfile ?? {}),
      clinical_mode_requested: response.clinical_mode_requested,
      clinical_mode_enabled: response.clinical_mode_enabled,
      can_use_clinical_lexicon: response.can_use_clinical_lexicon,
    }));
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_55%,#ecfeff_100%)] shadow-sm">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 backdrop-blur">
              <Stethoscope className="h-3.5 w-3.5" />
              Beta tester médica
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Onboarding del modo clínico híbrido
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                UI nueva para terapeutas que consulta el perfil actual, solicita el modo clínico y recoge feedback
                beta sin tocar la capa de sesión ni los componentes clínicos bloqueados.
              </p>
            </div>
          </div>

          <GuidanceSurface tone={statusSummary.tone} title={statusSummary.title} description={statusSummary.description} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <ProfileStatusPanel
            profile={profile}
            state={profileState}
            error={profileError}
            onRetry={loadProfile}
          />

          <ClinicalModeRequestForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            submitError={submitError}
            submitMessage={submitMessage}
            submitState={submitState}
            isRequestLocked={Boolean(profile?.clinical_mode_enabled)}
          />
        </div>

        <BetaFeedbackForm />
      </section>
    </div>
  );
}

function resolveClinicalRequestError(error: unknown): string {
  if (error instanceof ClinicalOnboardingApiError) {
    if (error.code === 'credential_required') {
      return 'El backend requiere licencia/colegiación y especialidad para registrar la solicitud.';
    }

    if (error.code === 'acceptance_required') {
      return 'El backend requiere aceptar el uso responsable y el rail anti-fraude.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo enviar la solicitud clínica.';
}

interface GuidanceSurfaceProps {
  tone: 'enabled' | 'pending' | 'locked';
  title: string;
  description: string;
}

function GuidanceSurface({ tone, title, description }: GuidanceSurfaceProps) {
  const toneMap = {
    enabled: {
      icon: ShieldCheck,
      badge: 'consent',
      className: 'border-emerald-200 bg-white/85 text-emerald-950',
      iconWrap: 'bg-emerald-100 text-emerald-700',
    },
    pending: {
      icon: Clock3,
      badge: 'info',
      className: 'border-amber-200 bg-white/85 text-amber-950',
      iconWrap: 'bg-amber-100 text-amber-700',
    },
    locked: {
      icon: LockKeyhole,
      badge: 'locked',
      className: 'border-slate-200 bg-white/85 text-slate-950',
      iconWrap: 'bg-slate-100 text-slate-700',
    },
  } as const;

  const currentTone = toneMap[tone];
  const Icon = currentTone.icon;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm backdrop-blur ${currentTone.className}`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl p-3 ${currentTone.iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentTone.badge}</Badge>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Estado del rollout</span>
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface ProfileStatusPanelProps {
  profile: MyProfile | null;
  state: LoadState;
  error: string | null;
  onRetry: () => Promise<void>;
}

function ProfileStatusPanel({ profile, state, error, onRetry }: ProfileStatusPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Perfil actual</p>
          <h2 className="text-xl font-semibold text-slate-900">Flags clínicos desde `MyProfile`</h2>
          <p className="text-sm leading-6 text-slate-600">
            La pantalla consume `clinical_mode_requested`, `clinical_mode_enabled` y `can_use_clinical_lexicon`.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={() => void onRetry()} disabled={state === 'loading'}>
          <RefreshCcw className="h-4 w-4" />
          Recargar
        </Button>
      </div>

      {state === 'error' && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {statusItems.map((item) => {
          const value = profile?.[item.key];
          const enabled = value === true;
          const pending = value == null;

          return (
            <article key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-slate-900">{item.label}</h3>
                <StatusBadge enabled={enabled} pending={pending} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({ enabled, pending }: { enabled: boolean; pending: boolean }) {
  if (pending) {
    return <Badge variant="outline">sin dato</Badge>;
  }

  return enabled ? (
    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">activo</Badge>
  ) : (
    <Badge variant="outline">no activo</Badge>
  );
}

interface ClinicalModeRequestFormProps {
  formData: ClinicalModeRequestPayload;
  onChange: Dispatch<SetStateAction<ClinicalModeRequestPayload>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitError: string | null;
  submitMessage: string | null;
  submitState: 'idle' | 'submitting' | 'success';
  isRequestLocked: boolean;
}

function ClinicalModeRequestForm({
  formData,
  onChange,
  onSubmit,
  submitError,
  submitMessage,
  submitState,
  isRequestLocked,
}: ClinicalModeRequestFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Solicitud</p>
        <h2 className="text-xl font-semibold text-slate-900">Solicitar modo clínico</h2>
        <p className="text-sm leading-6 text-slate-600">
          La petición la registra el backend y la activación real continúa en el endpoint administrativo ya existente.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={(event) => void onSubmit(event)}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nº colegiado / licencia" htmlFor="license_number">
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(event) => onChange((current) => ({ ...current, license_number: event.target.value }))}
              placeholder="Ej. 28/123456"
              disabled={isRequestLocked}
            />
          </Field>

          <Field label="Especialidad" htmlFor="specialty">
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(event) => onChange((current) => ({ ...current, specialty: event.target.value }))}
              placeholder="Psicología clínica, psiquiatría, trauma, etc."
              disabled={isRequestLocked}
            />
          </Field>
        </div>

        <Field label="Colegio / entidad emisora" htmlFor="professional_body">
          <Input
            id="professional_body"
            value={formData.professional_body ?? ''}
            onChange={(event) => onChange((current) => ({ ...current, professional_body: event.target.value }))}
            placeholder="Colegio Oficial o entidad emisora"
            disabled={isRequestLocked}
          />
        </Field>

        <Field label="Notas para revisión" htmlFor="notes">
          <Textarea
            id="notes"
            rows={4}
            value={formData.notes ?? ''}
            onChange={(event) => onChange((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Contexto adicional de tu práctica o del piloto clínico."
            disabled={isRequestLocked}
          />
        </Field>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formData.responsible_use_accepted}
              onChange={(event) =>
                onChange((current) => ({ ...current, responsible_use_accepted: event.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
              disabled={isRequestLocked}
            />
            <span>
              Declaro que usaré el modo clínico solo como apoyo profesional y no como sustituto del juicio clínico,
              consentimiento informado o diagnóstico.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formData.anti_fraud_rail_accepted}
              onChange={(event) =>
                onChange((current) => ({ ...current, anti_fraud_rail_accepted: event.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
              disabled={isRequestLocked}
            />
            <span>
              Acepto el rail anti-fraude y entiendo que un uso no autorizado o una credencial inválida puede bloquear
              o revocar el acceso clínico.
            </span>
          </label>
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs leading-5 text-slate-500">
            Endpoint: `POST /api/profile/clinical-mode-request/`
          </p>

          <Button type="submit" disabled={submitState === 'submitting' || isRequestLocked}>
            {submitState === 'submitting' ? 'Enviando…' : isRequestLocked ? 'Modo ya activado' : 'Solicitar acceso'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
