# SWM MCMI-4 SIGNAL — CONTRATO DOCUMENTAL

**Versión**: 1.0  
**Fecha**: 2026-01-18  
**Tipo**: Módulo de Señal Mínima (SWM v3)  
**Estado**: Autorizado por ARQ

---

## 1. DEFINICIÓN

**SWM MCMI-4 SIGNAL** es un módulo de captura de señal mínima que registra respuestas numéricas (escala Likert 1–5) de un consultante a un cuestionario breve de 16 ítems, generando un `TestResult` simbólico interpretable.

**Propósito único**: Producir señal procesable para el módulo **SWM MCMI-4 Místico**.

---

## 2. Características de la Señal

- **Tipo de instrumento**: Cuestionario breve de señal no clínica.
- **Ítems**: 16 ítems (implementación actual confirmada).
- **Escala**: Likert de 5 puntos (1 = "Muy bajo", 2 = "Bajo", 3 = "Medio", 4 = "Alto", 5 = "Muy alto").
- **Duración estimada**: 3–5 minutos.
- **Propósito**: Captura de señal mínima simbólica, no diagnóstica.
- **Dominios evaluados**: Percepción de patrones, coherencia interna, regulación, adaptabilidad (orientativos, no clínicos).).
- Asignable por terapeuta a consultante.

### NO ES
- Instrumento clínico validado.
- Herramienta diagnóstica.
- Generador de interpretación propia.
- Sustituto de evaluación profesional.
- Test exhaustivo (solo señal mínima).

---

## 3. ROL DEL CONSULTANTE

- **Acción**: Responde 16 ítems con escala Likert 1–5.
- **Contexto**: Ejecución mediante Assignment (flujo `patient_self`).
- **Output**: Envía respuestas al backend para persistencia.
- **No requiere**: Interpretación de resultados ni acceso a análisis.

---

## 4. ROL DEL TERAPEUTA

- **Acción**: Asigna el módulo SIGNAL al consultante vía Assignment.
- **Observación**: Visualiza `TestResult` generado (respuestas numéricas).
- **Interpretación**: Ejecuta **SWM MCMI-4 Místico** para obtener lectura simbólica.
- **No realiza**: Diagnóstico clínico ni calificación psicométrica.

---

## 5. TIPO DE SEÑAL GENERADA

**Formato del TestResult**:
```json
{
  "test_module_code": "mcmi4-signal",
  "input_data": {
    "s1": 4,
    "s2": 3,
    "s3": 5,
    // ... 16 ítems total
  },
  "metadata": {
    "items_count": 16,
    "scale_range": [1, 5],
    "completed_at": "ISO-8601 timestamp"
  }
}
```

**Características**:
- Señal mínima: 16 valores numéricos (1–5), sin scoring.
- No contiene interpretación ni escalas clínicas.
- Persistido como `api.TestResult` vinculado al `subject_user`.

---

## 6. RELACIÓN CON SWM MCMI-4 MÍSTICO

| Módulo | Función |
|--------|---------|
| **SIGNAL** | Captura respuestas del consultante |
| **Místico** | Interpreta señal mediante lógica simbólica |

**Dependencia explícita**:  
El módulo **Místico** requiere un `TestResult` generado por **SIGNAL** como entrada obligatoria. Sin señal previa, el Místico no puede ejecutarse.

---

## NOTA DE ALCANCE: Señal Mínima vs Expansión Futura

### Implementación Actual (v1.0)

**Alcance mínimo confirmado**:
- 16 ítems de señal simbólica no clínica
- Escala Likert 1–5 estandarizada
- Ejecución exclusiva `patient_self`
- TestResult como única salida
- Duración real: 3–5 minutos

**Diseño minimalista intencional**:
- La señal NO pretende ser exhaustiva
- NO sustituye evaluaciones clínicas
- Actúa como "llave" para habilitar workspace interpretativo
- Suficiente para generar TestResult válido

### Expansión Futura (Fuera de Alcance Actual)

**NO implementado / NO planificado**:
- Ítems adicionales (más allá de 16)
- Scoring clínico o diagnóstico
- Integración con otros tests clásicos
- Re-ejecución automática o periódica

**Si se requiere señal más compleja**:
- Crear nuevo TestModule independiente (ej: `mcmi4-signal-extended`)
- Mantener mcmi4-signal como señal mínima estable
- NO inflar alcance de este contrato

---

Este contrato define la capa de señal SIGNAL como entrada válida para el workspace MÍSTICO, respetando la arquitectura sellada y la separación clínico/simbólico.

**Flujo de datos**:
```
Consultante → [SIGNAL] → TestResult → [Místico] → Interpretación Simbólica
```

---

## 7. FLUJO TEMPORAL

1. **Asignación**: Terapeuta crea Assignment(`mcmi4-signal`, consultante).
2. **Captura**: Consultante completa 16 ítems (escala Likert 1–5).
3. **Persistencia**: Backend guarda `TestResult` con respuestas numéricas.
4. **Interpretación**: Terapeuta ejecuta `mcmi4-mystic` usando TestResult previo.
5. **Resultado final**: Místico genera análisis simbólico basado en señal.

**Restricción temporal**: El Místico solo puede ejecutarse si existe un `TestResult` de SIGNAL para el mismo `subject_user`.

---

## 8. CUMPLIMIENTO DE AUDITORÍA

- **Sin lenguaje clínico**: Los ítems no contienen terminología diagnóstica.
- **Sin scoring automático**: No genera puntuaciones ni escalas.
- **Sin interpretación directa**: El módulo no produce texto interpretativo.
- **Trazabilidad completa**: Cada ejecución genera `Assignment` + `TestResult` auditables.
- **Contexto explícito**: Todo uso está dentro del marco del sistema SWM (simbólico/místico).

**Nota legal**: Este módulo NO constituye herramienta psicométrica validada ni diagnóstica. Su uso está limitado al contexto simbólico definido en el contrato SWM MCMI-4 Místico.

---

**FIN DEL CONTRATO**
