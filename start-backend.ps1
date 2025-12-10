# Script to start Django backend server with virtual environment
# This ensures the correct Python environment is used

Write-Host "🚀 Starting Django Backend Server..." -ForegroundColor Cyan
Write-Host "Using virtual environment: .venv" -ForegroundColor Yellow

# Navigate to backend directory
Set-Location "$PSScriptRoot\backend"

# Check if virtual environment exists
if (-not (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe")) {
    Write-Host "❌ Error: Virtual environment not found at .venv" -ForegroundColor Red
    Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv" -ForegroundColor White
    exit 1
}

# Activate virtual environment and run server
Write-Host "✅ Virtual environment found" -ForegroundColor Green
Write-Host "Starting server on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run Django server using the virtual environment Python
# Ensure required packages are installed (only installs if Pillow missing)
try {
    & "$PSScriptRoot\.venv\Scripts\python.exe" -c "import PIL; print('Pillow OK')" | Out-Null
} catch {
    Write-Host "📦 Installing backend dependencies (Pillow)..." -ForegroundColor Yellow
    & "$PSScriptRoot\.venv\Scripts\python.exe" -m pip install -r "$PSScriptRoot\backend\requirements.txt"
}

# Run Django server using the virtual environment Python
& "$PSScriptRoot\.venv\Scripts\python.exe" manage.py runserver 8000
