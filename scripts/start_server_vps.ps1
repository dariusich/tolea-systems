param(
  [string]$HostAddress = "0.0.0.0",
  [int]$Port = 8000,
  [string]$DbPath = "C:\tolea-systems\db\trades.sqlite",
  [int]$PollInterval = 10,
  [switch]$DisableMT4,
  [switch]$DisableMT5,
  [switch]$NoInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

New-Item -ItemType Directory -Force -Path (Join-Path $Root "db") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Root "logs") | Out-Null

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.11 -m venv .venv
  } else {
    python -m venv .venv
  }
}

if (-not $NoInstall) {
  & ".venv\Scripts\python.exe" -m pip install -r requirements-api.txt -r requirements-collector.txt
}

$env:TRADEJOURNAL_HOST = $HostAddress
$env:PORT = "$Port"
$env:TRADEJOURNAL_DB_PATH = $DbPath
$env:TRADEJOURNAL_ENABLE_LOCAL_COLLECTOR = "1"
$env:TRADEJOURNAL_ENABLE_MT4 = "0"
$env:TRADEJOURNAL_ENABLE_MT5 = if ($DisableMT5) { "0" } else { "1" }
$env:TRADEJOURNAL_POLL_INTERVAL = "$PollInterval"

Write-Host "[tolea] starting site + API + collector"
Write-Host "[tolea] URL local:  http://127.0.0.1:$Port"
Write-Host "[tolea] URL public: http://<VPS-IP>:$Port"
Write-Host "[tolea] DB: $DbPath"
Write-Host "[tolea] MT4 live collector: disabled (MT4 results via Myfxbook only)"
Write-Host "[tolea] MT5 enabled: $(-not $DisableMT5)"

& ".venv\Scripts\python.exe" -m backend.main
