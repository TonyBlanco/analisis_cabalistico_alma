# PLAN MAESTRO: Motor Astrológico Profesional

**Estado**: ✅ IMPLEMENTACIÓN COMPLETA (Backend + Frontend)  
**Fecha**: 2026-01-26  
**Autor**: AGENTE_ARQ (Arquitectura y Gobernanza)

---

## 📊 Estado de Implementación

### ✅ IMPLEMENTADO Y FUNCIONAL (100%)

| Motor | Archivo | API | Estado |
|-------|---------|-----|--------|
| **Carta Natal** | `natal_chart_engine.py` | `/natal-chart/` | ✅ Swiss Ephemeris real |
| **Posiciones Planetarias** | `planets.py` | interno | ✅ 13 cuerpos celestes |
| **Casas Astrológicas** | `houses.py` | interno | ✅ 10 sistemas soportados |
| **Aspectos** | `aspects.py` | interno | ✅ Mayores + menores |
| **Arco Solar** | `solar_arc.py` | `/solar-arc/` | ✅ Direcciones completas |
| **Retorno Lunar** | `lunar_return.py` | `/lunar-return/` | ✅ Búsqueda iterativa |
| **Composite Chart** | `composite_chart.py` | `/composite-chart/` | ✅ Puntos medios |
| **Davison Chart** | `davison_chart.py` | `/davison-chart/` | ✅ Momento/lugar medio |
| **Tránsitos** | `transits.py` | `/transits/` | ✅ FASE 1 COMPLETA |
| **Progresiones Secundarias** | `progressions.py` | `/progressions/` | ✅ FASE 2 COMPLETA |
| **Retorno Solar** | `solar_return.py` | `/solar-return/` | ✅ FASE 3 COMPLETA |
| **Sinastría** | `synastry.py` | `/synastry/` | ✅ FASE 4 COMPLETA |
| **Cartas Armónicas** | `harmonics.py` | `/harmonics/` | ✅ FASE 5 COMPLETA |
| **Estrellas Fijas** | `fixed_stars.py` | `/fixed-stars/` | ✅ FASE 6 COMPLETA |
| **Relocación** | `relocation.py` | `/relocation/` | ✅ FASE 7 COMPLETA |
| **Partes Árabes** | `arabic_parts.py` | `/arabic-parts/` | ✅ FASE 8 COMPLETA |

### ✅ FRONTEND INTEGRADO

| Componente | Archivo | Estado |
|------------|---------|--------|
| **AdvancedTechniquesPanel** | `AdvancedTechniquesPanel.tsx` | ✅ COMPLETO |
| **Integración en AstrologyVisualTab** | `AstrologyVisualTab.tsx` | ✅ COMPLETO |

---

## 🎯 COMMITS DE IMPLEMENTACIÓN

| Fase | Commit | Descripción |
|------|--------|-------------|
| FASE 1 | `23a5e0ea` | feat(astrology): add Transits Engine with Swiss Ephemeris |
| FASE 2 | `7e4298ae` | feat(astrology): add Secondary Progressions Engine |
| FASE 3 | `1b2f145c` | feat(astrology): add Solar Return Engine |
| FASE 4 | `8bf01a19` | feat(astrology): add Synastry Engine for relationship comparison |
| FASE 5 | `58b7707a` | feat(astrology): add Harmonic Charts Engine (H4, H5, H7, H9, H12) |
| FASE 6 | `12f52dfd` | feat(astrology): add Fixed Stars Engine with 55 stars catalog |
| FASE 7 | `6916c153` | feat(astrology): add Relocation/Astrocartography Engine |
| FASE 8 | `5a33c028` | feat(astrology): add Arabic Parts (Lots) Engine with 22 traditional parts |
| FRONTEND | `ca60cac4` | feat(frontend): add AdvancedTechniquesPanel with all 8 techniques |

---

## 🏗️ Detalles de Implementación

### FASE 1: Tránsitos (transits.py + API) ✅
**Estado**: COMPLETO

**Descripción Técnica**:
- Calcular posiciones planetarias para fecha actual/objetivo
- Comparar con posiciones natales
- Detectar aspectos tránsito-natal (conjunción, oposición, etc.)
- Calcular ingreso a casas natales

**API**:
```
GET /api/astrology/patients/{id}/transits/?target_date=YYYY-MM-DD
```

**Entregables**:
- `backend/astrology/engine/transits.py`
- Endpoint en `views.py`
- URL en `urls.py`

---

### FASE 2: Progresiones Secundarias (progressions.py + API)
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 200 líneas de código

**Descripción Técnica**:
- Técnica "día por año" (1 día de movimiento = 1 año de vida)
- Calcular día progresado: natal_jd + (age_years)
- Calcular posiciones progresadas para todos los planetas
- Calcular ASC/MC progresados usando arco solar del Sol

**Fórmula**:
```python
progressed_jd = natal_jd + (target_year - birth_year)
```

**API**:
```
GET /api/astrology/patients/{id}/progressions/?target_date=YYYY-MM-DD
```

---

### FASE 3: Retorno Solar (solar_return.py + API)
**Prioridad**: 🔴 CRÍTICO  
**Estimación**: 180 líneas de código

**Descripción Técnica**:
- Buscar momento exacto cuando Sol vuelve a longitud natal
- Algoritmo de búsqueda iterativa (similar a Lunar Return)
- Calcular carta completa para ese momento
- Opción de calcular para ubicación actual o natal

**API**:
```
GET /api/astrology/patients/{id}/solar-return/?target_year=YYYY&location=current|natal
```

---

### FASE 4: Sinastría (synastry.py + API)
**Prioridad**: 🟡 ALTA  
**Estimación**: 180 líneas de código

**Descripción Técnica**:
- Comparar dos cartas natales sin fusionarlas
- Calcular aspectos entre planetas de carta A vs carta B
- Análisis de planetas de A en casas de B y viceversa
- Score de compatibilidad basado en aspectos

**API**:
```
POST /api/astrology/patients/{id}/synastry/
Body: { person2_birth_date, person2_birth_time, person2_lat, person2_lon }
```

---

### FASE 5: Cartas Armónicas (harmonics.py + API)
**Prioridad**: 🟢 MEDIA  
**Estimación**: 120 líneas de código

**Descripción Técnica**:
- Multiplicar todas las posiciones por el número armónico
- Armónicos principales: 4 (cuadraturas), 5 (creatividad), 7 (inspiración), 9 (maestría)
- Normalizar resultado a 0-360°

**Fórmula**:
```python
harmonic_position = (natal_position * harmonic_number) % 360
```

**API**:
```
GET /api/astrology/patients/{id}/harmonics/?harmonic=4
```

---

### FASE 6: Estrellas Fijas (fixed_stars.py + API)
**Prioridad**: 🟢 MEDIA  
**Estimación**: 200 líneas de código

**Descripción Técnica**:
- Catálogo de ~50 estrellas fijas principales (Aldebaran, Regulus, Spica, etc.)
- Calcular posición para fecha (corrección por precesión)
- Detectar conjunciones con planetas natales (orbe ≤1°)

**Catálogo Principal**:
- Estrellas Reales (Aldebaran, Regulus, Antares, Fomalhaut)
- Estrellas Behenias (15 estrellas de tradición medieval)
- Nodos galácticos

**API**:
```
GET /api/astrology/patients/{id}/fixed-stars/
```

---

### FASE 7: Relocación (relocation.py + API)
**Prioridad**: 🟡 ALTA  
**Estimación**: 80 líneas de código

**Descripción Técnica**:
- Mantener posiciones planetarias natales
- Recalcular casas para nueva ubicación geográfica
- Útil para análisis de mudanzas/viajes

**API**:
```
POST /api/astrology/patients/{id}/relocation/
Body: { new_latitude, new_longitude, city_name }
```

---

### FASE 8: Puntos Árabes (arabic_parts.py + API)
**Prioridad**: 🟢 MEDIA  
**Estimación**: 100 líneas de código

**Descripción Técnica**:
- Fórmulas tradicionales para puntos sensibles
- Rueda de la Fortuna: ASC + Luna - Sol
- Punto del Espíritu: ASC + Sol - Luna
- ~20 puntos árabes principales

**API**:
```
GET /api/astrology/patients/{id}/arabic-parts/
```

---

## 🔒 Restricciones de Gobernanza

- ❌ NO modificar motores existentes que funcionan
- ❌ NO cambiar estructura de domain objects
- ❌ NO alterar URLs existentes
- ✅ Usar Swiss Ephemeris para todos los cálculos
- ✅ Seguir patrones de código existentes
- ✅ Commit después de cada fase funcional
- ✅ Test de build antes de cada commit

---

## 📁 Estructura de Archivos a Crear

```
backend/astrology/engine/
├── transits.py          # FASE 1
├── progressions.py      # FASE 2
├── solar_return.py      # FASE 3
├── synastry.py          # FASE 4
├── harmonics.py         # FASE 5
├── fixed_stars.py       # FASE 6
├── relocation.py        # FASE 7
└── arabic_parts.py      # FASE 8
```

---

## ✅ Criterios de Aceptación por Fase

1. **Motor funciona** con Swiss Ephemeris real
2. **API endpoint** responde correctamente
3. **Build pasa** sin errores
4. **Commit** con mensaje descriptivo
5. **Documentación** actualizada

---

## 🚀 Orden de Ejecución

```
FASE 1 → commit → test → 
FASE 2 → commit → test → 
FASE 3 → commit → test → 
FASE 4 → commit → test → 
FASE 5 → commit → test → 
FASE 6 → commit → test → 
FASE 7 → commit → test → 
FASE 8 → commit → test → 
DOCUMENTACIÓN FINAL
```

---

**FIN DEL PLAN — Proceder con CODE para implementación**
