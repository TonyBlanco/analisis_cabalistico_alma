/** Mensajes UX para errores del widget Cloudflare Turnstile. */
export function turnstileWidgetErrorMessage(code?: string): string {
  if (code === '110200') {
    return (
      'Este sitio (studios33.app) no está autorizado en tu widget Turnstile. ' +
      'En Cloudflare → Turnstile → Hostname management, añade studios33.app y www.studios33.app.'
    );
  }
  if (code === '110100' || code === '110110' || code === '400020') {
    return 'Clave de sitio Turnstile inválida. Revisa TURNSTILE_SITE_KEY en el servidor.';
  }
  if (code) {
    return `No se pudo conectar con Cloudflare (código ${code}). Recarga la página o inténtalo más tarde.`;
  }
  return 'No se pudo cargar la verificación de Cloudflare. Comprueba tu conexión y recarga.';
}

export function turnstileApiErrorMessage(errorCode?: string, fallback?: string): string {
  if (errorCode === 'turnstile_required') {
    return 'Completa la verificación de seguridad antes de continuar.';
  }
  if (errorCode === 'turnstile_invalid') {
    return 'La verificación no es válida. Inténtalo de nuevo.';
  }
  if (errorCode === 'turnstile_verify_failed') {
    return 'No se pudo validar con Cloudflare. Reintenta en unos segundos.';
  }
  return fallback || 'Error de verificación de seguridad.';
}