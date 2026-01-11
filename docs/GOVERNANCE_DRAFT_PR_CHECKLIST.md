GOVERNANCE DRAFT PR CHECKLIST — DOCUMENTAL (NO EJECUTAR)

Estado: DRAFT — V0
Fecha: 2026-01-11

1) Título sugerido del PR

"docs(governance): establish Source of Truth, SWM immutability and indexes"

2) Qué incluye el PR (checklist)

- [ ] Actualización de `docs/00_SOURCE_OF_TRUTH.md` para citar los nuevos documentos y el índice.
- [ ] Inclusión de `docs/00_SOURCE_OF_TRUTH/SWM_IMMUTABILITY_CONTRACT.md`.
- [ ] Inclusión de `docs/00_SOURCE_OF_TRUTH/SWM_INDEX_READ_ONLY.md`.
- [ ] Inclusión de `docs/00_SOURCE_OF_TRUTH/*.md` nuevos (Exploraciones canónicas, protocolos, contratos, resultados y gobernanza).
- [ ] Actualización de `DOCUMENT_INDEX.md` con referencias a estos documentos.
- [ ] Confirmación de que NO hay cambios de código en el branch.

3) Qué NO incluye el PR

- Cambios de lógica o implementación
- Cambios de rutas o renombrado de módulos SWM
- Cambios en contenido de SWM (código, símbolos, decks)
- Activación o desactivación de tests

4) Checklist de aprobación de gobernanza

- [ ] Revisado por Arquitectura
- [ ] Revisado por Producto
- [ ] Riesgo SWM evaluado y catalogado
- [ ] Confirmado “NO IMPACTO FUNCIONAL” por el equipo de QA/Técnico

5) Nota final

Este PR es DOCUMENTAL. Su único objetivo es fortalecer la gobernanza para PREVENIR REGRESIONES y PROTEGER los SWM.

6) Instrucciones de ejecución (HUMANO)

Para abrir el draft PR ejecutar localmente (humano):

```bash
# crear branch local
git checkout -b governance/docs-source-of-truth
# agregar cambios, commit & push
git add docs/00_SOURCE_OF_TRUTH/*.md docs/GOVERNANCE_DRAFT_PR_CHECKLIST.md DOCUMENT_INDEX.md
git commit -m "docs(governance): add Source of Truth, SWM immutability and index"
git push -u origin governance/docs-source-of-truth
# abrir Draft PR en plataforma de SCM
```

> **IMPORTANTE:** NO ejecutar estos comandos de forma automática; dejar preparados los cambios y el checklist para que un responsable humano cree el PR.

---

Este archivo es parte del paquete documental de gobernanza y DEBE acompañar al PR cuando un humano lo cree.