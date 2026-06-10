'use client';

import Link from 'next/link';
import { type LucideIcon, AlertCircle, Info, Lock, HelpCircle } from 'lucide-react';

export type GuidedBlockVariant = 'missing' | 'consent' | 'info' | 'locked';
export type GuidedBlockRole = 'therapist' | 'patient' | 'both';

export interface GuidedAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface GuidedStep {
  label: string;
  description?: string;
}

export interface GuidedBlockProps {
  title: string;
  description: string;
  steps?: GuidedStep[];
  actions?: GuidedAction[];
  variant?: GuidedBlockVariant;
  role?: GuidedBlockRole;
  icon?: LucideIcon;
  compact?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<GuidedBlockVariant, {
  wrapper: string;
  iconWrapper: string;
  iconColor: string;
  DefaultIcon: LucideIcon;
  roleBg: string;
}> = {
  missing: {
    wrapper: 'border-amber-200 bg-amber-50',
    iconWrapper: 'bg-amber-100',
    iconColor: 'text-amber-600',
    DefaultIcon: AlertCircle,
    roleBg: 'bg-amber-100 text-amber-700',
  },
  consent: {
    wrapper: 'border-purple-200 bg-purple-50',
    iconWrapper: 'bg-purple-100',
    iconColor: 'text-purple-600',
    DefaultIcon: Lock,
    roleBg: 'bg-purple-100 text-purple-700',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50',
    iconWrapper: 'bg-blue-100',
    iconColor: 'text-blue-600',
    DefaultIcon: Info,
    roleBg: 'bg-blue-100 text-blue-700',
  },
  locked: {
    wrapper: 'border-gray-200 bg-gray-50',
    iconWrapper: 'bg-gray-100',
    iconColor: 'text-gray-500',
    DefaultIcon: HelpCircle,
    roleBg: 'bg-gray-100 text-gray-600',
  },
};

const ROLE_LABELS: Record<GuidedBlockRole, string> = {
  therapist: 'Terapeuta',
  patient: 'Consultante',
  both: 'Terapeuta · Consultante',
};

const ACTION_STYLES: Record<NonNullable<GuidedAction['variant']>, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

export function GuidedBlock({
  title,
  description,
  steps,
  actions,
  variant = 'missing',
  role,
  icon,
  compact = false,
  className = '',
}: GuidedBlockProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = icon ?? styles.DefaultIcon;

  return (
    <div
      className={`rounded-xl border p-5 ${styles.wrapper} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconWrapper}`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} aria-hidden="true" />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {role && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.roleBg}`}>
                {ROLE_LABELS[role]}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600">{description}</p>

          {!compact && steps && steps.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-gray-300 text-[11px] font-semibold text-gray-600">
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm text-gray-700 font-medium">{step.label}</span>
                    {step.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {actions && actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((action, i) => {
                const cls = `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ACTION_STYLES[action.variant ?? (i === 0 ? 'primary' : 'secondary')]}`;
                if (action.href) {
                  return (
                    <Link key={i} href={action.href} className={cls}>
                      {action.label}
                    </Link>
                  );
                }
                return (
                  <button key={i} type="button" onClick={action.onClick} className={cls}>
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
