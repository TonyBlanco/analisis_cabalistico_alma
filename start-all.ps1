# Script to start both Backend and Frontend servers

Write-Host "🚀 Starting Full Application Stack..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new terminal
Write-Host "1️⃣  Starting Django Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-backend.ps1'"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new terminal
Write-Host "2️⃣  Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-frontend.ps1'"

Write-Host ""
Write-Host "✅ Both servers are starting in separate terminals!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend API at: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers, close both terminal windows or press Ctrl+C in each." -ForegroundColor Yellow
