// API base URL normalization.
//
// In this codebase we generally expect NEXT_PUBLIC_API_URL to point to the backend
// API root, e.g. "http://localhost:8000/api".
// However, env values often vary (missing "/api" or with trailing slashes). This
// helper normalizes the value to a stable, slash-safe API base.

const DEFAULT_API_BASE = 'https://analisis-cabalistico-alma.onrender.com/api';
const LOCAL_FALLBACK_API_BASE = 'http://127.0.0.1:8000/api';

export function getApiBaseUrl(): string {
  const envValue = process.env.NEXT_PUBLIC_API_URL;
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // In local dev, missing env should fall back to local backend and warn once.
  if (!envValue && isLocalHost) {
    const g = globalThis as unknown as { __warnedMissingApiBaseUrl?: boolean };
    if (!g.__warnedMissingApiBaseUrl) {
      g.__warnedMissingApiBaseUrl = true;
      // eslint-disable-next-line no-console
      console.warn(`[api] NEXT_PUBLIC_API_URL not set; falling back to ${LOCAL_FALLBACK_API_BASE}`);
    }
  }

  // Use local backend by default in non-production if env is missing.
  const raw = envValue || (process.env.NODE_ENV !== 'production' ? LOCAL_FALLBACK_API_BASE : DEFAULT_API_BASE);

  // Remove trailing slashes to avoid double-slash URLs when concatenating.
  const trimmed = raw.replace(/\/+$/, '');

  // If caller already provided the API root, keep it.
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  // If caller provided backend root (e.g. http://localhost:8000), append /api.
  return `${trimmed}/api`;
}
