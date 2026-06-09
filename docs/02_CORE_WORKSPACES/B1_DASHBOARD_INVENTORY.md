# B1 — Inventario de Dashboards Simbólicos

**Fecha:** 2026-06-09 · **main:** `48d6f802`

---

## Estado por ítem del Plan Maestro

| Item | Estado | Componente(s) | Notas |
|------|--------|---------------|-------|
| **B2** Dashboard del Árbol | ✅ Operativo | `Tree/TreeOfLifeSVG.tsx` · `Tree/TreeWithFlows.tsx` · `CabalAppliedWorkspace/FormativeReadingPanel.tsx` | 10 sefirot + flujos direccionales + polaridades (harmonic/integrative/tensional). Pilares/tríadas: renderizados via `TreeOfLifeSVG`. Posiciones desde `SEFIROT_TOPOLOGY`. |
| **B3** Panel Correspondencias | ✅ Operativo (wired) | `SymbolicCorrespondences/CorrespondencesPanel.tsx` | Toggle **hermetic-golden-dawn ↔ jewish-traditional** implementado. Da'at: renderizado condicionalmente. Wired en `CabalAppliedToolsPanel`. **Gap:** no expuesto en ruta standalone `/dashboard/therapist/.../correspondencias`. |
| **B4** Panel Interpretación | ✅ Operativo (wired) | `SymbolicInterpretation/SymbolicInterpretationPanel.tsx` | Disclaimer prominente siempre visible. Opt-in explícito. Lenguaje educativo. Wired en `CabalAppliedToolsPanel`. **Gap:** sin estado de consentimiento SWM v3 formal (solo disclaimer estático). |
| **B5** DASHBOARD-PROFESIONAL-NUEVO.tsx | ✅ Eliminado | — | Commit `12307d1d`. |
| **B6** UX (loading/error/empty/a11y) | ✅ Operativo | `CabalAppliedWorkspace/*` · `CorrespondencesPanel` · `SymbolicInterpretationPanel` | Estados loading/error/empty en árbol, historial, síntesis y paneles. Copy ES unificado. A11y básica: `nav`/`tablist`, `aria-current`/`aria-selected`/`aria-pressed`, `aria-live`/`role="alert"`, reintentos en errores. Sin i18n framework (textos hardcoded ES). |
| **B7** Metrics Dashboard (terapeuta) | ✅ Operativo | `components/dashboard/MetricsDashboard.tsx` · `hooks/useTherapistMetrics.ts` | Datos reales desde backend Django. Commit `191a6a4e`. |

---

## Rutas activas del área simbólica

| Ruta | Componente principal | Estado |
|------|----------------------|--------|
| `/dashboard/therapist/(swm)/cabala-aplicada` | `CabalAppliedWorkspace` | ✅ Árbol + Correspondencias + Interpretación + Síntesis |
| `/dashboard/therapist/(core)/cabala` | `therapist/KabbalahPanel` | ⚠️ Revisar — usa API v1 BFF pero no expone toggle de sistema |
| `/dashboard/therapist/(core)/page` | `MetricsDashboard` | ✅ B7 |
| `/dev/symbolic-overlay` | Dev overlay | 🔧 Solo dev |

---

## Gaps pendientes (B3/B4/B6)

### B3 — Gap: ruta standalone de correspondencias
`CorrespondencesPanel` existe y funciona, pero solo es accesible dentro del workspace `cabala-aplicada`. No hay ruta `/dashboard/therapist/correspondencias` independiente. Valorar si se necesita o con el workspace es suficiente.

### B4 — Gap: consentimiento SWM v3 formal
El panel tiene disclaimer estático permanente pero no implementa el flujo de consentimiento SWM v3 (registro de aceptación, trazabilidad). Requerido antes de DoD.

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

- **B2, B3, B4, B5, B7**: implementados. B3 y B4 wired dentro de `cabala-aplicada`.
- **Bloqueante real para DoD-B**: gap SWM v3 consentimiento formal (B4). B6 a11y básica cerrado.
- **docs/02_CORE_WORKSPACES**: directorio creado en este commit (B1).
