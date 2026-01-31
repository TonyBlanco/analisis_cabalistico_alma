// API base URL normalization.
//
// In this codebase we generally expect NEXT_PUBLIC_API_URL to point to the backend
// API root, e.g. "http://localhost:8000/api".
// However, env values often vary (missing "/api" or with trailing slashes). This
// helper normalizes the value to a stable, slash-safe API base.

const DEFAULT_API_BASE = 'https://analisis-cabalistico-alma.onrender.com/api';
const LOCAL_FALLBACK_API_BASE = 'http://127.0.0.1:8000/api';

function normalizeApiBase(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export function getApiBaseUrl(): string {
  const envValue = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  const localOverride = normalizeApiBase(process.env.NEXT_PUBLIC_LOCAL_API_URL);
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  // In local dev, prefer a local backend when running in the browser on localhost.
  // This avoids trying to call the production API (e.g., Render) which may be
  // unreachable from local dev environments.
  if (isLocalHost) {
    const g = globalThis as unknown as { __warnedApiBaseOverride?: boolean };
    // If a local override is explicitly provided, use it.
    if (localOverride) return localOverride;

    // If envValue points to a non-local host, override it with the local fallback
    // and warn once to help developers adjust their env vars.
    if (envValue && !envValue.includes('localhost') && !envValue.includes('127.0.0.1')) {
      if (!g.__warnedApiBaseOverride) {
        g.__warnedApiBaseOverride = true;
        // eslint-disable-next-line no-console
        console.warn(`[api] NEXT_PUBLIC_API_URL set to ${envValue} but running on localhost — overriding to ${LOCAL_FALLBACK_API_BASE} for local dev.`);
      }
      return LOCAL_FALLBACK_API_BASE;
    }

    // If no envValue, just fall back to local
    if (!envValue) {
      if (!g.__warnedApiBaseOverride) {
        g.__warnedApiBaseOverride = true;
        // eslint-disable-next-line no-console
        console.warn(`[api] NEXT_PUBLIC_API_URL not set; falling back to ${LOCAL_FALLBACK_API_BASE}`);
      }
      return LOCAL_FALLBACK_API_BASE;
    }
  }

  const fallbackBase = process.env.NODE_ENV !== 'production' ? LOCAL_FALLBACK_API_BASE : DEFAULT_API_BASE;
  const base = localOverride || envValue || normalizeApiBase(fallbackBase)!;

  return base;
}
