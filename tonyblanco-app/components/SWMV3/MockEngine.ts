"use client";

export type SwmV3ReadingCard = {
  id: string;
  name: string;
  arcana?: string;
  tags?: string[];
  symbols?: Record<string, unknown>;
};

export type SwmV3Reading = {
  id: string;
  summary: string;
  themes: string[];
  correspondences: string[];
  caution: string;
  cards: SwmV3ReadingCard[];
  symbolic_reading?: {
    system?: { id: string; label: string };
    card?: { name: string; arcana: string; keywords: string[] };
    symbolic_reading?: {
      core_meaning: string;
      contextual_meaning: string;
      position_meaning: string;
      system_frame: string;
    };
    notes?: string;
  };
};

export function runMockInterpretation(): SwmV3Reading {
  return {
    id: "swm-v3-mock-fallback",
    summary: "Lectura educativa (mock) — sin ejecución remota.",
    themes: [],
    correspondences: [],
    caution:
      "Lectura educativa (mock) — no es diagnóstico, recomendación ni consejo clínico.",
    cards: [],
  };
}

export default runMockInterpretation;
