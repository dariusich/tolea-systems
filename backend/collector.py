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
from .mt4_bridge import collect_mt4_payloads
from .mt5_connector import collect_all_mt5_payloads


QUEUE_PATH = Path(os.getenv("TRADEJOURNAL_QUEUE_PATH", str(DB_DIR / "collector_queue.sqlite"))).resolve()
SERVER_URL = os.getenv("TRADEJOURNAL_SERVER_URL", "").rstrip("/")
COLLECTOR_KEY = os.getenv("TRADEJOURNAL_COLLECTOR_KEY", "change-me")
ENABLE_MT5 = os.getenv("TRADEJOURNAL_ENABLE_MT5", "1").lower() not in {"0", "false", "no"}
ENABLE_MT4 = os.getenv("TRADEJOURNAL_ENABLE_MT4", "1").lower() not in {"0", "false", "no"}


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
        for row in rows:
            try:
                send_payload(json.loads(row["payload"]))
            except Exception as exc:  # network failures must not stop the collector
                conn.execute(
                    "UPDATE outbound_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?",
                    (str(exc), row["id"]),
                )
                break
            else:
                conn.execute("DELETE FROM outbound_queue WHERE id = ?", (row["id"],))


def collect_payloads() -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    if ENABLE_MT5:
        try:
            payloads.extend(collect_all_mt5_payloads())
        except Exception as exc:
            print(f"[collector] MT5 sync skipped: {exc}")
    if ENABLE_MT4:
        try:
            payloads.extend(collect_mt4_payloads())
        except Exception as exc:
            print(f"[collector] MT4 bridge sync skipped: {exc}")
    return payloads


def run_once() -> None:
    for payload in collect_payloads():
        try:
            send_payload(payload)
        except Exception as exc:
            print(f"[collector] remote sync queued: {exc}")
            queue_payload(payload)
    flush_queue()


def run_collector_forever() -> None:
    db.init_db()
    while True:
        started = time.monotonic()
        run_once()
        elapsed = time.monotonic() - started
        time.sleep(max(1, POLL_INTERVAL_SECONDS - elapsed))


if __name__ == "__main__":
    run_collector_forever()

