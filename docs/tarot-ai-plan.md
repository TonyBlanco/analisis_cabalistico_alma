# Plan técnico: Integración de interpretaciones holísticas con IA

**Objetivo**
- Integrar interpretaciones holísticas generadas por IA para `tarot` sin modificar la lógica clínica existente; agregar contrato API, esquema de datos, wireframes y checklist de despliegue.

**Alcance**
- Solo documentación y especificación: no se modifica código fuente en este paso.
- Entregables: esquema de datos propuesto, contrato API, spreads soportados, UI/UX mínimo, tests y checklist.

**Esquema de datos propuesto (no clínico)**
- Cada arcano debe ampliar su mapping con campos AI no-clínicos:

```ts
interface TarotArcanaAI {
  id: string; // ej. "the_fool"
  number: number;
  name: string;
  letterId?: string;
  gematria?: number;
  sefirot?: [string, string];
  keywords?: string[]; // etiquetas temáticas
  psychologicalThemes?: string[]; // temas holísticos
  aiInterpretation?: string; // texto breve por defecto
  reversedInterpretation?: string; // texto si sale invertida
  examplePrompts?: string[]; // prompts usados para generar interpretaciones
  sources?: string[];
}
```

**Contrato API (propuesta)**
- `POST /api/ai/tarot/interpretCard`
  - Request: `{ "arcanaId": "the_fool", "position": "center", "reversed": false, "context": {"question":"..."}, "options": {"temperature":0.7} }`
  - Response: `{ "text": "Interpretación holística...", "themes": ["renacimiento","curiosidad"], "confidence": 0.72, "explanationTrace": [{"prompt":"...","modelResponse":"..."}] }`

- `POST /api/ai/tarot/interpretSpread`
  - Request: `{ "spreadType":"three_card","cards":[{"arcanaId":"the_fool","reversed":false,"position":"past"}, ...], "context": {...}, "options": {...} }`
  - Response: `{ "cardInterpretations": [{"arcanaId":"the_fool","text":"...","themes":[...]}], "summary":"...", "recommendations":["..."], "confidence":0.84 }`

- `GET /api/ai/tarot/schema` — devuelve el esquema y metadatos de decks disponibles.

Notas API:
- Incluir `seed` opcional para reproducibilidad.
- Limitar tokens y exponer `temperature` para control de creatividad.
- Todas las respuestas deben incluir `explanationTrace` opcional para auditoría.

**Spreads soportados (mínimo)**
- `three_card` (pasado/presente/futuro)
- `single_card` (consulta puntual)
- `celtic_cross` (versión resumida para holístico)
- Cada spread define posiciones y una breve descripción; el servidor debe aceptar la posición como parámetro al interpretar.

**Reglas de reverso (invertidas)**
- Estándar: campo `reversed` booleano en cada carta.
- Interpretación debe preferir `reversedInterpretation` si existe; si no, aplicar regla heurística (ej. matizar la interpretación normal con bloqueo/retardo).

**UI / UX (wireframes textuales)**
- Pantalla principal `TarotReading`:
  - Panel izquierdo: selector de `Deck` y `Spread`.
  - Panel central: cartas (interactivas) con botón `Interpretación AI`.
  - Panel derecho: interpretación AI (resumen + botón "Ver detalle").
  - Banner de consentimiento: checkbox `Acepto interpretaciones holísticas generadas por IA` con enlace a políticas.

- Modal de detalle:
  - Texto completo de la interpretación.
  - Botón `Mostrar trazabilidad` para ver `explanationTrace`.
  - Opciones: `Guardar lectura` (si acepta), `Anonymize and save`, `No guardar`.

**Pruebas y validación**
- Tests unitarios:
  - Validar mapeos `arcanaId` → datos AI ampliados.
  - `drawSpread` determinista con `seed`.
  - `interpretCard` devuelve estructura esperada.
- Revisión humana (UX): panel de revisión con 15–30 lecturas para ajustar prompts y temperatura.

**Fixtures de ejemplo**
- `fixtures/three_card_example.json` con 3 cartas y respuestas esperadas (para tests).

**Privacidad, consentimiento y ética**
- Mostrar disclaimer claro: interpretaciones holísticas no reemplazan servicios profesionales.
- Opciones de almacenamiento: `no_store`, `store_anonymized`, `store_with_consent`.
- Si `themes` o `riskFlags` indican riesgo (ej. "ideación"), UI debe mostrar recomendación de derivación y recursos.

**Checklist de despliegue**
- Configurar claves y límites de uso del proveedor IA en `env`.
- Añadir feature flag `AI_TAROT_ENABLED`.
- Tests automáticos y revisión humana aprobada.
- Monitorización: tasa de errores, latencia, y métricas de uso.

**Riesgos y mitigaciones**
- Interpretaciones erróneas o sesgadas → mitigación: revisión humana, control de temperatura, logging de prompts.
- Expectativas terapéuticas → mitigación: disclaimers y redirección a profesionales.

**Anexos / próximos pasos recomendados**
1. Crear un `deck` de ejemplo con campos AI para 3–5 arcanos y añadir fixtures (para pruebas).
2. Implementar endpoints mock en backend y un componente UI que consuma el mock.
3. Lanzar pruebas de usuario con revisores para ajustar prompts.

---
Documento generado como especificación para la integración AI-holística del módulo `tarot`.

**Fases de implementación (para un agente)**

Phase 0 — Preparación (1–2 días)
- Tareas: validar alcance con stakeholders; asegurar accesos y claves IA; crear repositorio/branch `feature/tarot-ai`.
- Criterios de aceptación: alcance aprobado, claves en `env` de staging, feature flag definido (`AI_TAROT_ENABLED`).
- Entregables: ticket de proyecto, branch creado, keys configuradas en entorno de staging.

Phase 1 — Datos y esquema (2–3 días)
- Tareas: extender un `deck` de ejemplo (p. ej. `SEPHIROTH`) con campos AI no-clínicos; crear fixtures JSON; añadir typescript types/TS interfaces.
- Criterios de aceptación: `src/symbolic/tarot/decks/example-ai.ts` con 5 arcanos ampliados; tests que validan esquema contra types.
- Entregables: archivo de deck ejemplo y fixtures en `tests/fixtures`.

Phase 2 — API core y mocks (3–4 días)
- Tareas: implementar endpoints mock (`/api/ai/tarot/interpretCard`, `/interpretSpread`, `/schema`); implementar util `drawSpread(seed?)` en server-side; tests unitarios.
- Criterios de aceptación: endpoints consumibles con respuestas deterministas usando `seed`; cobertura básica de tests (unit).
- Entregables: endpoints mock y tests en `backend/tests`.

Phase 3 — UI mínimo y consentimiento (3–5 días)
- Tareas: componente `TarotReading` con selector `Deck`/`Spread`, visor de cartas, panel AI; banner consentimiento y modal de detalle con opciones de guardado.
- Criterios de aceptación: flujo completo en staging (tirar cartas → interpretar → ver trazabilidad); consentimiento requerido antes de interpretar.
- Entregables: componentes en `src/components/TarotReading`, estilos y storybook / snapshots.

Phase 4 — Integración con proveedor IA y trazabilidad (2–4 días)
- Tareas: sustituir mocks por llamadas al proveedor IA (con límite de tokens y `temperature` configurable); añadir `explanationTrace` logging; manejo de `seed` y reproducibilidad.
- Criterios de aceptación: interpretaciones reales en staging con trazabilidad guardada en logs; rate-limits y retries implementados.
- Entregables: integración con provider, pruebas end-to-end en staging.

Phase 5 — Validación y revisión humana (3–7 días)
- Tareas: preparar conjunto de revisiones humanas (15–30 lecturas); iterar prompts y parámetros hasta aceptación UX; ajustar `riskFlags` mapping.
- Criterios de aceptación: aprobación de revisores para tono y seguridad; listas de prompts definitivas.
- Entregables: informe de revisión, prompts finales, PR listo para staging → review.

Phase 6 — Staging → Producción y monitoreo (2–4 días)
- Tareas: desplegar a staging con feature flag; pruebas de carga pequeñas; añadir monitorización (errores, latencia, uso tokens); preparar rollback plan.
- Criterios de aceptación: estabilidad en staging, alertas configuradas, documento de operación y runbook.
- Entregables: despliegue en producción, runbook, checklist completado.

Notas para el agente
- Ejecutar fases en orden; cada PR debe ser pequeño y acompañado de tests y fixtures.
- Mantener privacidad por defecto (`no_store`) hasta que usuario acepte guardado.
- Dejar puntos de configuración en `env` para `AI_PROVIDER`, `AI_API_KEY`, `AI_TEMPERATURE`, `AI_TOKEN_LIMIT`.

**Conformidad y referencias (documentos leídos)**

Antes de implementar, el agente debe revisar y cumplir las políticas y contratos del repositorio. He leído los documentos principales en `docs/` y destaco las restricciones y requisitos relevantes que deben aplicarse a esta integración:

- `AI_SYMBOLIC_CONTRACT.md`: la forma canónica es *no-clínica* y los tipos/contratos deben usarse para la entrada/salida. No diagnosis ni interpretación clínica.
- `ARCHITECTURE_SYMBOLIC_SYSTEM.md`: la capa de interpretación IA es una capa futura separada; requiere opt-in, disclaimers, y 5-layer safety validation. Mantener `src/symbolic/` como fuente de verdad.
- `DOCUMENTATION_GOVERNANCE.md`: cualquier agente que cree documentos debe colocar archivos en `/docs` y registrar su creación en `PROJECT_STATE_CURRENT.md` (o carpeta `01_PROJECT_STATE`).
- `ASTROLOGIA_PROFESIONAL.md` y archivos de Astrología: la terminología correcta es `consultante` y `lectura simbólica` (prohibido usar `paciente` o `diagnóstico`). Las operaciones reales (cálculos) deben ser disparadas por acción explícita y deben mantenerse aisladas.
- `ASTRO_ENGINE_*` y `ASTRO_RESEARCH_LAB_SCOPE.md`: separación clara entre entornos reales, sandbox y research; no usar datos reales en modos research/sandbox; fail-fast si falta dependencia crítica.

Implicaciones concretas para la integración `tarot-ai`:

- Mantener las interpretaciones dentro del marco no-clínico: usar lenguaje holístico y evitar términos diagnósticos. Usar `consultante` y `lectura simbólica` en UI y docs.
- Implementar opt-in obligatorio y banner de consentimiento (UI) antes de permitir interpretaciones IA; por defecto `AI_TAROT_ENABLED=false`.
- Integrar la misma validación de seguridad y filtrado de salida (por ejemplo: 5-layer validation) descrita en `ARCHITECTURE_SYMBOLIC_SYSTEM.md`.
- Registrar cualquier nuevo documento creado por el agente en `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md` como exige `DOCUMENTATION_GOVERNANCE.md`.
- Mantener los datos simbólicos en `src/symbolic/` y no importar componentes clínicos desde `tonyblanco-app/components/TherapistClinicalDashboard`.
- Las pruebas y fixtures deben indicar claramente si usan datos simulados (`research`/`sandbox`) o datos reales; seguir las reglas de `ASTRO_SANDBOX_LIMITS.md` y `ASTRO_STUDY_LAB_SCOPE.md`.

**Requisito operativo para agentes que implementen código**

- Leer `DOCUMENTATION_GOVERNANCE.md` y elegir la carpeta `/docs` u otra canónica para nuevos documentos.
- Registrar la creación en `01_PROJECT_STATE/`.
- Antes de crear endpoints que procesen datos de consultantes reales: validar `env` y feature flag y asegurar que el backend tenga las dependencias necesarias (provider IA, límites de tokens) y que exista un runbook.

**SWM v3 (formalización)**

Este plan se alinea con la aprobación documental de SWM v3 (Interpretación simbólica educativa asistida por IA). El documento rector es `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md` y la auditoría añade un addendum aprobado (`docs/00_SOURCE_OF_TRUTH/AUDITORIA CABALA APP 12182025.md`).

Requisitos adicionales antes de cualquier desarrollo:
- Registrar la intención en `01_PROJECT_STATE/PROJECT_STATE_CURRENT.md`.
- Mantener `AI_TAROT_ENABLED=false` por defecto en entornos no consentidos.
- No crear endpoints ni tocar código sin aprobación explícita según la auditoría.


