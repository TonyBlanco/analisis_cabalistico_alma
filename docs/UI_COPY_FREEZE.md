# UI Copy Freeze

## 1. Lenguaje PERMITIDO

- "Vista previa"
- "Acción manual"
- "Confirmar"
- "Copiar (pegar manualmente...)"
- "Solo lectura"
- "No se sincroniza con otros workspaces"
- "Revisión requerida antes de insertar"

## 2. Lenguaje PROHIBIDO (lista explícita)

Evitar cualquier texto que pueda sugerir automatismo, sincronización o inyección.

- insertar
- inyectar
- enviar automáticamente
- se guarda en notas
- se sincroniza
- se aplica al caso
- generar informe clínico
- se inyecta
- enviar al terapista (cuando implique acción automática)

Ejemplos de patrones prohibidos: "se inyecta en", "se guarda automáticamente en", "envía a notas".

## 3. Reglas de redacción UI

- Separar siempre "Vista previa" vs "Confirmar". Nunca mostrar preview como acción aplicada.
- Toda acción de copia debe indicar explícitamente que es manual y que no sincroniza:
  - Ejemplo permitido: "Copiar (pegar manualmente en Notas integrativas)"
  - Ejemplo prohibido: "Copiar y enviar a notas"
- Evitar verbos activos atribuibles al sistema: no usar "el sistema hará", "se generará".
- Para botones de inserción, usar etiquetas que incluyan "(manual)" o "(requiere confirmación)".
- En tooltips y mensajes de estado, incluir la frase exacta: "No se sincroniza con otros workspaces" cuando proceda.

## 4. Alcance

Aplica a:

- Interfaces de usuario (botones, labels, menús)
- Tooltips y ayudas contextuales
- Mensajes de estado, banners y toasts visibles al usuario
- Documentación visible a usuarios dentro de la aplicación

## 5. Aplicación y revisión

- Cualquier texto nuevo o modificado en UI debe cumplir estas reglas antes de merge.
- Los revisores deben bloquear PRs que contengan cualquiera de las palabras o patrones prohibidos.
