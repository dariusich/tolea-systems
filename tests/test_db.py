from __future__ import annotations

import os

from backend import db
from backend import mt4_bridge


def payload(account_id: str = "mt5:Broker:1001", ticket: str = "42") -> dict:
    return {
        "source": "test",
        "account": {
            "account_id": account_id,
            "platform": "MT5",
            "login": account_id.rsplit(":", 1)[-1],
            "name": "Test Account",
            "broker": "Broker",
            "server": "Broker",
            "currency": "USD",
            "visible": True,
        },
        "snapshot": {
            "balance": 10000,
            "equity": 10025,
            "floating_pl": 25,
            "margin": 0,
            "free_margin": 10025,
            "timestamp": "2026-05-30T10:00:00+00:00",
        },
        "trades": [
            {
                "ticket": ticket,
                "symbol": "EURUSD",
                "volume": 0.1,
                "profit": 120,
                "swap": -1,
                "commission": -4,
                "open_time": "2026-05-29T10:00:00+00:00",
                "close_time": "2026-05-30T12:00:00+00:00",
            }
        ],
    }


def test_ingest_stats_daily_and_equity(tmp_path):
    db.DATABASE_PATH = tmp_path / "trades.sqlite"
    db.init_db()

    result = db.ingest_sync(payload())
    assert result["trades_received"] == 1

    account = db.get_account_by_slug("test-account")
    assert account is not None
    assert account["equity"] == 10025

    stats = db.stats(account["account_id"])
    assert stats["total_profit"] == 115
    assert stats["win_rate"] == 100
    assert stats["number_of_trades"] == 1

    days = db.daily_pnl(account["account_id"])
    assert days == [{"date": "2026-05-30", "profit": 115.0, "trades": 1}]

    equity = db.equity_curve(account["account_id"])
    assert equity[-1]["equity"] == 115


def test_same_ticket_is_unique_per_account(tmp_path):
    db.DATABASE_PATH = tmp_path / "trades.sqlite"
    db.init_db()

    db.ingest_sync(payload("mt5:Broker:1001", "99"))
    db.ingest_sync(payload("mt5:Broker:1002", "99"))

    first = db.get_account_by_slug("test-account")
    second = db.get_account_by_slug("test-account-2")

    assert first is not None
    assert second is not None
    assert len(db.get_trades(first["account_id"])) == 1
    assert len(db.get_trades(second["account_id"])) == 1


def test_share_link_can_limit_accounts(tmp_path):
    db.DATABASE_PATH = tmp_path / "trades.sqlite"
    db.init_db()

    first = db.ingest_sync(payload("mt5:Broker:1001", "1"))
    db.ingest_sync(payload("mt5:Broker:1002", "2"))
    db.create_share_link(token="readonly", account_id=first["account_id"])

    allowed = db.resolve_share_token("readonly")
    accounts = db.list_accounts(allowed)

    assert allowed == [first["account_id"]]
    assert [account["account_id"] for account in accounts] == [first["account_id"]]


def test_known_accounts_get_friendly_names_and_stable_slugs(tmp_path):
    db.DATABASE_PATH = tmp_path / "trades.sqlite"
    db.init_db()

    mt4 = payload("mt4:RoboForex-ProCent-5:35115307", "177817658")
    mt4["account"].update({"platform": "MT4", "login": "35115307", "name": "MT4 35115307"})
    mt5 = payload("mt5:RoboForex-ECN:77045247", "528866508")
    mt5["account"].update({"platform": "MT5", "login": "77045247", "name": "MT5 77045247"})

    mt4_result = db.ingest_sync(mt4)
    mt5_result = db.ingest_sync(mt5)

    assert mt4_result["slug"] == "mt4-35115307"
    assert mt5_result["slug"] == "mt5-77045247"
    assert db.get_account_by_slug("mt4-35115307")["display_name"] == "DSys Beta"
    assert db.get_account_by_slug("mt5-77045247")["display_name"] == "DSys Alpha"
    assert db.get_account_by_slug("mt4-35115307")["resultSource"] == "myfxbook"
    assert db.get_account_by_slug("mt5-77045247")["resultSource"] == "liveCollector"


def test_mt4_default_spool_paths_ignore_processed_archives(tmp_path, monkeypatch):
    appdata = tmp_path / "AppData" / "Roaming"
    folder = appdata / "MetaQuotes" / "Terminal" / "Common" / "Files" / "TradeJournalPro"
    folder.mkdir(parents=True)
    active = folder / "mt4_35115307.jsonl"
    processed = folder / "mt4_35115307.processed-20260530150000.jsonl"
    active.write_text("", encoding="utf-8")
    processed.write_text("", encoding="utf-8")

    monkeypatch.setenv("APPDATA", str(appdata))
    monkeypatch.delenv("TRADEJOURNAL_MT4_SPOOL", raising=False)

    if os.name == "nt":
        assert mt4_bridge.default_spool_paths() == [active]
        assert mt4_bridge.processed_spool_paths() == [processed]
