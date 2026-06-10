'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, ShieldCheck, Info, Lock, type LucideIcon } from 'lucide-react';

export type GuidedBlockVariant = 'missing' | 'consent' | 'info' | 'locked';
export type GuidedBlockRole = 'therapist' | 'patient' | 'admin' | 'system';

export interface GuidedBlockStep {
  label: string;
}

export interface GuidedBlockAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export interface GuidedBlockProps {
  variant: GuidedBlockVariant;
  title: string;
  description?: ReactNode;
  role?: GuidedBlockRole;
  steps?: GuidedBlockStep[];
  actions?: GuidedBlockAction[];
  compact?: boolean;
  className?: string;
  icon?: ReactNode;
}

interface VariantStyle {
  container: string;
  iconWrap: string;
  title: string;
  badge: string;
  Icon: LucideIcon;
}

const VARIANT_STYLES: Record<GuidedBlockVariant, VariantStyle> = {
  missing: {
    container: 'border-amber-200 bg-amber-50',
    iconWrap: 'bg-amber-100 text-amber-700',
    title: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle,
  },
  consent: {
    container: 'border-purple-200 bg-purple-50',
    iconWrap: 'bg-purple-100 text-purple-700',
    title: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-700',
    Icon: ShieldCheck,
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    iconWrap: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
    Icon: Info,
  },
  locked: {
    container: 'border-gray-200 bg-gray-50',
    iconWrap: 'bg-gray-200 text-gray-600',
    title: 'text-gray-900',
    badge: 'bg-gray-200 text-gray-600',
    Icon: Lock,
  },
};

const ROLE_LABELS: Record<GuidedBlockRole, string> = {
  therapist: 'Terapeuta',
  patient: 'Consultante',
  admin: 'Administrador',
  system: 'Sistema',
};

function ActionButton({ action }: { action: GuidedBlockAction }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors';
  const styles =
    action.variant === 'secondary'
      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      : 'bg-gray-900 text-white hover:bg-gray-800';
  const className = `${base} ${styles}`;

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

/**
 * GuidedBlock — bloque universal de guia para estados que requieren accion del
 * usuario en los workspaces simbolicos del Modo Interactivo Asistido.
 *
 * Variantes:
 * - missing  (ambar):  falta configuracion / dato requerido.
 * - consent  (purpura): se requiere consentimiento del consultante.
 * - info     (azul):   informacion / estado neutro.
 * - locked   (gris):   acceso restringido (p. ej. rol clinico no verificado).
 */
export function GuidedBlock({
  variant,
  title,
  description,
  role,
  steps,
  actions,
  compact = false,
  className = '',
  icon,
}: GuidedBlockProps) {
  const style = VARIANT_STYLES[variant];
  const Icon = style.Icon;

  return (
    <div
      className={`rounded-xl border ${style.container} ${compact ? 'p-4' : 'p-5'} shadow-sm ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
        >
          {icon ?? <Icon className="h-5 w-5" aria-hidden="true" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-sm font-semibold ${style.title}`}>{title}</h3>
            {role ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${style.badge}`}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            ) : null}
          </div>

          {description ? (
            <div className="mt-1 text-xs leading-relaxed text-gray-600">{description}</div>
          ) : null}

          {steps && steps.length > 0 ? (
            <ol className="mt-3 space-y-1.5">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/80 text-[10px] font-semibold text-gray-500 ring-1 ring-inset ring-gray-300">
                    {index + 1}
                  </span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {actions && actions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <ActionButton key={index} action={action} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default GuidedBlock;
