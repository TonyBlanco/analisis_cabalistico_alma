/**
 * Symbolic AI Usage Metrics - Local analytics without personal data
 * 
 * RESTRICTIONS (per ARQ_AI_USAGE_METRICS):
 * - NO text logs (never store AI responses or therapist input)
 * - NO semantic analysis
 * - NO personal persistence (session-only or anonymous aggregates)
 * - ONLY: ON/OFF counts, phase, duration
 */

export interface AIUsageEvent {
  type: 'toggle_on' | 'toggle_off' | 'suggestion_requested' | 'suggestion_received';
  phase: string;
  timestamp: number;
}

export interface AIUsageSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  toggleCount: { on: number; off: number };
  suggestionsRequested: number;
  suggestionsReceived: number;
  phaseUsage: Record<string, number>; // phase -> seconds spent
  currentPhase?: string;
  phaseStartTime?: number;
}

const SESSION_KEY = 'swm_ai_usage_session';
const AGGREGATE_KEY = 'swm_ai_usage_aggregate';

/**
 * Generate anonymous session ID (no user identification)
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create current session
 */
export function getOrCreateSession(): AIUsageSession {
  if (typeof window === 'undefined') {
    return createEmptySession();
  }

  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Corrupted data, create new
    }
  }

  const newSession = createEmptySession();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession;
}

function createEmptySession(): AIUsageSession {
  return {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    toggleCount: { on: 0, off: 0 },
    suggestionsRequested: 0,
    suggestionsReceived: 0,
    phaseUsage: {},
  };
}

/**
 * Update session in storage
 */
function saveSession(session: AIUsageSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Record toggle event (ON or OFF)
 */
export function recordToggle(enabled: boolean): void {
  const session = getOrCreateSession();
  
  if (enabled) {
    session.toggleCount.on += 1;
  } else {
    session.toggleCount.off += 1;
  }
  
  saveSession(session);
}

/**
 * Record phase change and track time in previous phase
 */
export function recordPhaseChange(newPhase: string): void {
  const session = getOrCreateSession();
  const now = Date.now();
  
  // Close previous phase timing
  if (session.currentPhase && session.phaseStartTime) {
    const duration = Math.round((now - session.phaseStartTime) / 1000);
    session.phaseUsage[session.currentPhase] = 
      (session.phaseUsage[session.currentPhase] || 0) + duration;
  }
  
  // Start new phase timing
  session.currentPhase = newPhase;
  session.phaseStartTime = now;
  
  saveSession(session);
}

/**
 * Record suggestion request
 */
export function recordSuggestionRequested(phase: string): void {
  const session = getOrCreateSession();
  session.suggestionsRequested += 1;
  
  // Also track phase if not already tracked
  if (session.currentPhase !== phase) {
    recordPhaseChange(phase);
  }
  
  saveSession(session);
}

/**
 * Record suggestion received (successful response)
 */
export function recordSuggestionReceived(): void {
  const session = getOrCreateSession();
  session.suggestionsReceived += 1;
  saveSession(session);
}

/**
 * End session and optionally persist to aggregate (anonymous)
 */
export function endSession(): AIUsageSession {
  const session = getOrCreateSession();
  session.endTime = Date.now();
  
  // Close any open phase timing
  if (session.currentPhase && session.phaseStartTime) {
    const duration = Math.round((session.endTime - session.phaseStartTime) / 1000);
    session.phaseUsage[session.currentPhase] = 
      (session.phaseUsage[session.currentPhase] || 0) + duration;
  }
  
  // Optionally persist to local aggregate (anonymous)
  persistToAggregate(session);
  
  // Clear session
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
  
  return session;
}

/**
 * Aggregate structure for local anonymous analytics
 */
interface AIUsageAggregate {
  totalSessions: number;
  totalTogglesOn: number;
  totalTogglesOff: number;
  totalSuggestionsRequested: number;
  totalSuggestionsReceived: number;
  phaseUsageTotals: Record<string, number>;
  lastUpdated: number;
}

/**
 * Persist session data to anonymous aggregate (localStorage)
 * NO personal data, NO text, NO identifiers
 */
function persistToAggregate(session: AIUsageSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(AGGREGATE_KEY);
    const aggregate: AIUsageAggregate = stored 
      ? JSON.parse(stored)
      : {
          totalSessions: 0,
          totalTogglesOn: 0,
          totalTogglesOff: 0,
          totalSuggestionsRequested: 0,
          totalSuggestionsReceived: 0,
          phaseUsageTotals: {},
          lastUpdated: 0,
        };
    
    // Add session data to aggregate
    aggregate.totalSessions += 1;
    aggregate.totalTogglesOn += session.toggleCount.on;
    aggregate.totalTogglesOff += session.toggleCount.off;
    aggregate.totalSuggestionsRequested += session.suggestionsRequested;
    aggregate.totalSuggestionsReceived += session.suggestionsReceived;
    aggregate.lastUpdated = Date.now();
    
    // Merge phase usage
    for (const [phase, seconds] of Object.entries(session.phaseUsage)) {
      aggregate.phaseUsageTotals[phase] = 
        (aggregate.phaseUsageTotals[phase] || 0) + seconds;
    }
    
    localStorage.setItem(AGGREGATE_KEY, JSON.stringify(aggregate));
  } catch {
    // Silently fail - metrics are non-critical
  }
}

/**
 * Get anonymous aggregate data for display/export
 */
export function getAggregate(): AIUsageAggregate | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(AGGREGATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear all metrics (for privacy or reset)
 */
export function clearAllMetrics(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AGGREGATE_KEY);
}

/**
 * Get current session summary (for display)
 */
export function getSessionSummary(): {
  isActive: boolean;
  duration: number;
  togglesOn: number;
  togglesOff: number;
  suggestions: number;
  currentPhase: string | null;
} {
  const session = getOrCreateSession();
  const now = Date.now();
  
  return {
    isActive: !session.endTime,
    duration: Math.round((now - session.startTime) / 1000),
    togglesOn: session.toggleCount.on,
    togglesOff: session.toggleCount.off,
    suggestions: session.suggestionsRequested,
    currentPhase: session.currentPhase || null,
  };
}
