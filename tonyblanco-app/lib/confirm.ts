// Central confirm wrapper — allows replacing native confirm with app modal
export default function confirmAction(message: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    let resolved = false;

    const responseEventName = 'app:confirm:response';

    const onResponse = (e: Event) => {
      if (resolved) return;
      resolved = true;
      try {
        const detail: any = (e as CustomEvent).detail;
        resolve(Boolean(detail && detail.confirmed));
      } catch (err) {
        resolve(false);
      } finally {
        window.removeEventListener(responseEventName, onResponse as any);
      }
    };

    window.addEventListener(responseEventName, onResponse as any);

    // Dispatch a request event that an app-level modal can listen to.
    // Listener should read detail.message and post a CustomEvent(responseEventName, { detail: { confirmed: true/false } })
    const requestEvent = new CustomEvent('app:confirm:request', { detail: { message } });
    window.dispatchEvent(requestEvent);

    // Fallback: if no app-modal handles it within short timeout, use native confirm
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try {
        const ok = window.confirm(message);
        resolve(Boolean(ok));
      } catch (e) {
        resolve(false);
      } finally {
        window.removeEventListener(responseEventName, onResponse as any);
      }
    }, 80);
  });
}
