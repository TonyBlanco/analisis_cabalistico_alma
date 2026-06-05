'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api-base';

export type GoogleAuthConfig = {
  enabled: boolean;
  client_id: string | null;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string; locale?: string }
          ) => void;
        };
      };
    };
  }
}

async function fetchGoogleConfig(): Promise<GoogleAuthConfig> {
  const res = await fetch(`${getApiBaseUrl()}/google/config/`, { credentials: 'include' });
  if (!res.ok) return { enabled: false, client_id: null };
  const data = await res.json();
  return {
    enabled: Boolean(data.enabled),
    client_id: data.client_id ?? null,
  };
}

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onCredential, onError, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<GoogleAuthConfig | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const renderedRef = useRef(false);

  useEffect(() => {
    fetchGoogleConfig().then(setConfig).catch(() => setConfig({ enabled: false, client_id: null }));
  }, []);

  const renderButton = useCallback(() => {
    if (renderedRef.current || disabled) return;
    if (!config?.enabled || !config.client_id || !scriptReady || !containerRef.current) return;
    if (!window.google?.accounts?.id) return;

    containerRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: config.client_id,
      callback: (response) => {
        if (response?.credential) onCredential(response.credential);
        else onError?.('No se recibió credencial de Google');
      },
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'es',
      width: containerRef.current.offsetWidth || 360,
    });
    renderedRef.current = true;
  }, [config, scriptReady, disabled, onCredential, onError]);

  useEffect(() => {
    renderedRef.current = false;
    renderButton();
  }, [renderButton]);

  if (!config?.enabled) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => onError?.('No se pudo cargar el inicio de sesión de Google')}
      />
      <div
        ref={containerRef}
        className={`flex justify-center min-h-[44px] ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        aria-label="Iniciar sesión con Google"
      />
    </>
  );
}