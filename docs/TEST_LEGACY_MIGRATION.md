# Test Legacy Migration Issues

**Fecha**: 30 de enero de 2026  
**Estado**: Documentación activa de migración de tests clínicos legacy a holísticos

---

## Resumen del Problema

Durante la transición de la plataforma de tests clínicos tradicionales (PHQ-9, AUDIT, EAT-26) a evaluaciones holísticas (SHA Harmony, wellness), algunos tests mantuvieron **código legacy** que esperaba formatos de respuesta incompatibles con las nuevas interfaces frontend.

**Síntoma principal**: El frontend envía respuestas con formato `{ q1: 3, q2: 4, ..., qN: 5 }` pero el backend busca claves legacy como `AUDIT_01`, `AUDIT_02`, resultando en **"Cuestionario incompleto"** aunque todas las preguntas fueron respondidas.

---

## Caso 1: SHA Harmony (sha_harmony)

### Problema Detectado

**Archivo**: `backend/api/test_views.py` líneas 940-984 (versión anterior)

**Código problemático**:
```python
if test_module.code == 'sha_harmony':
    responses = input_data.get('responses', {})
    for i in range(1, 11):
        key = f'AUDIT_{i:02d}'  # ❌ INCORRECTO: Busca AUDIT_01, AUDIT_02...
        val = responses.get(key)
```

**Frontend enviaba**:
```json
{
  "responses": {
    "q1": 3,
    "q2": 4,
    ...
    "q10": 5
  }
}
```

**Resultado**: `answered_items = 0` → "Cuestionario incompleto"

### Solución Implementada

**Commit**: `f05a1669` (2026-01-30)

**Cambios**:
1. Cambiar claves de respuesta de `AUDIT_{i:02d}` a `q{i}`
2. Actualizar escala de 0-4 (AUDIT) a 1-5 (Likert holístico)
3. Recalcular `harmony_index` como promedio 1-5 en lugar de suma 0-40
4. Mapear cada pregunta a su Sefirá correspondiente:
   - `q1` → Keter (Propósito)
   - `q2` → Chokmah (Sabiduría)
   - `q3` → Binah (Entendimiento)
   - `q4` → Chesed (Bondad)
   - `q5` → Gevurah (Rigor)
   - `q6` → Tiferet (Belleza)
   - `q7` → Netzach (Victoria)
   - `q8` → Hod (Esplendor)
   - `q9` → Yesod (Fundamento)
   - `q10` → Malkuth (Reino)

**Schema version**: Actualizado de `sha_harmony:v1` (AUDIT legacy) a `sha_harmony:v2` (Sefirotic balance)

**Campos del resultado**:
```python
{
    'schema_version': 'sha_harmony:v2',
    'total_score': 42,           # Suma de q1-q10 (10-50 range)
    'max_score': 50,
    'answered_items': 10,
    'harmony_index': 4.2,        # Promedio (1-5 scale)
    'harmony_level': 'good',     # excellent/good/moderate/low
    'harmony_label': 'Buena armonía',
    'sefirot_scores': {
        'Keter': 5,
        'Chokmah': 4,
        # ... resto de Sefirot
    },
    'recommendations': [...]
}
```

---

## Tests en Riesgo de Problema Similar

### Tests Potencialmente Afectados

**Criterio de riesgo**: Tests holísticos (`test_type='holistic_screening'`) que originalmente fueron adaptados desde tests clínicos estandarizados.

| Código Test | Nombre | test_type | Riesgo | Estado |
|-------------|--------|-----------|--------|--------|
| `sha_harmony` | SHA Harmony Audit | holistic_screening | 🔴 ALTO | ✅ **CORREGIDO** (v2) |
| `eat26-spirit` | EAT-26 Spirit | holistic_screening | 🟡 MEDIO | ⚠️ **REVISAR** |
| `wellness` | Wellness Assessment | holistic_screening | 🟢 BAJO | ✅ OK |
| `screening-general` | Screening General | holistic_screening | 🟢 BAJO | ✅ OK |
| `past-lives` | Past Lives | holistic_screening | 🟢 BAJO | ✅ OK |
| `insomnia` | Insomnia Wellness | wellness | 🟢 BAJO | ✅ OK |
| `nutrition` | Nutrition Wellness | wellness | 🟢 BAJO | ✅ OK |
| `stress` | Stress Wellness | wellness | 🟢 BAJO | ✅ OK |
| `stress-regulation` | Stress Regulation | wellness | 🟢 BAJO | ✅ OK |
| `anxiety-state-trait` | Anxiety State-Trait | wellness | 🟢 BAJO | ✅ OK |

### eat26-spirit: Pendiente de Revisión

**Motivo de riesgo**: El código en `backend/api/diagnostics.py` línea 2277 (`compute_eat26_spirit`) usa scoring del EAT-26 clínico estándar con escala 0-5, pero el nombre sugiere adaptación holística.

**Acción recomendada**: 
1. Verificar si existe frontend para `eat26-spirit`
2. Si existe, revisar formato de respuestas (¿`q1-q26` o `EAT_01-EAT_26`?)
3. Si no existe frontend, marcar test como `is_internal=True` hasta implementación completa

---

## Protocolo de Migración de Tests Legacy

### Checklist para Nuevos Tests Holísticos

Cuando se adapte un test clínico estandarizado (AUDIT, PHQ-9, GAD-7, EAT-26, etc.) a formato holístico:

- [ ] **1. Renombrar el test**
  - ❌ Evitar: `audit`, `eat26`, `phq9` (nombres clínicos directos)
  - ✅ Preferir: `sha_harmony`, `wellness`, `spiritual_nourishment`

- [ ] **2. Actualizar formato de respuestas**
  - ❌ Legacy: `AUDIT_01`, `PHQ_01`, `EAT_01`
  - ✅ Holístico: `q1`, `q2`, ..., `qN`

- [ ] **3. Ajustar escalas de scoring**
  - Documentar escala original (ej: AUDIT 0-4)
  - Decidir si mantener o adaptar a escala holística (ej: Likert 1-5)
  - Actualizar umbrales de interpretación

- [ ] **4. Mapear a conceptos holísticos**
  - AUDIT → Netzach (victoria/persistencia), Gevurah (límites)
  - EAT-26 → Malkuth (cuerpo físico), Keter (voluntad divina)
  - PHQ-9 → Yesod (fundamento emocional), Hod (expresión)

- [ ] **5. Actualizar schema_version**
  - `v1` → código legacy clínico
  - `v2` → primera versión holística correcta
  - Mantener retrocompatibilidad en lectura de resultados antiguos

- [ ] **6. Crear tests de integración**
  - Verificar payload frontend → backend
  - Validar cálculo de scores
  - Confirmar que `answered_items` cuenta correctamente

- [ ] **7. Documentar en este archivo**
  - Agregar entrada en tabla de "Tests en Riesgo"
  - Documentar mapeo de Sefirot si aplica
  - Incluir ejemplo de payload frontend/backend

---

## Debugging: Cómo Detectar Este Problema

### Síntomas en el Usuario

1. **Frontend**: Cuestionario completado correctamente, botón "Enviar" habilitado
2. **Backend**: Resultado muestra "Cuestionario incompleto" con score 0
3. **Logs**: No hay errores 500, la request retorna 200 OK

### Diagnóstico en Código

**Paso 1**: Identificar el executor del test en `backend/api/test_views.py`:

```python
if test_module.code == 'nombre_test':
    responses = input_data.get('responses', {})
    # Buscar qué claves se están accediendo:
    val = responses.get('CLAVE_AQUI')  # ← Aquí está el problema
```

**Paso 2**: Comparar con el payload del frontend:

```typescript
// Frontend: tonyblanco-app/app/.../page.tsx
const responses: Record<string, number> = {};
for (const q of questions) {
  responses[q.id] = Number(answers[q.id]);  // ← ¿q.id es 'q1' o 'AUDIT_01'?
}
```

**Paso 3**: Si hay mismatch → aplicar fix:

```python
# ❌ Antes (legacy clínico)
for i in range(1, 11):
    key = f'CLINICAL_TEST_{i:02d}'
    val = responses.get(key)

# ✅ Después (holístico)
for i in range(1, 11):
    key = f'q{i}'
    val = responses.get(key)
```

---

## Tests de Regresión

### Test Backend: Validar SHA Harmony

**Archivo**: `backend/tests/test_execute_patient_self.py`

```python
payload = {
    'test_module_code': 'sha_harmony',
    'input_data': {
        'responses': {
            'q1': 3, 'q2': 3, 'q3': 3, 'q4': 3, 'q5': 3,
            'q6': 3, 'q7': 3, 'q8': 3, 'q9': 3, 'q10': 3
        }
    },
    'save_result': True
}

response = self.client.post('/api/tests/execute/', data=json.dumps(payload), ...)
data = response.json()

# Validaciones:
assert data.get('result_data', {}).get('answered_items') == 10
assert data.get('result_data', {}).get('harmony_index') > 0
assert 'Cuestionario incompleto' not in data.get('result_data', {}).get('harmony_label', '')
```

### Test E2E: Frontend → Backend

**Archivo**: `tonyblanco-app/__tests__/sha-harmony.test.ts` (crear si no existe)

```typescript
test('SHA Harmony completes with q1-q10 responses', async () => {
  const result = await executeTest({
    test_module_code: 'sha_harmony',
    input_data: {
      responses: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }
    }
  });
  
  expect(result.result_data.answered_items).toBe(10);
  expect(result.result_data.harmony_level).not.toBe('incomplete');
});
```

---

## Historial de Cambios

| Fecha | Test | Cambio | Commit | Autor |
|-------|------|--------|--------|-------|
| 2026-01-30 | sha_harmony | Migración de AUDIT legacy (v1) a Sefirotic balance (v2) | f05a1669 | Copilot + Luis Blanco |
| 2026-01-30 | - | Creación de TEST_LEGACY_MIGRATION.md | - | Copilot + Luis Blanco |

---

## Referencias

- **AUDIT Original**: Alcohol Use Disorders Identification Test (WHO, 1989)
- **EAT-26**: Eating Attitudes Test-26 (Garner et al., 1982)
- **Sefirot**: Árbol de la Vida Cabalístico (Kabbalah)
- **Test Execution Flow**: `docs/PHOENIX_BRIDGE_IMPLEMENTATION.md`
- **Frontend Test Patterns**: `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/*/page.tsx`

---

## Contacto para Dudas

**Mantenedor**: Luis Antonio Blanco Fontela  
**Rol**: Lead Developer - Holística Aplicada  
**Última actualización**: 2026-01-30
