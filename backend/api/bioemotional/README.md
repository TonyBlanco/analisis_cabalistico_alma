# Módulo Bio-Emocional & Árbol Transgeneracional (backend)



Este paquete define la base backend del módulo **"Bio-Emoción & Árbol Transgeneracional"**.



## Qué hace



- Proporciona **modelos mínimos y estructurados** para:

  - `BioEmotionalDictionaryEntry`: entradas de diccionario bio-emocional (solo lectura / referencia).

  - `GenealogyPerson`: personas del árbol transgeneracional de un paciente.

  - `GenealogyEvent`: eventos relevantes asociados al sistema familiar del paciente.

  - `BioTransgenerationalHypothesis`: hipótesis terapéuticas estructuradas, redactadas por el terapeuta.

- Expone endpoints REST **pasivos** (CRUD / lectura) bajo `/api/bioemotional/` para terapeutas:

  - Diccionario bio-emocional (READ-ONLY, validado por schema):

    - `GET /api/bioemotional/dictionary/?q=...`

  - Árbol genealógico y eventos por paciente:

    - `GET /api/bioemotional/genealogy/{patient_id}/`

    - `POST /api/bioemotional/genealogy/{patient_id}/person`

    - `POST /api/bioemotional/genealogy/{patient_id}/event`

    - `PATCH/DELETE /api/bioemotional/genealogy/persons/{id}/`

    - `PATCH/DELETE /api/bioemotional/genealogy/events/{id}/`

  - Hipótesis bio-transgeneracionales:

    - `GET /api/bioemotional/hypotheses/{patient_id}/`

    - `POST /api/bioemotional/hypotheses/{patient_id}/`

    - `PATCH /api/bioemotional/hypotheses/detail/{id}/`

- Todas las operaciones están **restringidas a terapeutas** y validan que el

  paciente pertenece al terapeuta autenticado.



## Diccionario bio-emocional READ-ONLY



- La fuente de verdad es el archivo JSON:

  - `backend/resources/diccionario_bioemocional_2016.json`.

- Su contrato lógico se valida contra el schema JSON:

  - `backend/resources/schema_bioemocional.json`.

- El loader `api/bioemotional/dictionary_loader.py`:

  - Lee el JSON maestro desde `backend/resources`.

  - Transforma cada entrada bruta (`slug`, `title`, `description`, `source`, etc.)

    a una estructura alineada con el schema (`termino`, `definicion`, `fuente`, ...).

  - Valida el array resultante contra `schema_bioemocional.json` (usando `jsonschema`

    cuando está disponible, o una validación mínima manual si no lo está).

  - Lanza `BioEmotionalDictionaryError` si el schema no se cumple o si hay errores

    de lectura/parsing.

  - Cachea en memoria el resultado para uso READ-ONLY en el endpoint.

- El endpoint `GET /api/bioemotional/dictionary/?q=...`:

  - Está protegido por `IsAuthenticated` + `IsTherapist` (solo terapeutas).

  - Nunca expone el diccionario a `patient` ni `personal`.

  - No tiene efectos colaterales: no escribe en base de datos ni dispara flujos.



## Qué NO hace



- ❌ No crea ni modifica `AnalysisRecord` ni sus flujos.

- ❌ No introduce **roles nuevos** (usa solo `admin / therapist / personal / patient`).

- ❌ No crea **execution modes** nuevos (trabaja conceptualmente en `therapist_clinical`).

- ❌ No ejecuta tests ni usa `executeTest()`.

- ❌ No expone endpoints al paciente ni al rol `personal`.

- ❌ No realiza inferencias automáticas, IA, scoring o diagnóstico.

  - Todos los textos (hipótesis, notas) son **redactados por el terapeuta**.

- ❌ No modifica modelos legacy ni refactoriza código existente.



## Integración prevista



- Los modelos viven en `api.bioemotional.models` y se relacionan solo con:

  - `User` (como terapeuta autor en `BioTransgenerationalHypothesis`).

  - `Patient` (como sujeto clínico de genealogía / hipótesis).

- El archivo `api/bioemotional/urls.py` se incluye desde `api/urls.py` bajo el

  prefijo `/bioemotional/`.

- Los permisos usan la estructura existente (`User.profile.user_type`) y

  validan ownership (`Patient.therapist`).



## Estado actual



- ✅ Modelos, serializers, views y URLs definidos.

- ✅ Permisos específicos (`IsTherapistAndOwnsPatient`).

- ✅ Loader READ-ONLY del diccionario bio-emocional + validación por schema.

- ✅ Endpoint GET protegido para búsqueda en el diccionario (`/api/bioemotional/dictionary/`).

- ✅ Modelo clínico editable de hipótesis transgeneracionales (`BioTransgenerationalHypothesis`):

  - Referencia el diccionario **solo por `termino_bioemocional`** (string) sin copiar texto.

  - Expone un contrato controlado en API: `id`, `patient_id`, `termino_bioemocional`, `hypothesis_type`, `description`, `status`, `created_by`, `created_at`, `updated_at`.

  - `hypothesis_type` restringido a: `lealtad_invisible | repeticion | aniversario | proyecto_sentido | otro`.

  - `status` restringido a: `open | in_review | discarded`.

  - La validación de `termino_bioemocional` se hace contra el diccionario READ-ONLY, sin scoring, IA ni diagnósticos.

- ⚠️ Falta crear y aplicar migraciones (`makemigrations` / `migrate`).

- ⚠️ Falta integrar explícitamente en el frontend del dashboard terapeuta

  (este paquete solo cubre backend).



## Hipótesis transgeneracionales – Contrato clínico



### Qué es una hipótesis transgeneracional



- Un **texto clínico redactado por el terapeuta** donde se exploran posibles patrones

  de lealtad, repetición, aniversarios o proyecto sentido en la historia familiar

  de un paciente.

- Es **editable y reversible**: el terapeuta puede crear, revisar, descartar o

  actualizar hipótesis a lo largo del proceso.

- Cada hipótesis se asocia siempre a:

  - Un `patient_id` que **pertenece al terapeuta autenticado**.

  - Un `created_by` (therapist_id) para auditoría básica.



### Qué NO es



- ❌ No es un **diagnóstico médico** ni un dictamen causal.

- ❌ No es un algoritmo ni un sistema de scoring: **no hay campos automáticos**,

  ni pesos, ni probabilidades.

- ❌ No genera conclusiones por sí misma: el módulo no hace inferencias ni

  propone decisiones clínicas; solo almacena el texto que redacta el terapeuta.



### Referencia al diccionario bio-emocional



- Cada hipótesis referencia exactamente **un término del diccionario** mediante

  el campo `termino_bioemocional` (tipo `string`).

- Antes de guardar, el serializer valida que ese término **existe en el

  diccionario READ-ONLY** cargado por `dictionary_loader.py`.

- No se guarda copia del texto del diccionario en la hipótesis; solo se

  persiste el nombre del término para poder enlazarlo después en el frontend.



### Estados de la hipótesis



- `open`: hipótesis **abierta**, en exploración activa dentro del proceso

  terapéutico.

- `in_review`: hipótesis en **revisión**; el terapeuta la está contrastando,

  afinando o validando frente a nueva información clínica.

- `discarded`: hipótesis **descartada**; se conserva para fines de auditoría y

  trazabilidad, pero ya no se considera activa en el trabajo clínico actual.



Este módulo respeta la **arquitectura cerrada** definida en

`PROJECT_STATE_CURRENT.md` y mantiene el código nuevo **aislado** dentro de

`api/bioemotional/`.

