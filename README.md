# Tolea Systems

Tolea Systems is a local-first trading analytics dashboard with SQLite storage, a FastAPI API, a React dashboard, and an Electron desktop wrapper.

It supports two modes:

- **Cloud dashboard:** a lightweight MT5 collector runs on the trading VPS and pushes real account data to a separate FastAPI server. MT4 product results are shown through public Myfxbook links.
- **Desktop/offline:** Electron starts the local backend and stores data in local SQLite.

No mock data is included. Empty MT5 live screens stay empty until real MT5 data is synced.

## Requirements

- Windows for MT5 collection
- Python 3.11
- Node.js 20+
- MT5 installed and logged in for direct MT5 sync
- MT4 product result pages use Myfxbook links instead of the internal collector

## Install

```powershell
cd "C:\Users\Asus\Documents\New project\tradejournal-pro"
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm install
npm --prefix frontend install
Copy-Item .env.example .env
```

Edit `.env` and set strong values for:

```powershell
TRADEJOURNAL_COLLECTOR_KEY
TRADEJOURNAL_ADMIN_KEY
TRADEJOURNAL_SERVER_URL
```

## Run Backend

```powershell
.\.venv\Scripts\Activate.ps1
python -m backend.main
```

API health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

## Run Frontend

```powershell
npm --prefix frontend run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Run Collector On Trading VPS

The collector is intentionally small. It polls every 10 seconds, queues locally if the server is unavailable, and retries later.

```powershell
.\.venv\Scripts\Activate.ps1
$env:TRADEJOURNAL_SERVER_URL="https://your-api-domain.com"
$env:TRADEJOURNAL_COLLECTOR_KEY="same-secret-as-server"
python -m backend.collector
```

For the VPS setup, the shortest command is:

```powershell
cd C:\tolea-systems
powershell -ExecutionPolicy Bypass -File scripts\run_collector_vps.ps1 `
  -ServerUrl "https://your-render-service.onrender.com" `
  -CollectorKey "same-secret-as-render"
```

For MT5, keep the MT5 terminal installed and logged in. If auto-detection misses it:

```powershell
$env:TRADEJOURNAL_MT5_PATHS="C:\Program Files\Your Broker MT5\terminal64.exe"
```

MT4 live collector sync is disabled. For MT4 products, connect or review the public Myfxbook result link instead.

## Create A Read-Only Link

Share all visible accounts:

```powershell
python scripts/create_share_link.py --label "Investor dashboard"
```

Share one account only:

```powershell
python scripts/create_share_link.py --account-id "mt5:Broker-Server:123456"
```

Use the printed path with your hosted frontend, for example:

```text
https://your-dashboard-domain.com/#/share/<token>
```

## Build Electron EXE

```powershell
.\.venv\Scripts\Activate.ps1
npm run build:exe
```

The installer is written to:

```text
release/
```

The packaged desktop app starts the backend automatically and stores SQLite data in the Windows app data directory.

## API

- `GET /accounts`
- `GET /accounts/{slug}`
- `GET /accounts/{slug}/trades`
- `GET /accounts/{slug}/stats`
- `GET /accounts/{slug}/pnl/daily`
- `GET /accounts/{slug}/equity`
- `POST /ingest/sync` with `X-Collector-Key`
- `GET /public/{token}/accounts`
- `GET /public/{token}/accounts/{slug}`
- `GET /public/{token}/accounts/{slug}/trades`
- `GET /public/{token}/accounts/{slug}/stats`
- `GET /public/{token}/accounts/{slug}/pnl/daily`
- `GET /public/{token}/accounts/{slug}/equity`

## Deploy Cloud Dashboard

### Render Free Test Deploy

This repo includes `Dockerfile` and `render.yaml` for a single Render Web Service. The service runs FastAPI and serves the built React dashboard from the same public URL.

Important Render Free limitation: local SQLite files are not persistent on Free web services. If the service restarts, redeploys, or spins down, `trades.sqlite` can be lost. This is fine for a first connectivity test. For reliable production SQLite storage, use a paid Render service with a persistent disk or host the API on a VPS with persistent storage.

1. Push this project to GitHub/GitLab/Bitbucket.
2. In Render, create a new Blueprint from the repo or a new Web Service using the Dockerfile.
3. Set these environment variables:

```text
TRADEJOURNAL_COLLECTOR_KEY=<same secret used on VPS>
TRADEJOURNAL_ADMIN_KEY=<admin secret>
TRADEJOURNAL_DB_PATH=/app/db/trades.sqlite
```

4. After deploy, open:

```text
https://your-render-service.onrender.com
```

5. On the trading VPS, run:

```powershell
cd C:\tolea-systems
powershell -ExecutionPolicy Bypass -File scripts\run_collector_vps.ps1 `
  -ServerUrl "https://your-render-service.onrender.com" `
  -CollectorKey "<same secret used on Render>"
```

### Manual Static/API Deploy

Run the FastAPI backend on a separate server, expose it over HTTPS, and serve the built frontend from any static host:

```powershell
npm --prefix frontend run build
```

Set the frontend API URL at build time:

```powershell
$env:VITE_API_URL="https://your-api-domain.com"
npm --prefix frontend run build
```

Copy `frontend/dist` to your web host.
