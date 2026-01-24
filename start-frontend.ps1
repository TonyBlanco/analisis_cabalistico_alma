# Script to start Next.js frontend server
[CmdletBinding()]
param (
    [switch]$Clean
)

Write-Host "🚀 Starting Next.js Frontend Server..." -ForegroundColor Cyan

# Ensure correct Node.js version for tonyblanco-app
# next@16.0.7 requiere Node >=20.9.0, por eso fijamos esta versión.
try {
    Write-Host "ℹ️  Selecting Node 20.9.0 via nvm (requerido por next@16.0.7)..." -ForegroundColor Yellow
    nvm use 20.9.0 | Out-Null
} catch {
    Write-Host "⚠️  No se pudo ejecutar 'nvm use 20.9.0'. Asegúrate de tener Node 20.9 activo antes de usar este script." -ForegroundColor Red
}

# Navigate to frontend directory
Set-Location "$PSScriptRoot\tonyblanco-app"

if ($Clean) {
    Write-Host "🧹 Performing a clean start..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Write-Host "Removing node_modules..."
        Remove-Item -Recurse -Force node_modules
    }
    if (Test-Path ".next") {
        Write-Host "Removing .next directory..."
        Remove-Item -Recurse -Force .next
    }
    if (Test-Path "package-lock.json") {
        Write-Host "Removing package-lock.json..."
        Remove-Item -Force package-lock.json
    }
    Write-Host "Clearing npm cache..."
    npm cache clean --force
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Starting server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run Next.js dev server
npm run dev
