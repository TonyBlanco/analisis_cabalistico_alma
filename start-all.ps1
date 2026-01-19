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

# 3) Start Django backend, Flask API, and Frontend in new terminals
Write-Host "1️⃣  Starting Django Backend (Port 8000)... $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-backend.ps1'"

Write-Host "2️⃣  Starting Flask API (Port 5000)... $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-flask.ps1'"

Write-Host "3️⃣  Starting Next.js Frontend (Port 3000)... $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-frontend.ps1'"

# Parallel health checks for services (faster than sequential polling)
Write-Host "⏳ Checking service health in parallel..." -ForegroundColor DarkYellow

$checks = @(
	@{ Name = 'Django Backend'; Url = 'http://127.0.0.1:8000/api/'; Timeout = 30 },
	@{ Name = 'Flask API'; Url = 'http://localhost:5000/api/salud'; Timeout = 30 },
	@{ Name = 'Frontend'; Urls = @('http://localhost:3000','http://127.0.0.1:3000','http://localhost:3001','http://127.0.0.1:3001'); Timeout = 60 }
)

$jobs = @()
foreach ($c in $checks) {
	if ($c.ContainsKey('Urls')) {
		$jobs += Start-Job -Name $c.Name -ArgumentList ($c.Urls, $c.Timeout, $c.Name) -ScriptBlock {
			param($Urls, $Timeout, $Name)
			$sw = [Diagnostics.Stopwatch]::StartNew()
			$end = (Get-Date).AddSeconds($Timeout)
			foreach ($u in $Urls) {
				while ((Get-Date) -lt $end) {
					try {
						$resp = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 3 -UseBasicParsing
						if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
							$sw.Stop(); return @{ Name = $Name; Url = $u; Success = $true; Elapsed = $sw.Elapsed.TotalSeconds }
						}
					} catch { }
					Start-Sleep -Seconds 1
				}
			}
			$sw.Stop(); return @{ Name = $Name; Url = $null; Success = $false; Elapsed = $sw.Elapsed.TotalSeconds }
		}
	} else {
		$jobs += Start-Job -Name $c.Name -ArgumentList ($c.Url, $c.Timeout, $c.Name) -ScriptBlock {
			param($Url, $Timeout, $Name)
			$sw = [Diagnostics.Stopwatch]::StartNew()
			$end = (Get-Date).AddSeconds($Timeout)
			while ((Get-Date) -lt $end) {
				try {
					$resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 3 -UseBasicParsing
					if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
						$sw.Stop(); return @{ Name = $Name; Url = $Url; Success = $true; Elapsed = $sw.Elapsed.TotalSeconds }
					}
				} catch { }
				Start-Sleep -Seconds 1
			}
			$sw.Stop(); return @{ Name = $Name; Url = $Url; Success = $false; Elapsed = $sw.Elapsed.TotalSeconds }
		}
	}
}

# Wait for all jobs up to the maximum configured timeout
$maxTimeout = ($checks | Measure-Object -Property Timeout -Maximum).Maximum
Wait-Job -Job $jobs -Timeout ($maxTimeout + 5) | Out-Null

Write-Host "Health check results:" -ForegroundColor Cyan
foreach ($j in $jobs) {
	$res = Receive-Job -Job $j -ErrorAction SilentlyContinue
	if ($res -and $res.Success) {
		Write-Host "✅ $($res.Name) ready at $($res.Url) (after $([math]::Round($res.Elapsed,1))s)" -ForegroundColor Green
	} else {
		Write-Host "⚠️ $($j.Name) did not respond within allotted time." -ForegroundColor Yellow
	}
	Remove-Job -Job $j -Force
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
