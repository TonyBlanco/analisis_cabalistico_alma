# Migración: Actualización del Modelo TestResult

## 📋 Resumen

Se ha actualizado el modelo `TestResult` existente en `backend/api/test_models.py` para incluir campos específicos para tests psicométricos con análisis clínico y cabalístico.

## 🗂️ Campos Agregados al Modelo

Se han agregado los siguientes campos al modelo `TestResult` existente:

- **Identificación del Test**:
  - `test_id`: CharField (opcional, ej: 'phq-9', 'gad-7', 'ptsd', 'scl-90-r')
  - `test_module`: ForeignKey a `TestModule` (ahora opcional, para compatibilidad)

- **Resultados Clínicos**:
  - `score`: IntegerField (opcional, puntaje numérico del test)
  - `clinical_diagnosis`: CharField (opcional, ej: 'Ansiedad Severa', 'Depresión Moderada')

- **Análisis Cabalístico**:
  - `kabbalah_sefira`: CharField (opcional, ej: 'Netzach', 'Malchut', 'Binah')
  - `angel_remedy`: CharField (opcional, ej: 'Caliel', 'Veuliah', 'Mikael')

- **Datos Adicionales**:
  - `details`: JSONField (opcional, para respuestas crudas y análisis completo)

**Nota**: Los campos existentes (`user`, `patient`, `input_data`, `result_data`, etc.) se mantienen para compatibilidad con el sistema actual.

## 🚀 Instrucciones para Aplicar la Migración

### Paso 1: Crear la Migración

Desde el directorio raíz del proyecto (donde está `manage.py`):

```bash
# Windows (PowerShell)
cd backend
python manage.py makemigrations api

# Linux/Mac
cd backend
python manage.py makemigrations api
```

**Salida esperada:**
```
Migrations for 'api':
  api/migrations/XXXX_add_testresult_fields.py
    - Add field test_id to testresult
    - Add field score to testresult
    - Add field clinical_diagnosis to testresult
    - Add field kabbalah_sefira to testresult
    - Add field angel_remedy to testresult
    - Add field details to testresult
    - Alter field test_module on testresult
```

### Paso 2: Revisar la Migración (Opcional pero Recomendado)

Antes de aplicar, puedes revisar el archivo de migración generado:

```bash
# Ver el contenido de la última migración
cat api/migrations/XXXX_testresult.py
```

O en Windows:
```powershell
Get-Content api/migrations/XXXX_testresult.py
```

### Paso 3: Aplicar la Migración

```bash
python manage.py migrate api
```

**Salida esperada:**
```
Operations to perform:
  Apply all migrations: api
Running migrations:
  Applying api.XXXX_add_testresult_fields... OK
```

### Paso 4: Verificar la Migración

Puedes verificar que la tabla se creó correctamente:

```bash
python manage.py dbshell
```

Luego en el shell de la base de datos (SQLite/PostgreSQL):

```sql
-- Para SQLite
.tables
.schema api_testresult

-- Para PostgreSQL
\dt api_testresult
\d api_testresult
```

## 🔍 Verificación en Django Admin

Si tienes Django Admin configurado, puedes verificar que el modelo aparece:

1. Accede a `/admin/`
2. Busca la sección "API"
3. Deberías ver "Resultados de Tests" (TestResult)

## 📝 Notas Importantes

1. **Índices**: El modelo incluye índices para optimizar consultas por:
   - `test_id` y `created_at`
   - `user` y `created_at`
   - `patient` y `created_at`

2. **Relaciones**:
   - Si `patient` está presente, el test pertenece a un paciente de un terapeuta
   - Si `patient` es `null`, el test pertenece directamente al usuario (caso personal)

3. **JSONField**: El campo `details` puede almacenar:
   - Respuestas crudas del test
   - Análisis completo del backend Flask
   - Cualquier dato adicional necesario

## 🛠️ Uso del Modelo

### Ejemplo: Guardar un resultado de test psicométrico

```python
from api.test_models import TestResult
from api.models import Patient, User

# Para un paciente de terapeuta
patient = Patient.objects.get(id=1)
therapist = User.objects.get(id=2)

test_result = TestResult.objects.create(
    patient=patient,
    user=therapist,
    test_id='phq-9',
    score=18,
    clinical_diagnosis='Depresión Moderadamente Severa',
    kabbalah_sefira='Malchut',
    angel_remedy='Veuliah',
    details={
        'answers': [2, 3, 1, 2, 3, 2, 2, 1, 3],
        'soul_analysis': {
            'sefira_afectada': 'Malchut',
            'organo': 'Corazón',
            'concepto': 'Oscuridad'
        }
    }
)

# Para un usuario personal
user = User.objects.get(id=1)

test_result = TestResult.objects.create(
    patient=None,
    user=user,
    test_id='gad-7',
    score=12,
    clinical_diagnosis='Ansiedad Moderada',
    kabbalah_sefira='Netzach',
    angel_remedy='Caliel'
)
```

### Consultar resultados

```python
from api.test_models import TestResult

# Todos los resultados de un usuario
results = TestResult.objects.filter(user=user)

# Resultados de un paciente específico
patient_results = TestResult.objects.filter(patient=patient)

# Resultados de un test psicométrico específico
phq9_results = TestResult.objects.filter(test_id='phq-9')

# Resultados con diagnóstico clínico
severe_cases = TestResult.objects.filter(clinical_diagnosis__icontains='Severa')

# Resultados recientes
recent = TestResult.objects.filter(user=user).order_by('-created_at')[:10]

# Resultados por ángel remedio
caliel_results = TestResult.objects.filter(angel_remedy='Caliel')
```

## ⚠️ Troubleshooting

### Error: "No changes detected"
Si Django no detecta cambios:
1. Verifica que guardaste el archivo `models.py`
2. Asegúrate de estar en el directorio correcto
3. Intenta: `python manage.py makemigrations api --name testresult`

### Error: "Table already exists"
Si la tabla ya existe:
1. Puede ser una migración previa
2. Verifica con: `python manage.py showmigrations api`
3. Si es necesario, elimina la tabla manualmente y vuelve a migrar

### Error: "Field 'patient' cannot be null"
Si obtienes este error al crear un TestResult sin paciente:
- Asegúrate de pasar `patient=None` explícitamente o dejar el campo vacío
- El campo está configurado como `null=True, blank=True`

## ✅ Checklist Post-Migración

- [ ] Migración creada exitosamente
- [ ] Migración aplicada sin errores
- [ ] Tabla `api_testresult` existe en la base de datos
- [ ] Modelo visible en Django Admin (si está configurado)
- [ ] Puedes crear instancias de TestResult desde el shell de Django

