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
          disableAutoSelect?: () => void;
          cancel?: () => void;
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

function isGsiReady(): boolean {
  return Boolean(window.google?.accounts?.id?.initialize && window.google?.accounts?.id?.renderButton);
}

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onCredential, onError, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [config, setConfig] = useState<GoogleAuthConfig | null>(null);
  const [gsiReady, setGsiReady] = useState(false);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    fetchGoogleConfig().then(setConfig).catch(() => setConfig({ enabled: false, client_id: null }));
  }, []);

  // Tras logout (navegación SPA) el script ya está en window; onLoad del <Script> no vuelve a dispararse.
  useEffect(() => {
    if (isGsiReady()) {
      setGsiReady(true);
      return;
    }
    const interval = window.setInterval(() => {
      if (isGsiReady()) {
        setGsiReady(true);
        window.clearInterval(interval);
      }
    }, 150);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 12_000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  const renderButton = useCallback(() => {
    if (disabled || !config?.enabled || !config.client_id || !gsiReady || !containerRef.current) {
      return;
    }
    if (!isGsiReady()) return;

    const parent = containerRef.current;
    parent.innerHTML = '';

    window.google!.accounts.id.initialize({
      client_id: config.client_id,
      callback: (response) => {
        if (response?.credential) onCredentialRef.current(response.credential);
        else onErrorRef.current?.('No se recibió credencial de Google');
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google!.accounts.id.renderButton(parent, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'es',
      width: parent.offsetWidth || 360,
    });
  }, [config, gsiReady, disabled]);

  useEffect(() => {
    renderButton();
  }, [renderButton]);

  useEffect(() => {
    return () => {
      try {
        window.google?.accounts?.id?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, []);

  if (!config?.enabled) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGsiReady(true)}
        onReady={() => setGsiReady(true)}
        onError={() => onErrorRef.current?.('No se pudo cargar el inicio de sesión de Google')}
      />
      <div
        ref={containerRef}
        className={`flex justify-center min-h-[44px] ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        aria-label="Iniciar sesión con Google"
      />
    </>
  );
}