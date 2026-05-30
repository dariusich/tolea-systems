param(
  [Parameter(Mandatory=$true)]
  [string]$ServerUrl,

  [Parameter(Mandatory=$true)]
  [string]$CollectorKey
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$env:TRADEJOURNAL_SERVER_URL = $ServerUrl.TrimEnd("/")
$env:TRADEJOURNAL_COLLECTOR_KEY = $CollectorKey
$env:TRADEJOURNAL_ENABLE_MT4 = "1"
$env:TRADEJOURNAL_ENABLE_MT5 = "0"
$env:TRADEJOURNAL_POLL_INTERVAL = "10"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  py -3.11 -m venv .venv
}

& ".venv\Scripts\python.exe" -m pip install -r requirements-collector.txt
& ".venv\Scripts\python.exe" -m backend.collector

