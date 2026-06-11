const THERAPIST_LEARNING_LANDING_SEEN_KEY = 'therapist_learning_landing_seen_v1';
const THERAPIST_LEARNING_AUTOTOUR_KEY = 'therapist_learning_autotour_v1';

const LEARNING_PATHS = new Set(['/learn', '/dashboard/therapist/learn']);

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isLearningCenterPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return LEARNING_PATHS.has(pathname);
}

export function hasSeenTherapistLearningLanding(): boolean {
  if (!hasWindow()) {
    return true;
  }

  return window.localStorage.getItem(THERAPIST_LEARNING_LANDING_SEEN_KEY) === '1';
}

export function markTherapistLearningLandingSeen(): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(THERAPIST_LEARNING_LANDING_SEEN_KEY, '1');
}

export function queueTherapistLearningAutotour(): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(THERAPIST_LEARNING_AUTOTOUR_KEY, '1');
}

export function consumeTherapistLearningAutotour(): boolean {
  if (!hasWindow()) {
    return false;
  }

  const queued = window.localStorage.getItem(THERAPIST_LEARNING_AUTOTOUR_KEY) === '1';
  if (queued) {
    window.localStorage.removeItem(THERAPIST_LEARNING_AUTOTOUR_KEY);
  }
  return queued;
}
