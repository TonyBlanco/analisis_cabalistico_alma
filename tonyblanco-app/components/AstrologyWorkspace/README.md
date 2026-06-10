# AstrologyWorkspace

Purpose:
AstrologyWorkspace provides a dedicated visual container for astrology-only exploration.

Modes:
- Observational: visual-only (no structured interpretation panel)
- Formativo / Interpretative: enables a non-clinical interpretation panel with 5 teaching methods (accordion)

Why separate from Tarot:
This workspace is isolated to avoid mixing symbolic narratives and to keep inputs clean for future analysis.

Explicit exclusions:
- Tarot
- Body
- Tree of Life visualization

Future AI note:
Any future AI usage will remain symbolic and holistic, separated from the visual layer.

Este workspace contiene exclusivamente astrologia.
Tarot no vive aqui — Tarot tiene su propio workspace en `/dashboard/therapist/tarot`.
El launcher combinado "Astrologia | Tarot" se mantiene **Proximamente** para evitar mezclar flujos; usa los workspaces por separado.
IA futura sera simbolica, no clinica.

Componentes deprecados:
- `PsychologicalAnalysisPanel.tsx` — huérfano, sin imports; usar `PsychologicalHoroscopeAdvanced`.

Sistemas de Casas soportados (códigos usados en la UI):
- P: Placidus (predeterminado)
- K: Koch
- E: Equal (Casas Iguales)
- W: Whole Sign (recomendado para Kabbalah)
- R: Regiomontanus
