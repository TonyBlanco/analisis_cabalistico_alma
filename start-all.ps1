param(
		[switch]$OpenBrowser
)

<#
  Start all servers: Django Backend, Flask API, and Next.js Frontend
  - Ensures .venv exists and has deps
  - Starts Django backend (port 8000), waits until reachable
  - Starts Flask API (port 5000), waits until reachable
  - Starts frontend afterwards
#>

Write-Host "🚀 Starting Full Application Stack..." -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
$backendDir = Join-Path $root "backend"
$requirements = Join-Path $backendDir "requirements.txt"

# 0) Ensure virtual environment exists (create if missing)
if (-not (Test-Path $venvPython)) {
	Write-Host "🧪 Creating virtual environment (.venv)..." -ForegroundColor Yellow
	python -m venv (Join-Path $root ".venv")
}

if (-not (Test-Path $venvPython)) {
	Write-Host "❌ Could not create/find .venv. Aborting." -ForegroundColor Red
	exit 1
}

# 1) Ensure backend dependencies (only if Pillow missing)
try {
	& $venvPython -c "import PIL" | Out-Null
} catch {
	if (Test-Path $requirements) {
		Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
		& $venvPython -m pip install -r $requirements
	}
}

# 2) Ensure Flask and pandas are installed
$flaskInstalled = $false
$pandasInstalled = $false
try {
	$null = & $venvPython -c "import flask" 2>&1
	if ($LASTEXITCODE -eq 0) {
		$flaskInstalled = $true
	}
} catch {
	$flaskInstalled = $false
}

try {
	$null = & $venvPython -c "import pandas" 2>&1
	if ($LASTEXITCODE -eq 0) {
		$pandasInstalled = $true
	}
} catch {
	$pandasInstalled = $false
}

if (-not $flaskInstalled -or -not $pandasInstalled) {
	Write-Host "📦 Installing Flask, flask-cors, and pandas..." -ForegroundColor Yellow
	$flaskRequirements = Join-Path $root "requirements-flask.txt"
	if (Test-Path $flaskRequirements) {
		& $venvPython -m pip install -r $flaskRequirements
	} else {
		& $venvPython -m pip install flask flask-cors pandas
	}
	if ($LASTEXITCODE -ne 0) {
		Write-Host "❌ Error installing Flask dependencies. Please install manually:" -ForegroundColor Red
		Write-Host "  .venv\Scripts\python.exe -m pip install flask flask-cors pandas" -ForegroundColor White
	} else {
		Write-Host "✅ Flask and dependencies installed successfully" -ForegroundColor Green
	}
}

# 3) Start Django backend in a new terminal
Write-Host "1️⃣  Starting Django Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-backend.ps1'"

# 4) Wait for Django backend health (up to 60s)
function Test-BackendReady {
	param([string]$Url = "http://127.0.0.1:8000/api/")
	try {
		$resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 3 -UseBasicParsing
		return $true
	} catch {
		return $false
	}
}

Write-Host "⏳ Waiting for Django backend to become ready (max 60s)..." -ForegroundColor DarkYellow
$maxTries = 60
for ($i = 1; $i -le $maxTries; $i++) {
	if (Test-BackendReady) {
		Write-Host "✅ Django backend is ready!" -ForegroundColor Green
		break
	}
	Start-Sleep -Seconds 1
	if ($i -eq $maxTries) {
		Write-Host "⚠️ Django backend did not respond in time. Continuing anyway..." -ForegroundColor Yellow
	}
}

# 5) Start Flask API in a new terminal
Write-Host "2️⃣  Starting Flask API (Port 5000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-flask.ps1'"

# 6) Wait for Flask API health (up to 60s)
function Test-FlaskReady {
	param([string]$Url = "http://localhost:5000/api/salud")
	try {
		$resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 3 -UseBasicParsing
		return $true
	} catch {
		return $false
	}
}

Write-Host "⏳ Waiting for Flask API to become ready (max 60s)..." -ForegroundColor DarkYellow
$maxTries = 60
for ($i = 1; $i -le $maxTries; $i++) {
	if (Test-FlaskReady) {
		Write-Host "✅ Flask API is ready!" -ForegroundColor Green
		break
	}
	Start-Sleep -Seconds 1
	if ($i -eq $maxTries) {
		Write-Host "⚠️ Flask API did not respond in time. Continuing anyway..." -ForegroundColor Yellow
	}
}

# 7) Start frontend in a new terminal
Write-Host "2️⃣  Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-frontend.ps1'"

# 8) Wait for frontend health (tries ports 3000 then 3001, up to 90s)
function Test-FrontendReady {
	param([string[]]$Urls)
	foreach ($u in $Urls) {
		try {
			$resp = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 3 -UseBasicParsing
			if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
				return $u
			}
		} catch { }
	}
	return $null
}

Write-Host "⏳ Waiting for frontend to become ready (max 90s)..." -ForegroundColor DarkYellow
$frontendUrls = @(
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	'http://localhost:3001',
	'http://127.0.0.1:3001'
)
$readyUrl = $null
for ($i = 1; $i -le 90; $i++) {
	$readyUrl = Test-FrontendReady -Urls $frontendUrls
	if ($readyUrl) { break }
	Start-Sleep -Seconds 1
}
if ($readyUrl) {
	Write-Host "✅ Frontend is ready: $readyUrl" -ForegroundColor Green
} else {
	Write-Host "⚠️ Frontend did not respond in time. It may still be compiling." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ All servers are starting in separate terminals!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application at: $($readyUrl ?? 'http://localhost:3000')" -ForegroundColor Cyan
Write-Host "📍 Django Backend API at: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "📍 Flask Tests API at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers, close all terminal windows or press Ctrl+C in each." -ForegroundColor Yellow

# Optionally open browser to the ready frontend URL
if ($OpenBrowser) {
	$urlToOpen = $readyUrl
	if (-not $urlToOpen) { $urlToOpen = 'http://localhost:3000' }
	try {
		Write-Host "🌐 Opening browser: $urlToOpen" -ForegroundColor Cyan
		Start-Process $urlToOpen | Out-Null
	} catch {
		Write-Host "⚠️ Could not open browser automatically. Please open: $urlToOpen" -ForegroundColor Yellow
	}
}
