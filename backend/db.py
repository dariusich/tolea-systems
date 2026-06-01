from __future__ import annotations

import json
import re
import secrets
import sqlite3
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import DATABASE_PATH


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def parse_time(value: str | None) -> str:
    if not value:
        return utc_now()
    text = str(value).strip()
    if re.match(r"^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}:\d{2}$", text):
        text = text.replace(".", "-", 2).replace(" ", "T", 1)
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).replace(microsecond=0).isoformat()
    except ValueError:
        return text


def slugify(value: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return text or secrets.token_hex(4)


ACCOUNT_DISPLAY_NAMES = {
    ("MT4", "35115307"): "DSys Beta",
    ("MT5", "77045247"): "DSys Alpha",
}

MYFXBOOK_BY_ACCOUNT = {
    ("MT4", "35115307"): {
        "profile_url": "https://www.myfxbook.com/members/dariusch/dsys-beta/12049164",
        "widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6",
        "label": "DSys Beta verified profile",
    },
}


def preferred_account_display_name(account: dict[str, Any]) -> str | None:
    platform = str(account.get("platform") or "").upper()
    login = str(account.get("login") or "")
    return ACCOUNT_DISPLAY_NAMES.get((platform, login))


def preferred_account_slug(account: dict[str, Any]) -> str | None:
    platform = str(account.get("platform") or "").lower()
    login = str(account.get("login") or "")
    if preferred_account_display_name(account) and platform and login:
        return f"{platform}-{login}"
    return None


def account_result_source(account: dict[str, Any]) -> str:
    platform = str(account.get("platform") or "").upper()
    return "myfxbook" if platform == "MT4" else "liveCollector"


def with_result_metadata(account: dict[str, Any]) -> dict[str, Any]:
    platform = str(account.get("platform") or "").upper()
    login = str(account.get("login") or "")
    result_source = account_result_source(account)
    account["result_source"] = result_source
    account["resultSource"] = result_source
    account["results_label"] = "Myfxbook Results" if result_source == "myfxbook" else "Live Results"
    if (platform, login) in MYFXBOOK_BY_ACCOUNT:
        account["myfxbook"] = MYFXBOOK_BY_ACCOUNT[(platform, login)]
    return account


def connect(path: Path | None = None) -> sqlite3.Connection:
    database_path = path or DATABASE_PATH
    database_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(database_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS accounts (
              account_id TEXT PRIMARY KEY,
              slug TEXT NOT NULL UNIQUE,
              platform TEXT NOT NULL,
              login TEXT NOT NULL,
              name TEXT NOT NULL,
              display_name TEXT NOT NULL,
              strategy TEXT,
              broker TEXT,
              server TEXT,
              currency TEXT,
              visible INTEGER NOT NULL DEFAULT 1,
              tags TEXT NOT NULL DEFAULT '[]',
              last_sync_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS trades (
              account_id TEXT NOT NULL,
              ticket TEXT NOT NULL,
              platform TEXT NOT NULL,
              symbol TEXT NOT NULL,
              volume REAL NOT NULL DEFAULT 0,
              profit REAL NOT NULL DEFAULT 0,
              swap REAL NOT NULL DEFAULT 0,
              commission REAL NOT NULL DEFAULT 0,
              open_time TEXT NOT NULL,
              close_time TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (account_id, ticket),
              FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_trades_account_close_time
              ON trades(account_id, close_time);

            CREATE TABLE IF NOT EXISTS account_snapshots (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id TEXT NOT NULL,
              balance REAL NOT NULL DEFAULT 0,
              equity REAL NOT NULL DEFAULT 0,
              floating_pl REAL NOT NULL DEFAULT 0,
              margin REAL NOT NULL DEFAULT 0,
              free_margin REAL NOT NULL DEFAULT 0,
              timestamp TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_snapshots_account_timestamp
              ON account_snapshots(account_id, timestamp DESC);

            CREATE TABLE IF NOT EXISTS share_links (
              token TEXT PRIMARY KEY,
              account_id TEXT,
              label TEXT,
              active INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS sync_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id TEXT,
              source TEXT,
              status TEXT NOT NULL,
              message TEXT,
              trades_received INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL
            );
            """
        )


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    data = dict(row)
    if "visible" in data:
        data["visible"] = bool(data["visible"])
    if "tags" in data:
        try:
            data["tags"] = json.loads(data["tags"] or "[]")
        except json.JSONDecodeError:
            data["tags"] = []
    return data


def _unique_slug(conn: sqlite3.Connection, base: str, account_id: str) -> str:
    slug = slugify(base)
    candidate = slug
    index = 2
    while True:
        row = conn.execute("SELECT account_id FROM accounts WHERE slug = ?", (candidate,)).fetchone()
        if row is None or row["account_id"] == account_id:
            return candidate
        candidate = f"{slug}-{index}"
        index += 1


def upsert_account(conn: sqlite3.Connection, account: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    account_id = str(account["account_id"])
    existing = conn.execute("SELECT * FROM accounts WHERE account_id = ?", (account_id,)).fetchone()
    existing_data = row_to_dict(existing) if existing else {}
    preferred_display_name = preferred_account_display_name(account)
    name = account.get("name") or existing_data.get("name") or f"{account.get('platform')} {account.get('login')}"
    display_name = preferred_display_name or account.get("display_name") or existing_data.get("display_name") or name
    slug_base = preferred_account_slug(account) or display_name
    slug = existing_data.get("slug") or _unique_slug(conn, slug_base, account_id)
    tags = account.get("tags")
    if tags is None:
        tags = existing_data.get("tags", [])
    conn.execute(
        """
        INSERT INTO accounts (
          account_id, slug, platform, login, name, display_name, strategy, broker, server,
          currency, visible, tags, last_sync_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(account_id) DO UPDATE SET
          platform=excluded.platform,
          login=excluded.login,
          name=excluded.name,
          display_name=excluded.display_name,
          strategy=COALESCE(excluded.strategy, accounts.strategy),
          broker=excluded.broker,
          server=excluded.server,
          currency=excluded.currency,
          visible=excluded.visible,
          tags=excluded.tags,
          last_sync_at=excluded.last_sync_at,
          updated_at=excluded.updated_at
        """,
        (
            account_id,
            slug,
            str(account.get("platform", "")).upper(),
            str(account.get("login", "")),
            str(name),
            str(display_name),
            account.get("strategy") or existing_data.get("strategy"),
            account.get("broker"),
            account.get("server"),
            account.get("currency"),
            1 if account.get("visible", True) else 0,
            json.dumps(tags),
            now,
            now,
            now,
        ),
    )
    return row_to_dict(conn.execute("SELECT * FROM accounts WHERE account_id = ?", (account_id,)).fetchone()) or {}


def upsert_trade(conn: sqlite3.Connection, account_id: str, platform: str, trade: dict[str, Any]) -> bool:
    now = utc_now()
    before = conn.total_changes
    conn.execute(
        """
        INSERT INTO trades (
          account_id, ticket, platform, symbol, volume, profit, swap, commission,
          open_time, close_time, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(account_id, ticket) DO UPDATE SET
          symbol=excluded.symbol,
          volume=excluded.volume,
          profit=excluded.profit,
          swap=excluded.swap,
          commission=excluded.commission,
          open_time=excluded.open_time,
          close_time=excluded.close_time,
          updated_at=excluded.updated_at
        """,
        (
            account_id,
            str(trade["ticket"]),
            platform.upper(),
            trade.get("symbol") or "UNKNOWN",
            float(trade.get("volume") or 0),
            float(trade.get("profit") or 0),
            float(trade.get("swap") or 0),
            float(trade.get("commission") or 0),
            parse_time(trade.get("open_time")),
            parse_time(trade.get("close_time")),
            now,
            now,
        ),
    )
    return conn.total_changes > before


def insert_snapshot(conn: sqlite3.Connection, account_id: str, snapshot: dict[str, Any] | None) -> None:
    if not snapshot:
        return
    now = utc_now()
    conn.execute(
        """
        INSERT INTO account_snapshots (
          account_id, balance, equity, floating_pl, margin, free_margin, timestamp, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            account_id,
            float(snapshot.get("balance") or 0),
            float(snapshot.get("equity") or 0),
            float(snapshot.get("floating_pl") or 0),
            float(snapshot.get("margin") or 0),
            float(snapshot.get("free_margin") or 0),
            parse_time(snapshot.get("timestamp") or now),
            now,
        ),
    )


def log_sync(conn: sqlite3.Connection, account_id: str | None, source: str | None, status: str, message: str, count: int) -> None:
    conn.execute(
        """
        INSERT INTO sync_logs (account_id, source, status, message, trades_received, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (account_id, source, status, message, count, utc_now()),
    )


def ingest_sync(payload: dict[str, Any]) -> dict[str, Any]:
    init_db()
    with connect() as conn:
        account = upsert_account(conn, payload["account"])
        insert_snapshot(conn, account["account_id"], payload.get("snapshot"))
        inserted_or_updated = 0
        for trade in payload.get("trades", []):
            if upsert_trade(conn, account["account_id"], account["platform"], trade):
                inserted_or_updated += 1
        log_sync(conn, account["account_id"], payload.get("source"), "ok", "sync accepted", len(payload.get("trades", [])))
        return {
            "account_id": account["account_id"],
            "slug": account["slug"],
            "trades_received": len(payload.get("trades", [])),
            "trades_inserted_or_updated": inserted_or_updated,
        }


def latest_snapshot(conn: sqlite3.Connection, account_id: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT balance, equity, floating_pl, margin, free_margin, timestamp
        FROM account_snapshots
        WHERE account_id = ?
        ORDER BY timestamp DESC, id DESC
        LIMIT 1
        """,
        (account_id,),
    ).fetchone()
    return row_to_dict(row)


def merge_snapshot(conn: sqlite3.Connection, account: dict[str, Any]) -> dict[str, Any]:
    snapshot = latest_snapshot(conn, account["account_id"])
    if snapshot:
        account.update(snapshot)
    return with_result_metadata(account)


def list_accounts(account_ids: list[str] | None = None, include_hidden: bool = False) -> list[dict[str, Any]]:
    init_db()
    with connect() as conn:
        clauses: list[str] = []
        params: list[Any] = []
        if account_ids is not None:
            if not account_ids:
                return []
            clauses.append(f"account_id IN ({','.join('?' for _ in account_ids)})")
            params.extend(account_ids)
        if not include_hidden:
            clauses.append("visible = 1")
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        rows = conn.execute(f"SELECT * FROM accounts {where} ORDER BY display_name", params).fetchall()
        return [merge_snapshot(conn, row_to_dict(row) or {}) for row in rows]


def get_account_by_slug(slug: str, account_ids: list[str] | None = None) -> dict[str, Any] | None:
    init_db()
    with connect() as conn:
        params: list[Any] = [slug]
        where = "slug = ? AND visible = 1"
        if account_ids is not None:
            if not account_ids:
                return None
            where += f" AND account_id IN ({','.join('?' for _ in account_ids)})"
            params.extend(account_ids)
        row = conn.execute(f"SELECT * FROM accounts WHERE {where}", params).fetchone()
        account = row_to_dict(row)
        return merge_snapshot(conn, account) if account else None


def get_trades(account_id: str, date: str | None = None) -> list[dict[str, Any]]:
    init_db()
    with connect() as conn:
        params: list[Any] = [account_id]
        where = "account_id = ?"
        if date:
            where += " AND substr(close_time, 1, 10) = ?"
            params.append(date)
        rows = conn.execute(
            f"""
            SELECT *, (profit + swap + commission) AS net_profit
            FROM trades
            WHERE {where}
            ORDER BY close_time DESC, ticket DESC
            """,
            params,
        ).fetchall()
        return [row_to_dict(row) or {} for row in rows]


def daily_pnl(account_id: str) -> list[dict[str, Any]]:
    init_db()
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT
              substr(close_time, 1, 10) AS date,
              SUM(profit + swap + commission) AS profit,
              COUNT(*) AS trades
            FROM trades
            WHERE account_id = ?
            GROUP BY substr(close_time, 1, 10)
            ORDER BY date ASC
            """,
            (account_id,),
        ).fetchall()
        return [row_to_dict(row) or {} for row in rows]


def equity_curve(account_id: str) -> list[dict[str, Any]]:
    init_db()
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT ticket, symbol, close_time, profit, swap, commission,
                   (profit + swap + commission) AS net_profit
            FROM trades
            WHERE account_id = ?
            ORDER BY close_time ASC, ticket ASC
            """,
            (account_id,),
        ).fetchall()
        cumulative = 0.0
        points: list[dict[str, Any]] = []
        for row in rows:
            item = row_to_dict(row) or {}
            cumulative += float(item["net_profit"])
            points.append(
                {
                    "ticket": item["ticket"],
                    "symbol": item["symbol"],
                    "date": item["close_time"][:10],
                    "timestamp": item["close_time"],
                    "profit": item["net_profit"],
                    "equity": round(cumulative, 2),
                }
            )
        return points


def stats(account_id: str) -> dict[str, Any]:
    trades = list(reversed(get_trades(account_id)))
    daily = daily_pnl(account_id)
    net_values = [float(trade["net_profit"]) for trade in trades]
    wins = [value for value in net_values if value > 0]
    losses = [value for value in net_values if value < 0]
    total_profit = sum(net_values)
    avg_win = sum(wins) / len(wins) if wins else 0
    avg_loss = abs(sum(losses) / len(losses)) if losses else 0
    best = max(daily, key=lambda item: item["profit"], default=None)
    worst = min(daily, key=lambda item: item["profit"], default=None)
    return {
        "total_profit": round(total_profit, 2),
        "win_rate": round((len(wins) / len(net_values)) * 100, 2) if net_values else 0,
        "average_rr": round(avg_win / avg_loss, 2) if avg_loss else 0,
        "best_day": best,
        "worst_day": worst,
        "number_of_trades": len(net_values),
        "wins": len(wins),
        "losses": len(losses),
        "average_trade": round(total_profit / len(net_values), 2) if net_values else 0,
    }


def resolve_share_token(token: str) -> list[str] | None:
    init_db()
    with connect() as conn:
        rows = conn.execute(
            "SELECT account_id FROM share_links WHERE token = ? AND active = 1",
            (token,),
        ).fetchall()
        if not rows:
            return []
        account_ids = [row["account_id"] for row in rows if row["account_id"]]
        return account_ids or None


def create_share_link(token: str | None = None, account_id: str | None = None, label: str | None = None, active: bool = True) -> dict[str, Any]:
    init_db()
    now = utc_now()
    share_token = token or secrets.token_urlsafe(32)
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO share_links (token, account_id, label, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(token) DO UPDATE SET
              account_id=excluded.account_id,
              label=excluded.label,
              active=excluded.active,
              updated_at=excluded.updated_at
            """,
            (share_token, account_id, label, 1 if active else 0, now, now),
        )
        row = conn.execute("SELECT * FROM share_links WHERE token = ?", (share_token,)).fetchone()
        return row_to_dict(row) or {}


def trades_by_day(account_id: str) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for trade in get_trades(account_id):
        grouped[trade["close_time"][:10]].append(trade)
    return dict(grouped)
