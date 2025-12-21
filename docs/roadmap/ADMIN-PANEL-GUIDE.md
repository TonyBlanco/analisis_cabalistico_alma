# 🎛️ Panel de Administración - Tony Blanco App

## 📋 Resumen General

Panel de administración web accesible desde Next.js que permite gestionar toda la plataforma **sin necesidad de acceder directamente a Django admin** cuando esté en producción (Render → Vercel).

---

## 🌐 URLs de Acceso

### **Desarrollo Local**
```
Frontend Admin:  http://127.0.0.1:3000/admin
Django Admin:    http://127.0.0.1:8000/admin
```

### **Producción (Futuro)**
```
Frontend Admin:  https://tudominio.vercel.app/admin
Django Admin:    https://tubackend.onrender.com/admin
```

---

## 👥 Control de Acceso

### **Requisitos para Acceder**
- ✅ Usuario autenticado con token válido
- ✅ `is_admin = True` o `is_staff = True` en el perfil de usuario
- ✅ Token almacenado en `localStorage` del navegador

### **Redirecciones Automáticas**
- Sin token → Redirige a `/login`
- No es admin → Redirige a `/dashboard/personal`
- Es admin → Acceso completo al panel

---

## 📊 Secciones del Panel

### **1️⃣ Resumen (Overview)**

**Estadísticas Visibles:**
- Total de usuarios registrados
- Cantidad de terapeutas
- Usuarios personales
- Total de fichas creadas
- Suscripciones activas
- Cursos publicados
- Inscripciones a cursos
- Ingresos por cursos

**Accesos Rápidos:**
- 🔧 Django Admin completo
- 🎓 Gestionar cursos LMS
- 📝 Tests modulares
- 📦 Servicios y bookings

---

### **2️⃣ Usuarios**

**Funcionalidades:**
- ✅ **Vista de tabla completa** con todos los usuarios
- ✅ **Búsqueda** por username, email o nombre
- ✅ **Filtros** por tipo (personal/therapist)
- ✅ **Exportar a CSV** para análisis externo
- ✅ **Activar membresía** manualmente a cualquier usuario
- ✅ **Otorgar acceso especial** a tests individuales
- ✅ **Eliminar usuarios** (excepto superadmin)

**Columnas de la Tabla:**
| Campo | Descripción |
|-------|-------------|
| Usuario | Nombre completo y username |
| Email | Correo electrónico |
| Tipo | Personal o Terapeuta (con badge) |
| Plan | free/personal/professional/premium |
| Estado | Activa/Inactiva (con badge) |
| Expira | Fecha de expiración de membresía |
| Acciones | Activar, otorgar test, eliminar |

**Acciones Disponibles:**

#### ✅ **Activar Membresía**
```
Botón: "✓ Activar"
Solicita:
  - Plan: personal/professional/premium
  - Duración: meses (1-12)
  
Efecto:
  - Activa suscripción inmediatamente
  - Establece fecha de expiración
  - Actualiza estado a "active"
```

#### 🎁 **Otorgar Test Especial**
```
Botón: "🎁 Test"
Solicita:
  - Código del test: complete-numerology, etc.
  - Usos especiales: número o ilimitado
  
Efecto:
  - Crea UserTestAccess con usos especiales
  - Usuario puede usar test sin límite de plan
```

#### 🗑️ **Eliminar Usuario**
```
Botón: "🗑️"
Confirma acción
Protege al superadmin (username: superty)
```

---

### **3️⃣ Cursos LMS**

**Vista de Estadísticas:**
- Cursos publicados
- Inscripciones totales
- Ingresos generados

**Enlaces Directos a Django Admin:**
- **Ver Cursos** → Lista completa con filtros y búsqueda
- **Crear Curso Nuevo** → Formulario completo con inlines
- **Ver Inscripciones** → Tracking de estudiantes
- **Ver Categorías** → Gestión de categorías de cursos
- **Nueva Categoría** → Crear categoría nueva

**Características del LMS:**
- ✅ Cursos con módulos y lecciones
- ✅ Videos (YouTube, Vimeo, Wistia, custom)
- ✅ Recursos descargables (PDFs, eBooks, etc.)
- ✅ Sistema de progreso automático
- ✅ Certificados al completar
- ✅ Precios en USD/EUR con descuentos
- ✅ Reseñas y calificaciones

---

### **4️⃣ Tests Modulares**

**Estadísticas:**
- Tests disponibles en el sistema
- Tests realizados por usuarios

**Enlaces de Administración:**
- **Gestionar Tests** → Configurar módulos, límites, precios
- **Ver Accesos** → UserTestAccess de todos los usuarios
- **Ver Resultados** → TestResult con datos y análisis

**Guía Rápida:**
- Códigos de tests: `basic-analysis`, `complete-numerology`, `couple-compatibility`
- Planes disponibles: `personal` (€29), `professional` (€49/mes), `premium` (€99/mes)

---

## 🔌 API Endpoints Usados

### **Backend Django (Render)**

#### **GET `/api/admin/stats/`**
```json
{
  "total_users": 50,
  "therapists": 12,
  "personal_users": 38,
  "total_fichas": 245,
  "active_subscriptions": 28,
  "total_courses": 5,
  "total_enrollments": 42,
  "total_course_revenue": 1850
}
```

#### **GET `/api/admin/users/`**
```json
[
  {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "full_name": "Juan Pérez",
    "user_type": "personal",
    "is_admin": false,
    "profile": {
      "subscription_plan": "personal",
      "membership_active": true,
      "membership_expires": "2025-01-15",
      "subscription_status": "active"
    }
  }
]
```

#### **POST `/api/payments/activate/`**
Activa membresía manualmente para un usuario.
```json
Request:
{
  "user_id": 5,
  "subscription_plan": "professional",
  "duration_months": 3
}

Response:
{
  "success": true,
  "message": "Membresía activada correctamente",
  "expires_at": "2025-03-09"
}
```

#### **POST `/api/tests/grant-access/`**
Otorga acceso especial a un test.
```json
Request:
{
  "user_id": 5,
  "test_code": "complete-numerology",
  "special_uses": 10
}

Response:
{
  "success": true,
  "message": "Acceso especial otorgado"
}
```

#### **DELETE `/api/admin/users/{id}/`**
Elimina un usuario (protegido para superadmin).

---

## 🔐 Seguridad

### **Verificación en Frontend**
```typescript
// Verifica token y permisos antes de mostrar contenido
const checkAuth = async () => {
  const token = getAuthToken();
  if (!token) {
    router.push('/login');
    return;
  }

  const response = await fetch(`${API_BASE_URL}/me/`, {
    headers: { 'Authorization': `Token ${token}` }
  });

  const userData = await response.json();
  if (!userData.is_admin) {
    router.push('/dashboard');
    return;
  }
  
  setIsAdmin(true);
};
```

### **Verificación en Backend**
```python
# En todas las vistas de admin
if not request.user.profile.is_admin:
    return Response(
        {'error': 'No tienes permisos de administrador'},
        status=status.HTTP_403_FORBIDDEN
    )
```

---

## 🚀 Flujo de Trabajo Típico

### **Caso 1: Activar Membresía para Usuario**
1. Admin accede a `http://127.0.0.1:3000/admin`
2. Va a pestaña "👥 Usuarios"
3. Busca al usuario por email o nombre
4. Click en botón "✓ Activar"
5. Ingresa plan (`professional`) y duración (`3` meses)
6. Sistema actualiza perfil automáticamente
7. Usuario recibe acceso inmediato

### **Caso 2: Crear Nuevo Curso**
1. Admin accede al panel en `/admin`
2. Va a pestaña "🎓 Cursos LMS"
3. Click en "Crear Curso Nuevo"
4. Se abre Django admin en nueva pestaña
5. Completa formulario del curso
6. Agrega módulos y lecciones (inlines)
7. Sube thumbnail y recursos
8. Publica curso → Visible en frontend

### **Caso 3: Otorgar Test Especial**
1. Admin va a "👥 Usuarios"
2. Encuentra al usuario
3. Click en "🎁 Test"
4. Ingresa código: `complete-numerology`
5. Ingresa usos: `5` (o vacío para ilimitado)
6. Usuario puede hacer test sin restricciones

---

## 📦 Exportación de Datos

### **Exportar Usuarios a CSV**
Genera archivo con columnas:
- ID
- Usuario
- Email
- Nombre Completo
- Tipo (personal/therapist)
- Suscripción (free/personal/professional/premium)

**Uso:**
1. Click en botón "📥 Exportar CSV"
2. Se descarga archivo `usuarios.csv`
3. Abrir en Excel/Google Sheets para análisis

---

## 🎨 Diseño Visual

### **Colores por Estado**
- 🟢 Verde: Activo, publicado, completado
- 🔴 Rojo: Inactivo, expirado, eliminado
- 🟡 Amarillo: Pendiente, trial, intermedio
- 🟣 Morado: Premium, avanzado
- 🔵 Azul: Personal, básico

### **Badges y Etiquetas**
- Tipo de usuario: Personal (azul) vs Terapeuta (verde)
- Estado de membresía: Activa (verde) vs Inactiva (rojo)
- Dificultad: Principiante/Intermedio/Avanzado/Experto
- Status de curso: Borrador/Publicado/Archivado

---

## 🔮 Integración con Producción

### **Cuando esté en Render + Vercel:**

1. **Backend en Render:**
   ```
   https://tubackend.onrender.com
   ```

2. **Frontend en Vercel:**
   ```
   https://tuapp.vercel.app
   ```

3. **Variable de Entorno en Vercel:**
   ```env
   NEXT_PUBLIC_API_URL=https://tubackend.onrender.com/api
   ```

4. **CORS en Backend:**
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://tuapp.vercel.app',
   ]
   ```

5. **Acceso al Admin:**
   ```
   - Frontend: https://tuapp.vercel.app/admin
   - Django: https://tubackend.onrender.com/admin
   ```

### **Ventajas del Sistema:**
✅ **No necesitas SSH** para administrar
✅ **Interface visual moderna** desde cualquier lugar
✅ **Enlaces directos** a Django cuando necesites funcionalidad avanzada
✅ **Estadísticas en tiempo real**
✅ **Gestión de usuarios centralizada**
✅ **Acciones rápidas** sin escribir código

---

## 📞 Soporte y Mantenimiento

### **Para agregar nuevas funcionalidades:**
1. Crear endpoint en Django (backend)
2. Agregar botón/sección en panel admin (frontend)
3. Conectar con `fetch` y token de autorización
4. Actualizar estadísticas si es necesario

### **Para debugging:**
- Revisar Console del navegador (F12)
- Verificar Network tab para ver respuestas de API
- Confirmar que token está en localStorage
- Verificar permisos en Django admin

---

## ✅ Checklist de Funcionalidades

- [x] Vista de estadísticas generales
- [x] Gestión completa de usuarios
- [x] Activación manual de membresías
- [x] Otorgar accesos especiales a tests
- [x] Eliminar usuarios con protección
- [x] Exportar usuarios a CSV
- [x] Enlaces directos a Django admin
- [x] Gestión de cursos LMS
- [x] Gestión de tests modulares
- [x] Control de acceso con verificación de permisos
- [x] Diseño responsive y moderno
- [x] Búsqueda y filtros en tabla de usuarios
- [ ] Edición de cursos desde panel (futuro)
- [ ] Dashboard de analytics avanzado (futuro)
- [ ] Notificaciones push (futuro)

---

**🎉 Sistema completo, profesional y listo para producción!**
