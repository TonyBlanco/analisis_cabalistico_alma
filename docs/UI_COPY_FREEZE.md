# UI Copy Freeze

## 1. Lenguaje PERMITIDO

- "Vista previa"
- "Acci├│n manual"
- "Confirmar"
- "Copiar (pegar manualmente...)"
- "Solo lectura"
- "No se sincroniza con otros workspaces"
- "Revisi├│n requerida antes de insertar"

## 2. Lenguaje PROHIBIDO (lista expl├¡cita)

Evitar cualquier texto que pueda sugerir automatismo, sincronizaci├│n o inyecci├│n.

- insertar
- inyectar
- enviar autom├íticamente
- se guarda en notas
- se sincroniza
- se aplica al caso
- generar informe cl├¡nico
- se inyecta
- enviar al terapista (cuando implique acci├│n autom├ítica)

Ejemplos de patrones prohibidos: "se inyecta en", "se guarda autom├íticamente en", "env├¡a a notas".

## 3. Reglas de redacci├│n UI

- Separar siempre "Vista previa" vs "Confirmar". Nunca mostrar preview como acci├│n aplicada.
- Toda acci├│n de copia debe indicar expl├¡citamente que es manual y que no sincroniza:
  - Ejemplo permitido: "Copiar (pegar manualmente en Notas integrativas)"
  - Ejemplo prohibido: "Copiar y enviar a notas"
- Evitar verbos activos atribuibles al sistema: no usar "el sistema har├í", "se generar├í".
- Para botones de inserci├│n, usar etiquetas que incluyan "(manual)" o "(requiere confirmaci├│n)".
- En tooltips y mensajes de estado, incluir la frase exacta: "No se sincroniza con otros workspaces" cuando proceda.

## 4. Alcance

Aplica a:

- Interfaces de usuario (botones, labels, men├║s)
- Tooltips y ayudas contextuales
- Mensajes de estado, banners y toasts visibles al usuario
- Documentaci├│n visible a usuarios dentro de la aplicaci├│n

## 5. Aplicaci├│n y revisi├│n

- Cualquier texto nuevo o modificado en UI debe cumplir estas reglas antes de merge.
- Los revisores deben bloquear PRs que contengan cualquiera de las palabras o patrones prohibidos.
