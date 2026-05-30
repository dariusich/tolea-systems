Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $Root
try {
  $Python = "py"
  & $Python -3.11 -m pip install -r requirements.txt
  & $Python -3.11 -m PyInstaller `
    --noconfirm `
    --clean `
    --name tradejournal-backend `
    --paths . `
    --collect-all MetaTrader5 `
    backend/main.py
}
finally {
  Pop-Location
}

