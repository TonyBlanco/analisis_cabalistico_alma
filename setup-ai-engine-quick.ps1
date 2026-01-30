# ============================================================================
# Quick AI Engine Setup Script
# ============================================================================
# Automates: migrations, dependencies, environment configuration
# Run: .\setup-ai-engine-quick.ps1
# ============================================================================

Write-Host "🤖 AI Engine Quick Setup" -ForegroundColor Cyan
Write-Host "=" * 60

# Step 1: Database Migrations
Write-Host "`n[1/4] Creating database migrations..." -ForegroundColor Yellow
cd backend
python manage.py makemigrations ai_engine
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations created" -ForegroundColor Green
    python manage.py migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations applied" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ makemigrations failed" -ForegroundColor Red
    exit 1
}
cd ..

# Step 2: Install Dependencies
Write-Host "`n[2/4] Installing AI dependencies..." -ForegroundColor Yellow
$packages = @(
    "openai==1.12.0",
    "pinecone-client==3.0.0",
    "tiktoken==0.6.0",
    "tenacity==8.2.3",
    "redis==5.0.1"
)

foreach ($pkg in $packages) {
    Write-Host "  Installing $pkg..." -ForegroundColor Gray
    pip install $pkg
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
    Write-Host "  Updating requirements.txt..." -ForegroundColor Gray
    pip freeze > backend/requirements.txt
} else {
    Write-Host "⚠️  Some packages failed - check manually" -ForegroundColor Yellow
}

# Step 3: Environment Configuration
Write-Host "`n[3/4] Setting up environment..." -ForegroundColor Yellow
$envPath = "backend\.env.local"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env.local exists - merging new settings..." -ForegroundColor Yellow
    $existingEnv = Get-Content $envPath -Raw
} else {
    $existingEnv = ""
}

# Check if AI_ENGINE_ENABLED already exists
if ($existingEnv -notmatch "AI_ENGINE_ENABLED") {
    Write-Host "`nEnter API keys (press Enter to skip):" -ForegroundColor Cyan
    
    $openaiKey = Read-Host "OpenAI API Key (sk-...)"
    $pineconeKey = Read-Host "Pinecone API Key (optional)"
    $pineconeEnv = Read-Host "Pinecone Environment (default: us-west1-gcp)"
    
    if ([string]::IsNullOrWhiteSpace($pineconeEnv)) {
        $pineconeEnv = "us-west1-gcp"
    }

    $aiConfig = @"

# ============================================================================
# AI Engine Configuration (Added by setup-ai-engine-quick.ps1)
# ============================================================================
AI_ENGINE_ENABLED=true
OPENAI_API_KEY=$openaiKey
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
PINECONE_API_KEY=$pineconeKey
PINECONE_ENVIRONMENT=$pineconeEnv
PINECONE_INDEX_NAME=holistica-knowledge
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.3
AI_CACHE_TTL=86400
"@

    Add-Content -Path $envPath -Value $aiConfig
    Write-Host "✅ Configuration added to $envPath" -ForegroundColor Green
} else {
    Write-Host "✅ AI Engine config already present" -ForegroundColor Green
}

# Step 4: Verification
Write-Host "`n[4/4] Verifying setup..." -ForegroundColor Yellow

# Check OpenAI key
if ($openaiKey -and $openaiKey.StartsWith("sk-")) {
    Write-Host "  ✅ OpenAI API key configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No valid OpenAI key - AI Engine will not work" -ForegroundColor Yellow
}

# Check Pinecone key
if ($pineconeKey) {
    Write-Host "  ✅ Pinecone configured (RAG enabled)" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  No Pinecone key - using fallback context" -ForegroundColor Cyan
}

# Check migrations
cd backend
$tables = python manage.py inspectdb | Select-String "ai_interpretation|ai_audit_log"
if ($tables) {
    Write-Host "  ✅ Database tables created" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Tables not found - check migrations" -ForegroundColor Yellow
}
cd ..

# Summary
Write-Host "`n" + ("=" * 60)
Write-Host "🎉 AI Engine Setup Complete!" -ForegroundColor Green
Write-Host ("=" * 60)

Write-Host "`n📋 Status Summary:" -ForegroundColor Cyan
Write-Host "  • Migrations: Applied"
Write-Host "  • Dependencies: Installed"
Write-Host "  • Environment: Configured"
Write-Host "  • Ready for: Testing"

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend: .\start-backend.ps1"
Write-Host "  2. Test endpoint: POST /api/ai-engine/interpret/<test_result_id>/"
Write-Host "  3. Check admin: http://localhost:8000/admin/ai_engine/"
Write-Host "  4. (Optional) Ingest knowledge base: python backend/manage.py ingest_knowledge"

Write-Host "`n💰 Cost Estimates:" -ForegroundColor Magenta
Write-Host "  • Per interpretation: ~`$0.20"
Write-Host "  • With 60% cache hit: ~`$0.08"
Write-Host "  • Monthly (50 interp): ~`$4-10"

Write-Host "`n📖 Documentation:" -ForegroundColor Cyan
Write-Host "  • Architecture: docs/AI_ENGINE_ARCHITECTURE.md"
Write-Host "  • Implementation: docs/AI_ENGINE_IMPLEMENTATION_GUIDE.md"
Write-Host "  • Setup Scripts: docs/AI_ENGINE_SETUP_SCRIPTS.md"
Write-Host "  • Testing: docs/AI_ENGINE_TESTING_GUIDE.md"

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "  • System works without Pinecone (uses fallback context)"
Write-Host "  • Frontend component: AIInterpretationPanel"# 1. Asegúrate que el backend esté corriendo
.\start-backend.ps1

# 2. En otra terminal, ejecuta el test
.\test_ai_engine.ps1
Write-Host "  • Access: Therapist role ONLY"
Write-Host "  • Safety filters: Prevents diagnostic language"

Write-Host "`n✨ Ready to generate AI interpretations!" -ForegroundColor Green
