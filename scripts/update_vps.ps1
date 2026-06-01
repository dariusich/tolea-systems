param(
  [int]$Port = 8000,
  [string]$DbPath = "C:\tolea-systems\db\trades.sqlite",
  [int]$PollInterval = 10,
  [switch]$SkipGitPull,
  [switch]$SkipInstall,
  [switch]$DisableMT4,
  [switch]$DisableMT5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$LogsDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

function Write-Step($Message) {
  Write-Host ""
  Write-Host "[tolea-update] $Message"
}

Write-Step "using project folder: $Root"

if (-not $SkipGitPull) {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not installed or not available in PATH. Install Git, or run this script with -SkipGitPull."
  }
  Write-Step "pulling latest code from GitHub"
  git pull --ff-only
}

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  Write-Step "creating Python virtual environment"
  if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.11 -m venv .venv
  } else {
    python -m venv .venv
  }
}

if (-not $SkipInstall) {
  Write-Step "installing Python dependencies"
  & ".venv\Scripts\python.exe" -m pip install -r requirements-api.txt -r requirements-collector.txt

  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw "Node.js/npm is not installed or not available in PATH."
  }
  Write-Step "installing frontend dependencies"
  npm.cmd --prefix frontend install
}

Write-Step "building frontend"
npm.cmd --prefix frontend run build

Write-Step "stopping old server on port $Port, if running"
$connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
$processIds = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $processIds) {
  if ($processId -and $processId -ne $PID) {
    Write-Host "[tolea-update] stopping process id $processId"
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 2

$startScript = Join-Path $Root "scripts\start_server_vps.ps1"
$outLog = Join-Path $LogsDir "server.out.log"
$errLog = Join-Path $LogsDir "server.err.log"

$argsList = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$startScript`"",
  "-Port", "$Port",
  "-DbPath", "`"$DbPath`"",
  "-PollInterval", "$PollInterval",
  "-NoInstall"
)

if ($DisableMT5) {
  $argsList += "-DisableMT5"
}

Write-Step "starting server in background"
$process = Start-Process powershell.exe `
  -ArgumentList $argsList `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -PassThru

Write-Host "[tolea-update] started process id $($process.Id)"
Write-Host "[tolea-update] stdout log: $outLog"
Write-Host "[tolea-update] stderr log: $errLog"

Write-Step "checking health endpoint"
$healthUrl = "http://127.0.0.1:$Port/health"
$healthy = $false
for ($i = 1; $i -le 20; $i++) {
  try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      $healthy = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $healthy) {
  Write-Host "[tolea-update] server did not answer yet. Last stderr lines:"
  if (Test-Path $errLog) {
    Get-Content $errLog -Tail 20
  }
  throw "Server health check failed at $healthUrl"
}

Write-Host ""
Write-Host "[tolea-update] done"
Write-Host "[tolea-update] local:  http://127.0.0.1:$Port"
Write-Host "[tolea-update] public: http://<VPS-IP>:$Port"
