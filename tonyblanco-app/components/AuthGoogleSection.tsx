'use client';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';

type AuthGoogleSectionProps = {
  googleKey: number;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
  tone?: 'default' | 'marketing';
};

/** Bloque reutilizable: separador + botón Google (login y registros). */
export function AuthGoogleSection({
  googleKey,
  disabled,
  onCredential,
  onError,
  tone = 'default',
}: AuthGoogleSectionProps) {
  const marketing = tone === 'marketing';

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div
            className={`w-full border-t ${marketing ? 'border-[var(--ha-line-soft)]' : 'border-gray-200'}`}
          />
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className={`px-4 ${marketing ? 'bg-[var(--ha-surface)] text-[var(--ha-ink-3)]' : 'bg-white text-gray-500'}`}
          >
            o continúa con
          </span>
        </div>
      </div>
      <GoogleSignInButton
        key={googleKey}
        disabled={disabled}
        onCredential={onCredential}
        onError={onError}
      />
    </>
  );
}