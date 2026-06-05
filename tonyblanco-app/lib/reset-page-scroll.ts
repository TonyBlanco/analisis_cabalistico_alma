/** Restaura el scroll de la página al entrar en un workspace (p. ej. admin). */
export function resetPageScroll(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Desplaza a una sección respetando el header sticky del admin. */
export function scrollToPageSection(elementId: string, headerOffsetPx = 52): void {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(elementId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffsetPx - 12;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}