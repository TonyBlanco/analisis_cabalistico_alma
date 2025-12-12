# Script to start Flask server for tests API
# This ensures the correct Python environment is used

Write-Host "🚀 Starting Flask Server (Tests API)..." -ForegroundColor Cyan
Write-Host "Using virtual environment: .venv" -ForegroundColor Yellow

# Navigate to root directory (where app_cabalistica.py is located)
Set-Location $PSScriptRoot

# Check if virtual environment exists
if (-not (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe")) {
    Write-Host "❌ Error: Virtual environment not found at .venv" -ForegroundColor Red
    Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv" -ForegroundColor White
    exit 1
}

# Check if Flask and pandas are installed
$flaskInstalled = $false
$pandasInstalled = $false
try {
    $null = & "$PSScriptRoot\.venv\Scripts\python.exe" -c "import flask" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $flaskInstalled = $true
    }
} catch {
    $flaskInstalled = $false
}

try {
    $null = & "$PSScriptRoot\.venv\Scripts\python.exe" -c "import pandas" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pandasInstalled = $true
    }
} catch {
    $pandasInstalled = $false
}

if (-not $flaskInstalled -or -not $pandasInstalled) {
    Write-Host "📦 Installing Flask and dependencies (including pandas)..." -ForegroundColor Yellow
    $flaskRequirements = Join-Path $PSScriptRoot "requirements-flask.txt"
    if (Test-Path $flaskRequirements) {
        & "$PSScriptRoot\.venv\Scripts\python.exe" -m pip install -r $flaskRequirements
    } else {
        & "$PSScriptRoot\.venv\Scripts\python.exe" -m pip install flask flask-cors pandas
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error installing Flask dependencies. Please install manually:" -ForegroundColor Red
        Write-Host "  .venv\Scripts\python.exe -m pip install flask flask-cors pandas" -ForegroundColor White
        exit 1
    }
    Write-Host "✅ Flask and dependencies installed successfully" -ForegroundColor Green
}

# Check if app_cabalistica.py exists
if (-not (Test-Path "$PSScriptRoot\app_cabalistica.py")) {
    Write-Host "❌ Error: app_cabalistica.py not found in root directory" -ForegroundColor Red
    exit 1
}

# Activate virtual environment and run server
Write-Host "✅ Virtual environment found" -ForegroundColor Green
Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Set PYTHONPATH to include backend directory so cabala_py can be found
$backendDir = Join-Path $PSScriptRoot "backend"
$env:PYTHONPATH = $backendDir
if ($env:PYTHONPATH -notmatch [regex]::Escape($PSScriptRoot)) {
    $env:PYTHONPATH = "$PSScriptRoot;$backendDir"
}

Write-Host "PYTHONPATH set to: $env:PYTHONPATH" -ForegroundColor DarkGray
Write-Host ""

# Run Flask server using the virtual environment Python
& "$PSScriptRoot\.venv\Scripts\python.exe" app_cabalistica.py

