# INFORME DE AUDITORÍA: Tests Holísticos y Limpieza de /root

**Fecha:** 2026-01-09
**Responsable:** Agente CLI (Arquitecto de Plataforma)
**Contexto:** Transición a sistema 100% holístico/simbólico. Eliminación de tests clínicos legacy.

---

## 1. Inventario de Tests (Fuente de Verdad: PY)

Se han identificado 8 módulos Python en `/root` que definen la lógica y contenido de los tests.

| test_code_propuesto | archivo_py | descripción | ejecutable | dependencias | estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `asrs_essence` | `adhd_asrs6_schema.py` | ASRS v1.1 Screener. Solo estructura, sin textos. Scorer placeholder. | Parcial | `json`, `csv` | `incompleto` |
| `aq_kabbalah` | `aq50_schema.py` | AQ-50. Solo estructura (50 items), sin textos. Scorer placeholder. | Parcial | `json`, `csv` | `incompleto` |
| `sha_harmony` | `audit_bank.py` | AUDIT. Banco sintético completo (10 items) en español. Scoring funcional. | Sí | `json`, `csv` | `usable` |
| `dudit_spirit` | `dudit_schema.py` | DUDIT. Solo estructura (11 items), sin textos. Scorer placeholder. | Parcial | `json`, `csv` | `incompleto` |
| `eat26_spirit` | `eat26_bank.py` | EAT-26. Banco sintético completo (26 items) en español. Scoring funcional. | Sí | `json`, `csv` | `usable` |
| `mcmi4_mystic` | `mcmi4_bank.py` | MCMI-IV. Generador sintético de 195 items con lógica de escalas. | Sí | `random`, `json` | `usable` |
| `pcl5_trauma_healing` | `pcl5_bank.py` | PCL-5. Banco sintético completo (20 items) en español. Lógica de clusters. | Sí | `json`, `csv` | `usable` |
| `ybocs_soul` | `ybocs_schema.py` | Y-BOCS. Solo estructura (10 items), sin textos. Scorer placeholder. | Parcial | `json`, `csv` | `incompleto` |

**Nota:** Los tests marcados como `incompleto` requieren la inyección de textos (prompts) o completado manual antes de ser funcionales para el usuario final. Los marcados como `usable` tienen contenido sintético válido para pruebas o demos.

---

## 2. Evaluación de JSON (Descarte Controlado)

Todos los archivos JSON listados a continuación son **artefactos generados** por los scripts `.py` correspondientes. No son fuentes de verdad primaria.

| Archivo JSON | Estado | Fuente Original | Acción Recomendada |
| :--- | :--- | :--- | :--- |
| `asrs6_schema.json` | OBSOLETO | `adhd_asrs6_schema.py` | Eliminar / Mover a legacy |
| `aq50_schema.json` | OBSOLETO | `aq50_schema.py` | Eliminar / Mover a legacy |
| `audit_items.json` | OBSOLETO | `audit_bank.py` | Eliminar / Mover a legacy |
| `dudit_schema.json` | OBSOLETO | `dudit_schema.py` | Eliminar / Mover a legacy |
| `eat26_items.json` | OBSOLETO | `eat26_bank.py` | Eliminar / Mover a legacy |
| `mcmi4_items.json` | OBSOLETO | `mcmi4_bank.py` | Eliminar / Mover a legacy |
| `pcl5_items.json` | OBSOLETO | `pcl5_bank.py` | Eliminar / Mover a legacy |
| `ybocs_severity_schema.json` | OBSOLETO | `ybocs_schema.py` | Eliminar / Mover a legacy |
| `tests_catalog_status.json` | REFERENCIAL | Script de auditoría previo | Eliminar / Mover a legacy |

También se aplica a los archivos `.csv` correspondientes.

---

## 3. Propuesta de Limpieza y Estructura del `/root`

Se propone reorganizar el directorio raíz para aislar la lógica de tests y limpiar el ruido.

### Nueva Estructura Propuesta

```text
/tests_holistic_py/       <-- NUEVO DIRECTORIO
    adhd_asrs6_schema.py
    aq50_schema.py
    audit_bank.py
    dudit_schema.py
    eat26_bank.py
    mcmi4_bank.py
    pcl5_bank.py
    ybocs_schema.py

/tools/                   <-- MOVER AQUÍ (Existente o crear)
    activate_wellness_tests.py
    final_verification.py
    inspect_testmodule_fields.py
    review_tests_state.py
    review_wellness_tests.py
    tmp_query_db.py
    verify_catalog_endpoint.py
    verify_legacy_filters.py
    menu_interactivo.py

/legacy_json/             <-- DIRECTORIO TEMPORAL PARA BASURA
    *.json (listados arriba)
    *.csv (listados arriba)
    tests_catalog_status.md
    DEBUG_AUDIT_REPORT.md
```

### Archivos a Conservar en `/root` (por ahora)
* `app_cabalistica.py` (Entrada principal probable)
* `manage.py` (Django entrypoint)
* Archivos de configuración (`Dockerfile`, `package.json`, `requirements.txt`, etc.)
* Archivos de setup (`setup-*.ps1`, `start-*.ps1`)

---

## 4. Riesgos Detectados / Dependencias Ocultas

1.  **Referencias en DB:** El script `activate_wellness_tests.py` hace referencia a códigos de test (`anxiety-state-trait`, `bdi-ii`, etc.) que **no coinciden** con los nombres de archivo auditados. Esto sugiere que existe una desconexión entre los archivos físicos nuevos (auditados aquí) y los registros existentes en la base de datos `TestModule`.
    *   *Mitigación:* Antes de activar cualquier test "nuevo", se debe asegurar que exista su correspondiente registro en DB o crearlo.
2.  **Imports Cruzados:** No se detectaron imports entre los módulos de tests (`*_schema.py`). Son independientes.
3.  **Dependencia de `menu_interactivo.py`:** Es posible que este menú (si se usa localmente) importe directamente los archivos por nombre. Si se mueven a `/tests_holistic_py/`, habrá que actualizar esos imports.

---

## Conclusión

La auditoría ha sido exitosa. Se ha identificado claramente qué es código fuente válido (PY) y qué es ruido generado (JSON/CSV). El camino está despejado para crear una estructura limpia y un inicializador canónico.
