import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, getAuthToken } from './api';

export type TreeStructuralState = {
  sefirot_activas: Array<{
    id_canonico: string;
    indice: number | null;
    peso: number;
  }>;
  senderos_activos: Array<{
    id_canonico: string;
    numero: number | null;
    endpoints: {
      from_sefira: string | null;
      to_sefira: string | null;
    };
    peso: number;
  }>;
  repeticiones: Array<{
    simbolo_id: string;
    conteo: number;
  }>;
  pesos: Record<string, number>;
  ejes: null;
  polaridades: null;
  fuentes: null;
};

export type TreeStructuralStateInput = {
  fullName?: string | null;
  birthDate?: string | null;
  tarotCards?: Array<{ name?: string | null; number?: number | null }>;
  astrologyPlanets?: Record<string, Record<string, unknown>>;
};

export async function fetchTreeStructuralState(
  input: TreeStructuralStateInput,
  signal?: AbortSignal
): Promise<TreeStructuralState | null> {
  const payload = {
    full_name: input.fullName ?? null,
    birth_date: input.birthDate ?? null,
    tarot_cards: input.tarotCards ?? [],
    astrology_planets: input.astrologyPlanets ?? null,
  };

  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };

  const response = await fetch(
    `${API_BASE_URL}/symbolic/tree-structural-state/`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as TreeStructuralState;
}

export function useTreeStructuralState(input: TreeStructuralStateInput) {
  const [state, setState] = useState<TreeStructuralState | null>(null);
  const [loading, setLoading] = useState(false);

  const hasInputs = useMemo(() => {
    return Boolean(
      (input.fullName && input.birthDate) ||
        (input.tarotCards && input.tarotCards.length) ||
        input.astrologyPlanets
    );
  }, [input.birthDate, input.fullName, input.tarotCards, input.astrologyPlanets]);

  const requestKey = useMemo(() => {
    return JSON.stringify({
      fullName: input.fullName ?? null,
      birthDate: input.birthDate ?? null,
      tarotCards: input.tarotCards ?? null,
      astrologyPlanets: input.astrologyPlanets ?? null,
    });
  }, [input.birthDate, input.fullName, input.tarotCards, input.astrologyPlanets]);

  useEffect(() => {
    if (!hasInputs) {
      setState(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchTreeStructuralState(input, controller.signal);
        setState(result);
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') {
          setState(null);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [hasInputs, requestKey]);

  return { state, loading };
}
