## ASTROLOGY STUDY / LAB — Alcance y Separación

**Qué es**
- Espacio académico independiente del workspace terapéutico.
- Incluye: Catálogo extendido, Visual Pro (sample), Comparador, Research Lab, Sandbox simulado.
- Usa datasets simulados o marcados “research”. No requiere patientId.

**Qué no es**
- No es parte del flujo clínico ni del workspace con usuario activo.
- No expone endpoints nuevos ni modifica el motor astronómico (adapter sellado).
- No almacena scoring ni resultados interpretativos con implicaciones clínicas.

**Datos**
- Origen: JSON estático/simulado y datasets research.
- Sin snapshots reales ni PatientContext.
- Sandbox se bloquea si detecta contexto real.

**Governance**
- Mode Switch vive en el módulo Study (localStorage `astro_mode`), no afecta otras áreas.
- Logging frontend-only (buffer localStorage) para uso/print/export.
- Export CSV/TXT y print via navegador; sin PDFs generados en backend.
