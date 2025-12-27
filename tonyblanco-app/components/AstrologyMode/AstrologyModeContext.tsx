'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { logEvent } from '@/components/AstrologyStudy/eventLogger';

export type AstrologyMode = 'TRAINING' | 'RESEARCH' | 'SANDBOX';

const STORAGE_KEY = 'astro_mode';

type ModeContextValue = {
  mode: AstrologyMode;
  setMode: (mode: AstrologyMode) => void;
  initialized: boolean;
  storageKey: string;
  hasProvider: boolean;
};

const defaultContext: ModeContextValue = {
  mode: 'TRAINING',
  setMode: () => {},
  initialized: false,
  storageKey: STORAGE_KEY,
  hasProvider: false,
};

const ModeContext = createContext<ModeContextValue>(defaultContext);

export function AstrologyModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AstrologyMode>('TRAINING');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'TRAINING' || stored === 'RESEARCH' || stored === 'SANDBOX') {
        setMode(stored);
      }
    } catch {
      // ignore storage errors
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
    logEvent('MODE_SWITCH', { mode });
  }, [mode, initialized]);

  const value = useMemo<ModeContextValue>(
    () => ({
      mode,
      setMode,
      initialized,
      storageKey: STORAGE_KEY,
      hasProvider: true,
    }),
    [mode, initialized]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useAstrologyMode() {
  const ctx = useContext(ModeContext);
  if (!ctx.hasProvider) {
    // Graceful fallback: read from localStorage to keep UI consistent in components
    let stored: AstrologyMode = 'TRAINING';
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === 'TRAINING' || raw === 'RESEARCH' || raw === 'SANDBOX') {
        stored = raw;
      }
    } catch {
      // ignore
    }
    return {
      ...ctx,
      mode: stored,
    };
  }
  return ctx;
}
