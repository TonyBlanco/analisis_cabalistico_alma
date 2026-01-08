Changelog — 2026-01-08

Regla canónica: Solo puede existir un resultado activo por paciente para un mismo módulo de test. Mientras exista un `TestResult` no archivado (`is_archived=False`) para (paciente, test_module), la reasignación de ese mismo test se bloquea en el backend y retorna conflicto (HTTP 409).

Nota operativa: El frontend debe consumir las banderas del catálogo (`already_assigned`, `locked`, `lock_reason`) para mostrar estado y/o acciones en la UI; la lógica de decisión (bloqueo/reasignación) está en el backend y no debe duplicarse en el cliente.
