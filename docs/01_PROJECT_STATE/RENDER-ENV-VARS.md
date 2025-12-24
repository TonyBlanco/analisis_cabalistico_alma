# Variables de Entorno REQUERIDAS en Render

## 🚨 CRÍTICO: Configurar en Render Dashboard

Ve a: **Render Dashboard → Tu Servicio → Environment**

### Variables OBLIGATORIAS:

```bash
# CORS - Permitir peticiones desde el frontend de Vercel
CORS_ALLOWED_ORIGINS=https://analisis-cabalistico-alma.vercel.app,https://analisis-cabalistico-alma-tonyblanco.vercel.app

# CSRF - Protección contra ataques
CSRF_TRUSTED_ORIGINS=https://analisis-cabalistico-alma.vercel.app,https://analisis-cabalistico-alma-tonyblanco.vercel.app

# Hosts permitidos
ALLOWED_HOSTS=analisis-cabalistico-alma.onrender.com,.onrender.com,localhost

# Contraseña por defecto para usuarios admin (se usa en migración 0013)
ADMIN_DEFAULT_PASSWORD=Admin2025!

# Secreto de Django (genera uno único)
SECRET_KEY=tu-secret-key-super-segura-aqui-cambiar

# Debug (SIEMPRE False en producción)
DEBUG=False

# Base de datos (Render la configura automáticamente)
DATABASE_URL=(se configura automática)
```

## 📋 Verificación Rápida

Para verificar que las variables están configuradas:

```bash
curl https://analisis-cabalistico-alma.onrender.com/api/
```

Si ves la respuesta JSON, el backend está vivo.

## 🔧 Después de agregar las variables:

1. **Guardar** las variables en Render
2. **Manual Deploy** para aplicar los cambios
3. Esperar 2-3 minutos
4. Probar registro desde: https://analisis-cabalistico-alma.vercel.app/register/therapist

## 🐛 Si sigue dando "Failed to fetch":

1. Abre F12 en el navegador
2. Ve a la pestaña **Console**
3. Busca errores de CORS (color rojo)
4. Si dice "CORS policy blocked", falta configurar CORS_ALLOWED_ORIGINS

## 📝 Notas:

- Las migraciones (incluida 0013 que crea usuarios admin) se ejecutan automáticamente en cada deploy
- Los usuarios admin (supertony, supportadmin, tony) se crearán con la contraseña de ADMIN_DEFAULT_PASSWORD
- Si ADMIN_DEFAULT_PASSWORD no está configurada, usa "Admin2025!" por defecto
