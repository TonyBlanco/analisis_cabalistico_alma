# B1 — Inventario de Dashboards Simbólicos

**Fecha:** 2026-06-09 · **main:** `7e68d1ae`

---

## Estado por ítem del Plan Maestro

| Item | Estado | Componente(s) | Notas |
|------|--------|---------------|-------|
| **B2** Dashboard del Árbol | ✅ Operativo | `Tree/TreeOfLifeSVG.tsx` · `Tree/TreeWithFlows.tsx` · `CabalAppliedWorkspace/FormativeReadingPanel.tsx` | 10 sefirot + flujos direccionales + polaridades (harmonic/integrative/tensional). Pilares/tríadas: renderizados via `TreeOfLifeSVG`. Posiciones desde `SEFIROT_TOPOLOGY`. |
| **B3** Panel Correspondencias | ✅ Operativo | `CorrespondencesPanel` · `CorrespondencesWorkspace` | Toggle **hermetic-golden-dawn ↔ jewish-traditional**. Wired en `CabalAppliedToolsPanel` y ruta standalone `/dashboard/therapist/correspondencias`. |
| **B4** Panel Interpretación | ✅ Operativo | `SymbolicInterpretationPanel` · `ConsentModal` · `symbolic-interpreter-api.ts` | Consentimiento SWM v3 formal (`SwmV3ConsentState`: mode/version/acceptedAt). Badge trazable en panel. Commit `7e68d1ae`. |
| **B5** DASHBOARD-PROFESIONAL-NUEVO.tsx | ✅ Eliminado | — | Commit `12307d1d`. |
| **B6** UX (loading/error/empty/a11y) | ✅ Operativo | `CabalAppliedWorkspace/*` · `CorrespondencesPanel` · `SymbolicInterpretationPanel` | Estados loading/error/empty en árbol, historial, síntesis y paneles. Copy ES unificado. A11y básica: `nav`/`tablist`, `aria-current`/`aria-selected`/`aria-pressed`, `aria-live`/`role="alert"`, reintentos en errores. Sin i18n framework (textos hardcoded ES). |
| **B7** Metrics Dashboard (terapeuta) | ✅ Operativo | `components/dashboard/MetricsDashboard.tsx` · `hooks/useTherapistMetrics.ts` | Datos reales desde backend Django. Commit `191a6a4e`. |

---

## Rutas activas del área simbólica

| Ruta | Componente principal | Estado |
|------|----------------------|--------|
| `/dashboard/therapist/(swm)/cabala-aplicada` | `CabalAppliedWorkspace` | ✅ Árbol + Correspondencias + Interpretación + Síntesis |
| `/dashboard/therapist/(swm)/correspondencias` | `CorrespondencesWorkspace` | ✅ B3 standalone — tablas Hermético / Judío |
| `/dashboard/therapist/(core)/cabala` | `therapist/KabbalahPanel` | ⚠️ Revisar — usa API v1 BFF pero no expone toggle de sistema |
| `/dashboard/therapist/(core)/page` | `MetricsDashboard` | ✅ B7 |
| `/dev/symbolic-overlay` | Dev overlay | 🔧 Solo dev |

---

## Gaps pendientes (DoD-B)

### DoD-B — Confirmación en prod
Bloque B (B2–B7) cerrado en `main`. Pendiente smoke/visual en prod para B6 (otro agente).

### B6 — Resuelto (auditoría básica)
- A11y: landmarks, tabs, estados vivos, botones con `aria-pressed`/`aria-busy`, reintentos
- i18n: copy ES en componentes del workspace (sin framework de traducciones)
- Empty state en árbol, historial, síntesis, correspondencias e interpretación

---

## Componentes simbólicos existentes (no en el plan original, ya construidos)

| Componente | Función |
|-----------|---------|
| `AISymbolicWorkspace/` | Workspace AI completo con Hypotheses, Observations, SymbolicLinks, Disclaimers |
| `SymbolicOverlayViewer/` | Overlay multicapa (tarot + astrología + árbol) con provenencia |
| `SymbolicCrossWorkspace/` | Cruz simbólica con patrones, dominancias y alineación temporal |
| `SymbolicTimeline/` | Timeline simbólico por paciente |
| `PatientSymbolicOverview/` | Vista resumen simbólica del paciente |
| `TherapistClinicalDashboard/` | Dashboard clínico con CenterVisual + ContextNav + RightPanel |

---

## Conclusión

- **B2–B7**: ✅ completos en `main` (último hito B4: `7e68d1ae`).
- **DoD-B**: pendiente confirmación B6 en prod (`studios33.app`).
- **docs/02_CORE_WORKSPACES**: inventario B1 (este doc).
