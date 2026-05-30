from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DB_DIR = ROOT_DIR / "db"


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


DATABASE_PATH = Path(os.getenv("TRADEJOURNAL_DB_PATH", str(DB_DIR / "trades.sqlite"))).resolve()
COLLECTOR_API_KEY = os.getenv("TRADEJOURNAL_COLLECTOR_KEY", "change-me")
ADMIN_API_KEY = os.getenv("TRADEJOURNAL_ADMIN_KEY", "change-me-admin")
PUBLIC_TOKEN = os.getenv("TRADEJOURNAL_PUBLIC_TOKEN", "")
ENABLE_LOCAL_COLLECTOR = env_bool("TRADEJOURNAL_ENABLE_LOCAL_COLLECTOR", False)
POLL_INTERVAL_SECONDS = env_int("TRADEJOURNAL_POLL_INTERVAL", 10)

