# B.O.T.A. Tarot — Tableau-based Baseline Acceptance Checklist

Baseline objetivo: **B.O.T.A. Tarot — Tableau-based (observacional, sin IA, sin mocks)**.

Este checklist valida que el sistema está **cerrado, auditable y consistente** sin tocar contratos SWM v3 ni introducir lógica nueva.

## Alcance del sistema

**Qué ES**
- Motor simbólico **estructural** basado en el **Tableau B.O.T.A.** (datos canónicos del dataset).
- Observacional/educativo: muestra correspondencias y estructura (consciencia, letra, sendero, sefirot, inteligencia).
- Visualización simbólica por carta usando **activos PNG** (Árbol/Sefirot) como referencia estructural.

**Qué NO ES**
- No es IA, no genera narrativa, no prescribe, no diagnostica.
- No añade campos nuevos al contrato SWM v3.
- No depende de “keywords” como salida primaria en B.O.T.A.

## Source of truth (archivos a verificar)

**Backend**
- `backend/symbolic/tarot/bota_observation.py`
- `backend/symbolic/tarot/data/bota/bota_tableau_complete.json`

**Frontend**
- `tonyblanco-app/components/tarot/SymbolicReadingPanel.tsx`
- `tonyblanco-app/components/tarot/TarotDrawPanel.tsx`
- `src/symbolic/tarot/bota/botaIdentityResolver.ts`
- `src/symbolic/tarot/bota/positionInterpreter.ts`
- `src/symbolic/tarot/bota/synthesisBuilder.ts`
- `src/symbolic/tarot/bota/botaVisualMapper.ts`

**Assets**
- `tonyblanco-app/public/tarot/0-el-loco.png`
- `tonyblanco-app/public/tarot/1-el-mago.png`
- `tonyblanco-app/public/tarot/2-la-suma-sacerdotisa.png`
- …
- `tonyblanco-app/public/tarot/21-el-mundo.png`

## 1) Arquitectura (aislamiento)

- [ ] B.O.T.A. se activa solo cuando `system`/`systemLabel` corresponde a B.O.T.A. (sin afectar otros sistemas).
- [ ] No hay dependencia funcional de IA en el flujo B.O.T.A. (sin llamadas a LLM/servicios externos para producir los campos B.O.T.A.).
- [ ] No se reutilizan “significados Thoth” ni motor genérico para rellenar campos B.O.T.A.
- [ ] No se introducen campos nuevos al contrato SWM v3 (solo consumo/render de datos existentes).

## 2) Dataset (integridad)

- [ ] `bota_tableau_complete.json` contiene **22 Arcanos Mayores** en `majorArcana`.
- [ ] Para cada carta existen los campos:
  - [ ] `consciousness.power`
  - [ ] `consciousness.aspect`
  - [ ] `consciousness.humanFaculty`
  - [ ] `kabbalistic.hebrewLetter`
  - [ ] `kabbalistic.path`
  - [ ] `kabbalistic.sefirot`
  - [ ] `kabbalistic.intelligence`
- [ ] Dataset no se modifica durante este proceso de release (solo lectura/verificación).

## 3) UI (sin placeholders legacy)

Validación manual en `/dashboard/therapist/tarot` con **Sistema = B.O.T.A. Tarot**:

- [ ] No aparece el placeholder `Campo simbólico no disponible para esta carta.` en la experiencia B.O.T.A.
- [ ] Los 4 bloques muestran datos reales del Tableau:
  - [ ] **Estructura B.O.T.A.** (consciencia: power/aspect/humanFaculty).
  - [ ] **Texto principal** (hebrewLetter/path/sefirot/intelligence).
  - [ ] **Contexto aplicado** (texto del intérprete por posición).
  - [ ] **Significado de la posición** (definición + enfoque/alcance desde ontología).
- [ ] “Keywords” no aportan contenido visible relevante en B.O.T.A. (se mantiene oculto/neutral).

## 4) Visualización simbólica (activos PNG)

- [ ] Existen 22 PNG (0–21) en `tonyblanco-app/public/tarot/`.
- [ ] El bloque **Estructura B.O.T.A.** muestra la imagen correspondiente a la carta seleccionada.
- [ ] El bloque muestra “Sefirot activas” coherente con el Tableau (sin inventar campos).

## 5) Tests & Build

- [ ] `npm run build` en `tonyblanco-app` pasa.
- [ ] `python backend/manage.py test tests.test_bota_observation symbolic.tarot.tests_bota_loader` pasa.
- [ ] No hay warnings críticos que afecten el funcionamiento B.O.T.A. (warnings generales del proyecto se registran como “conocidos”).

## Firma conceptual de cierre

Fecha de validación: ____________

Validado por: ____________

Hash validado (tag target): `bota-tableau-baseline` → ____________

