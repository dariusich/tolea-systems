from __future__ import annotations

import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .db import parse_time


ACTIVE_SPOOL_PATTERN = "mt4_*.jsonl"
PROCESSED_SPOOL_PATTERN = "mt4_*.processed-*.jsonl"


def default_spool_paths() -> list[Path]:
    env_paths = [Path(item.strip()) for item in os.getenv("TRADEJOURNAL_MT4_SPOOL", "").split(";") if item.strip()]
    if env_paths:
        return env_paths
    if os.name != "nt":
        return []
    appdata = os.getenv("APPDATA")
    if not appdata:
        return []
    folder = Path(appdata) / "MetaQuotes" / "Terminal" / "Common" / "Files" / "TradeJournalPro"
    return [path for path in folder.glob(ACTIVE_SPOOL_PATTERN) if ".processed-" not in path.name]


def processed_spool_paths() -> list[Path]:
    if os.name != "nt":
        return []
    appdata = os.getenv("APPDATA")
    if not appdata:
        return []
    folder = Path(appdata) / "MetaQuotes" / "Terminal" / "Common" / "Files" / "TradeJournalPro"
    return list(folder.glob(PROCESSED_SPOOL_PATTERN))


def _empty_account(login: str, server: str) -> dict[str, Any]:
    return {
        "account_id": f"mt4:{server}:{login}",
        "platform": "MT4",
        "login": login,
        "name": f"MT4 {login}",
        "broker": "",
        "server": server,
        "currency": "",
        "visible": True,
    }


def _normalize_record(record: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None, dict[str, Any] | None] | None:
    account = record.get("account") or {}
    login = str(account.get("login") or record.get("login") or "")
    server = str(account.get("server") or record.get("server") or "unknown-server")
    if not login:
        return None
    normalized_account = _empty_account(login, server)
    normalized_account.update(
        {
            "broker": account.get("broker") or record.get("broker") or "",
            "currency": account.get("currency") or record.get("currency") or "",
        }
    )

    snapshot = record.get("snapshot")
    if snapshot:
        snapshot = {
            "balance": float(snapshot.get("balance") or 0),
            "equity": float(snapshot.get("equity") or 0),
            "floating_pl": float(snapshot.get("floating_pl") or 0),
            "margin": float(snapshot.get("margin") or 0),
            "free_margin": float(snapshot.get("free_margin") or 0),
            "timestamp": parse_time(snapshot.get("timestamp")),
        }

    trade = record.get("trade")
    if trade:
        trade = {
            "ticket": str(trade.get("ticket")),
            "symbol": str(trade.get("symbol") or "UNKNOWN"),
            "volume": float(trade.get("volume") or 0),
            "profit": float(trade.get("profit") or 0),
            "swap": float(trade.get("swap") or 0),
            "commission": float(trade.get("commission") or 0),
            "open_time": parse_time(trade.get("open_time")),
            "close_time": parse_time(trade.get("close_time")),
        }

    return normalized_account, snapshot, trade


def read_mt4_bridge_file(path: Path, consume: bool = True) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    raw_lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    grouped: dict[str, dict[str, Any]] = {}
    seen_tickets: dict[str, set[str]] = defaultdict(set)

    for line in raw_lines:
        if not line.strip():
            continue
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            continue
        normalized = _normalize_record(record)
        if not normalized:
            continue
        account, snapshot, trade = normalized
        account_id = account["account_id"]
        payload = grouped.setdefault(
            account_id,
            {"source": f"mt4-bridge:{path}", "account": account, "snapshot": snapshot, "trades": []},
        )
        payload["account"].update(account)
        if snapshot:
            payload["snapshot"] = snapshot
        if trade and trade["ticket"] not in seen_tickets[account_id]:
            payload["trades"].append(trade)
            seen_tickets[account_id].add(trade["ticket"])

    if consume and raw_lines:
        archive = path.with_suffix(f".processed-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}.jsonl")
        try:
            path.replace(archive)
        except OSError:
            path.write_text("", encoding="utf-8")

    return list(grouped.values())


def collect_mt4_payloads(paths: list[Path] | None = None, consume: bool = True) -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    for path in paths or default_spool_paths():
        payloads.extend(read_mt4_bridge_file(path, consume=consume))
    return payloads
