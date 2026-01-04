# FASE 5 — Persistencia Simbólica B.O.T.A. (Sin IA)

## Estado del sistema
Este documento define la FASE 5 del sistema B.O.T.A. Tarot dentro de la arquitectura SWM v3.

FASE 4 (motor simbólico observacional) está cerrada y versionada.
FASE 6 (IA asistida) NO está activa.

---

## Objetivo de la FASE 5
Permitir que las lecturas simbólicas B.O.T.A.:
- se guarden como snapshots inmutables
- queden asociadas al historial del paciente (si hay consentimiento)
- puedan ser consultadas desde el workspace del terapeuta
- sin diagnóstico
- sin reinterpretación
- sin IA

---

## Naturaleza del registro
Toda lectura B.O.T.A. guardada es:

- simbólica
- observacional
- no diagnóstica
- no predictiva
- no editable
- no recalculable

---

## Contenido del snapshot simbólico
El snapshot contiene exclusivamente datos ya generados por el motor B.O.T.A.:

- sistema: B.O.T.A. Tarot
- spread utilizado
- cartas (id, posición, orientación)
- correspondencias cabalísticas (letra, sendero, sefirot, inteligencia)
- consciencia activa (power, aspect, humanFaculty)
- ontología de posición (definition, scope)
- síntesis estructural
- fecha, terapeuta
- paciente (solo si consentimiento lo permite)

No contiene narrativa clínica ni conclusiones.

---

## Consentimiento
El snapshot solo se guarda si el usuario acepta explícitamente uno de los modos permitidos:
- no almacenar
- almacenar anonimizado
- almacenar asociado al terapeuta/paciente

---

## Visualización
Las lecturas guardadas:
- se muestran en el workspace del terapeuta
- se renderizan en modo read-only
- mantienen exactamente el estado original
- incluyen aviso visible:  
  “Lectura simbólica observacional. No diagnóstica.”

---

## Relación con FASE 6
FASE 5 prepara la base para IA futura, pero:
- ai_used = false
- ai_role = none

La IA no interviene en esta fase.

---

## Cierre de fase
FASE 5 se considera cerrada cuando:
- el snapshot se guarda correctamente
- puede visualizarse históricamente
- no afecta otros sistemas
- cumple auditoría SWM v3

🟩 PROMPT 2 — PARA AGENTE DE CÓDIGO

(IMPLEMENTACIÓN TÉCNICA, SIN DOCUMENTACIÓN)

⚠️ NO EJECUTAR hasta que el .md anterior esté aprobado.

PROMPT (COPIAR / PEGAR AL AGENTE DE CÓDIGO)
OBJETIVO
Implementar FASE 5: persistencia simbólica de lecturas B.O.T.A.
según el documento:
docs/swm/FASE_5_PERSISTENCIA_SIMBOLICA_BOTA.md

---

ALCANCE PERMITIDO
- Backend: guardar snapshot simbólico B.O.T.A.
- Frontend: historial + visor read-only
- Sin IA
- Sin recalcular
- Sin modificar motor simbólico

---

BACKEND
- Crear/usar registro tipo AnalysisRecord o equivalente
- system = "BOTA_TAROT"
- mode = "symbolic_observational"
- snapshot_payload JSON inmutable
- Validar consentimiento antes de guardar

---

FRONTEND
- Botón “Guardar lectura” en flujo B.O.T.A.
- Sección “Historial simbólico” en workspace del terapeuta
- Vista de lectura histórica usando snapshot_payload
- Modo read-only

---

PROHIBIDO
- Introducir IA
- Cambiar SWM v3
- Tocar otros sistemas
- Añadir interpretación clínica

---

VALIDACIÓN
- npm run build OK
- python manage.py test OK
- Snapshot no editable
 (See <attachments> above for file contents. You may not need to search or read the file again.)
