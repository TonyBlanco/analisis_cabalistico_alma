<!--
  AUDITORIA_INTEGRACION_IA_MCMI4.md
  Estado: AUDITORÍA TÉCNICA / PENDIENTE APROBACIÓN
  Fecha: 2026-01-23
  Propósito: Evaluar dónde, cómo y si procede integrar IA en el MCMI-4 Místico.
-->

# AUDITORÍA DE INTEGRACIÓN DE IA — MCMI-4 MÍSTICO

**ESTADO:** AUDITORÍA TÉCNICA / PENDIENTE APROBACIÓN  
**FECHA:** 2026-01-23  
**AUDITOR:** Agente ARQ_AI_INJECTION_AUDITOR

Este documento presenta una auditoría exhaustiva de los puntos del sistema MCMI-4 Místico donde la IA podría aportar valor SIN violar el contrato funcional, scoring ni naturaleza simbólica del sistema.

---

## EXECUTIVE SUMMARY

**DECISIÓN PRELIMINAR:** ✅ APROBACIÓN CONDICIONAL  
**PUNTOS APROBADOS PARA IA:** 4 (Workspace 4 fases)  
**PUNTOS RECHAZADOS:** 6 (todo lo relacionado con scoring, selección, SIGNAL)  
**RIESGOS IDENTIFICADOS:** 5 (contaminación clínica, bypass de terapeuta, sesgo diagnóstico)  
**RECOMENDACIÓN:** Implementar IA solo en modo "asistente de reflexión" del Workspace, con controles estrictos.

---

## 1. MAPA COMPLETO DEL MÓDULO MCMI-4 MÍSTICO

### 1.1. SIGNAL (16 ítems)

**Componentes:**
- `backend/swm/mcmi4/services/questionnaire_service.py` — No involucrado (SIGNAL es separado)
- `backend/assignments/select.py` — Carga banco SIGNAL
- `tonyblanco-app/components/AssignMCMI4Modal.tsx` — UI para asignación SIGNAL
- TestResult model — Almacena resultados SIGNAL

**ESTADO:** [INTOCABLE] / [PROHIBIDO]

**JUSTIFICACIÓN:** El SIGNAL es un umbral determinista que habilita la CTA. Introducir IA aquí:
- Rompería el contrato (no automatizar)
- Contaminaría el cribado inicial
- Crearía dependencia de modelos externos en decisión crítica

**DECISIÓN:** ❌ NO IMPLEMENTAR IA

---

### 1.2. Cuestionario 195 (Selección y Ejecución)

**Componentes:**
- `backend/swm/mcmi4/services/questionnaire_service.py`:
  - `load_worlds_data()` — Carga JSONs
  - `select_questions()` — Selección anti-repetición
  - `get_next_question()` — Navegación secuencial
- `backend/data/mcmi4_mystic_questions_*.json` — Pool de preguntas
- `tonyblanco-app/components/swm/QuestionnaireViewer.tsx` — UI del cuestionario

**ESTADO:** [INTOCABLE] / [PROHIBIDO]

**JUSTIFICACIÓN:** El cuestionario es determinista por diseño. Introducir IA aquí podría:
- Sesgar la selección de preguntas
- Alterar el orden canónico de mundos
- Contaminar el pool de 270 ítems
- Romper anti-repetición
- Violar el scoring fijo

**DECISIÓN:** ❌ NO IMPLEMENTAR IA

---

### 1.3. Scoring y Cálculo de Resultados

**Componentes:**
- `backend/swm/mcmi4/services/questionnaire_service.py`:
  - Métodos de cálculo (no visibles en el fragmento leído, pero existen)
- `questionnaire_completion` artifact — Contiene responses raw
- Lógica de mundos dominantes/sombra

**ESTADO:** [INTOCABLE] / [PROHIBIDO]

**JUSTIFICACIÓN:** El scoring es el núcleo matemático del sistema. Introducir IA aquí:
- Violaría el contrato funcional (scoring INALTERABLE)
- Contaminaría resultados simbólicos con inferencias
- Rompería reproducibilidad
- Crearía opacidad en cálculos

**DECISIÓN:** ❌ NO IMPLEMENTAR IA

---

### 1.4. Workspace Terapéutico (4 Fases)

**Componentes:**
- `tonyblanco-app/lib/swm-mcmi4/phase-guides.config.ts` — Define fases y preguntas guía
- `tonyblanco-app/components/SwmMcmi4/PhaseGuidedPanel.tsx` — Panel de fase individual
- `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/swm/mcmi4/[workspace_id]/page.tsx` — Vista principal del workspace
- `backend/swm/mcmi4/views.py` — Endpoints para artifacts de fase

**FASES:**
1. Discovery (Assiah) — Observación
2. Mapping (Yetzirah) — Formación emocional
3. Interpretation (Beriah) — Comprensión intelectual
4. Synthesis (Atzilut) — Unificación

**ESTADO ACTUAL:** Pasivo — preguntas guía estáticas, terapeuta escribe texto libre.

**ESTADO PROPUESTO:** [CANDIDATO IA] ✅

**JUSTIFICACIÓN:** Este es el punto óptimo para IA porque:
- Opera POST-CÁLCULO (scoring ya completado)
- No modifica datos del núcleo (solo lectura de `questionnaire_completion`)
- Asiste al terapeuta, no lo sustituye
- El terapeuta siempre tiene control final
- Naturaleza exploratoria y no diagnóstica

**DECISIÓN:** ✅ APROBAR IA (con restricciones)

---

### 1.5. CTA Post-SIGNAL

**Componentes:**
- `tonyblanco-app/components/AssignMCMI4MysticModal.tsx` — Modal que muestra mundo dominante/sombra del SIGNAL
- Lógica condicional en `TherapistPatientDetailPage`

**ESTADO:** [INTOCABLE] / [PROHIBIDO]

**JUSTIFICACIÓN:** La CTA es un punto de decisión humana. Introducir IA aquí podría:
- Presionar al terapeuta con recomendaciones
- Automatizar la asignación del 195
- Violar el principio de control consciente

**DECISIÓN:** ❌ NO IMPLEMENTAR IA

---

### 1.6. Visualizaciones y Reporting

**Componentes:**
- `tonyblanco-app/components/SwmMcmi4/SymbolicAxesDisplay.tsx` — Visualización de ejes simbólicos
- Futuras herramientas de export/PDF (no implementadas aún)

**ESTADO:** [CANDIDATO IA] ⚠️ (con precaución)

**JUSTIFICACIÓN:** La IA podría generar narrativas simbólicas para informes, pero:
- Debe ser revisada por el terapeuta (no automática)
- Debe incluir disclaimers explícitos
- No debe parecer conclusiva

**DECISIÓN:** ⚠️ APROBAR IA (secundaria, con disclaimers estrictos)

---

## 2. PUNTOS DONDE LA IA PODRÍA APORTAR VALOR (SIN RIESGO)

### 2.1. Asistente de Reflexión en Workspace (APROBADO ✅)

**DESCRIPCIÓN:**  
IA conversacional que acompaña al terapeuta durante las 4 fases del Workspace. La IA:
- Lee mundo dominante, mundo sombra, tensiones simbólicas
- NO ve scores numéricos raw
- Genera preguntas abiertas alineadas con la fase actual
- Refleja lo que el terapeuta escribe (espejo simbólico)
- NO concluye ni recomienda intervenciones

**EJEMPLO DE INTERACCIÓN:**

**FASE: Discovery (Assiah)**  
Terapeuta escribe: "El consultante muestra alta intensidad en Atzilut pero baja en Assiah."  
IA responde: "¿Qué observas en lo cotidiano que refleje esa tensión entre lo espiritual y lo material? ¿Hay comportamientos concretos que se repitan?"

**VALOR:**
- Ayuda al terapeuta a formular preguntas
- Mantiene foco en la fase actual
- No introduce juicios clínicos

**RIESGOS MITIGADOS:**
- La IA no decide Tikkún
- El terapeuta siempre puede ignorar sugerencias
- Interfaz con botón ON/OFF

---

### 2.2. Reformulación Simbólica NO Conclusiva (APROBADO ✅)

**DESCRIPCIÓN:**  
IA que ayuda a reformular notas del terapeuta en lenguaje simbólico más rico, sin alterar el significado.

**EJEMPLO:**

Terapeuta escribe: "Paciente tiene problemas de control."  
IA reformula: "Posible tensión en el eje Gevurah (contención) — explorar si hay rigidez o miedo a soltar."

**VALOR:**
- Enriquece vocabulario simbólico
- Conecta con conceptos cabalísticos
- No diagnostica

**RIESGOS MITIGADOS:**
- Reformulación es sugerencia, no reemplazo
- Terapeuta decide si acepta
- No introduce patología

---

### 2.3. Generación de Preguntas Abiertas Contextuales (APROBADO ✅)

**DESCRIPCIÓN:**  
IA que genera preguntas exploratorias basadas en:
- Fase actual del workspace
- Mundo dominante/sombra
- Tensiones identificadas

**EJEMPLO:**

**FASE: Synthesis (Atzilut)**  
**Contexto:** Mundo dominante = Briah, Mundo sombra = Assiah  
IA genera: "¿Qué narrativa emerge cuando integras la creatividad intelectual (Briah) con la necesidad de acción concreta (Assiah)? ¿Hacia dónde apunta el proceso?"

**VALOR:**
- Acelera el trabajo terapéutico
- Mantiene alineación con el diseño de fases
- No impone conclusiones

**RIESGOS MITIGADOS:**
- Preguntas son sugerencias, no obligatorias
- Terapeuta puede editarlas o ignorarlas
- No incluyen juicios de valor

---

### 2.4. Síntesis Narrativa Post-Workspace (APROBADO ⚠️ con disclaimers)

**DESCRIPCIÓN:**  
IA que genera un resumen narrativo del workspace completo, integrando las 4 fases.

**EJEMPLO:**

"Este proceso exploró la tensión entre Atzilut (mundo dominante) y Assiah (mundo sombra). En Discovery se observaron patrones de alta reflexión y baja acción. En Mapping emergieron emociones de frustración ante lo incompleto. En Interpretation se identificó una narrativa de 'búsqueda sin anclaje'. En Synthesis, el terapeuta propone explorar rituales concretos que den cuerpo a la espiritualidad."

**VALOR:**
- Ayuda al terapeuta a cerrar el proceso
- Útil para compartir con el consultante (con revisión)
- Integra las 4 fases en narrativa coherente

**RIESGOS MITIGADOS:**
- Disclaimer obligatorio: "Generado por asistente simbólico, revisado por terapeuta"
- No usar en documentos legales o clínicos
- Siempre revisión humana antes de compartir

---

## 3. RIESGOS DE CONTAMINACIÓN IDENTIFICADOS

### 3.1. Riesgo: Contaminación Clínica

**DESCRIPCIÓN:** La IA podría usar lenguaje diagnóstico (DSM-5, patología) en lugar de simbólico.

**PROBABILIDAD:** Alta (si no se controla)  
**IMPACTO:** Crítico (viola contrato funcional)

**MITIGACIÓN:**
- Prompt de sistema explícito: "Nunca uses términos diagnósticos. Solo lenguaje simbólico y exploratorio."
- Filtro post-generación que detecte palabras prohibidas (trastorno, patología, diagnóstico, DSM, CIE)
- Revisión humana obligatoria antes de mostrar al consultante

---

### 3.2. Riesgo: Bypass del Terapeuta

**DESCRIPCIÓN:** La IA podría volverse tan "útil" que el terapeuta delegue decisiones críticas.

**PROBABILIDAD:** Media  
**IMPACTO:** Alto (sustituye criterio clínico)

**MITIGACIÓN:**
- UX que enfatiza rol de "asistente", no "experto"
- Botón ON/OFF visible
- Recordatorios periódicos: "El terapeuta toma todas las decisiones finales"
- No generar recomendaciones de intervención

---

### 3.3. Riesgo: Sesgo Diagnóstico Oculto

**DESCRIPCIÓN:** La IA podría sesgar sus respuestas hacia interpretaciones patologizantes por entrenamiento previo en datos clínicos.

**PROBABILIDAD:** Media  
**IMPACTO:** Alto (contamina naturaleza simbólica)

**MITIGACIÓN:**
- Usar modelo de IA entrenado en lenguaje simbólico/filosófico (no solo clínico)
- Prompt de sistema con ejemplos de lenguaje correcto
- Auditoría periódica de outputs generados

---

### 3.4. Riesgo: Reinterpretación de Scores

**DESCRIPCIÓN:** La IA podría inferir scores numéricos y basar sus respuestas en eso, en lugar de conceptos simbólicos.

**PROBABILIDAD:** Baja (si se implementa correctamente)  
**IMPACTO:** Crítico (viola scoring fijo)

**MITIGACIÓN:**
- La IA NO recibe scores numéricos raw
- Solo recibe: mundo dominante (string), mundo sombra (string), tensiones (descriptivas)
- Backend filtra datos antes de enviar a IA

---

### 3.5. Riesgo: Automatización de Tikkún

**DESCRIPCIÓN:** La IA podría generar recomendaciones de "trabajo simbólico" que se perciban como prescriptivas.

**PROBABILIDAD:** Media  
**IMPACTO:** Alto (viola principio de no-automatización)

**MITIGACIÓN:**
- Prohibir explícitamente generación de "deberías" o "recomiendo"
- Usar formulaciones exploratorias: "¿qué sucedería si...?", "¿has considerado...?"
- No generar listas de "pasos a seguir"

---

## 4. ARQUITECTURA TÉCNICA PROPUESTA (SI SE APRUEBA)

### 4.1. Punto de Integración

**COMPONENTE:** `tonyblanco-app/components/SwmMcmi4/PhaseGuidedPanel.tsx`

**CAMBIOS:**
- Añadir botón "Asistente Simbólico" (ON/OFF)
- Añadir panel de chat colapsable
- No modificar flujo existente (el texto libre sigue funcionando igual)

---

### 4.2. Flujo de Datos (Read-Only)

```
1. Terapeuta abre Workspace
2. Frontend lee artifacts: questionnaire_completion, phase artifacts
3. Backend extrae SOLO:
   - mundo_dominante: "atzilut"
   - mundo_sombra: "assiah"
   - tensiones: ["alta espiritualidad, baja acción"]
   - fase_actual: "discovery"
4. Frontend envía a servicio de IA con prompt de sistema
5. IA genera respuesta (pregunta abierta o reflejo)
6. Frontend muestra respuesta en panel
7. Terapeuta decide si usa o ignora la sugerencia
```

**GARANTÍA:** Ningún dato numérico llega a la IA. No hay escritura en artifacts del núcleo.

---

### 4.3. Prompt de Sistema (Ejemplo)

```
Eres un asistente simbólico para terapeutas que trabajan con el MCMI-4 Místico.

REGLAS OBLIGATORIAS:
1. Nunca uses lenguaje diagnóstico (DSM, CIE, trastorno, patología).
2. Solo lenguaje simbólico basado en los Cuatro Mundos: Atzilut (Emanación), Briah (Creación), Yetzirah (Formación), Assiah (Acción).
3. Genera preguntas abiertas, no conclusiones.
4. No recomiendas intervenciones. Solo reflejas y acompañas.
5. Eres humilde: "posiblemente", "quizás", "¿qué percibes?".

CONTEXTO ACTUAL:
- Mundo dominante: {mundo_dominante}
- Mundo sombra: {mundo_sombra}
- Fase actual: {fase_actual}

El terapeuta está explorando {fase_descripcion}.
Genera una pregunta abierta que ayude a profundizar en esta fase.
```

---

### 4.4. UX Obligatoria

**Disclaimer visible:**
> ⚠️ Asistente simbólico (no diagnóstico). Las sugerencias son exploratorias. El terapeuta toma todas las decisiones.

**Botón ON/OFF:**
- Estado OFF por defecto (opt-in consciente)
- Persistir preferencia por sesión (no global)

**Indicador de que es IA:**
- Icono distintivo (🤖 o similar)
- Color diferente al texto del terapeuta

---

## 5. DECISIÓN FINAL Y RECOMENDACIONES

### 5.1. Puntos APROBADOS para IA ✅

1. **Workspace 4 fases — Asistente de reflexión**  
   - Modo: conversacional, preguntas abiertas  
   - Riesgo: Bajo (con mitigaciones)  
   - Valor: Alto (acelera trabajo terapéutico)

2. **Workspace 4 fases — Reformulación simbólica**  
   - Modo: sugerencias de lenguaje  
   - Riesgo: Bajo  
   - Valor: Medio (enriquece vocabulario)

3. **Workspace 4 fases — Generación de preguntas contextuales**  
   - Modo: sugerencias no obligatorias  
   - Riesgo: Bajo  
   - Valor: Alto (mantiene alineación con fases)

4. **Post-Workspace — Síntesis narrativa**  
   - Modo: generación de resumen (con revisión obligatoria)  
   - Riesgo: Medio (requiere disclaimers estrictos)  
   - Valor: Medio (útil para documentación)

---

### 5.2. Puntos RECHAZADOS para IA ❌

1. **SIGNAL (16 ítems)**  
   - Razón: Rompería contrato de no-automatización

2. **Cuestionario 195 — Selección de preguntas**  
   - Razón: Contaminaría selección determinista

3. **Cuestionario 195 — Navegación/orden**  
   - Razón: Alteraría orden canónico de mundos

4. **Scoring y cálculo de resultados**  
   - Razón: Viola scoring INALTERABLE

5. **CTA Post-SIGNAL**  
   - Razón: Riesgo de presionar al terapeuta

6. **Modificación de artifacts del núcleo**  
   - Razón: Viola modo read-only

---

### 5.3. Recomendaciones de Implementación

#### FASE 1 (Mínima Viable):
- Implementar solo asistente de reflexión en Workspace
- Panel colapsable, opt-in
- Solo preguntas abiertas (no reformulación ni síntesis)

#### FASE 2 (Expansión Controlada):
- Añadir reformulación simbólica
- Añadir generación de preguntas contextuales

#### FASE 3 (Avanzada):
- Añadir síntesis narrativa post-workspace
- Auditar outputs durante 3 meses antes de producción

---

### 5.4. Métricas de Éxito (Post-Implementación)

1. **No contaminación:** 0 casos de lenguaje diagnóstico en outputs
2. **Control del terapeuta:** >80% de terapeutas reportan mantener control
3. **Valor percibido:** >70% de terapeutas usan asistente regularmente
4. **No bypass:** 0 casos de decisiones delegadas a la IA
5. **Cumplimiento de contrato:** 0 violaciones del núcleo

---

## 6. CHECKLIST DE APROBACIÓN

Antes de proceder a FASE 2 (implementación), verificar:

- [ ] Auditoría revisada por `AGENTE_ARQ` humano  
- [ ] Puntos aprobados claramente identificados  
- [ ] Riesgos mitigados documentados  
- [ ] Arquitectura técnica aprobada  
- [ ] UX obligatoria definida  
- [ ] Prompt de sistema validado  
- [ ] Plan de auditoría post-implementación  
- [ ] Confirmación explícita: "APROBAR FASE 2"

---

## 7. REGISTRO DE AUDITORÍA

- **Creado:** 2026-01-23  
- **Auditor:** Agente ARQ_AI_INJECTION_AUDITOR  
- **Estado:** PENDIENTE APROBACIÓN  
- **Siguiente paso:** Esperar decisión humana sobre FASE 2

---

### NOTA FINAL

Esta auditoría recomienda **APROBACIÓN CONDICIONAL** de IA en el Workspace terapéutico, con todas las restricciones documentadas. La implementación debe ser gradual, auditada y siempre reversible.

**NO proceder a implementación sin aprobación explícita.**
