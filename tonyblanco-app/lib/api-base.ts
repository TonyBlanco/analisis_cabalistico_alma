// API base URL normalization.
//
// Production should use the current public API host. Local development may still
// point to a Django server directly.

const DEFAULT_API_BASE = 'https://api.studios33.app/api';
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

  // In local dev, missing env should fall back to local backend and warn once.
  if (!envValue && !localOverride && isLocalHost) {
    const g = globalThis as unknown as { __warnedMissingApiBaseUrl?: boolean };
    if (!g.__warnedMissingApiBaseUrl) {
      g.__warnedMissingApiBaseUrl = true;
      console.warn(`[api] NEXT_PUBLIC_API_URL not set; falling back to ${LOCAL_FALLBACK_API_BASE}`);
    }
  }

  const fallbackBase = process.env.NODE_ENV !== 'production' ? LOCAL_FALLBACK_API_BASE : DEFAULT_API_BASE;
  const base = localOverride || envValue || normalizeApiBase(fallbackBase)!;

  return base;
}

/** Join API base with a relative path (e.g. `therapist/metrics/` or `/therapist/metrics/`). */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
