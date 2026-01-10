# REGLAS DE GOBERNANZA DE TESTS

**Contexto:** Define las reglas inquebrantables para el uso, modificación y despliegue de tests en la plataforma.

---

## 1. Naturaleza No Clínica (Regla de Oro)

*   **Prohibición de Diagnóstico:** Bajo ninguna circunstancia el sistema emitirá diagnósticos médicos, psiquiátricos o psicológicos (ej. "Tienes TDAH", "Sufres depresión").
*   **Lenguaje:** Todo output debe usar lenguaje fenomenológico, simbólico o espiritual (ej. "Tu ritmo atencional fluctúa", "Tu energía vital muestra contracción").
*   **Renuncia de Responsabilidad:** Todos los tests deben incluir un *disclaimer* visible indicando su naturaleza educativa/espiritual antes de iniciar.

## 2. Definición de `execution_mode`

### `patient_self` (Auto-administrado)
*   **Definición:** El usuario responde el cuestionario en soledad, a su propio ritmo.
*   **Requisito:** Las instrucciones deben ser auto-explicativas.
*   **Seguridad:** Si las respuestas indican riesgo inminente (ej. ideación suicida en items legacy), el sistema debe mostrar recursos de ayuda profesional (hotlines) y NO intentar "tratar" al usuario.

### `therapist_guided` (Guiado)
*   **Definición:** El test se realiza durante una sesión sincrónica o bajo instrucción directa de un facilitador.
*   **Uso:** Reservado para instrumentos complejos o que requieren contención emocional inmediata.

## 3. Definición de `assignable`

*   **`true`:** El test aparece en el catálogo disponible para que los terapeutas lo envíen a sus consultantes.
*   **`false`:** El test es de uso interno del sistema, experimental o deprecado.

## 4. Inmutabilidad y Fuente de Verdad

*   El archivo `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md` es la **ÚNICA** definición válida de qué tests existen.
*   El "Initializer" del sistema debe leer este archivo Markdown (o un derivado JSON directo) para crear/actualizar los registros en base de datos.
*   **No se crean tests en BD manual o arbitrariamente.** Si no está en el catálogo, no existe.

## 5. Gestión de Archivos Legacy

*   Los archivos originales (`*_schema.py`) se conservan como motores lógicos.
*   No se eliminan ni alteran para mantener la trazabilidad, pero su *interpretación* cambia según la capa de presentación holística definida aquí.
