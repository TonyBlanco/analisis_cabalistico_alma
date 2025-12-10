# Setup Admin User on Render - Multiple Solutions
Write-Host "🔧 Soluciones para crear usuario admin en Render" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Yellow

Write-Host "`n📋 SOLUCIÓN 1: One-off Job (Requiere upgrade a Starter Plan)" -ForegroundColor Green
Write-Host "-" * 50 -ForegroundColor Green
Write-Host "1. Ve a Render Dashboard > Tu servicio backend" -ForegroundColor White
Write-Host "2. Upgrade a Starter Plan (tiene One-off jobs)" -ForegroundColor White
Write-Host "3. Ve a 'Jobs' > 'Create One-off Job'" -ForegroundColor White
Write-Host "4. Comando: python create_admin_job.py" -ForegroundColor White
Write-Host "5. Ejecuta el job" -ForegroundColor White

Write-Host "`n📋 SOLUCIÓN 2: Endpoint Browser (Espera redeploy)" -ForegroundColor Green
Write-Host "-" * 50 -ForegroundColor Green
Write-Host "Espera 5-10 minutos a que Render redeploy automáticamente" -ForegroundColor White
Write-Host "Luego visita:" -ForegroundColor White
Write-Host "https://analisis-cabalistico-alma.onrender.com/api/setup-admin/" -ForegroundColor Yellow
Write-Host "Si funciona, verás JSON con confirmación" -ForegroundColor White

Write-Host "`n📋 SOLUCIÓN 3: Manual Database (Si tienes DB access)" -ForegroundColor Green
Write-Host "-" * 50 -ForegroundColor Green
Write-Host "Si puedes acceder a PostgreSQL directamente:" -ForegroundColor White
Write-Host "1. Conecta a la base de datos" -ForegroundColor White
Write-Host "2. Ejecuta estos comandos SQL:" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "INSERT INTO auth_user (username, email, first_name, last_name, is_staff, is_superuser, date_joined, is_active)" -ForegroundColor Gray
Write-Host "VALUES ('supertony', 'admin@analisis-cabalistico-alma.com', 'Super', 'Tony', true, true, NOW(), true);" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "INSERT INTO api_userprofile (user_id, user_type, full_name, is_admin, subscription_status, profession, max_patients)" -ForegroundColor Gray
Write-Host "VALUES ((SELECT id FROM auth_user WHERE username='supertony'), 'therapist', 'Super Tony Admin', true, 'active', 'Administrador del Sistema', 0);" -ForegroundColor Gray

Write-Host "`n📋 SOLUCIÓN 4: Local Script + DB Copy" -ForegroundColor Green
Write-Host "-" * 50 -ForegroundColor Green
Write-Host "1. Ejecuta localmente: python backend/create_production_admin.py" -ForegroundColor White
Write-Host "2. Copia los datos del usuario de local a producción" -ForegroundColor White
Write-Host "3. O exporta/importa la data necesaria" -ForegroundColor White

Write-Host "`n✅ DESPUÉS DE CREAR EL ADMIN:" -ForegroundColor Green
Write-Host "-" * 30 -ForegroundColor Green
Write-Host "Ve a: https://analisis-cabalistico-alma.onrender.com/admin/" -ForegroundColor Yellow
Write-Host "Usuario: supertony" -ForegroundColor White
Write-Host "Password: [el mismo que usas localmente]" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANTE: Elimina los endpoints temporales después de usarlos!" -ForegroundColor Red
Write-Host "   - Borra setup_admin_user de views.py" -ForegroundColor Red
Write-Host "   - Borra la URL setup-admin de urls.py" -ForegroundColor Red
Write-Host "   - Borra los scripts temporales" -ForegroundColor Red

Write-Host "`n" + "=" * 60 -ForegroundColor Yellow