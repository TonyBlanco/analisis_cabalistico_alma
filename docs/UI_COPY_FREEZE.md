# UI Copy Freeze

⚠️ **ACTUALIZACIÓN**: Aplicar terminología `Consultante` (no `paciente`) en todo copy nuevo. Ver [`CONSULTANTE_TERMINOLOGY.md`](CONSULTANTE_TERMINOLOGY.md).

## 1. Lenguaje PERMITIDO

### Terminología de personas:
- **"Consultante"** (no "paciente")
- **"Terapeuta"**
- **"Usuario"** (cuenta técnica)

### Acciones permitidas:
- "Vista previa"
- "Acción manual"
- "Confirmar"
- "Copiar (pegar manualmente...)"
- "Solo lectura"
- "No se sincroniza con otros workspaces"
- "Revisión requerida antes de insertar"
- "Seleccionar consultante"
- "Agregar nuevo consultante"
- "Datos del consultante"

## 2. Lenguaje PROHIBIDO (lista explícita)

### Terminología legacy:
- **"Paciente"** → Usar "consultante"
- **"Patient"** → Usar "Consultante" 
- **"El/la paciente"** → Usar "el/la consultante"

### Acciones automatizadas prohibidas:
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
