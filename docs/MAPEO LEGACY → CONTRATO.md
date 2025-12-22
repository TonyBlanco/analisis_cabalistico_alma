# MAPEO LEGACY → CONTRATO
# FASE 2 — TreeStructuralState (Árbol de la Vida)

Resumen del mapeo (máx. 10 líneas)
El legacy aporta mapeos estructurales sólidos para sefirot y senderos (cabala_py + mapper_cabala), y conteos de repetición/pesos vía inclusión base. No existe un productor explícito para ejes, polaridades ni fuentes en la capa estructural actual. Hay mezcla estructura/narrativa en `backend/cabala_py/integracion_arbol.py`, `backend/cabala_py/inclusion.py`, `backend/cabala_py/soul_analytics.py`, `backend/api/bioemotional/services/tree_of_life_adapter.py` y `backend/api/utils/tarot_service.py`, que deben separarse. Hay duplicidad de mapeos (senderos y sefirot) entre backend y frontend con discrepancias de IDs (p. ej. `chokmah` vs `chokhmah`). El contrato TreeStructuralState puede llenarse con fuentes A para sefirot/senderos/repeticiones/pesos, pero requiere gaps C para ejes, polaridades y fuentes.

Tabla de mapeo campo por campo, con columnas:
Campo TreeStructuralState | Archivo legacy | Función legacy | Tipo (A / B / C) | Notas técnicas (solo estructurales)

- sefirot_activas | `backend/cabala_py/arbol_vida.py` | `SEFIROTH`, `obtener_sefira_por_numero`, `mapear_numero_a_arbol` | A | Base canónica de sefirot por índice.
- sefirot_activas | `backend/cabala_py/integracion_arbol.py` | `mapear_a_arbol_vida`, `generar_mapa_cabalista_completo` | A | Expone sefirot activas al mapear esencia/expresión/herencia/destino.
- sefirot_activas | `backend/cabala_py/numerology.py` | `calcular_valores_nombre`, `calcular_camino_destino` | A | Produce números base que activan sefirot.
- sefirot_activas | `backend/cabala_py/inclusion.py` | `calcular_inclusion_base` | A | Frecuencias 1–9 permiten inferir sefirot activas.
- sefirot_activas | `backend/api/astrology_kerykeion/mapper_cabala.py` | `map_planet_to_sefirot`, `build_cabalistic_mapping` | A | Mapea planeta→sefira (estructural).
- sefirot_activas | `backend/api/utils/tarot_service.py` | `ARCANA_MAP` | B | Incluye rutas con sefirot en texto; embebido en contexto clínico.
- sefirot_activas | `tonyblanco-app/components/Tree/tree.config.ts` | `TREE_SEFIROT` | B | Definición visual; no produce estado, solo consume.

- senderos_activos | `backend/cabala_py/arbol_vida.py` | `SENDEROS`, `obtener_sendero_por_numero`, `mapear_numero_a_arbol` | A | Mapeo canónico sendero↔tarot/letter.
- senderos_activos | `backend/cabala_py/integracion_arbol.py` | `mapear_a_arbol_vida` | A | Activa senderos al mapear números 11–22.
- senderos_activos | `backend/api/astrology_kerykeion/mapper_cabala.py` | `SIGN_TO_PATHS`, `map_sign_to_paths`, `build_cabalistic_mapping` | A | Mapea signo→sendero (estructural).
- senderos_activos | `backend/api/utils/tarot_service.py` | `ARCANA_MAP` | B | Senderos como texto dentro de análisis clínico.
- senderos_activos | `tonyblanco-app/components/Tree/tree.config.ts` | `TREE_PATHS` | B | Conexiones visuales, no estado estructural.

- ejes | `backend/cabala_py/integracion_arbol.py` | — | C | No hay estructura explícita de ejes; solo conexiones/relaciones.
- ejes | `tonyblanco-app/components/Tree/tree.config.ts` | `TREE_PATHS` | C | Conexiones no están agrupadas por eje.

- polaridades | `backend/cabala_py/*` | — | C | No hay clasificación yin/yang en legacy estructural.
- polaridades | `tonyblanco-app/components/Tree/*` | — | C | Visualizadores no definen polaridades.

- repeticiones | `backend/cabala_py/inclusion.py` | `calcular_inclusion_base` | A | `numeros_dominantes`, `maestrias`, `casas` permiten repetir símbolos.
- repeticiones | `backend/cabala_py/integracion_arbol.py` | `generar_mapa_cabalista_completo` (campo `inclusion_base`) | A | Expone dominantes/ausentes como repeticiones estructurales.

- pesos | `backend/cabala_py/inclusion.py` | `calcular_inclusion_base` | A | Conteos de `casas` son pesos de frecuencia.
- pesos | `backend/cabala_py/integracion_arbol.py` | `generar_estructura_energetica` | B | `grafico_simple` es peso, pero mezclado con narrativa en el módulo.
- pesos | `backend/api/synthesis_engine/schemas.py` | `NormalizedSource.weight` | C | Peso clínico/síntesis, fuera del árbol estructural.

- fuentes | `backend/cabala_py/integracion_arbol.py` | — | C | No hay tagging explícito de fuentes por campo.
- fuentes | `backend/api/synthesis_engine/engine.py` | `source_trace` | C | Trazabilidad clínica/síntesis, no estructural del árbol.

Legacy reutilizable directo (lista)
- `backend/cabala_py/arbol_vida.py` (SEFIROTH, SENDEROS, mapeos numéricos)
- `backend/cabala_py/numerology.py` (cálculos base)
- `backend/cabala_py/inclusion.py` (conteos/frecuencias)
- `backend/cabala_py/utils.py` (reducciones)
- `backend/api/astrology_kerykeion/mapper_cabala.py` (mapeos planeta/signo)
- `tonyblanco-app/components/Tree/tree.config.ts`, `tonyblanco-app/components/Tree/TreeOfLifeSVG.tsx`, `tonyblanco-app/components/BodySoulVisualization/SefirotOverlay.tsx`, `tonyblanco-app/components/BodySoulVisualization/plugins/tarot/TarotTreeOverlay.tsx` (consumo visual)

Legacy que requiere separación estructura / narrativa
- `backend/cabala_py/integracion_arbol.py` (`obtener_significado_sefira`, `obtener_significado_sendero`, `generar_analisis_cabalista`, `generar_recomendaciones`, `calcular_turbulencias`)
- `backend/cabala_py/inclusion.py` (`interpretar_inclusion`)
- `backend/cabala_py/soul_analytics.py` (`interpretar_individual`)
- `backend/api/bioemotional/services/tree_of_life_adapter.py` (lectura orientativa)
- `backend/api/utils/tarot_service.py` (análisis clínico + IA)

Vacíos detectados (campos sin productor legacy)
- ejes (no hay agrupación explícita por eje)
- polaridades (yin/yang no definido)
- fuentes (no hay trazabilidad por campo estructural)

Riesgos si se implementa FASE 2 sin este mapeo
- Mezcla de estructura con narrativa clínica/interpretativa (rompe contrato).
- Duplicidad y conflicto de mapeos (SENDEROS vs SIGN_TO_PATHS vs ARCANA_MAP vs TREE_PATHS).
- Inconsistencia de IDs de sefirot (`chokmah` vs `chokhmah`, `tiferet` vs `tiferet`/`tiferet` en diferentes módulos).
- Estado incompleto sin ejes/polaridades/fuentes, generando interpretaciones implícitas en UI.
