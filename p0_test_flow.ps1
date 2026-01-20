# P0 Test Flow for SWM MCMI4
# Variables
$BASE = "http://localhost:8000/api/swm/mcmi4"
$TOKEN = "90f7ab25a594f47999f4f4b708c2f3f6928ecd4c"
$SUBJECT_USER_ID = 50
$EXECUTOR_USER_ID = 49

Write-Output "=== P0 TEST FLOW - SWM MCMI4 ==="
Write-Output "BASE: $BASE"
Write-Output "SUBJECT_USER_ID: $SUBJECT_USER_ID"
Write-Output "EXECUTOR_USER_ID: $EXECUTOR_USER_ID"
Write-Output ""

# PASO 1: CREATE WORKSPACE
Write-Output "=== PASO 1: CREATE WORKSPACE ==="
$createBody = @"
{
  "subject_user_id": $SUBJECT_USER_ID,
  "mcmi4_source_data_id": "MCMI4_TEST_FLOW_001",
  "config": {},
  "metadata": {"test": true}
}
"@

Write-Output "REQUEST: POST $BASE/create"
Write-Output "BODY: $createBody"
Write-Output ""

$createResponse = Invoke-RestMethod -Uri "$BASE/create" -Method Post `
    -Headers @{ Authorization = "Token $TOKEN" } `
    -ContentType "application/json" `
    -Body $createBody

Write-Output "RESPONSE:"
$createResponse | ConvertTo-Json -Depth 10
Write-Output ""

$WORKSPACE_ID = $createResponse.workspace_id
Write-Output "WORKSPACE_ID captured: $WORKSPACE_ID"
Write-Output ""

# DB CHECK after CREATE
Write-Output "=== DB CHECK after CREATE ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceInstance
print('WorkspaceInstance count:', WorkspaceInstance.objects.count())
w = WorkspaceInstance.objects.filter(id='$WORKSPACE_ID').first()
if w:
    print(f'Last WorkspaceInstance: id={w.id}, status={w.status}, subject={w.subject_user_id}, creator={w.creator_user_id}')
else:
    print('ERROR: Workspace not found!')
"@
Write-Output ""

# PASO 2: GRANT PERMISSION
Write-Output "=== PASO 2: GRANT PERMISSION ==="
$grantBody = @"
{
  "workspace_id": "$WORKSPACE_ID",
  "user_id": $EXECUTOR_USER_ID,
  "permission_type": "executor"
}
"@

Write-Output "REQUEST: POST $BASE/grant-permission"
Write-Output "BODY: $grantBody"
Write-Output ""

$grantResponse = Invoke-RestMethod -Uri "$BASE/grant-permission" -Method Post `
    -Headers @{ Authorization = "Token $TOKEN" } `
    -ContentType "application/json" `
    -Body $grantBody

Write-Output "RESPONSE:"
$grantResponse | ConvertTo-Json -Depth 10
Write-Output ""

# DB CHECK after GRANT
Write-Output "=== DB CHECK after GRANT ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspacePermission
perms = WorkspacePermission.objects.filter(workspace_instance_id='$WORKSPACE_ID')
print(f'WorkspacePermission count for workspace: {perms.count()}')
for p in perms:
    print(f'Permission: user_id={p.user_id}, type={p.permission_type}, active={p.is_active}')
"@
Write-Output ""

# PASO 3: START SESSION
Write-Output "=== PASO 3: START SESSION ==="
$startBody = @"
{
  "workspace_id": "$WORKSPACE_ID"
}
"@

Write-Output "REQUEST: POST $BASE/start"
Write-Output "BODY: $startBody"
Write-Output ""

$startResponse = Invoke-RestMethod -Uri "$BASE/start" -Method Post `
    -Headers @{ Authorization = "Token $TOKEN" } `
    -ContentType "application/json" `
    -Body $startBody

Write-Output "RESPONSE:"
$startResponse | ConvertTo-Json -Depth 10
Write-Output ""

$SESSION_ID = $startResponse.session_id
Write-Output "SESSION_ID captured: $SESSION_ID"
Write-Output ""

# DB CHECK after START
Write-Output "=== DB CHECK after START ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceInstance, WorkspaceSession
w = WorkspaceInstance.objects.get(id='$WORKSPACE_ID')
print(f'WorkspaceInstance status: {w.status}')
sess = WorkspaceSession.objects.filter(workspace_instance_id='$WORKSPACE_ID', is_active=True).first()
if sess:
    print(f'Active WorkspaceSession: id={sess.id}, executor={sess.executor_user_id}, status={sess.status}')
else:
    print('ERROR: No active session found!')
"@
Write-Output ""

# PASO 4: PROGRESS (generate artifact)
Write-Output "=== PASO 4: PROGRESS (generate artifact) ==="
$progressBody = @"
{
  "workspace_id": "$WORKSPACE_ID",
  "session_id": "$SESSION_ID",
  "action": "generate_artifact",
  "payload": {
    "artifact_type": "progress_snapshot",
    "content": {
      "step": 1,
      "answers": [{"question": "Q1", "answer": "A1"}]
    }
  }
}
"@

Write-Output "REQUEST: POST $BASE/progress"
Write-Output "BODY: $progressBody"
Write-Output ""

$progressResponse = Invoke-RestMethod -Uri "$BASE/progress" -Method Post `
    -Headers @{ Authorization = "Token $TOKEN" } `
    -ContentType "application/json" `
    -Body $progressBody

Write-Output "RESPONSE:"
$progressResponse | ConvertTo-Json -Depth 10
Write-Output ""

# DB CHECK after PROGRESS
Write-Output "=== DB CHECK after PROGRESS ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceArtifact
artifacts = WorkspaceArtifact.objects.filter(workspace_instance_id='$WORKSPACE_ID')
print(f'WorkspaceArtifact count: {artifacts.count()}')
if artifacts.exists():
    last = artifacts.order_by('-created_at').first()
    print(f'Last artifact: type={last.artifact_type}, sealed={last.sealed_at is not None}, payload_keys={list(last.payload.keys()) if last.payload else []}')
"@
Write-Output ""

# PASO 5: SEAL
Write-Output "=== PASO 5: SEAL WORKSPACE ==="
$sealBody = @"
{
  "workspace_id": "$WORKSPACE_ID",
  "session_id": "$SESSION_ID",
  "final_synthesis": {
    "synthesis": "Final test synthesis for P0 flow"
  }
}
"@

Write-Output "REQUEST: POST $BASE/seal"
Write-Output "BODY: $sealBody"
Write-Output ""

$sealResponse = Invoke-RestMethod -Uri "$BASE/seal" -Method Post `
    -Headers @{ Authorization = "Token $TOKEN" } `
    -ContentType "application/json" `
    -Body $sealBody

Write-Output "RESPONSE:"
$sealResponse | ConvertTo-Json -Depth 10
Write-Output ""

# DB CHECK after SEAL
Write-Output "=== DB CHECK after SEAL ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceInstance, WorkspaceArtifact
w = WorkspaceInstance.objects.get(id='$WORKSPACE_ID')
print(f'WorkspaceInstance status: {w.status}')
sealed_artifacts = WorkspaceArtifact.objects.filter(workspace_instance_id='$WORKSPACE_ID', sealed_at__isnull=False)
print(f'Sealed artifacts count: {sealed_artifacts.count()}')
"@
Write-Output ""

# PASO 6: RESULTS
Write-Output "=== PASO 6: GET RESULTS ==="
Write-Output "REQUEST: GET $BASE/results?workspace_id=$WORKSPACE_ID"
Write-Output ""

$resultsResponse = Invoke-RestMethod -Uri "$BASE/results?workspace_id=$WORKSPACE_ID" -Method Get `
    -Headers @{ Authorization = "Token $TOKEN" }

Write-Output "RESPONSE:"
$resultsResponse | ConvertTo-Json -Depth 10
Write-Output ""

# PASO 6b: AUDIT
Write-Output "=== PASO 6b: GET AUDIT ==="
Write-Output "REQUEST: GET $BASE/audit?workspace_id=$WORKSPACE_ID&limit=100"
Write-Output ""

$auditResponse = Invoke-RestMethod -Uri "$BASE/audit?workspace_id=$WORKSPACE_ID&limit=100" -Method Get `
    -Headers @{ Authorization = "Token $TOKEN" }

Write-Output "RESPONSE:"
$auditResponse | ConvertTo-Json -Depth 10
Write-Output ""

# DB CHECK AUDIT
Write-Output "=== DB CHECK AUDIT ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceAuditLog
audit_count = WorkspaceAuditLog.objects.filter(workspace_instance_id='$WORKSPACE_ID').count()
print(f'WorkspaceAuditLog count for workspace: {audit_count}')
"@
Write-Output ""

# FINAL REPORT
Write-Output "=== FINAL REPORT ==="
python manage.py shell -c @"
from swm.mcmi4.models import WorkspaceInstance, WorkspaceSession, WorkspacePermission, WorkspaceArtifact, WorkspaceAuditLog
w = WorkspaceInstance.objects.filter(id='$WORKSPACE_ID').first()
if w:
    sessions = WorkspaceSession.objects.filter(workspace_instance=w).count()
    perms = WorkspacePermission.objects.filter(workspace_instance=w).count()
    artifacts = WorkspaceArtifact.objects.filter(workspace_instance=w).count()
    audits = WorkspaceAuditLog.objects.filter(workspace_instance=w).count()
    print('| Table | Count |')
    print('|-------|-------|')
    print(f'| Instances | 1 |')
    print(f'| Sessions | {sessions} |')
    print(f'| Permissions | {perms} |')
    print(f'| Artifacts | {artifacts} |')
    print(f'| AuditLogs | {audits} |')
    print('')
    print(f'WORKSPACE_ID: {w.id}')
    print(f'SESSION_ID: (check above)')
    print(f'FINAL STATUS: {w.status}')
else:
    print('ERROR: Workspace not found in DB!')
"@

Write-Output ""
Write-Output "=== P0 TEST FLOW COMPLETE ==="
