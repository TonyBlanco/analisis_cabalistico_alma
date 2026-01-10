# 00 - SOURCE OF TRUTH

**Propósito:**
Documento maestro que consolida hallazgos, artefactos y decisiones propuestas resultantes de la auditoría y reconciliación entre repositorio, runtime y documentación. Sirve como la fuente oficial para la gobernanza antes de cualquier movimiento administrativo.

**Alcance:**
Incluye el inventario final de contradicciones, dumps runtime, estado del paquete `@holistica/symbolic`, decisiones pendientes y la lista de artefactos que soportan las decisiones.

---

## Resumen ejecutivo
- Causa técnica principal detectada: conflictos de resolución de módulos por `tsconfig` path mappings y comportamiento de Turbopack; mitigado temporalmente forzando Webpack y ajustando `package.json` de `@holistica/symbolic`.
- Estado del build: Con Turbopack → fallos por alias/resolución; Con Webpack → empacado OK pero queda un error TypeScript que impide compilación final (tipo en página `app`).
- Hallazgos de gobernanza: la documentación de algunos subsistemas (p.ej. "Symbolic Interpreter AI") contradice la realidad del runtime; se requiere decisión sobre mantener, reconstruir o archivar.

---

## Artefactos generados (ubicación: `docs/00_SOURCE_OF_TRUTH/`)
- `symbolic_contradictions_matrix.csv` — matriz inicial de contradicciones detectadas.
- `symbolic_contradictions_governance.md` — propuestas de gobernanza por contradicción.
- `symbolic_contradictions_jira.csv` — CSV para importar en Jira con issues propuestos.
- `legacy_tests_runtime_report_2026-01-10.md` — reporte de pruebas activas en runtime y exclusiones.
- `runtime_testmodule_dump.csv` — volcado de `TestModule` del runtime (flags y conteos).
- `runtime_analysis_kinds.csv` — conteo por tipo de análisis en runtime.
- `repo_modules_inventory.md` — inventario de módulos en repo relevantes para la auditoría.
- `final_contradictions_matrix.csv` — matriz final después de reconciliación.
- `final_system_classification.md` — clasificación final (KEEP / REBUILD / REMOVE) con recomendaciones.

---

## Checklist de decisiones (para gobernanza)
1. Acordar destino de cada ítem clasificado: **KEEP**, **REBUILD**, **REMOVE**.
2. Decidir política de empaquetado para `@holistica/symbolic` (subpath exports vs single entry) y autorizar cambios de producción.
3. Determinar el futuro de la "Symbolic Interpreter AI": Implementar (endpoint + infra) o Deprecate (archivar docs y código asociado).
4. Aprobar el movimiento administrativo de documentos obsoletos a `docs/backLegacy/` y la plantilla de cabecera de trazabilidad que se aplicará a cada documento movido.

> Nota: `docs/backLegacy/` es una ubicación histórica para archivos archivados; su contenido sirve como evidencia histórica y **no es vinculante** para políticas u operaciones activas.

---

## Propuesta de pasos tras aprobación (acción administrativa a ejecutar solo tras aprobación explícita)
1. Mover los documentos aprobados desde su ubicación actual a `docs/backLegacy/...`.
2. Añadir en cada documento movido una cabecera de trazabilidad (ver ejemplo abajo).
3. Actualizar `docs/DOCUMENT_INDEX.md` con las nuevas rutas finales.
4. Registrar la decisión de gobernanza en el issue correspondiente (usar `symbolic_contradictions_jira.csv` para bulk import si aplica).

**Ejemplo de cabecera de trazabilidad (añadir al inicio del documento movido):**

---
Traceability: Moved to `docs/backLegacy/<original-path>` by <GOV_USER> on <YYYY-MM-DD>
Governance-Decision: <KEEP|REBUILD|REMOVE>
Issue-Ref: <JIRA-ID or PR#>
---

> ⚠️ Nota: **No mover archivos todavía.** Estos pasos solo se ejecutarán después de la aprobación formal de gobernanza.

---

## Flujo oficial de trabajo con agentes (VINCULANTE)

Se establece el flujo oficial y obligatorio para interacciones con agentes (AGENT_WORKFLOW). El protocolo de continuidad de chat `docs/CHAT_CONTINUITY_PROTOCOL.md` es **VINCULANTE** y debe aplicarse en todas las sesiones formales que involucren agentes, auditoría o acciones que requieran trazabilidad.

- Consultar `docs/CHAT_CONTINUITY_PROTOCOL.md` para el ritual de cierre, ritual de apertura y la frase clave que asegura continuidad del contexto entre sesiones.
- Cualquier excepción debe estar aprobada por el comité de gobernanza y documentada en un issue referenciado.


## Siguientes pasos propuestos
- Revisión y aprobación por el comité de gobernanza de los puntos listados en la Checklist (1–4).
- Si se aprueba: ejecutar el movimiento administrativo, añadir cabeceras de trazabilidad y actualizar `docs/DOCUMENT_INDEX.md`.
- Paralelamente, planificar los cambios técnicos (p.ej. corrección TypeScript y política de empaquetado) y asignar tickets para ejecución por el equipo de ingeniería.

---

**Contacto:** Para cualquier aclaración sobre datos o artefactos, revisar `docs/00_SOURCE_OF_TRUTH/repo_modules_inventory.md` y el `legacy_tests_runtime_report_2026-01-10.md` para evidencia runtime.
