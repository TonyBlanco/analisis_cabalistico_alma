# AI Engine Setup Scripts

**Phase**: DOC > (Setup Documentation)  
**Purpose**: Automated setup scripts and configuration for AI Engine deployment

---

## Quick Start

```powershell
# Run complete setup (from repo root)
.\scripts\setup-ai-engine.ps1

# Or step-by-step:
.\scripts\setup-ai-dependencies.ps1     # Install packages
.\scripts\setup-ai-environment.ps1      # Configure .env
.\scripts\setup-ai-database.ps1         # Create tables
.\scripts\setup-ai-knowledge-base.ps1   # Ingest knowledge
```

---

## Script 1: Dependency Installation

**File**: `scripts/setup-ai-dependencies.ps1`

```powershell
<#
.SYNOPSIS
    Install AI Engine dependencies for backend
.DESCRIPTION
    Installs OpenAI, Pinecone, Redis, and related packages
#>

Write-Host "🔧 AI Engine: Installing dependencies..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-Not (Test-Path "backend\.venv")) {
    Write-Host "❌ Virtual environment not found. Run start-backend.ps1 first." -ForegroundColor Red
    exit 1
}

# Activate virtual environment
& backend\.venv\Scripts\Activate.ps1

# Navigate to backend
Push-Location backend

try {
    Write-Host "📦 Installing AI packages..." -ForegroundColor Yellow
    
    # Install core AI packages
    pip install --upgrade pip
    pip install openai==1.12.0
    pip install pinecone-client==3.0.0
    pip install tiktoken==0.6.0
    pip install tenacity==8.2.3
    pip install redis==5.0.1
    
    # Optional: LangChain for RAG utilities
    $installLangChain = Read-Host "Install LangChain? (y/n) [default: n]"
    if ($installLangChain -eq 'y') {
        pip install langchain==0.1.0
    }
    
    # Update requirements.txt
    Write-Host "📝 Updating requirements.txt..." -ForegroundColor Yellow
    pip freeze | Out-File -FilePath requirements.txt -Encoding UTF8
    
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error installing dependencies: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
```

---

## Script 2: Environment Configuration

**File**: `scripts/setup-ai-environment.ps1`

```powershell
<#
.SYNOPSIS
    Configure AI Engine environment variables
.DESCRIPTION
    Creates .env.local with AI Engine configuration (API keys, settings)
#>

Write-Host "🔐 AI Engine: Configuring environment..." -ForegroundColor Cyan

$envFilePath = "backend\.env.local"

# Check if .env.local already exists
if (Test-Path $envFilePath) {
    $overwrite = Read-Host ".env.local already exists. Overwrite? (y/n) [default: n]"
    if ($overwrite -ne 'y') {
        Write-Host "⏭️  Skipping environment setup." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Please provide the following API keys:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Collect OpenAI API Key
Write-Host ""
Write-Host "🤖 OpenAI API Key" -ForegroundColor Cyan
Write-Host "Get it from: https://platform.openai.com/api-keys" -ForegroundColor Gray
$openaiKey = Read-Host "Enter OpenAI API Key (sk-proj-...)"

if (-Not $openaiKey.StartsWith("sk-")) {
    Write-Host "⚠️  Warning: OpenAI key should start with 'sk-'" -ForegroundColor Yellow
}

# Collect Pinecone API Key
Write-Host ""
Write-Host "📍 Pinecone API Key" -ForegroundColor Cyan
Write-Host "Get it from: https://app.pinecone.io/" -ForegroundColor Gray
$pineconeKey = Read-Host "Enter Pinecone API Key"
$pineconeEnv = Read-Host "Enter Pinecone Environment (e.g., us-west1-gcp) [default: us-west1-gcp]"
if ([string]::IsNullOrWhiteSpace($pineconeEnv)) {
    $pineconeEnv = "us-west1-gcp"
}
$pineconeIndex = Read-Host "Enter Pinecone Index Name [default: holistica-knowledge]"
if ([string]::IsNullOrWhiteSpace($pineconeIndex)) {
    $pineconeIndex = "holistica-knowledge"
}

# Redis URL
Write-Host ""
Write-Host "🔴 Redis Configuration" -ForegroundColor Cyan
$redisUrl = Read-Host "Enter Redis URL [default: redis://localhost:6379/0]"
if ([string]::IsNullOrWhiteSpace($redisUrl)) {
    $redisUrl = "redis://localhost:6379/0"
}

# AI Model Settings
Write-Host ""
Write-Host "⚙️  AI Model Settings" -ForegroundColor Cyan
$aiModel = Read-Host "OpenAI Model [default: gpt-4-turbo-preview]"
if ([string]::IsNullOrWhiteSpace($aiModel)) {
    $aiModel = "gpt-4-turbo-preview"
}

$embeddingModel = Read-Host "Embedding Model [default: text-embedding-3-large]"
if ([string]::IsNullOrWhiteSpace($embeddingModel)) {
    $embeddingModel = "text-embedding-3-large"
}

$maxTokens = Read-Host "Max Tokens [default: 4000]"
if ([string]::IsNullOrWhiteSpace($maxTokens)) {
    $maxTokens = "4000"
}

$temperature = Read-Host "Temperature [default: 0.3]"
if ([string]::IsNullOrWhiteSpace($temperature)) {
    $temperature = "0.3"
}

# Generate .env.local content
$envContent = @"
# AI Engine Configuration
# ⚠️ DO NOT COMMIT THIS FILE - Add to .gitignore
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# OpenAI Configuration
AI_ENGINE_ENABLED=true
OPENAI_API_KEY=$openaiKey
OPENAI_MODEL=$aiModel
OPENAI_EMBEDDING_MODEL=$embeddingModel

# Pinecone Vector Database
PINECONE_API_KEY=$pineconeKey
PINECONE_ENVIRONMENT=$pineconeEnv
PINECONE_INDEX_NAME=$pineconeIndex

# Redis Cache
REDIS_URL=$redisUrl

# AI Engine Limits
AI_MAX_TOKENS=$maxTokens
AI_TEMPERATURE=$temperature
AI_CACHE_TTL=86400

# Cost Tracking
AI_COST_ALERT_THRESHOLD=50.00
"@

# Write to file
$envContent | Out-File -FilePath $envFilePath -Encoding UTF8

Write-Host ""
Write-Host "✅ Environment configured successfully!" -ForegroundColor Green
Write-Host "📄 Configuration saved to: $envFilePath" -ForegroundColor Gray

# Verify .gitignore
$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    if (-Not $gitignoreContent.Contains(".env.local")) {
        Write-Host ""
        Write-Host "⚠️  Adding .env.local to .gitignore..." -ForegroundColor Yellow
        Add-Content -Path $gitignorePath -Value "`n# AI Engine secrets`n.env.local"
        Write-Host "✅ .gitignore updated" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Run: .\scripts\setup-ai-database.ps1" -ForegroundColor Gray
Write-Host "2. Run: .\scripts\setup-ai-knowledge-base.ps1" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
```

---

## Script 3: Database Setup

**File**: `scripts/setup-ai-database.ps1`

```powershell
<#
.SYNOPSIS
    Create AI Engine database tables
.DESCRIPTION
    Runs Django migrations for AIInterpretation and AIAuditLog models
#>

Write-Host "🗄️  AI Engine: Setting up database..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-Not (Test-Path "backend\.venv")) {
    Write-Host "❌ Virtual environment not found." -ForegroundColor Red
    exit 1
}

# Activate virtual environment
& backend\.venv\Scripts\Activate.ps1

# Navigate to backend
Push-Location backend

try {
    Write-Host "📝 Creating migrations..." -ForegroundColor Yellow
    python manage.py makemigrations ai_engine
    
    Write-Host "🔄 Applying migrations..." -ForegroundColor Yellow
    python manage.py migrate ai_engine
    
    Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
    
    # Verify tables
    Write-Host ""
    Write-Host "📊 Verifying tables..." -ForegroundColor Yellow
    python manage.py shell -c "
from api.ai_engine.models import AIInterpretation, AIAuditLog
print(f'✓ AIInterpretation table: {AIInterpretation._meta.db_table}')
print(f'✓ AIAuditLog table: {AIAuditLog._meta.db_table}')
"
    
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error setting up database: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
```

---

## Script 4: Knowledge Base Ingestion

**File**: `scripts/setup-ai-knowledge-base.ps1`

```powershell
<#
.SYNOPSIS
    Ingest knowledge into Pinecone vector database
.DESCRIPTION
    Runs ingestion scripts for DSM-5, ICD-11, therapies, and Kabbalah
#>

Write-Host "📚 AI Engine: Ingesting knowledge base..." -ForegroundColor Cyan

# Check environment
if (-Not (Test-Path "backend\.env.local")) {
    Write-Host "❌ .env.local not found. Run setup-ai-environment.ps1 first." -ForegroundColor Red
    exit 1
}

# Activate virtual environment
& backend\.venv\Scripts\Activate.ps1

# Navigate to backend
Push-Location backend

try {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "This process will:" -ForegroundColor White
    Write-Host "1. Create Pinecone index (if needed)" -ForegroundColor Gray
    Write-Host "2. Ingest DSM-5 diagnostic criteria (~500 entries)" -ForegroundColor Gray
    Write-Host "3. Ingest ICD-11 mental health codes (~300 entries)" -ForegroundColor Gray
    Write-Host "4. Ingest therapeutic modalities (~100 entries)" -ForegroundColor Gray
    Write-Host "5. Ingest Kabbalistic knowledge (~50 entries)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  This will cost approximately $5-10 in OpenAI API fees" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    
    $confirm = Read-Host "Continue? (y/n) [default: n]"
    if ($confirm -ne 'y') {
        Write-Host "⏭️  Knowledge base ingestion cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    # Setup Pinecone index
    Write-Host ""
    Write-Host "🔧 Setting up Pinecone index..." -ForegroundColor Cyan
    python api/ai_engine/rag/setup_pinecone.py
    
    # Ingest DSM-5
    Write-Host ""
    Write-Host "📖 Ingesting DSM-5..." -ForegroundColor Cyan
    python api/ai_engine/rag/ingest_scripts/ingest_dsm5.py
    
    # Ingest ICD-11
    Write-Host ""
    Write-Host "🏥 Ingesting ICD-11..." -ForegroundColor Cyan
    python api/ai_engine/rag/ingest_scripts/ingest_icd11.py
    
    # Ingest therapies
    Write-Host ""
    Write-Host "🧘 Ingesting therapeutic modalities..." -ForegroundColor Cyan
    python api/ai_engine/rag/ingest_scripts/ingest_therapies.py
    
    # Ingest Kabbalah
    Write-Host ""
    Write-Host "🌳 Ingesting Kabbalistic knowledge..." -ForegroundColor Cyan
    python api/ai_engine/rag/ingest_scripts/ingest_kabbalah.py
    
    Write-Host ""
    Write-Host "✅ Knowledge base ingestion complete!" -ForegroundColor Green
    
    # Summary
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Knowledge Base Summary:" -ForegroundColor White
    python -c "
import pinecone
from django.conf import settings
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

pinecone.init(api_key=settings.PINECONE_API_KEY, environment=settings.PINECONE_ENVIRONMENT)
index = pinecone.Index(settings.PINECONE_INDEX_NAME)
stats = index.describe_index_stats()
print(f'Total vectors: {stats.total_vector_count}')
print(f'Index dimension: {stats.dimension}')
"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error ingesting knowledge base: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
```

---

## Script 5: Complete Setup (Master Script)

**File**: `scripts/setup-ai-engine.ps1`

```powershell
<#
.SYNOPSIS
    Complete AI Engine setup (master script)
.DESCRIPTION
    Runs all setup scripts in sequence
#>

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "        AI ENGINE COMPLETE SETUP" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""

$steps = @(
    @{Name="Dependencies"; Script="setup-ai-dependencies.ps1"},
    @{Name="Environment"; Script="setup-ai-environment.ps1"},
    @{Name="Database"; Script="setup-ai-database.ps1"},
    @{Name="Knowledge Base"; Script="setup-ai-knowledge-base.ps1"}
)

$currentStep = 0
foreach ($step in $steps) {
    $currentStep++
    Write-Host ""
    Write-Host "━━━ STEP $currentStep/4: $($step.Name) ━━━" -ForegroundColor Cyan
    Write-Host ""
    
    & ".\scripts\$($step.Script)"
    
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        Write-Host ""
        Write-Host "❌ Setup failed at step: $($step.Name)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "        ✅ AI ENGINE SETUP COMPLETE!" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Verify environment: Get-Content backend\.env.local" -ForegroundColor Gray
Write-Host "2. Test backend: .\start-backend.ps1" -ForegroundColor Gray
Write-Host "3. Test AI endpoint: Invoke-WebRequest http://localhost:8000/api/ai-engine/" -ForegroundColor Gray
Write-Host "4. Check logs: tail -f backend/logs/ai_engine.log" -ForegroundColor Gray
Write-Host ""
```

---

## Script 6: Verification & Testing

**File**: `scripts/verify-ai-engine.ps1`

```powershell
<#
.SYNOPSIS
    Verify AI Engine installation
.DESCRIPTION
    Runs health checks for all AI Engine components
#>

Write-Host "🔍 AI Engine: Running verification..." -ForegroundColor Cyan

# Activate virtual environment
& backend\.venv\Scripts\Activate.ps1

Push-Location backend

try {
    Write-Host ""
    Write-Host "━━━ 1. Checking Dependencies ━━━" -ForegroundColor Yellow
    python -c "
import openai
import pinecone
import tiktoken
import redis
print('✓ openai:', openai.__version__)
print('✓ pinecone:', pinecone.__version__)
print('✓ tiktoken:', tiktoken.__version__)
print('✓ redis:', redis.__version__)
"
    
    Write-Host ""
    Write-Host "━━━ 2. Checking Environment Variables ━━━" -ForegroundColor Yellow
    python -c "
from django.conf import settings
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

checks = {
    'AI_ENGINE_ENABLED': settings.AI_ENGINE_ENABLED,
    'OPENAI_API_KEY': 'Set' if settings.OPENAI_API_KEY else 'Missing',
    'PINECONE_API_KEY': 'Set' if settings.PINECONE_API_KEY else 'Missing',
    'OPENAI_MODEL': settings.OPENAI_MODEL,
}

for key, value in checks.items():
    print(f'✓ {key}: {value}')
"
    
    Write-Host ""
    Write-Host "━━━ 3. Checking Database Tables ━━━" -ForegroundColor Yellow
    python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from api.ai_engine.models import AIInterpretation, AIAuditLog

print(f'✓ AIInterpretation count: {AIInterpretation.objects.count()}')
print(f'✓ AIAuditLog count: {AIAuditLog.objects.count()}')
"
    
    Write-Host ""
    Write-Host "━━━ 4. Checking Pinecone Connection ━━━" -ForegroundColor Yellow
    python -c "
import pinecone
from django.conf import settings
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

try:
    pinecone.init(api_key=settings.PINECONE_API_KEY, environment=settings.PINECONE_ENVIRONMENT)
    index = pinecone.Index(settings.PINECONE_INDEX_NAME)
    stats = index.describe_index_stats()
    print(f'✓ Pinecone connected')
    print(f'✓ Total vectors: {stats.total_vector_count}')
    print(f'✓ Dimension: {stats.dimension}')
except Exception as e:
    print(f'✗ Pinecone error: {str(e)}')
"
    
    Write-Host ""
    Write-Host "━━━ 5. Checking Redis Connection ━━━" -ForegroundColor Yellow
    python -c "
import redis
from django.conf import settings
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

try:
    r = redis.from_url(settings.REDIS_URL)
    r.ping()
    print('✓ Redis connected')
except Exception as e:
    print(f'✗ Redis error: {str(e)}')
"
    
    Write-Host ""
    Write-Host "✅ Verification complete!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Verification failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
```

---

## Script 7: Knowledge Base Update

**File**: `scripts/update-ai-knowledge.ps1`

```powershell
<#
.SYNOPSIS
    Update AI knowledge base with new data
.DESCRIPTION
    Re-ingest specific knowledge categories
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dsm5", "icd11", "therapies", "kabbalah", "all")]
    [string]$Category = "all"
)

Write-Host "🔄 AI Engine: Updating knowledge base..." -ForegroundColor Cyan

& backend\.venv\Scripts\Activate.ps1
Push-Location backend

try {
    if ($Category -eq "all" -or $Category -eq "dsm5") {
        Write-Host "📖 Updating DSM-5..." -ForegroundColor Yellow
        python api/ai_engine/rag/ingest_scripts/ingest_dsm5.py
    }
    
    if ($Category -eq "all" -or $Category -eq "icd11") {
        Write-Host "🏥 Updating ICD-11..." -ForegroundColor Yellow
        python api/ai_engine/rag/ingest_scripts/ingest_icd11.py
    }
    
    if ($Category -eq "all" -or $Category -eq "therapies") {
        Write-Host "🧘 Updating therapies..." -ForegroundColor Yellow
        python api/ai_engine/rag/ingest_scripts/ingest_therapies.py
    }
    
    if ($Category -eq "all" -or $Category -eq "kabbalah") {
        Write-Host "🌳 Updating Kabbalah..." -ForegroundColor Yellow
        python api/ai_engine/rag/ingest_scripts/ingest_kabbalah.py
    }
    
    Write-Host "✅ Knowledge base updated!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Update failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
```

---

## Manual Setup (Alternative)

If PowerShell scripts don't work, follow these manual steps:

### 1. Install Dependencies
```powershell
cd backend
.venv\Scripts\activate
pip install openai pinecone-client tiktoken tenacity redis
pip freeze > requirements.txt
```

### 2. Configure Environment
Create `backend/.env.local`:
```env
AI_ENGINE_ENABLED=true
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=holistica-knowledge

REDIS_URL=redis://localhost:6379/0

AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.3
AI_CACHE_TTL=86400
```

### 3. Run Migrations
```powershell
cd backend
python manage.py makemigrations ai_engine
python manage.py migrate ai_engine
```

### 4. Setup Pinecone
```powershell
python api/ai_engine/rag/setup_pinecone.py
```

### 5. Ingest Knowledge
```powershell
python api/ai_engine/rag/ingest_scripts/ingest_dsm5.py
python api/ai_engine/rag/ingest_scripts/ingest_icd11.py
python api/ai_engine/rag/ingest_scripts/ingest_therapies.py
python api/ai_engine/rag/ingest_scripts/ingest_kabbalah.py
```

### 6. Verify
```powershell
python -c "from api.ai_engine.models import AIInterpretation; print(AIInterpretation.objects.count())"
```

---

## Troubleshooting

### Error: "Module 'openai' not found"
**Solution**: Activate virtual environment first:
```powershell
backend\.venv\Scripts\activate
```

### Error: "Pinecone authentication failed"
**Solution**: Check API key in `.env.local`:
```powershell
Get-Content backend\.env.local | Select-String "PINECONE"
```

### Error: "Redis connection refused"
**Solution**: Start Redis server:
```powershell
# If using Docker:
docker run -d -p 6379:6379 redis:latest

# If using Windows Redis:
redis-server
```

### Error: "OPENAI_API_KEY not set"
**Solution**: Ensure `.env.local` is loaded:
```python
# backend/core/settings.py
from environ import Env
env = Env()
env.read_env('.env.local')  # Add this line
```

---

## Production Deployment

### Render (Current Platform)

**Environment Variables** (add in Render dashboard):
```
AI_ENGINE_ENABLED=true
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
REDIS_URL=redis://red-xyz.render.com:6379
```

**Build Command**:
```bash
pip install -r requirements.txt
python manage.py migrate
python api/ai_engine/rag/setup_pinecone.py
```

**Note**: Knowledge ingestion should be run ONCE manually after first deploy (not in build command to avoid repeated costs).

---

## Cost Management

### Development
- Knowledge ingestion: ~$5-10 (one-time)
- Testing (10 interpretations/day): ~$2/week
- **Total first month**: ~$15-20

### Production
- Per interpretation: ~$0.20
- With 60% cache hit rate: ~$0.08/interpretation
- 100 interpretations/month: ~$8
- **Estimated monthly**: $6-12

### Alerts
Monitor costs in OpenAI dashboard: https://platform.openai.com/usage

Set budget alert:
```python
# backend/api/ai_engine/utils/cost_tracker.py
MONTHLY_BUDGET_USD = 50.00  # Alert if exceeded
```

---

## Next Steps

✅ **Documentation complete** - All setup scripts defined  
🔄 **Ready for CODE phase** - Implement actual backend/frontend code  
📋 **Testing guide pending** - Create comprehensive testing documentation

**Proceed with CODE implementation?** 🚀
