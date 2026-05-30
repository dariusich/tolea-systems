param(
  [Parameter(Mandatory=$true)]
  [string]$ServerUrl,

  [Parameter(Mandatory=$true)]
  [string]$CollectorKey,

  [switch]$DisableMT4,

  [switch]$EnableMT5,

  [string]$Mt5Paths = "",

  [int]$PollInterval = 10
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$env:TRADEJOURNAL_SERVER_URL = $ServerUrl.TrimEnd("/")
$env:TRADEJOURNAL_COLLECTOR_KEY = $CollectorKey
$Mt4Enabled = -not $DisableMT4

$env:TRADEJOURNAL_ENABLE_MT4 = if ($Mt4Enabled) { "1" } else { "0" }
$env:TRADEJOURNAL_ENABLE_MT5 = if ($EnableMT5) { "1" } else { "0" }
$env:TRADEJOURNAL_MT5_PATHS = $Mt5Paths
$env:TRADEJOURNAL_POLL_INTERVAL = "$PollInterval"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.11 -m venv .venv
  } else {
    python -m venv .venv
  }
}

& ".venv\Scripts\python.exe" -m pip install -r requirements-collector.txt

Write-Host "[collector] Server: $($env:TRADEJOURNAL_SERVER_URL)"
Write-Host "[collector] MT4 enabled: $Mt4Enabled"
Write-Host "[collector] MT5 enabled: $($EnableMT5.IsPresent)"
if ($EnableMT5 -and $Mt5Paths) {
  Write-Host "[collector] Manual MT5 paths: $Mt5Paths"
}
Write-Host "[collector] Poll interval: $PollInterval seconds"

& ".venv\Scripts\python.exe" -m backend.collector
