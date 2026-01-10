$token = (Get-Content '.gemini/settings.json' | ConvertFrom-Json).GITHUB_PERSONAL_ACCESS_TOKEN
$headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json' }
try {
  $resp = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers -ErrorAction Stop
  Write-Output "OK:$($resp.login)"
} catch {
  $err = $_.Exception
  if ($err.Response -ne $null) {
    try { $status = $err.Response.StatusCode.Value__ } catch { $status = $err.Response.StatusCode }
    Write-Output "ERROR_STATUS:$status"
  } else {
    Write-Output "ERROR:$($err.Message)"
  }
}
