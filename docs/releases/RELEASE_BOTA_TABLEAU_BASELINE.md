# Release — B.O.T.A. Tarot (Tableau-based) Baseline

Nombre: **bota-tableau-baseline**

Estado: **Baseline estable (observacional, sin IA, sin mocks)**

## Resumen

Este release consolida el sistema B.O.T.A. Tarot como motor simbólico observacional basado en el Tableau oficial, sin interpretación diagnóstica, sin IA y sin alteración del contrato SWM v3.

## Qué problema resuelve

- Estabiliza una base auditable para B.O.T.A. Tarot basada en el Tableau (datos estructurales por carta).
- Asegura que la UI muestra campos del Tableau y evita placeholders legacy en el flujo B.O.T.A.
- Provee visualización simbólica estructural por carta mediante imágenes PNG (Árbol/Sefirot) en el workspace Tarot.

## Qué NO incluye (explícito)

- No incluye IA (LLM calls) ni generación de narrativa.
- No incluye diagnóstico, recomendación o prescripción.
- No modifica el contrato SWM v3 ni añade campos.
- No modifica datasets en este proceso de release.
- No introduce nuevos sistemas de tarot ni cambios en otros sistemas existentes.

## Componentes incluidos (alto nivel)

- Backend (B.O.T.A. estructural / observación): `backend/symbolic/tarot/bota_observation.py`
- Dataset Tableau: `backend/symbolic/tarot/data/bota/bota_tableau_complete.json`
- Frontend (render B.O.T.A. + mappers): `tonyblanco-app/components/tarot/SymbolicReadingPanel.tsx`, `src/symbolic/tarot/bota/*`
- Assets visuales: `tonyblanco-app/public/tarot/0-el-loco.png` … `tonyblanco-app/public/tarot/21-el-mundo.png`

## Compatibilidad

- Compatible con el contrato SWM v3 existente (sin cambios de shape).
- No afecta el comportamiento de otros sistemas de tarot (aislamiento por `system`/selector).

## Verificación

- `npm run build` (Next.js) OK.
- `python backend/manage.py test tests.test_bota_observation symbolic.tarot.tests_bota_loader` OK.

