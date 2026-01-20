---
title: Initializer Apply Readiness
---

# Informe de Aprobación — Gate pre-APPLY

**Resumen ejecutivo (re-evaluación):**
- Revisión adicional (lectura del script) realizada para verificar si la causa del NO APROBAR previo fue corregida. El script mantiene la lógica que asigna la columna `notes` del catálogo al campo `description` del modelo y coloca esa propiedad dentro de los payloads de creación y actualización.

Conclusión: incumplimiento persistente del contrato de campos (se escribe `description`). Recomendación: NO APROBAR `--apply` hasta corregir esa conducta.

**Checklist de verificación** (PASS / FAIL + evidencia)

- **DRY-RUN por defecto:** PASS. Evidencia: en `tools/initializer_tests.py` el valor dry_run se calcula como "dry_run = not args.apply" y la ayuda del script documenta que la ejecución sin flags es dry-run. Véase el parseo de argumentos y la asignación en el bloque principal of the script: [tools/initializer_tests.py](tools/initializer_tests.py).
- **Flags (`--dry-run` ON, `--apply` requiere confirmación explícita):** PASS (parcial). Evidencia: el script expone `--apply` como flag requerido para escribir; es explícito y no se aplica por defecto. No obstante, no hay un prompt interactivo de confirmación (Y/N) — la confirmación es la presencia explícita del flag. Referencia: argument parser en [tools/initializer_tests.py](tools/initializer_tests.py).
- **No destructivo (no borrar registros, no activar tests):** PASS. Evidencia: no hay llamadas a delete(); las creaciones usan is_active set a False y las actualizaciones solo emplean update() sobre campos concretos. Ver: plan_actions y apply_changes en [tools/initializer_tests.py](tools/initializer_tests.py).
- **Campos tocados: solo los del catálogo (code, name, test_type, execution_mode, assignable, source_files):** FAIL. Evidencia: el script aún mapea la columna `notes` del catálogo a la propiedad `description` del modelo y la incluye en los payloads de creación y actualización. Extracto relevante (lectura del script):

```python
target_description = entry.notes.strip() or f"Holistic test '{entry.code}'"
target_payload = {
	"name": entry.name,
	"description": target_description,
	"test_type": entry.test_type,
	"available_for_therapists": entry.assignable,
}

create_payload = {
	"code": entry.code,
	**target_payload,
	"is_active": False,
}
```

Referencias: [tools/initializer_tests.py](tools/initializer_tests.py) (lectura).
- **Idempotencia:** PASS. Evidencia: plan_actions compara campo a campo y log_actions imprime "No catalog changes required (idempotent)" cuando no hay cambios; si no hay diferencias, no se generan create/update. Ver plan_actions + log_actions in [tools/initializer_tests.py](tools/initializer_tests.py).
- **Legacy safe (registros fuera del catálogo quedan intactos):** PASS. Evidencia: summarize_legacy() calcula códigos legacy y el flujo solo los reporta; no hay borrado ni modificación de estos. Referencia: summarize_legacy and usage in main in [tools/initializer_tests.py](tools/initializer_tests.py).
- **Errores fatales (catalogo inválido/duplicados -> aborta):** PASS. Evidencia: parse_catalog() lanza ValueError en duplicados o valores inválidos (p.ej. parse_bool o execution_mode no válido), y main captura excepciones y hace sys.exit(1). Ver parse_catalog() and main exception handler in [tools/initializer_tests.py](tools/initializer_tests.py) and el diseño en [docs/03_INITIALIZER/INITIALIZER_IDEMPOTENT_DESIGN.md](docs/03_INITIALIZER/INITIALIZER_IDEMPOTENT_DESIGN.md).
- **Logging claro (crear / actualizar / ignorar legacy):** PASS. Evidencia: log_actions imprime secciones diferenciadas para Tests to create, Tests to update y Legacy tests ignored, además de modo DRY-RUN/APPLY. See log_actions in [tools/initializer_tests.py](tools/initializer_tests.py).
- **Transacción prevista solo para `--apply`:** PASS. Evidencia: apply_changes() envuelve escrituras en transaction.atomic(); apply_changes solo se invoca cuando args.apply es True. See apply_changes and its call in main in [tools/initializer_tests.py](tools/initializer_tests.py).
- **Sin dependencias ocultas (no imports de UI/endpoints):** PASS. Evidencia: imports limitados a django setup, django.db.transaction y api.test_models.TestModule. No se importan endpoints ni UI modules. See header imports in [tools/initializer_tests.py](tools/initializer_tests.py).

**Riesgos residuales**
- Riesgo funcional (alto): modificación de campos no autorizados. El script escribe el campo description (derivado de notes). Esto viola la regla "Nunca tocar campos fuera del catálogo" y puede sobrescribir descripciones manuales gestionadas por curadores. Recomendación: eliminar la asignación a description o hacerla opcional y controlada por una bandera explícita y aprobada.
- Riesgo de confirmación (medio): la política pide que --apply requiera confirmación explícita; el script requiere el flag pero no solicita un prompt interactivo. Si la gobernanza requiere una confirmación humana adicional al flag, añadir un prompt interactivo o una comprobación adicional sería necesario.
- Riesgo operacional (bajo): resolve_source_file exige existencia de archivos; si la ruta futura es otra, el script fallará en parse_catalog y abortará (deseable), pero esto debe comunicarse al equipo de contenidos.

**Acciones recomendadas (pre-APPLY):**
1. Corregir el script para que NO escriba en `description` ni en ningún campo no autorizado por el contrato. Opciones:
	- Eliminar `description` del `target_payload` y del payload de creación.
	- O bien, mover la escritura de `description` a un flujo explícito y separado que requiera aprobación formal del Arquitecto.
2. Si la gobernanza lo exige, añadir una confirmación interactiva adicional cuando se invoque `--apply` (prompt Y/N) para evitar ejecuciones accidentales.
3. Documentar en el README operativo que `--apply` debe ejecutarse solo con aprobación formal y preferiblemente en una ventana de mantenimiento.

**Recomendación final:** NO APROBAR. Motivo: la actualización del campo `description` (derivada de `notes`) modifica un campo que no figura en la lista de campos autorizados del contrato. Hasta que esto se corrija o sea aprobado explícitamente por gobernanza/arquitectura, no ejecutar `--apply` en entornos productivos.

**Referencias:**
- Diseño canónico: [docs/03_INITIALIZER/INITIALIZER_IDEMPOTENT_DESIGN.md](docs/03_INITIALIZER/INITIALIZER_IDEMPOTENT_DESIGN.md)
- Catálogo canónico: [docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md](docs/00_SOURCE_OF_TRUTH/TESTS_HOLISTIC_CATALOG.md)
- Script revisado (solo lectura): [tools/initializer_tests.py](tools/initializer_tests.py)

Prepared by: Agent de Diseño / Verificación
Date: 2026-01-09
