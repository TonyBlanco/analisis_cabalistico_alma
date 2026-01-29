<#
Builds the environments for the shared repo: Python backend and the frontend workspace.
Run this from the repo root on the new machine after `git checkout AholosticaS`.
#>

param(
    [switch]$Force,
    [string]$PythonExe = "python"
)

function Ensure-Venv {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        Write-Host "Creating virtual environment at $Path..."
        & $PythonExe -m venv $Path
    } else {
        Write-Host "Virtual environment already exists at $Path."
    }
}

function Install-PythonDeps {
    param(
        [string]$VenvPath,
        [string]$Requirements = "requirements.txt"
    )

    $Activate = Join-Path $VenvPath "Scripts\Activate.ps1"
    if (-not (Test-Path $Activate)) {
        throw "Cannot find $Activate – was the virtualenv created correctly?"
    }

    & powershell -NoLogo -NoProfile -Command ". '$Activate'; python -m pip install --upgrade pip; python -m pip install -r '$Requirements'"
}

function Install-NodeDeps {
    param(
        [string]$Dir
    )

    if (-not (Test-Path $Dir)) {
        throw "Directory $Dir missing."
    }

    Push-Location $Dir
    try {
        if (Test-Path "package-lock.json") {
            $Manager = "npm"
        } elseif (Test-Path "pnpm-lock.yaml") {
            $Manager = "pnpm"
        } elseif (Test-Path "yarn.lock") {
            $Manager = "yarn"
        } else {
            $Manager = "npm"
        }

        Write-Host "Installing Node dependencies with $Manager in $Dir..."
        & $Manager install
    } finally {
        Pop-Location
    }
}

try {
    Write-Host "Setting up backend (.venv + Python requirements)..."
    Ensure-Venv -Path ".venv"
    Install-PythonDeps -VenvPath ".venv"

    Write-Host "Setting up frontend (tonyblanco-app)..."
    Install-NodeDeps -Dir "tonyblanco-app"

    Write-Host "Setup complete. Activate the Python env with `.\\.venv\\Scripts\\Activate` before running backend scripts."
} catch {
    Write-Error "Setup failed: $_"
    exit 1
}
