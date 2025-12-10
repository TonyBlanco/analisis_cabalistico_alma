# Script para configurar el admin en producción (Render)
Write-Host "🔧 Configurando administrador en producción..." -ForegroundColor Cyan

Write-Host "📋 Pasos a seguir en Render.com:" -ForegroundColor Yellow
Write-Host "1. Ve a tu dashboard de Render" -ForegroundColor White
Write-Host "2. Selecciona tu servicio web (backend)" -ForegroundColor White
Write-Host "3. Ve a 'Shell' en el menú lateral" -ForegroundColor White
Write-Host "4. Ejecuta los siguientes comandos:" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "🔵 Comando 1 - Crear admin:" -ForegroundColor Green
Write-Host "python create_production_admin.py" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "🔵 Comando 2 - Dar acceso a tests (opcional):" -ForegroundColor Green
Write-Host "python grant_all_access.py supertony" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "🔵 Comando 3 - Verificar usuario:" -ForegroundColor Green
Write-Host "python manage.py shell -c ""from django.contrib.auth.models import User; u = User.objects.get(username='supertony'); print(f'Username: {u.username}, Superuser: {u.is_superuser}, Staff: {u.is_staff}')""" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "✅ Después de ejecutar estos comandos, podrás acceder a:" -ForegroundColor Green
Write-Host "https://analisis-cabalistico-alma.onrender.com/admin/" -ForegroundColor White
Write-Host "Usuario: supertony" -ForegroundColor White
Write-Host "Password: [la misma que usas localmente]" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "💡 Nota: Asegúrate de que el archivo create_production_admin.py esté en el repositorio" -ForegroundColor Yellow