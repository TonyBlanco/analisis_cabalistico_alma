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

## Caso 2: SHA Harmony Frontend Multi-View Sync (v2 Display Fix)

### Problema Detectado

**Fecha**: 30 de enero de 2026  
**Síntoma**: Después de corregir el backend para enviar SHA Harmony v2 (`harmony_index`, `sefirot_scores`, `recommendations`), la página individual del resultado mostraba correctamente los datos, pero:

1. **Página general de resultados** (`/dashboard/patient/results`) mostraba:
   - Etiqueta: "Unknown"
   - Puntuación: "7 / 50" (incorrecta)
   
2. **Workspace del terapeuta** (`/dashboard/therapist/sha`) mostraba:
   - "Puntuación Total N/A / 50" (sin datos)
   - No renderizaba los detalles del resultado

### Causa Raíz

Los componentes frontend responsables de renderizar resultados SHA en distintas vistas solo reconocían el formato **v1 legacy**:

**Archivos afectados**:
- `tonyblanco-app/components/test-results/ReadableResult.tsx` (línea 381)
- `tonyblanco-app/components/SHAWorkspace/index.tsx` (líneas 503-524)

**Código problemático** (ReadableResult.tsx):
```typescript
// ❌ Solo reconocía v1
const isSHAHarmony = payload?.schema_version === 'sha_harmony:v1' || testCode === 'sha_harmony';
const shaData = isSHAHarmony ? {
  total: payload?.total ?? null,        // v1 field
  max_score: payload?.max_score ?? 40,  // v1 scale
  zone: payload?.zone ?? 'Unknown',     // v1 risk zone
  sefira: payload?.sefira ?? null,      // v1 single sefira
} : null;
```

**Formato esperado v1**:
```json
{
  "schema_version": "sha_harmony:v1",
  "total": 28,
  "max_score": 40,
  "zone": "Hazardous use",
  "zone_label": "Uso peligroso",
  "sefira": "Gevurah (Rigor)",
  "interpretation": "..."
}
```

**Formato enviado v2** (backend corregido):
```json
{
  "schema_version": "sha_harmony:v2",
  "harmony_index": 2.8,
  "harmony_level": "moderate",
  "harmony_label": "Armonía moderada",
  "total_score": 28,
  "max_score": 50,
  "sefirot_scores": {
    "Keter": 2, "Chokmah": 3, "Binah": 3, "Chesed": 2,
    "Gevurah": 2, "Tiferet": 5, "Netzach": 3, "Hod": 3,
    "Yesod": 3, "Malkuth": 4
  },
  "recommendations": [
    "Medita sobre Keter para reconectar con tu propósito divino",
    "Trabaja con Chesed para cultivar la bondad y compasión",
    "..."
  ]
}
```

### Solución Implementada

**Commits**: 
- `d97ad3ad` - ReadableResult v2 recognition (2026-01-30)
- `52e0143e` - SHAWorkspace v2 display (2026-01-30)

#### Fix 1: ReadableResult.tsx

**Cambios**:
1. Reconocer `sha_harmony:v2` como válido
2. Detectar formato por presencia de `harmony_index`
3. Renderizar v2 con:
   - Índice de armonía (1-5 scale) en lugar de total/40
   - Barra de progreso sobre 5.0
   - Color-coding: verde (≥4.5), azul (≥3.5), amarillo (≥2.5), naranja (<2.5)
   - Todas las 10 Sefirot con barras individuales
   - Lista de recomendaciones con checkmarks
4. Mantener compatibilidad con v1 legacy

**Código corregido**:
```typescript
// ✅ Reconoce ambas versiones
const isSHAHarmony = payload?.schema_version === 'sha_harmony:v1' || 
                     payload?.schema_version === 'sha_harmony:v2' || 
                     testCode === 'sha_harmony';

const isV2 = payload?.harmony_index !== undefined;

const shaData = isSHAHarmony ? (isV2 ? {
  // v2 format
  harmony_index: payload?.harmony_index ?? null,
  harmony_level: payload?.harmony_level ?? 'moderate',
  sefirot_scores: payload?.sefirot_scores ?? {},
  recommendations: payload?.recommendations ?? [],
  version: 2
} : {
  // v1 format (legacy)
  total: payload?.total ?? null,
  zone: payload?.zone ?? 'Unknown',
  version: 1
}) : null;
```

**Renderizado v2**:
```tsx
{/* Harmony Index - 1-5 scale */}
<div className="flex items-center gap-3">
  <div className="w-12 h-12 bg-yellow-500 rounded-full">
    <span className="text-white font-bold text-lg">2.8</span>
  </div>
  <div>
    <p className="font-semibold text-yellow-800">Índice de Armonía</p>
    <p className="text-sm">2.8 / 5.0</p>
  </div>
</div>

{/* Sefirot Scores */}
<div className="space-y-2">
  {Object.entries(sefirot_scores).map(([sefira, score]) => (
    <div key={sefira} className="flex items-center gap-2">
      <span className="w-20">{sefira}</span>
      <div className="flex-1 bg-purple-200 rounded-full h-2">
        <div className="bg-purple-600 h-2 rounded-full" 
             style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="w-8 text-right">{score}/5</span>
    </div>
  ))}
</div>

{/* Recommendations */}
<ul className="space-y-1">
  {recommendations.map((rec, idx) => (
    <li key={idx} className="flex items-start gap-2">
      <span className="text-green-600">✓</span>
      <span>{rec}</span>
    </li>
  ))}
</ul>
```

#### Fix 2: SHAWorkspace/index.tsx

**Cambios**:
1. Detectar formato v2 por `scores?.harmony_index`
2. Mostrar índice de armonía en lugar de total/max_score
3. Renderizar nivel de armonía con color según `harmony_level`
4. Mostrar todas las Sefirot con mini barras de progreso
5. Listar top 3 recomendaciones
6. Mantener compatibilidad con v1

**Código corregido**:
```typescript
{/* Handle v2 format */}
{shaHarmonyResult.scores?.harmony_index !== undefined ? (
  <>
    <div>
      <p className="text-gray-500">Índice de Armonía</p>
      <p className="font-medium text-lg">
        {shaHarmonyResult.scores.harmony_index.toFixed(1)} / 5.0
      </p>
    </div>
    <div className="col-span-2">
      <p className="text-gray-500">Nivel de Armonía</p>
      <p className={`font-semibold ${
        shaHarmonyResult.scores.harmony_level === 'excellent' ? 'text-green-600' :
        shaHarmonyResult.scores.harmony_level === 'good' ? 'text-blue-600' :
        shaHarmonyResult.scores.harmony_level === 'moderate' ? 'text-yellow-600' :
        'text-orange-600'
      }`}>
        {shaHarmonyResult.scores.harmony_label}
      </p>
    </div>
    <div className="col-span-2">
      <p className="text-gray-500 mb-2">Distribución Sefirótica</p>
      <div className="space-y-1">
        {Object.entries(shaHarmonyResult.scores.sefirot_scores).map(([sefira, score]) => (
          <div key={sefira} className="flex items-center gap-2 text-xs">
            <span className="w-20 text-purple-700">{sefira}</span>
            <div className="flex-1 bg-purple-200 rounded-full h-1.5">
              <div className="bg-purple-600 h-1.5 rounded-full"
                   style={{ width: `${(Number(score) / 5) * 100}%` }} />
            </div>
            <span className="w-10 text-right text-purple-700">{score}/5</span>
          </div>
        ))}
      </div>
    </div>
  </>
) : /* v1 legacy format */ ...}
```

### Resultado

**Antes del fix**:
- ❌ Individual page: ✅ OK (tenía fix custom desde antes)
- ❌ General results: Mostraba "Unknown" y "7/50"
- ❌ Therapist workspace: Mostraba "N/A / 50"

**Después del fix**:
- ✅ Individual page: Sigue funcionando perfectamente
- ✅ General results: Modal con datos completos (harmony index, Sefirot, recomendaciones)
- ✅ Therapist workspace: Tarjeta verde con índice 2.8/5.0, nivel "moderada", Sefirot, recomendaciones

### Lecciones Aprendidas

1. **Múltiples puntos de renderizado**: Un test puede mostrarse en varias vistas (individual, lista, workspace), cada una con su propio componente

2. **Sincronización de schemas**: Cuando se actualiza el schema backend (v1→v2), TODOS los componentes frontend que renderizan ese test deben actualizarse

3. **Detección de versión**: Usar feature detection (`harmony_index !== undefined`) en lugar de solo `schema_version` para máxima compatibilidad

4. **Retrocompatibilidad**: Mantener rendering de v1 legacy para resultados históricos

5. **Componentes compartidos**: `ReadableResult` es usado por múltiples páginas → un fix allí beneficia a todos

### Checklist para Futuros Cambios de Schema

Cuando se actualice el schema de cualquier test:

- [ ] Actualizar backend executor (`backend/api/test_views.py`)
- [ ] Actualizar schema version (`v1` → `v2`)
- [ ] Identificar TODOS los componentes frontend que renderizan ese test:
  - [ ] Página individual (`/tests/<test-code>/result/page.tsx`)
  - [ ] Lista general de resultados (usa `ReadableResult`)
  - [ ] Workspace del terapeuta (si existe)
  - [ ] Dashboard personal (si aplica)
- [ ] Para cada componente:
  - [ ] Agregar detección de nueva versión
  - [ ] Renderizar nuevos campos
  - [ ] Mantener compatibilidad con versión anterior
  - [ ] Testear visualmente
- [ ] Commit cada componente por separado con mensaje descriptivo
- [ ] Documentar en este archivo

---

## Historial de Cambios

| Fecha | Test | Cambio | Commit | Autor |
|-------|------|--------|--------|-------|
| 2026-01-30 | sha_harmony | Migración de AUDIT legacy (v1) a Sefirotic balance (v2) | f05a1669 | Copilot + Luis Blanco |
| 2026-01-30 | sha_harmony | Fix ReadableResult para reconocer v2 (multi-view sync) | d97ad3ad | Copilot + Luis Blanco |
| 2026-01-30 | sha_harmony | Fix SHAWorkspace para mostrar resultados v2 del paciente | 52e0143e | Copilot + Luis Blanco |
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
