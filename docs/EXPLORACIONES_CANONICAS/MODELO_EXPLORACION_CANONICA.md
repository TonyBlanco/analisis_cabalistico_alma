# Modelo Base de una Exploración Canónica

Este documento define el MODELO BASE que deben seguir todas las Exploraciones Canónicas.

Estructura general (orden obligatorio)
1. Identificación
   - Título (no-clínico)
   - ID interno (puede mantener referencia legacy)
   - Versión estructural
2. Metadatos
   - Autoría documental
   - Fecha, contexto de uso
3. Propósito simbólico y Alcance
   - Enunciado breve y límites de uso
4. Inputs
   - Tipo: respuestas en lenguaje experiencial, selecciones guiadas, metadatos de contexto
5. Procesamiento (documental)
   - Nota: el procesamiento técnico permanece en backend; la exploración documenta cómo se interpretan esos resultados simbólicamente
6. Outputs
   - Sección A: Visible al usuario (resumen simbólico)
   - Sección B: Exclusivo terapeuta (lectura ampliada, recomendaciones simbólicas)
7. Limitaciones y avisos
8. Versionado y trazabilidad

Fases de una exploración
- Fase 1: Captura (inputs y consentimiento)
- Fase 2: Cálculo técnico (DB/Modelos — NO cambiar)
- Fase 3: Traducción simbólica (plantilla de interpretación)
- Fase 4: Presentación (usuario y terapeuta)

Inputs
- Respuestas directas del usuario y metadatos contextuales. Nunca introducir nuevos campos en DB; cualquier campo adicional debe ser gestionado a través de metadatos de presentación.

Outputs
- Visible al usuario: resumen neutral (p. ej. inclinaciones porsefirá, indicadores simbólicos, material educativo breve).
- Exclusivo terapeuta: lectura interpretativa completa, historial, sugerencias simbólicas y herramientas de exportación con metadatos.

Dónde encaja `AnalysisRecord`
- `AnalysisRecord` permanece como registro técnico del cálculo y la versión del algoritmo. Las exploraciones referencian el `AnalysisRecord` por ID y versión para garantizar trazabilidad, pero no lo modifican.

Dónde encaja la IA (conceptualmente)
- La IA se utiliza solo como asistente para el terapeuta en la generación de lecturas interpretativas y sugerencias simbólicas. Su uso debe estar registrado y sujeto a revisión humana. La IA no produce diagnósticos ni aparece en la interfaz de usuario.

Reglas de gobernanza (resumen)
- Cualquier modificación estructural a este modelo requiere aprobación documental y registro en `docs/00_SOURCE_OF_TRUTH.md`.
- Prohibido usar lenguaje clínico en títulos visibles.
