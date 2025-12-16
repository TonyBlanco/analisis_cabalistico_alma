# Guía de Login Local

## Problema

Las bases de datos local (SQLite) y Render (PostgreSQL) son **completamente diferentes**. Los usuarios creados en Render no existen en tu base de datos local y viceversa.

## Solución Rápida

### Opción 1: Usar usuario admin local (ya creado)

Ya se ha creado un usuario admin para desarrollo local:

```
Username: admin
Password: admin123
```

Puedes usar estas credenciales para iniciar sesión localmente.

### Opción 2: Crear tu propio usuario local

Ejecuta el script interactivo:

```bash
cd backend
python setup_local_login.py
```

O crea un usuario directamente:

```bash
python manage.py createsuperuser
```

### Opción 3: Actualizar contraseña de usuario existente

Si ya tienes un usuario local pero no recuerdas la contraseña:

```bash
cd backend
python manage.py shell
```

Luego en el shell:

```python
from django.contrib.auth.models import User
user = User.objects.get(username='tu_usuario')
user.set_password('nueva_contraseña')
user.save()
exit()
```

## Usuarios Locales Disponibles

Para ver todos los usuarios en tu base de datos local:

```bash
cd backend
python manage.py shell -c "from django.contrib.auth.models import User; [print(f'{u.username} - {u.email} - Superuser: {u.is_superuser}') for u in User.objects.all()]"
```

## Scripts Disponibles

1. **`setup_local_login.py`** - Script interactivo para crear/actualizar usuarios
2. **`create_local_user.py`** - Script para crear usuarios desde línea de comandos
3. **`list_users.py`** - Lista todos los usuarios locales

## Nota Importante

⚠️ **Los usuarios locales NO se sincronizan con Render automáticamente**. 

Si necesitas usar las mismas credenciales en ambos entornos, debes:
1. Crear el usuario en Render (desde el panel de administración o registro)
2. Crear el mismo usuario localmente usando uno de los métodos arriba

## Resolución de Problemas

### "No puedo iniciar sesión localmente"

1. Verifica que el servidor Django esté corriendo:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Verifica que el usuario existe localmente (ver comando arriba)

3. Si el usuario no existe, créalo usando una de las opciones arriba

4. Si el usuario existe pero la contraseña no funciona, actualízala (Opción 3)

### "Quiero usar las mismas credenciales que en Render"

Debes crear el usuario manualmente en ambos lugares, ya que las bases de datos son independientes.












