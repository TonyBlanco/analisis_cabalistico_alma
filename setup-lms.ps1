<#
  Setup script for LMS
  - Ensures virtual environment exists
  - Installs backend requirements (incl. Pillow)
  - Runs makemigrations/migrate for courses app
#>

Write-Host "🎓 Preparando entorno para el sistema de cursos (LMS)..." -ForegroundColor Cyan

# Resolve paths
$root = $PSScriptRoot
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
$backendDir = Join-Path $root "backend"
$requirements = Join-Path $backendDir "requirements.txt"

# Ensure venv exists
if (-not (Test-Path $venvPython)) {
	Write-Host "🧪 Creando entorno virtual .venv..." -ForegroundColor Yellow
	python -m venv (Join-Path $root ".venv")
}

# Verify venv created
if (-not (Test-Path $venvPython)) {
	Write-Host "❌ No se pudo encontrar/crear el entorno virtual en .venv" -ForegroundColor Red
	Write-Host "   Por favor crea el entorno manualmente: python -m venv .venv" -ForegroundColor Yellow
	exit 1
}

Write-Host "✅ Entorno virtual listo: $venvPython" -ForegroundColor Green

# Install backend dependencies
if (Test-Path $requirements) {
	try {
		Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
		& $venvPython -m pip install -r $requirements
		Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
	} catch {
		Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
		throw
	}
} else {
	Write-Host "⚠️ No se encontró $requirements, se omite instalación de dependencias" -ForegroundColor Yellow
}

# Run migrations
Push-Location $backendDir
try {
	Write-Host "`n📝 Generando archivos de migración (courses)..." -ForegroundColor Yellow
	& $venvPython manage.py makemigrations courses

	Write-Host "`n✅ Aplicando migraciones a la base de datos..." -ForegroundColor Yellow
	& $venvPython manage.py migrate

	Write-Host "`n🎉 ¡Migraciones completadas!" -ForegroundColor Green
	Write-Host "📚 El sistema LMS está listo para usar" -ForegroundColor Cyan
	Write-Host "`n💡 Accede al admin en: http://127.0.0.1:8000/admin" -ForegroundColor White
} finally {
	Pop-Location
}
