import type { SymbolicTimelineEvent } from './types';

type TimelineListener = (events: SymbolicTimelineEvent[]) => void;

const timelineEvents: SymbolicTimelineEvent[] = [];
const listeners = new Set<TimelineListener>();

export function getSymbolicTimelineEvents(): SymbolicTimelineEvent[] {
  return [...timelineEvents].sort((a, b) => b.date.localeCompare(a.date));
}

export function addSymbolicTimelineEvent(event: SymbolicTimelineEvent): void {
  timelineEvents.push(event);
  listeners.forEach((listener) => listener(getSymbolicTimelineEvents()));
}

export function subscribeSymbolicTimeline(
  listener: TimelineListener
): () => void {
  listeners.add(listener);
  listener(getSymbolicTimelineEvents());
  return () => {
    listeners.delete(listener);
  };
}
