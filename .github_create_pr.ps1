param(
    [string]$Token
)

$token = $Token
if (-not $token) {
  $token = (Get-Content '.gemini/settings.json' | ConvertFrom-Json).GITHUB_PERSONAL_ACCESS_TOKEN
}

$body = @{ 
  title = 'feat(ui): add isolated send-note block for patient notes'
  head = 'feat/isolated-send-note-block'
  base = 'main'
  body = @'
Resumen de cambios:
- Añade bloque aislado "Enviar nota al paciente" (solo terapeutas).
- No se modifica la sección "Notas integrativas".
- Añade listado de notas en vista paciente (solo lectura).
- Backend: normalización y endurecimiento de `patient_id`; pruebas de backend en verde.
Migrations aplicadas.

Checklist:
- [ ] Capturas: terapeuta enviando nota
- [ ] Capturas: paciente viendo nota
'@
} | ConvertTo-Json -Depth 6
$headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json' }
try {
  $resp = Invoke-RestMethod -Headers $headers -Method Post -Uri 'https://api.github.com/repos/TonyBlanco/analisis_cabalistico_alma/pulls' -Body $body
  Write-Output $resp.html_url
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
