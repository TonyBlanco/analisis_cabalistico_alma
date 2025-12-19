> ⚠️ DOCUMENTO HISTÓRICO / LEGACY  
> Este documento describe un sistema anterior de tests con membresías.  
> NO es aplicable al sistema clínico actual (ver AUDITORIA CABALA APP 12182025.md).

# Sistema de Tests Modulares

Sistema completo de tests cabalísticos modulares con control de acceso basado en membresía.

## 📋 Estructura del Sistema

### Modelos de Base de Datos

#### TestModule
Módulos de tests disponibles en la plataforma.

**Campos principales:**
- `code`: Código único del test (ej: 'basic-analysis')
- `name`: Nombre del test
- `description`: Descripción del test
- `test_type`: Tipo de test (basic, numerology, compatibility, etc.)
- `required_access_level`: Nivel mínimo requerido (free, personal, professional, premium)
- `uses_per_month`: Límite mensual de usos (null = ilimitado)
- `is_active`: Si el test está activo
- `available_for_therapists`: Si está disponible para terapeutas
- `available_for_personal`: Si está disponible para usuarios personales

#### UserTestAccess
Control de acceso y uso de tests por usuario.

**Campos principales:**
- `user`: Usuario
- `test_module`: Módulo de test
- `uses_count`: Total de usos
- `current_month_uses`: Usos en el mes actual
- `has_special_access`: Acceso especial otorgado
- `special_access_expires`: Fecha de expiración del acceso especial
- `special_access_uses`: Usos especiales disponibles

#### TestResult
Resultados guardados de tests realizados.

**Campos principales:**
- `user`: Usuario que realizó el test
- `test_module`: Módulo de test
- `input_data`: Datos ingresados (JSON)
- `result_data`: Resultados calculados (JSON)
- `client_name`: Nombre del cliente (para terapeutas)
- `notes`: Notas adicionales
- `is_favorite`: Si está marcado como favorito
- `is_archived`: Si está archivado

## 🎯 Niveles de Acceso

### Jerarquía de Acceso
1. **Free** (0) - Acceso gratuito limitado
2. **Personal** (1) - Plan personal €29
3. **Professional** (2) - Plan profesional €49
4. **Premium** (3) - Plan premium €99

### Tests Incluidos por Nivel

#### Free (Gratuito)
- ✅ Análisis Cabalístico Básico (ilimitado)

#### Personal (€29 único)
- ✅ Análisis Cabalístico Básico (ilimitado)
- ✅ Numerología Completa (10 usos/mes)
- ✅ Compatibilidad de Pareja (5 usos/mes)
- ✅ Orientación Profesional (5 usos/mes)

#### Professional (€49/mes) - Solo Terapeutas
- ✅ Todos los tests de Personal
- ✅ Camino Espiritual (ilimitado, solo terapeutas)
- ✅ Salud y Bienestar (ilimitado)
- ✅ Abundancia Financiera (3 usos/mes)

#### Premium (€99/mes)
- ✅ Todos los tests anteriores
- ✅ Relaciones Familiares (ilimitado)
- ✅ Propósito de Vida (ilimitado)
- ✅ Vidas Pasadas (2 usos/mes)

## 🔧 API Endpoints

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
Obtiene el detalle de un test específico.

**Parámetros:**
- `code`: Código del test

### POST /api/tests/execute/
Ejecuta un test y guarda el resultado.

**Body:**
```json
{
  "test_module_code": "basic-analysis",
  "input_data": {
    "name": "Juan Pérez",
    "birth_date": "1990-05-15"
  },
  "client_name": "Juan Pérez",
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
- `test_code`: Filtrar por código de test
- `favorites`: Mostrar solo favoritos (true/false)

### GET /api/tests/results/{id}/
Obtiene un resultado específico.

### PATCH /api/tests/results/{id}/
Actualiza un resultado (notas, favorito, etc.).

### DELETE /api/tests/results/{id}/
Elimina (archiva) un resultado.

### GET /api/tests/stats/
Obtiene estadísticas de uso de tests del usuario.

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

## 🎨 Componentes Frontend

### TestCard
Tarjeta visual para mostrar un test.

**Props:**
- `test`: TestModule
- `userLevel`: string (nivel de acceso del usuario)

**Características:**
- Muestra estado de bloqueo por nivel
- Indica límite mensual alcanzado
- Muestra badge de acceso especial
- Estadísticas de uso
- Botón de acción dinámico

### TestsPage
Página principal de tests (`/tests`).

**Características:**
- Lista todos los tests disponibles
- Filtrado automático por tipo de usuario
- Información de membresía
- Stats rápidas (disponibles, realizados, listos)

## 📝 Uso del Sistema

### 1. Inicializar Tests
```bash
cd backend
python initialize_tests.py
```

Este script crea los 10 tests iniciales:
1. Análisis Cabalístico Básico
2. Numerología Completa
3. Compatibilidad de Pareja
4. Orientación Profesional
5. Camino Espiritual
6. Salud y Bienestar
7. Abundancia Financiera
8. Relaciones Familiares
9. Propósito de Vida
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

## 🔐 Control de Acceso

### Verificación por Nivel
El sistema verifica automáticamente:
1. Si el test está activo
2. Si el usuario es del tipo correcto (therapist/personal)
3. Si el nivel de membresía es suficiente
4. Si no ha alcanzado el límite mensual
5. Si tiene acceso especial activo

### Acceso Especial
Los administradores pueden otorgar acceso especial que:
- Sobrepasa el nivel de membresía
- Tiene fecha de expiración opcional
- Tiene límite de usos opcional
- Se resetea automáticamente al expirar

## 📊 Administración Django

Todos los modelos están registrados en el admin de Django:

- `/admin/api/testmodule/` - Gestionar módulos de tests
- `/admin/api/usertestaccess/` - Ver y modificar accesos
- `/admin/api/testresult/` - Ver resultados guardados

## 🚀 Integración con Membresías

El sistema se integra automáticamente con el sistema de membresías:

1. **subscription_plan** del UserProfile determina el nivel de acceso
2. **membership_active** debe ser True para acceso completo
3. Tests gratuitos siempre disponibles
4. Límites mensuales se resetean automáticamente cada mes

## 📱 Frontend Routes

- `/tests` - Lista de tests disponibles
- `/tests/{code}` - Detalle y ejecución de test (próximamente)
- `/tests/results` - Historial de resultados (próximamente)

## ✅ Características Implementadas

- ✅ Modelos de base de datos completos
- ✅ Sistema de permisos por nivel
- ✅ Límites mensuales automáticos
- ✅ Acceso especial para usuarios
- ✅ API REST completa
- ✅ Componentes visuales (TestCard)
- ✅ Página de listado de tests
- ✅ Integración con dashboards
- ✅ Admin de Django configurado
- ✅ Script de inicialización

## 🔄 Próximas Mejoras

- [ ] Páginas de ejecución de tests individuales
- [ ] Implementar lógica de procesamiento real
- [ ] Página de historial de resultados
- [ ] Exportación de resultados a PDF
- [ ] Sistema de favoritos mejorado
- [ ] Búsqueda y filtros avanzados
- [ ] Notificaciones cuando se resetean límites
- [ ] Dashboard de estadísticas de uso
