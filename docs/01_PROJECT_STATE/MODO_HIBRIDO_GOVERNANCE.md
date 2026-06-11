# Modo Interactivo Asistido (Híbrido) — Gobernanza

> Estado: propuesta en `feat/modo-hibrido-clinico` (PR en revisión).
> Alcance: pasar del modo puramente observacional/educativo a un modo interactivo
> y práctico para el terapeuta, **bajo consentimiento y supervisión**, sin perder
> los raíles de seguridad que evitan el fraude holístico.

## 1. Roles y fuente de verdad

El rol del usuario es la **única fuente de verdad** y vive en el backend Django,
nunca se confía desde el cliente.

- Modelo: `api.UserProfile.user_type` (`personal | therapist | patient | visitor`).
- Permiso: `api.permissions.IsTherapist` (verifica `profile.user_type == 'therapist'`).

### Modo clínico (vocabulario clínico completo)

Nuevos campos en `UserProfile` (gobernados por Django):

| Campo | Tipo | Significado |
|---|---|---|
| `clinical_mode_requested` | bool | El terapeuta marcó el check de "soy médico/psiquiatra" en el **alta**. |
| `clinical_mode_enabled` | bool | Modo clínico **activo**. Solo lo activa un administrador tras verificar la credencial. |
| `clinical_credential_verified_at` | datetime | Fecha de verificación de la credencial profesional. |
| `clinical_credential_verified_by` | FK(User) | Administrador que verificó y activó el modo clínico. |

Helper de dominio: `UserProfile.can_use_clinical_lexicon()` →
`user_type == 'therapist' and clinical_mode_enabled`.

**Flujo de activación**

1. En el alta de terapeuta (`RegisterTherapistSerializer`), el check marca
   `clinical_mode_requested = true`. Esto **no** habilita nada por sí solo.
2. Un administrador verifica la credencial (nº de colegiado / licencia médica) y
   activa `clinical_mode_enabled = true`, registrando `verified_at` y `verified_by`.
3. El endpoint de login / `/api/profile/me/` devuelve `clinical_mode_enabled` y
   `clinical_mode_requested` (solo lectura) para que el frontend adapte la UI.

## 2. Léxico por rol

El validador de seguridad recibe el rol y aplica el léxico correspondiente.

- **Observacional (por defecto, todos los roles no clínicos):** se **bloquea** el
  léxico clínico (`diagnóstico`, `trastorno`, `patología`, `enfermedad`, `debes`,
  `tienes que`, `siempre`, `nunca`, `definitivamente`, …). Mantiene el marco
  educativo/simbólico para usuarios personales y terapeutas no verificados.
- **Clínico (terapeutas médicos/psiquiatras verificados):** se **levanta** el
  bloqueo del léxico clínico, porque un clínico licenciado necesita vocabulario
  clínico real para trabajar.

Implementación: `packages/symbolic/tree/clinical-lexicon.ts`
(`validateSafetyContentForRole(content, role)`), integrado en
`packages/symbolic/tree/formative-safety.ts`.

## 3. Rail anti-fraude (INNEGOCIABLE)

Independiente del rol y **nunca** se levanta, para **todos** los roles
(incluido el clínico verificado):

- ❌ No recetar medicamentos ni indicar dosis.
- ❌ No prometer curas mágicas ni sanación garantizada.
- ❌ No indicar abandonar o sustituir el tratamiento médico.

Implementación: `enforceAntiFraudRail(content)` en `clinical-lexicon.ts`.
Se aplica siempre, después de cualquier interpretación asistida por IA.

## 4. Disclaimer holístico

Toda salida asistida mantiene el disclaimer: lectura formativa/simbólica que el
terapeuta integra con su marco y el relato del consultante; no sustituye
evaluación ni tratamiento médico.

## 5. Beta tester médica

La primera cuenta clínica verificada corresponde a la médica beta tester, que
validará que el sistema asiste a profesionales médicos en terapia **holística**
(sin recetar fármacos ni prometer curas).
