'use client';

type EventType = 'MODE_SWITCH' | 'SANDBOX_ENTER_CONFIRM' | 'SANDBOX_SCORE_VIEW' | 'EXPORT_CLICK' | 'PRINT_OPEN';

interface EventPayload {
  [key: string]: unknown;
}

const STORAGE_KEY = 'astro_sandbox_events';
const MAX_EVENTS = 200;

function writeBuffer(event: { type: EventType; payload: EventPayload; ts: number }) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const arr: Array<typeof event> = raw ? JSON.parse(raw) : [];
    arr.push(event);
    const trimmed = arr.slice(-MAX_EVENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

export function logEvent(type: EventType, payload: EventPayload = {}) {
  const evt = { type, payload, ts: Date.now() };
  if (typeof console !== 'undefined' && console.info) {
    console.info('[astro-event]', evt);
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    writeBuffer(evt);
  }
}
