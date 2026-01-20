---
**LEGACY STATUS:** INFORMATIVO (HISTÓRICO)  
**SUPERSEDED BY:** `docs/00_SOURCE_OF_TRUTH/legacy_tests_runtime_report_2026-01-10.md`  
**REASON:** Documento histórico de sistema de tests. Runtime reports y catálogos actuales superseden este contenido.  
**EFFECTIVE UNTIL:** 2026-01-20  
**ARCHIVED BY:** Arquitectura / Gobernanza  
**DATE ARCHIVED:** 2026-01-20  

**Contexto histórico:**
Este documento describía el sistema de tests modulares legacy antes de la auditoría y reconciliación de 2026-01-10. Los datos actuales de runtime están en:
- `docs/00_SOURCE_OF_TRUTH/runtime_testmodule_dump.csv`
- `docs/00_SOURCE_OF_TRUTH/runtime_analysis_kinds.csv`
- `docs/00_SOURCE_OF_TRUTH/legacy_tests_runtime_report_2026-01-10.md`

**Referencia:** Ver `docs/00_SOURCE_OF_TRUTH/` para datos actuales de runtime.
---

> ⚠️ DOCUMENTO HISTÓRICO / LEGACY  
> Este documento describe un sistema anterior de tests con membresías.  
> NO es aplicable al sistema clínico actual (ver AUDITORIA CABALA APP 12182025.md).

# Sistema de Tests Modulares

Sistema completo de tests cabal├¡sticos modulares con control de acceso basado en membres├¡a.

## ≡ƒôï Estructura del Sistema

### Modelos de Base de Datos

#### TestModule
M├│dulos de tests disponibles en la plataforma.

**Campos principales:**
- `code`: C├│digo ├║nico del test (ej: 'basic-analysis')
- `name`: Nombre del test
- `description`: Descripci├│n del test
- `test_type`: Tipo de test (basic, numerology, compatibility, etc.)
- `required_access_level`: Nivel m├¡nimo requerido (free, personal, professional, premium)
- `uses_per_month`: L├¡mite mensual de usos (null = ilimitado)
- `is_active`: Si el test est├í activo
- `available_for_therapists`: Si est├í disponible para terapeutas
- `available_for_personal`: Si est├í disponible para usuarios personales

#### UserTestAccess
Control de acceso y uso de tests por usuario.

**Campos principales:**
- `user`: Usuario
- `test_module`: M├│dulo de test
- `uses_count`: Total de usos
- `current_month_uses`: Usos en el mes actual
- `has_special_access`: Acceso especial otorgado
- `special_access_expires`: Fecha de expiraci├│n del acceso especial
- `special_access_uses`: Usos especiales disponibles

#### TestResult
Resultados guardados de tests realizados.

**Campos principales:**
- `user`: Usuario que realiz├│ el test
- `test_module`: M├│dulo de test
- `input_data`: Datos ingresados (JSON)
- `result_data`: Resultados calculados (JSON)
- `client_name`: Nombre del cliente (para terapeutas)
- `notes`: Notas adicionales
- `is_favorite`: Si est├í marcado como favorito
- `is_archived`: Si est├í archivado

## ≡ƒÄ» Niveles de Acceso

### Jerarqu├¡a de Acceso
1. **Free** (0) - Acceso gratuito limitado
2. **Personal** (1) - Plan personal Γé¼29
3. **Professional** (2) - Plan profesional Γé¼49
4. **Premium** (3) - Plan premium Γé¼99

### Tests Incluidos por Nivel

#### Free (Gratuito)
- Γ£à An├ílisis Cabal├¡stico B├ísico (ilimitado)

#### Personal (Γé¼29 ├║nico)
- Γ£à An├ílisis Cabal├¡stico B├ísico (ilimitado)
- Γ£à Numerolog├¡a Completa (10 usos/mes)
- Γ£à Compatibilidad de Pareja (5 usos/mes)
- Γ£à Orientaci├│n Profesional (5 usos/mes)

#### Professional (Γé¼49/mes) - Solo Terapeutas
- Γ£à Todos los tests de Personal
- Γ£à Camino Espiritual (ilimitado, solo terapeutas)
- Γ£à Salud y Bienestar (ilimitado)
- Γ£à Abundancia Financiera (3 usos/mes)

#### Premium (Γé¼99/mes)
- Γ£à Todos los tests anteriores
- Γ£à Relaciones Familiares (ilimitado)
- Γ£à Prop├│sito de Vida (ilimitado)
- Γ£à Vidas Pasadas (2 usos/mes)

## ≡ƒöº API Endpoints

### GET /api/tests/
Lista todos los tests disponibles para el usuario actual.

**Respuesta:**
```json
{
  "tests": [...],
  "user_type": "personal",
  "subscription_plan": "personal",
  "membership_active": true
}
```

### GET /api/tests/{code}/
Obtiene el detalle de un test espec├¡fico.

**Par├ímetros:**
- `code`: C├│digo del test

### POST /api/tests/execute/
Ejecuta un test y guarda el resultado.

**Body:**
```json
{
  "test_module_code": "basic-analysis",
  "input_data": {
    "name": "Juan P├⌐rez",
    "birth_date": "1990-05-15"
  },
  "client_name": "Juan P├⌐rez",
  "client_birth_date": "1990-05-15",
  "save_result": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "result": {...},
  "uses_remaining": 9,
  "result_id": 123
}
```

### GET /api/tests/results/
Lista todos los resultados guardados del usuario.

**Query params:**
- `test_code`: Filtrar por c├│digo de test
- `favorites`: Mostrar solo favoritos (true/false)

### GET /api/tests/results/{id}/
Obtiene un resultado espec├¡fico.

### PATCH /api/tests/results/{id}/
Actualiza un resultado (notas, favorito, etc.).

### DELETE /api/tests/results/{id}/
Elimina (archiva) un resultado.

### GET /api/tests/stats/
Obtiene estad├¡sticas de uso de tests del usuario.

### POST /api/tests/grant-access/
Otorga acceso especial a un test (solo admin).

**Body:**
```json
{
  "user_id": 123,
  "test_code": "premium-test",
  "special_uses": 5,
  "expires_at": "2024-12-31T23:59:59"
}
```

## ≡ƒÄ¿ Componentes Frontend

### TestCard
Tarjeta visual para mostrar un test.

**Props:**
- `test`: TestModule
- `userLevel`: string (nivel de acceso del usuario)

**Caracter├¡sticas:**
- Muestra estado de bloqueo por nivel
- Indica l├¡mite mensual alcanzado
- Muestra badge de acceso especial
- Estad├¡sticas de uso
- Bot├│n de acci├│n din├ímico

### TestsPage
P├ígina principal de tests (`/tests`).

**Caracter├¡sticas:**
- Lista todos los tests disponibles
- Filtrado autom├ítico por tipo de usuario
- Informaci├│n de membres├¡a
- Stats r├ípidas (disponibles, realizados, listos)

## ≡ƒô¥ Uso del Sistema

### 1. Inicializar Tests
```bash
cd backend
python initialize_tests.py
```

Este script crea los 10 tests iniciales:
1. An├ílisis Cabal├¡stico B├ísico
2. Numerolog├¡a Completa
3. Compatibilidad de Pareja
4. Orientaci├│n Profesional
5. Camino Espiritual
6. Salud y Bienestar
7. Abundancia Financiera
8. Relaciones Familiares
9. Prop├│sito de Vida
10. Vidas Pasadas

### 2. Verificar Acceso de Usuario
```python
test = TestModule.objects.get(code='basic-analysis')
can_access = test.is_available_for_user(user)
```

### 3. Registrar Uso de Test
```python
access = UserTestAccess.objects.get(user=user, test_module=test)
if access.can_use_test():
    # Ejecutar test
    access.record_use()
```

### 4. Otorgar Acceso Especial (Admin)
```python
access, created = UserTestAccess.objects.get_or_create(
    user=user,
    test_module=test
)
access.has_special_access = True
access.special_access_uses = 10  # 10 usos especiales
access.save()
```

## ≡ƒöÉ Control de Acceso

### Verificaci├│n por Nivel
El sistema verifica autom├íticamente:
1. Si el test est├í activo
2. Si el usuario es del tipo correcto (therapist/personal)
3. Si el nivel de membres├¡a es suficiente
4. Si no ha alcanzado el l├¡mite mensual
5. Si tiene acceso especial activo

### Acceso Especial
Los administradores pueden otorgar acceso especial que:
- Sobrepasa el nivel de membres├¡a
- Tiene fecha de expiraci├│n opcional
- Tiene l├¡mite de usos opcional
- Se resetea autom├íticamente al expirar

## ≡ƒôè Administraci├│n Django

Todos los modelos est├ín registrados en el admin de Django:

- `/admin/api/testmodule/` - Gestionar m├│dulos de tests
- `/admin/api/usertestaccess/` - Ver y modificar accesos
- `/admin/api/testresult/` - Ver resultados guardados

## ≡ƒÜÇ Integraci├│n con Membres├¡as

El sistema se integra autom├íticamente con el sistema de membres├¡as:

1. **subscription_plan** del UserProfile determina el nivel de acceso
2. **membership_active** debe ser True para acceso completo
3. Tests gratuitos siempre disponibles
4. L├¡mites mensuales se resetean autom├íticamente cada mes

## ≡ƒô▒ Frontend Routes

- `/tests` - Lista de tests disponibles
- `/tests/{code}` - Detalle y ejecuci├│n de test (pr├│ximamente)
- `/tests/results` - Historial de resultados (pr├│ximamente)

## Γ£à Caracter├¡sticas Implementadas

- Γ£à Modelos de base de datos completos
- Γ£à Sistema de permisos por nivel
- Γ£à L├¡mites mensuales autom├íticos
- Γ£à Acceso especial para usuarios
- Γ£à API REST completa
- Γ£à Componentes visuales (TestCard)
- Γ£à P├ígina de listado de tests
- Γ£à Integraci├│n con dashboards
- Γ£à Admin de Django configurado
- Γ£à Script de inicializaci├│n

## ≡ƒöä Pr├│ximas Mejoras

- [ ] P├íginas de ejecuci├│n de tests individuales
- [ ] Implementar l├│gica de procesamiento real
- [ ] P├ígina de historial de resultados
- [ ] Exportaci├│n de resultados a PDF
- [ ] Sistema de favoritos mejorado
- [ ] B├║squeda y filtros avanzados
- [ ] Notificaciones cuando se resetean l├¡mites
- [ ] Dashboard de estad├¡sticas de uso
