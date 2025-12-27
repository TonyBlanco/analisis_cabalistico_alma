## ASTRO SANDBOX — Límites y Uso Educativo

**Alcance**
- Laboratorio simulado para practicar lectura estructural.
- Solo usa datasets simulados o marcados como `research`.
- No opera sobre pacientes reales ni historias clínicas.

**Prohibiciones**
- No diagnóstico, no predicción aplicada, no scoring clínico.
- No persiste resultados ni genera endpoints nuevos.
- No modifica el motor astronómico ni el adapter sellado.

**Scoring didáctico (Sandbox-only)**
- Métricas: densidad de aspectos, ratio tensión/armonía, concentración por casas, angularidad, dominancia elemento/modo (si disponible), complejidad estructural compuesta.
- Fórmulas fijas y visibles; peso fijo con fines pedagógicos.
- Banner permanente: “Simulación educativa. No predicción real.”

**Modo y seguridad**
- Mode Switch vive dentro del módulo de Astrología (localStorage `astro_mode`).
- Sandbox se bloquea si detecta datos reales (“Sandbox no disponible con datos reales”).
- Eventos mínimos registrados en frontend: MODE_SWITCH, SANDBOX_ENTER_CONFIRM, SANDBOX_SCORE_VIEW, EXPORT_CLICK, PRINT_OPEN (buffer localStorage 200 eventos).
- Sandbox reside en el espacio Astrology Study / Lab, no en el workspace clínico con pacientes.

**Export/Print**
- Export CSV/TXT desde frontend (config + tablas + scores + disclaimer).
- Print layout via navegador (`@media print`). Sin PDFs generados en backend.

**Mensajes obligatorios**
- “Simulación educativa. No predicción real.”
- “No se recalcula nada. Sin endpoints nuevos.”
- “No se usan pacientes reales en Sandbox/Research.”
