# Script to start Next.js frontend server

Write-Host "🚀 Starting Next.js Frontend Server..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location "$PSScriptRoot\tonyblanco-app"

# Check if node_modules exists
if (-not (Test-Path "$PSScriptRoot\tonyblanco-app\node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Starting server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run Next.js dev server
npm run dev
