// API base URL normalization.
//
// In this codebase we generally expect NEXT_PUBLIC_API_URL to point to the backend
// API root, e.g. "http://localhost:8000/api".
// However, env values often vary (missing "/api" or with trailing slashes). This
// helper normalizes the value to a stable, slash-safe API base.

const DEFAULT_API_BASE = 'https://analisis-cabalistico-alma.onrender.com/api';

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;

  // Remove trailing slashes to avoid double-slash URLs when concatenating.
  const trimmed = raw.replace(/\/+$/, '');

  // If caller already provided the API root, keep it.
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  // If caller provided backend root (e.g. http://localhost:8000), append /api.
  return `${trimmed}/api`;
}
