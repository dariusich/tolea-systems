from __future__ import annotations

from fastapi.testclient import TestClient

from backend import db
from backend.api import COLLECTOR_API_KEY, app


def sync_payload() -> dict:
    return {
        "source": "pytest",
        "account": {
            "account_id": "mt4:RoboForex-ProCent-5:35115307",
            "platform": "MT4",
            "login": "35115307",
            "name": "MT4 35115307",
            "broker": "RoboForex Ltd",
            "server": "RoboForex-ProCent-5",
            "currency": "USD",
            "visible": True,
        },
        "snapshot": {
            "balance": 10206.98,
            "equity": 10206.98,
            "floating_pl": 0,
            "margin": 0,
            "free_margin": 10206.98,
            "timestamp": "2026-05-29T23:58:59+00:00",
        },
        "trades": [
            {
                "ticket": "177817658",
                "symbol": "XAUUSD",
                "volume": 0.01,
                "profit": -0.01,
                "swap": 0,
                "commission": 0,
                "open_time": "2026-05-29T19:08:00+00:00",
                "close_time": "2026-05-29T19:09:11+00:00",
            }
        ],
    }


def client_for_tmp_db(tmp_path) -> TestClient:
    db.DATABASE_PATH = tmp_path / "trades.sqlite"
    db.init_db()
    return TestClient(app)


def test_site_products_featured_and_blog(tmp_path):
    client = client_for_tmp_db(tmp_path)

    products = client.get("/api/products").json()["products"]
    featured = client.get("/api/products/featured").json()["products"]
    blog = client.get("/api/blog").json()["posts"]

    assert [product["slug"] for product in products] == [
        "aurix-neural-edge-ai",
        "matrader-ai",
        "matrader-quickscalper",
    ]
    assert all(product["featured"] for product in featured)
    assert all(product["price"] == 49 and product["compare_at_price"] == 250 for product in products)
    assert all(product["resultSource"] == "myfxbook" for product in products)
    by_slug = {product["slug"]: product for product in products}
    assert by_slug["aurix-neural-edge-ai"]["myfxbook_widget_url"].endswith("accountOid=12060369&type=6")
    assert by_slug["matrader-ai"]["myfxbook_url"] == "https://www.myfxbook.com/members/dariusch/matrader/12039419"
    assert by_slug["matrader-quickscalper"]["myfxbook_url"] == "https://www.myfxbook.com/members/dariusch/dsys-beta/12049164"
    assert any(post["slug"] == "why-live-results-matter" for post in blog)


def test_site_accounts_map_real_trading_data(tmp_path):
    client = client_for_tmp_db(tmp_path)
    db.ingest_sync(sync_payload())

    response = client.get("/api/accounts")
    assert response.status_code == 200
    body = response.json()

    assert body["summary"]["active_systems"] == 1
    assert body["summary"]["myfxbook_systems"] == 1
    assert body["summary"]["live_systems"] == 0
    assert body["accounts"][0]["name"] == "DSys Beta"
    assert body["accounts"][0]["resultSource"] == "myfxbook"
    assert body["accounts"][0]["myfxbook"]["profile_url"].endswith("/12049164")

    detail = client.get("/api/accounts/mt4-35115307").json()
    assert detail["account"]["trades_count"] == 1
    assert detail["trades"][0]["ticket"] == "177817658"


def test_ingest_sync_endpoint_still_requires_collector_key(tmp_path):
    client = client_for_tmp_db(tmp_path)

    unauthorized = client.post("/ingest/sync", json=sync_payload())
    assert unauthorized.status_code == 401

    accepted = client.post("/ingest/sync", json=sync_payload(), headers={"X-Collector-Key": COLLECTOR_API_KEY})
    assert accepted.status_code == 200
    assert accepted.json()["result"]["slug"] == "mt4-35115307"
