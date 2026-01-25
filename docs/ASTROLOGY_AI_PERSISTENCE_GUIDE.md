# Sistema de Persistencia y Tooltips para Interpretaciones Astrológicas AI

**Fecha:** 26 de enero de 2026  
**Objetivo:** Guardar interpretaciones AI para evitar recálculos + agregar tooltips informativos para el terapeuta

---

## 📋 Resumen de Cambios

### Backend

#### 1. **Nuevo Modelo: `AstrologyAIInterpretation`**
- **Archivo:** `backend/api/models_astrology_ai.py`
- **Propósito:** Persistir interpretaciones AI generadas
- **Características:**
  - Guarda contenido de interpretación
  - Trackea si está compartida con el paciente
  - Permite notas del terapeuta
  - Soft delete (archivado)
  - Historial de versiones con `AstrologyAIInterpretationVersion`

#### 2. **Endpoints Actualizados**
- **Archivo:** `backend/api/astrology_ai_views.py`
- **Cambios:**
  - `AstrologyInterpretNatalView.post()`: Ahora guarda interpretaciones y usa caché
  - **Nuevos endpoints:**
    - `GET /api/astrology/interpretations/` - Lista interpretaciones guardadas
    - `GET /api/astrology/interpretations/<id>/` - Detalle de interpretación
    - `PUT /api/astrology/interpretations/<id>/` - Actualizar (compartir con paciente)
    - `DELETE /api/astrology/interpretations/<id>/` - Archivar interpretación

#### 3. **URLs Actualizadas**
- **Archivo:** `backend/api/urls.py`
- Agregadas rutas para gestión de interpretaciones

---

### Frontend

#### 1. **Nuevo Componente: `InfoTooltip`**
- **Archivo:** `tonyblanco-app/components/common/InfoTooltip.tsx`
- **Propósito:** Mostrar información contextual con (?)
- **Características:**
  - Posicionable (top, bottom, left, right)
  - Animaciones con Framer Motion
  - Ejemplos y descripciones
  - Hover y click

#### 2. **`AIInterpretationPanel` Mejorado**
- **Archivo:** `tonyblanco-app/components/AstrologyWorkspace/AIInterpretationPanel.tsx`
- **Nuevas características:**
  - **Tooltips** en cada capa (Natal, Tránsitos, Progresiones, Retorno Solar)
  - **Caché automático:** Usa interpretaciones guardadas para evitar recálculo
  - **Botón "Compartir":** Comparte interpretación con el consultante
  - **Botón "Historial":** Ver interpretaciones anteriores
  - **Indicador "Guardada":** Muestra si la interpretación está en DB
  - **Tooltips con información educativa** sobre cada tipo de carta

---

## 🎯 Beneficios

### Para el Terapeuta

1. **Guía Contextual**
   - Tooltips informativos explican qué significa cada capa
   - Ejemplos concretos de interpretación
   - Orientación para uso efectivo

2. **Eficiencia**
   - No re-generar interpretaciones ya calculadas
   - Acceso rápido a historial
   - Copia rápida al portapapeles

3. **Colaboración**
   - Compartir interpretaciones directamente con consultante
   - Notas privadas del terapeuta en cada interpretación
   - Trazabilidad de lo compartido

### Para el Sistema

1. **Rendimiento**
   - Reduce llamadas a API de Gemini
   - Caché inteligente por paciente y tipo
   - Menor costo de tokens AI

2. **Trazabilidad**
   - Historial completo de interpretaciones
   - Auditoría de cuándo se compartió con paciente
   - Versiones de interpretaciones

---

## 🔧 Uso

### Backend - Generar Interpretación con Caché

```python
# POST /api/astrology/interpret/natal/
{
  "patient_id": 4,
  "use_cached": true,          # Default: true - usa caché si existe
  "force_regenerate": false    # Default: false - fuerza regeneración
}

# Response (caché hit):
{
  "success": true,
  "interpretation": "...",
  "layer": "natal",
  "cached": true,              # Indica que vino de caché
  "created_at": "2026-01-26T10:30:00",
  "interpretation_id": 42
}
```

### Backend - Compartir con Paciente

```python
# PUT /api/astrology/interpretations/42/
{
  "share_with_patient": true,
  "therapist_notes": "Discutir en próxima sesión"  # Opcional
}
```

### Backend - Ver Historial

```python
# GET /api/astrology/interpretations/?patient_id=4&interpretation_type=natal&limit=5
{
  "success": true,
  "interpretations": [
    {
      "id": 42,
      "interpretation_type": "natal",
      "interpretation_text": "...",
      "word_count": 1200,
      "created_at": "2026-01-26T10:30:00",
      "is_shared_with_patient": true,
      "shared_at": "2026-01-26T11:00:00"
    }
  ],
  "count": 5
}
```

### Frontend - Tooltip Usage

```tsx
<InfoTooltip
  title="Carta Natal - Mapa del Alma"
  description="La Carta Natal es una fotografía del cielo..."
  examples={[
    'Sol en Casa 10: Vocación de liderazgo',
    'Luna en Cáncer: Necesidad de seguridad emocional'
  ]}
  position="top"
/>
```

---

## 📊 Estructura de Datos

### AstrologyAIInterpretation Model

```python
{
  "id": 42,
  "patient": <Patient>,
  "created_by": <User>,
  "interpretation_type": "natal" | "transits" | "progressions" | "solar_return",
  "interpretation_text": "...",  # Texto completo de la interpretación
  "input_context": {...},         # Contexto de entrada para auditoría
  "model_version": "gemini-2.5-flash",
  "token_count": 3500,
  "is_shared_with_patient": false,
  "shared_at": null,
  "therapist_notes": "",
  "is_archived": false,
  "created_at": "2026-01-26T10:30:00",
  "updated_at": "2026-01-26T10:30:00"
}
```

---

## 🔄 Flujo de Trabajo

1. **Terapeuta solicita interpretación**
   - Frontend llama a `/api/astrology/interpret/natal/` con `patient_id`
   - Backend verifica si existe interpretación guardada (`use_cached=true`)
   - Si existe → retorna desde DB (rápido, sin llamada a AI)
   - Si no existe → genera con Gemini y guarda en DB

2. **Terapeuta lee interpretación**
   - Tooltips (?) explican conceptos astrológicos
   - Puede copiar al portapapeles
   - Indicador "Guardada" muestra si está en DB

3. **Terapeuta comparte con consultante**
   - Click en "Compartir"
   - Actualiza campo `is_shared_with_patient=true`
   - Registra `shared_at` timestamp
   - TODO: Consultante ve en su espacio personal

4. **Terapeuta consulta historial**
   - Click en "Historial"
   - Ve últimas 5 interpretaciones del mismo tipo
   - TODO: Modal con lista completa

---

## ⚙️ Migración Pendiente

```bash
# Generar migración
cd backend
python manage.py makemigrations

# Aplicar migración
python manage.py migrate
```

---

## 🚀 Próximos Pasos

### Backend
- [ ] Generar y aplicar migración de `AstrologyAIInterpretation`
- [ ] Actualizar otros endpoints (transits, progressions, solar_return) con caché
- [ ] Endpoint para consultante ver interpretaciones compartidas
- [ ] Limpieza automática de interpretaciones antiguas (60+ días)

### Frontend
- [ ] Modal de historial completo con timeline
- [ ] Confirmación al compartir con consultante
- [ ] Notificaciones toast para acciones (guardado, compartido, etc.)
- [ ] Vista de consultante para ver interpretaciones compartidas
- [ ] Indicador visual en sidebar cuando hay interpretaciones nuevas

### Tooltips Adicionales
- [ ] Agregar tooltips en otros componentes del workspace
- [ ] Tooltips en aspectos planetarios
- [ ] Tooltips en casas astrológicas
- [ ] Glosario rápido de términos

---

## 📚 Referencias

- **Modelo AI**: `docs/AI_INTEGRATION_GUIDE.md`
- **Arquitectura Astrología**: `backend/api/models_astrology.py`
- **Componentes UI**: `tonyblanco-app/components/AstrologyWorkspace/`

---

**Última actualización:** 26 de enero de 2026  
**Autor:** Sistema de IA - Copilot
