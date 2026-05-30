from __future__ import annotations

import threading
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import db
from .config import ADMIN_API_KEY, COLLECTOR_API_KEY, ENABLE_LOCAL_COLLECTOR, PUBLIC_TOKEN, ROOT_DIR
from .models import ApiMessage, ShareLinkIn, SyncPayload


app = FastAPI(title="Tolea Systems API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_collector_started = False


def require_collector_key(x_collector_key: str | None = Header(default=None)) -> None:
    if x_collector_key != COLLECTOR_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid collector API key")


def require_admin_key(x_admin_key: str | None = Header(default=None)) -> None:
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid admin API key")


def _allowed_account_ids(token: str | None) -> list[str] | None:
    if not token:
        return None
    allowed = db.resolve_share_token(token)
    if allowed == []:
        raise HTTPException(status_code=404, detail="Share link not found")
    return allowed


def _account_or_404(slug: str, token: str | None = None) -> dict[str, Any]:
    account = db.get_account_by_slug(slug, _allowed_account_ids(token))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@app.on_event("startup")
def startup() -> None:
    global _collector_started
    db.init_db()
    if PUBLIC_TOKEN:
        db.create_share_link(token=PUBLIC_TOKEN, label="Public read-only dashboard")
    if ENABLE_LOCAL_COLLECTOR and not _collector_started:
        from .collector import run_collector_forever

        thread = threading.Thread(target=run_collector_forever, name="tradejournal-collector", daemon=True)
        thread.start()
        _collector_started = True


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "name": "Tolea Systems API"}


@app.get("/accounts")
def accounts() -> dict[str, Any]:
    return {"accounts": db.list_accounts()}


@app.get("/accounts/{slug}")
def account(slug: str) -> dict[str, Any]:
    return {"account": _account_or_404(slug)}


@app.get("/accounts/{slug}/trades")
def account_trades(slug: str, date: str | None = Query(default=None)) -> dict[str, Any]:
    account_data = _account_or_404(slug)
    return {"trades": db.get_trades(account_data["account_id"], date)}


@app.get("/accounts/{slug}/stats")
def account_stats(slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug)
    return {"stats": db.stats(account_data["account_id"])}


@app.get("/accounts/{slug}/pnl/daily")
def account_daily_pnl(slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug)
    return {"days": db.daily_pnl(account_data["account_id"]), "tradesByDay": db.trades_by_day(account_data["account_id"])}


@app.get("/accounts/{slug}/equity")
def account_equity(slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug)
    return {"equity": db.equity_curve(account_data["account_id"])}


@app.post("/ingest/sync", dependencies=[Depends(require_collector_key)])
def ingest(payload: SyncPayload) -> dict[str, Any]:
    return {"ok": True, "result": db.ingest_sync(payload.model_dump())}


@app.post("/share-links", response_model=ApiMessage, dependencies=[Depends(require_admin_key)])
def share_link(payload: ShareLinkIn) -> ApiMessage:
    link = db.create_share_link(
        token=payload.token,
        account_id=payload.account_id,
        label=payload.label,
        active=payload.active,
    )
    return ApiMessage(ok=True, message="Share link saved", details=link)


@app.get("/public/{token}/accounts")
def public_accounts(token: str) -> dict[str, Any]:
    return {"accounts": db.list_accounts(_allowed_account_ids(token))}


@app.get("/public/{token}/accounts/{slug}")
def public_account(token: str, slug: str) -> dict[str, Any]:
    return {"account": _account_or_404(slug, token)}


@app.get("/public/{token}/accounts/{slug}/trades")
def public_trades(token: str, slug: str, date: str | None = Query(default=None)) -> dict[str, Any]:
    account_data = _account_or_404(slug, token)
    return {"trades": db.get_trades(account_data["account_id"], date)}


@app.get("/public/{token}/accounts/{slug}/stats")
def public_stats(token: str, slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug, token)
    return {"stats": db.stats(account_data["account_id"])}


@app.get("/public/{token}/accounts/{slug}/pnl/daily")
def public_daily_pnl(token: str, slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug, token)
    return {"days": db.daily_pnl(account_data["account_id"]), "tradesByDay": db.trades_by_day(account_data["account_id"])}


@app.get("/public/{token}/accounts/{slug}/equity")
def public_equity(token: str, slug: str) -> dict[str, Any]:
    account_data = _account_or_404(slug, token)
    return {"equity": db.equity_curve(account_data["account_id"])}


frontend_dist = ROOT_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
