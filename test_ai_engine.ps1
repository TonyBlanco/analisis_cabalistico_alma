# ============================================================================
# Test AI Engine - Quick verification script
# ============================================================================

Write-Host "🧪 Testing AI Engine" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Check if backend is running
Write-Host "`n[1/4] Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health/" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running. Start with: .\start-backend.ps1" -ForegroundColor Red
    exit 1
}

# 2. Get auth token
Write-Host "`n[2/4] Getting auth token..." -ForegroundColor Yellow
Write-Host "Enter therapist credentials:" -ForegroundColor Cyan
$username = Read-Host "Username (email)"
$password = Read-Host "Password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

$loginBody = @{
    username = $username
    password = $plainPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/token-auth/" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Token obtained" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Find test results
Write-Host "`n[3/4] Finding test results..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type" = "application/json"
}

try {
    # Try to get SHA test results
    $shaResults = Invoke-RestMethod -Uri "http://localhost:8000/api/swm/sha/list/" -Method Get -Headers $headers
    
    if ($shaResults.Count -eq 0) {
        Write-Host "⚠️  No SHA test results found. Create one first." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Found $($shaResults.Count) SHA test results:" -ForegroundColor Green
    $shaResults | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "  [$i] ID: $($_.id) - Patient: $($_.subject_name) - Date: $($_.created_at)" -ForegroundColor Gray
        $i++
    }
    
    # Use first result
    $testResultId = $shaResults[0].id
    Write-Host "`nUsing test result ID: $testResultId" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to get test results: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Generate AI interpretation
Write-Host "`n[4/4] Generating AI interpretation..." -ForegroundColor Yellow
Write-Host "This may take 10-30 seconds..." -ForegroundColor Gray

try {
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/ai-engine/interpret/$testResultId/" -Method Post -Headers $headers
    
    Write-Host "`n✅ AI Interpretation generated!" -ForegroundColor Green
    Write-Host "=" * 60
    
    # Display results
    Write-Host "`n📊 INTERPRETATION SUMMARY:" -ForegroundColor Cyan
    Write-Host "ID: $($aiResponse.interpretation_id)" -ForegroundColor Gray
    Write-Host "Model: $($aiResponse.model_used)" -ForegroundColor Gray
    Write-Host "Tokens: $($aiResponse.prompt_tokens + $aiResponse.completion_tokens)" -ForegroundColor Gray
    Write-Host "Cost: `$$($aiResponse.total_cost_usd)" -ForegroundColor Gray
    Write-Host "Latency: $($aiResponse.latency_ms)ms" -ForegroundColor Gray
    
    if ($aiResponse.narrative.summary) {
        Write-Host "`n📝 NARRATIVE:" -ForegroundColor Cyan
        Write-Host $aiResponse.narrative.summary -ForegroundColor White
    }
    
    if ($aiResponse.narrative.key_insights) {
        Write-Host "`n💡 KEY INSIGHTS:" -ForegroundColor Cyan
        $aiResponse.narrative.key_insights | ForEach-Object {
            Write-Host "  • $_" -ForegroundColor White
        }
    }
    
    if ($aiResponse.suggested_diagnoses) {
        Write-Host "`n🔍 SUGGESTED DIAGNOSES:" -ForegroundColor Cyan
        $aiResponse.suggested_diagnoses | ForEach-Object {
            Write-Host "  • $($_.pattern_name) ($($_.probability_percentage)%)" -ForegroundColor White
        }
    }
    
    Write-Host "`n✨ Test completed successfully!" -ForegroundColor Green
    Write-Host "View in admin: http://localhost:8000/admin/ai_engine/aiinterpretation/$($aiResponse.id)/" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ AI interpretation failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "`nError details:" -ForegroundColor Yellow
        Write-Host ($errorDetails | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    }
    exit 1
}
