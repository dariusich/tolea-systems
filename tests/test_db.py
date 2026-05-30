from __future__ import annotations

from backend import db


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

