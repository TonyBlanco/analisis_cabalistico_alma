---
title: Initializer Idempotente
---

# Diseño del Initializer Idempotente

## A) Objetivo del initializer

- Garantizar que la instancia inicial de `TestModule` refleje fielmente el catálogo canónico sellado sin tocar la base de datos ni activar pruebas automáticamente.
- Ninguna lógica de ejecución o activación de tests se pone en marcha: el initializer únicamente lee datos y crea/actualiza registros para alinearlos con el catálogo (sin duplicados ni borrados).
- No se genera código ejecutable ni se modifican tests existentes; el entregable es un plan de sincronización.

## B) Fuente de datos

- Catálogo canónico: `docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md` (versión 1.0.1, estado CANONICO, fecha 2026-01-09).
- Campos obligatorios que el initializer debe extraer y validar antes de tocar `TestModule`:
  * `code` (identificador único y estable; se usará para comparación exacta).
  * `name` (etiqueta legible del test).
  * `test_type` (siempre `holistic` en este lote; no se importan otros tipos).
  * `execution_mode` (p.ej. `patient_self`; se preserva tal cual).
  * `assignable` (booleano que determina si el objeto puede asignarse a un consultante).
  * `source_files` (nombre del archivo `.py` asociado; se mantiene para rastreabilidad futura).
- Cualquier registro faltante en el catálogo se marca como incompleto y se reporta; no se asume información adicional.

## C) Reglas de idempotencia

1. **Si el test ya existe y los campos coinciden** con la fila del catálogo, no se realiza ningún cambio.
2. **Si el test existe pero algunos campos difieren**, solo se actualizan los campos obligatorios para que coincidan exactamente con el catálogo; se preservan otros atributos (estado, timestamps, relaciones) si ya existen. Las actualizaciones deben registrarse en un log de reconciliación.
3. **Nunca se borra** un registro ya presente en la base de datos, incluso si su código ya no aparece en el catálogo (el initializer no actúa como mecanismo de cleanup).
4. **Nunca se sobrescriben manualmente campos no mencionados** en el catálogo (por ejemplo, `description`, `tags`, `external_id`); el initializer solo opera sobre el conjunto canonizado.
5. En caso de conflicto (p. ej. `code` duplicado en el catálogo), se detiene el proceso y se notifica para revisión manual.

## D) Estrategia de reconciliación

- **Registros legacy:** Se identifican por códigos existentes en la base de datos que no están en el catálogo. Se dejan intactos y se documentan como “legacy” para revisiones futuras; el initializer no altera su estado ni los borra.
- **Códigos desconocidos del catálogo:** Si el catálogo incorpora un código nuevo, se crea un `TestModule` nuevo solo si se cumplen los campos obligatorios con valores válidos; de lo contrario se reporta el error y no se crea.
- **Tests desactivados:** Dado que no se activan automáticamente, la bandera de activación (p. ej. `is_active`) no se toca. Si el catálogo indica una nueva definición, el initializer actualiza los metadatos obligatorios pero conserva la configuración de activación original.
- **Política general:** *Non-destructive by default.* Cada operación de escritura debe validarse contra el catálogo y, si existe algún riesgo de pérdida de información, abortar esa entrada y reportarla.
- **Rollback conceptual:** En caso de errores durante la iteración (parsing, validación, escritura), se detiene sin completar nuevos cambios; el siguiente ejecuto reintenta desde el catálogo completo.

## Pseudocódigo descriptivo

```
leer el archivo canonizado docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md
validar estructura tabular y presencia de los campos obligatorios
para cada fila del catálogo:
    extraer code, name, test_type, execution_mode, assignable, source_files
    buscar en el modelo TestModule por code
    si no existe:
        preparar un registro nuevo con los valores obligatorios
        marcar para creación (sin ejecutar aún)
    si existe:
        comparar campo por campo con los valores canonizados
        si todos coinciden:
            continuar sin cambios
        si hay diferencias en los campos obligatorios:
            preparar una actualización que solo toque esos campos
    en cualquier caso, registrar la decisión para auditoría
al finalizar todas las filas, aplicar las creaciones/actualizaciones en una transacción controlada
```

> Nota: Este pseudocódigo es descriptivo y no debe convertirse en código real ni ejecutar ningún ORM.

## Contrato de seguridad

- **Errores que debe lanzar:** si faltan campos obligatorios en el catálogo, si los valores no son válidos (por ejemplo, `assignable` no booleano), o si existen códigos duplicados en el catálogo, el initializer debe abortar y reportar el problema sin modificar la base de datos.
- **Cuándo aborta:** ante cualquier inconsistencia de datos, excepción durante la validación o imposibilidad de garantizar la idempotencia de un registro, se detiene todo el proceso para evitar estados intermedios.
- **Cuándo requiere aprobación del Arquitecto:** si se detecta que el catálogo ha cambiado de forma incompatible (nuevos campos obligatorios, cambios en la estructura) o se necesitan alterar los principios de gobernanza (por ejemplo, activar tests automáticamente o eliminar registros), se detiene y se solicita autorización explícita antes de continuar.

Este diseño sirve como guía para implementar el initializer idempotente sin ejecutar nada ni modificar el catálogo actual.
