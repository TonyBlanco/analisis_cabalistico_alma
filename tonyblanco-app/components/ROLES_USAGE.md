# Guía de Uso de Roles y Protección de Rutas

## 📋 Resumen

El sistema de roles permite gestionar diferentes tipos de usuarios:
- **therapist**: Terapeutas profesionales
- **patient**: Pacientes con cuenta
- **personal**: Usuarios personales
- **visitor**: Visitantes no autenticados

## 🔐 Funciones de Autenticación

### Guardar datos de login

```typescript
import { saveLoginData } from '@/lib/auth';

// Después de un login exitoso
saveLoginData(token, 'therapist', 'username');
```

### Obtener datos del usuario

```typescript
import { getAuthToken, getUserRole, getUsername } from '@/lib/auth';

const token = getAuthToken();
const role = getUserRole(); // 'therapist' | 'patient' | 'personal' | 'visitor'
const username = getUsername();
```

### Verificar roles

```typescript
import { hasRole, isTherapist, isPatient } from '@/lib/auth';

if (isTherapist()) {
  // Usuario es terapeuta
}

if (isPatient()) {
  // Usuario es paciente
}

if (hasRole('personal')) {
  // Usuario es personal
}
```

## 🛡️ Componentes de Protección de Rutas

### TherapistRoute

Protege rutas que solo pueden acceder terapeutas.

**Ejemplo de uso:**

```typescript
// app/dashboard/therapist/page.tsx
'use client';

import TherapistRoute from '@/components/TherapistRoute';

export default function TherapistDashboard() {
  return (
    <TherapistRoute>
      <div>
        <h1>Dashboard del Terapeuta</h1>
        {/* Contenido solo visible para terapeutas */}
      </div>
    </TherapistRoute>
  );
}
```

### PatientRoute

Protege rutas que solo pueden acceder pacientes.

**Ejemplo de uso:**

```typescript
// app/dashboard/patient/page.tsx
'use client';

import PatientRoute from '@/components/PatientRoute';

export default function PatientDashboard() {
  return (
    <PatientRoute>
      <div>
        <h1>Dashboard del Paciente</h1>
        {/* Contenido solo visible para pacientes */}
      </div>
    </PatientRoute>
  );
}
```

## 🔄 Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. Backend retorna: `{ token, username, role }`
3. Frontend guarda en localStorage:
   - `authToken`: Token de autenticación
   - `userRole`: Rol del usuario
   - `username`: Nombre de usuario
4. Redirección según role:
   - `therapist` → `/dashboard/therapist`
   - `patient` → `/dashboard/patient`
   - `personal` → `/dashboard/personal`
   - Otros → `/`

## 📝 Ejemplo Completo de Login

```typescript
// app/login/page.tsx
import { saveLoginData, UserRole } from '@/lib/auth';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const res = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    // Manejar error
    return;
  }

  const data = await res.json();
  const token = data.token;
  const role = (data.role || 'visitor') as UserRole;
  const userUsername = data.username || username;

  // Guardar datos
  saveLoginData(token, role, userUsername);

  // Redirigir según role
  if (role === 'therapist') {
    router.replace('/dashboard/therapist');
  } else if (role === 'patient') {
    router.replace('/dashboard/patient');
  } else if (role === 'personal') {
    router.replace('/dashboard/personal');
  } else {
    router.replace('/');
  }
};
```

## 🚨 Manejo de Errores

Los componentes `TherapistRoute` y `PatientRoute` automáticamente:
- Redirigen a `/login` si el usuario no está autenticado
- Redirigen a `/login` si el usuario no tiene el rol correcto
- Muestran un spinner mientras verifican los permisos

## 🔧 Limpieza al Cerrar Sesión

```typescript
import { logout } from '@/lib/auth';

const handleLogout = () => {
  logout(); // Elimina token, role y username de localStorage
  router.push('/login');
};
```

## 📌 Notas Importantes

1. **localStorage**: Los datos se guardan en localStorage, por lo que persisten entre sesiones del navegador
2. **SSR**: Las funciones verifican `typeof window !== 'undefined'` para evitar errores en SSR
3. **Seguridad**: El rol en localStorage es solo para UX. La validación real debe hacerse en el backend
4. **Sincronización**: Si el rol cambia en el backend, el frontend debe actualizar localStorage

