'use client';

import Script from 'next/script';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api-base';
import { turnstileWidgetErrorMessage } from '@/lib/turnstile-messages';

export type TurnstileConfig = {
  enabled: boolean;
  enforced: boolean;
  site_key: string | null;
};

export type TurnstileFieldHandle = {
  getToken: () => string | null;
  reset: () => void;
  isEnforced: () => boolean;
  isReady: () => boolean;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      getResponse: (widgetId: string) => string | undefined;
      reset: (widgetId: string) => void;
    };
  }
}

async function fetchTurnstileConfig(): Promise<TurnstileConfig> {
  const res = await fetch(`${getApiBaseUrl()}/turnstile/config/`, { credentials: 'include' });
  if (!res.ok) {
    return { enabled: false, enforced: false, site_key: null };
  }
  const data = await res.json();
  return {
    enabled: Boolean(data.enabled),
    enforced: Boolean(data.enforced),
    site_key: data.site_key ?? null,
  };
}

function waitForTurnstileApi(timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.turnstile?.render) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const tick = () => {
      if (window.turnstile?.render) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

type TurnstileFieldProps = {
  theme?: 'light' | 'dark' | 'auto';
  onReadyChange?: (ready: boolean) => void;
  onError?: (message: string) => void;
};

export const TurnstileField = forwardRef<TurnstileFieldHandle, TurnstileFieldProps>(function TurnstileField(
  { theme = 'light', onReadyChange, onError },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [config, setConfig] = useState<TurnstileConfig | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTurnstileConfig().then((cfg) => {
      if (!cancelled) setConfig(cfg);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reportError = useCallback(
    (message: string) => {
      setLoadError(message);
      setWidgetReady(false);
      onReadyChange?.(false);
      onError?.(message);
    },
    [onError, onReadyChange]
  );

  const renderWidget = useCallback(async () => {
    if (!config?.enabled || !config.site_key || !containerRef.current) return;
    setLoadError(null);

    const apiReady = await waitForTurnstileApi();
    if (!apiReady) {
      reportError(turnstileWidgetErrorMessage());
      return;
    }

    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }
    }

    widgetIdRef.current = window.turnstile!.render(containerRef.current, {
      sitekey: config.site_key,
      theme,
      size: 'normal',
      'error-callback': (code) => {
        reportError(turnstileWidgetErrorMessage(code));
      },
      'expired-callback': () => {
        setWidgetReady(false);
        onReadyChange?.(false);
      },
    });
    setWidgetReady(true);
    onReadyChange?.(true);
  }, [config, theme, onReadyChange, reportError]);

  useEffect(() => {
    if (!scriptReady || !config?.enabled) return;
    renderWidget();
  }, [scriptReady, config, renderWidget]);

  useImperativeHandle(
    ref,
    () => ({
      getToken: () => {
        if (!config?.enabled || !config.enforced) return null;
        if (widgetIdRef.current === null || !window.turnstile?.getResponse) return null;
        return window.turnstile.getResponse(widgetIdRef.current) ?? null;
      },
      reset: () => {
        if (widgetIdRef.current !== null && window.turnstile?.reset) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            /* ignore */
          }
        }
        setWidgetReady(false);
        onReadyChange?.(false);
      },
      isEnforced: () => Boolean(config?.enabled && config.enforced),
      isReady: () => !config?.enabled || !config.enforced || (widgetReady && !loadError),
    }),
    [config, widgetReady, loadError, onReadyChange]
  );

  if (!config?.enabled || !config.site_key) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => reportError(turnstileWidgetErrorMessage())}
      />
      <div className="space-y-2 py-1">
        <div className="flex justify-center">
          <div ref={containerRef} aria-label="Verificación de seguridad Cloudflare" />
        </div>
        {loadError ? (
          <p className="text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {loadError}
          </p>
        ) : null}
      </div>
    </>
  );
});