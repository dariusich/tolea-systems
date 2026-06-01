from __future__ import annotations

import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Any

import requests

from . import db
from .config import DB_DIR, POLL_INTERVAL_SECONDS
from .mt5_connector import collect_all_mt5_payloads


QUEUE_PATH = Path(os.getenv("TRADEJOURNAL_QUEUE_PATH", str(DB_DIR / "collector_queue.sqlite"))).resolve()
SERVER_URL = os.getenv("TRADEJOURNAL_SERVER_URL", "").rstrip("/")
COLLECTOR_KEY = os.getenv("TRADEJOURNAL_COLLECTOR_KEY", "change-me")
ENABLE_MT5 = os.getenv("TRADEJOURNAL_ENABLE_MT5", "1").lower() not in {"0", "false", "no"}
ENABLE_MT4 = False
_mt4_notice_logged = False


def log(message: str) -> None:
    print(f"[collector] {message}", flush=True)


def queue_connect() -> sqlite3.Connection:
    QUEUE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(QUEUE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS outbound_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payload TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at TEXT NOT NULL
        )
        """
    )
    return conn


def queue_payload(payload: dict[str, Any]) -> None:
    with queue_connect() as conn:
        conn.execute(
            "INSERT INTO outbound_queue (payload, attempts, created_at) VALUES (?, 0, ?)",
            (json.dumps(payload), db.utc_now()),
        )


def queue_size() -> int:
    with queue_connect() as conn:
        return int(conn.execute("SELECT COUNT(*) FROM outbound_queue").fetchone()[0])


def payload_label(payload: dict[str, Any]) -> str:
    account = payload.get("account") or {}
    platform = account.get("platform") or "unknown"
    login = account.get("login") or "unknown"
    return f"{platform} {login}"


def payload_trade_count(payload: dict[str, Any]) -> int:
    return len(payload.get("trades") or [])


def is_auth_error(exc: Exception) -> bool:
    response = getattr(exc, "response", None)
    return getattr(response, "status_code", None) in {401, 403}


def send_payload(payload: dict[str, Any]) -> None:
    if not SERVER_URL:
        db.ingest_sync(payload)
        return
    response = requests.post(
        f"{SERVER_URL}/ingest/sync",
        json=payload,
        headers={"X-Collector-Key": COLLECTOR_KEY},
        timeout=15,
    )
    response.raise_for_status()


def flush_queue(limit: int = 100) -> None:
    with queue_connect() as conn:
        rows = conn.execute("SELECT * FROM outbound_queue ORDER BY id ASC LIMIT ?", (limit,)).fetchall()
        flushed = 0
        for row in rows:
            try:
                send_payload(json.loads(row["payload"]))
            except Exception as exc:  # network failures must not stop the collector
                conn.execute(
                    "UPDATE outbound_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?",
                    (str(exc), row["id"]),
                )
                if is_auth_error(exc):
                    log("queued payload still unauthorized. Check TRADEJOURNAL_COLLECTOR_KEY on Render and on the VPS.")
                else:
                    log(f"queue flush paused: {exc}")
                break
            else:
                conn.execute("DELETE FROM outbound_queue WHERE id = ?", (row["id"],))
                flushed += 1
        if flushed:
            remaining = conn.execute("SELECT COUNT(*) FROM outbound_queue").fetchone()[0]
            log(f"flushed {flushed} queued payloads, remaining queue={remaining}")


def collect_payloads() -> list[dict[str, Any]]:
    global _mt4_notice_logged
    payloads: list[dict[str, Any]] = []
    if ENABLE_MT5:
        try:
            mt5_payloads = collect_all_mt5_payloads()
            payloads.extend(mt5_payloads)
            log(f"MT5 collected payloads={len(mt5_payloads)} trades={sum(payload_trade_count(item) for item in mt5_payloads)}")
        except Exception as exc:
            log(f"MT5 sync skipped: {exc}")
    if not _mt4_notice_logged:
        log("MT4 live collector disabled; MT4 results are handled via Myfxbook links only.")
        _mt4_notice_logged = True
    return payloads


def run_once() -> None:
    sent = 0
    for payload in collect_payloads():
        try:
            send_payload(payload)
        except Exception as exc:
            if is_auth_error(exc):
                log("remote sync unauthorized. Check that TRADEJOURNAL_COLLECTOR_KEY is identical on Render and VPS.")
            else:
                log(f"remote sync queued: {exc}")
            queue_payload(payload)
            log(f"queued {payload_label(payload)} trades={payload_trade_count(payload)} queue={queue_size()}")
        else:
            sent += 1
            log(f"sent {payload_label(payload)} trades={payload_trade_count(payload)}")
    flush_queue()
    if sent == 0:
        log(f"cycle complete, sent=0 queue={queue_size()}")


def run_collector_forever() -> None:
    db.init_db()
    log(
        "started "
        f"server={SERVER_URL or 'local sqlite'} "
        f"mt4=False(Myfxbook-only) mt5={ENABLE_MT5} interval={POLL_INTERVAL_SECONDS}s queue={QUEUE_PATH}"
    )
    while True:
        started = time.monotonic()
        run_once()
        elapsed = time.monotonic() - started
        time.sleep(max(1, POLL_INTERVAL_SECONDS - elapsed))


if __name__ == "__main__":
    run_collector_forever()
