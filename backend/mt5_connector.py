from __future__ import annotations

import glob
import os
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


def _import_mt5():
    try:
        import MetaTrader5 as mt5  # type: ignore

        return mt5
    except ImportError as exc:
        raise RuntimeError("MetaTrader5 Python package is not installed. Install requirements with Python 3.11.") from exc


def _windows_process_paths() -> list[str]:
    if os.name != "nt":
        return []
    command = [
        "powershell",
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process -Filter \"name='terminal64.exe'\" | Select-Object -ExpandProperty ExecutablePath",
    ]
    try:
        result = subprocess.run(command, check=False, capture_output=True, text=True, timeout=5)
    except (OSError, subprocess.SubprocessError):
        return []
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def discover_mt5_terminals(extra_paths: list[str] | None = None) -> list[str | None]:
    candidates: list[str | None] = []
    env_paths = [item.strip() for item in os.getenv("TRADEJOURNAL_MT5_PATHS", "").split(";") if item.strip()]
    candidates.extend(extra_paths or [])
    candidates.extend(env_paths)
    candidates.extend(_windows_process_paths())

    if os.name == "nt":
        program_dirs = [os.getenv("ProgramFiles"), os.getenv("ProgramFiles(x86)")]
        for base in [item for item in program_dirs if item]:
            candidates.extend(glob.glob(str(Path(base) / "*" / "terminal64.exe")))
            candidates.extend(glob.glob(str(Path(base) / "*MetaTrader*" / "terminal64.exe")))

    unique: list[str | None] = []
    for candidate in candidates:
        if candidate and Path(candidate).exists() and candidate not in unique:
            unique.append(candidate)

    return unique or [None]


def _to_iso(timestamp: int | float | None) -> str:
    if not timestamp:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).replace(microsecond=0).isoformat()


def _as_dict(value: Any) -> dict[str, Any]:
    if value is None:
        return {}
    if hasattr(value, "_asdict"):
        return value._asdict()
    return dict(value)


def _build_trades(mt5: Any, deals: list[Any]) -> list[dict[str, Any]]:
    by_position: dict[int, list[dict[str, Any]]] = {}
    for deal in deals:
        item = _as_dict(deal)
        position_id = int(item.get("position_id") or item.get("order") or item.get("ticket") or 0)
        by_position.setdefault(position_id, []).append(item)

    entry_in = getattr(mt5, "DEAL_ENTRY_IN", 0)
    entry_out = getattr(mt5, "DEAL_ENTRY_OUT", 1)
    entry_inout = getattr(mt5, "DEAL_ENTRY_INOUT", 2)
    trades: list[dict[str, Any]] = []

    for position_deals in by_position.values():
        ordered = sorted(position_deals, key=lambda item: item.get("time", 0))
        open_deal = next((item for item in ordered if item.get("entry") == entry_in), ordered[0] if ordered else None)
        if not open_deal:
            continue
        for deal in ordered:
            if deal.get("entry") not in {entry_out, entry_inout}:
                continue
            if not deal.get("symbol"):
                continue
            trades.append(
                {
                    "ticket": str(deal.get("ticket")),
                    "symbol": deal.get("symbol"),
                    "volume": float(deal.get("volume") or 0),
                    "profit": float(deal.get("profit") or 0),
                    "swap": float(deal.get("swap") or 0),
                    "commission": float(deal.get("commission") or 0),
                    "open_time": _to_iso(open_deal.get("time")),
                    "close_time": _to_iso(deal.get("time")),
                }
            )
    return trades


def collect_mt5_payload(terminal_path: str | None = None, lookback_days: int = 3650) -> dict[str, Any] | None:
    mt5 = _import_mt5()
    initialized = mt5.initialize(path=terminal_path) if terminal_path else mt5.initialize()
    if not initialized:
        error = mt5.last_error()
        raise RuntimeError(f"MT5 initialize failed for {terminal_path or 'default terminal'}: {error}")

    try:
        account_info = mt5.account_info()
        if account_info is None:
            raise RuntimeError(f"MT5 account_info failed: {mt5.last_error()}")

        info = _as_dict(account_info)
        login = str(info.get("login", ""))
        server = str(info.get("server") or "unknown-server")
        account_id = f"mt5:{server}:{login}"
        now = datetime.now(timezone.utc)
        start = now - timedelta(days=lookback_days)
        deals = mt5.history_deals_get(start, now)
        if deals is None:
            deals = []

        balance = float(info.get("balance") or 0)
        equity = float(info.get("equity") or 0)
        return {
            "source": f"mt5:{terminal_path or 'default'}",
            "account": {
                "account_id": account_id,
                "platform": "MT5",
                "login": login,
                "name": f"MT5 {login}",
                "broker": str(info.get("company") or ""),
                "server": server,
                "currency": str(info.get("currency") or ""),
                "visible": True,
            },
            "snapshot": {
                "balance": balance,
                "equity": equity,
                "floating_pl": equity - balance,
                "margin": float(info.get("margin") or 0),
                "free_margin": float(info.get("margin_free") or 0),
                "timestamp": now.isoformat(),
            },
            "trades": _build_trades(mt5, list(deals)),
        }
    finally:
        mt5.shutdown()


def collect_all_mt5_payloads(extra_paths: list[str] | None = None, lookback_days: int = 3650) -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    errors: list[str] = []
    for path in discover_mt5_terminals(extra_paths):
        try:
            payload = collect_mt5_payload(path, lookback_days)
            if payload:
                payloads.append(payload)
        except RuntimeError as exc:
            errors.append(str(exc))
    if not payloads and errors:
        raise RuntimeError("; ".join(errors))
    return payloads

