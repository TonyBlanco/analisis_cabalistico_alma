# Script to install Flask and dependencies in the virtual environment

Write-Host "📦 Installing Flask and dependencies..." -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
$venvPython = Join-Path $root ".venv\Scripts\python.exe"

# Check if virtual environment exists
if (-not (Test-Path $venvPython)) {
    Write-Host "❌ Error: Virtual environment not found at .venv" -ForegroundColor Red
    Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv" -ForegroundColor White
    exit 1
}

# Install Flask dependencies
$flaskRequirements = Join-Path $root "requirements-flask.txt"
if (Test-Path $flaskRequirements) {
    Write-Host "Installing from requirements-flask.txt..." -ForegroundColor Yellow
    & $venvPython -m pip install -r $flaskRequirements
} else {
    Write-Host "Installing Flask, flask-cors, and pandas..." -ForegroundColor Yellow
    & $venvPython -m pip install flask flask-cors pandas
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Flask installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  .\start-flask.ps1" -ForegroundColor White
    Write-Host "  or" -ForegroundColor Cyan
    Write-Host "  .\start-all.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error installing Flask" -ForegroundColor Red
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  .venv\Scripts\python.exe -m pip install flask flask-cors" -ForegroundColor White
    exit 1
}

