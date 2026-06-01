param(
  [switch]$DisableMT4,

  [switch]$EnableMT5,

  [string]$Mt5Paths = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$env:TRADEJOURNAL_ENABLE_MT4 = "0"
$env:TRADEJOURNAL_ENABLE_MT5 = "1"
$env:TRADEJOURNAL_MT5_PATHS = $Mt5Paths

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.11 -m venv .venv
  } else {
    python -m venv .venv
  }
}

& ".venv\Scripts\python.exe" -m pip install -r requirements-collector.txt
& ".venv\Scripts\python.exe" -m backend.collector_diagnostics
