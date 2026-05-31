from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from . import db
from .site_data import CATEGORIES, REVIEWS, all_blog_posts, all_products, blog_by_slug, product_by_slug


router = APIRouter(prefix="/api", tags=["site"])

MYFXBOOK_DSYS_BETA = "https://www.myfxbook.com/members/dariusch/dsys-beta/12049164"
DEMO_ORDERS: dict[str, dict[str, Any]] = {}


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _num(value: Any) -> float:
    try:
        number = float(value)
        if math.isfinite(number):
            return number
    except (TypeError, ValueError):
        pass
    return 0.0


def _product_list(
    q: str | None = None,
    category: str | None = None,
    platform: str | None = None,
    risk: str | None = None,
    sort: str = "featured",
) -> list[dict[str, Any]]:
    products = all_products()
    if q:
        query = q.casefold()
        products = [
            item
            for item in products
            if query in item["name"].casefold()
            or query in item.get("tagline", "").casefold()
            or query in item.get("strategy_type", "").casefold()
        ]
    if category:
        products = [item for item in products if item.get("category") == category]
    if platform:
        products = [item for item in products if platform.upper() in [p.upper() for p in item.get("platform", [])]]
    if risk:
        products = [item for item in products if item.get("risk_level", "").casefold() == risk.casefold()]

    if sort == "monthly_return":
        products.sort(key=lambda item: _num(item.get("monthly_return")), reverse=True)
    elif sort == "rating":
        products.sort(key=lambda item: _num(item.get("rating")), reverse=True)
    elif sort == "price_asc":
        products.sort(key=lambda item: _num(item.get("price")))
    elif sort == "price_desc":
        products.sort(key=lambda item: _num(item.get("price")), reverse=True)
    else:
        products.sort(key=lambda item: (not item.get("featured"), item.get("name", "")))
    return products


def _account_product_slug(account: dict[str, Any]) -> str:
    platform = str(account.get("platform") or "").upper()
    login = str(account.get("login") or "")
    if platform == "MT4" and login == "35115307":
        return "matrader-quickscalper"
    if platform == "MT5" and login == "77045247":
        return "aurix-neural-edge-ai"
    return db.slugify(str(account.get("display_name") or account.get("name") or account.get("slug") or "system"))


def _days_active(trades: list[dict[str, Any]]) -> int:
    return len({str(trade.get("close_time") or "")[:10] for trade in trades if trade.get("close_time")})


def _current_month_profit(account_id: str) -> float:
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    return sum(_num(day.get("profit")) for day in db.daily_pnl(account_id) if str(day.get("date", "")).startswith(current_month))


def _chart_for_account(account: dict[str, Any], trades: list[dict[str, Any]]) -> list[dict[str, Any]]:
    account_id = str(account["account_id"])
    points = db.equity_curve(account_id)
    balance = _num(account.get("balance"))
    equity = _num(account.get("equity")) or balance

    if not points:
        timestamp = account.get("timestamp") or account.get("last_sync_at")
        if not timestamp:
            return []
        date = str(timestamp)[:10]
        return [{"date": date, "balance": balance, "equity": equity, "drawdown": 0.0}]

    total_closed = _num(points[-1].get("equity"))
    base_balance = balance - total_closed if balance else 0.0
    peak = base_balance
    chart: list[dict[str, Any]] = []
    for point in points:
        closed_equity = base_balance + _num(point.get("equity"))
        peak = max(peak, closed_equity)
        drawdown = ((peak - closed_equity) / peak * 100) if peak else 0.0
        chart.append(
            {
                "date": point["date"],
                "balance": round(closed_equity, 2),
                "equity": round(closed_equity, 2),
                "drawdown": round(drawdown, 2),
            }
        )
    return chart


def _trades_for_site(trades: list[dict[str, Any]]) -> list[dict[str, Any]]:
    mapped: list[dict[str, Any]] = []
    for trade in trades:
        profit = _num(trade.get("net_profit", trade.get("profit")))
        mapped.append(
            {
                "id": f"{trade.get('account_id', '')}-{trade.get('ticket')}",
                "ticket": str(trade.get("ticket") or ""),
                "symbol": trade.get("symbol") or "UNKNOWN",
                "action": "Closed",
                "lots": _num(trade.get("volume")),
                "pips": 0,
                "profit": round(profit, 2),
                "open_time": trade.get("open_time"),
                "close_time": trade.get("close_time"),
                "status": "closed",
            }
        )
    return mapped


def _site_account(account: dict[str, Any]) -> dict[str, Any]:
    account_id = str(account["account_id"])
    trades = db.get_trades(account_id)
    stats = db.stats(account_id)
    chart = _chart_for_account(account, trades)
    balance = _num(account.get("balance"))
    equity = _num(account.get("equity")) or balance
    total_profit = _num(stats.get("total_profit"))
    gain_base = balance - total_profit if balance and balance != total_profit else balance
    total_gain = (total_profit / gain_base * 100) if gain_base else 0.0
    monthly_gain = (_current_month_profit(account_id) / gain_base * 100) if gain_base else 0.0
    drawdown = max([_num(point.get("drawdown")) for point in chart], default=0.0)
    display_name = account.get("display_name") or account.get("name") or f"{account.get('platform')} {account.get('login')}"
    product_slug = _account_product_slug(account)

    result = {
        "id": account_id,
        "slug": account.get("slug"),
        "name": display_name,
        "display_name": display_name,
        "broker": account.get("broker") or "Connected broker",
        "server": account.get("server"),
        "platform": account.get("platform"),
        "login": account.get("login"),
        "currency": account.get("currency") or "USD",
        "system_name": display_name,
        "system_slug": product_slug,
        "chart": chart,
        "balance": round(balance, 2),
        "equity": round(equity, 2),
        "floating_pl": round(_num(account.get("floating_pl")), 2),
        "total_profit": round(total_profit, 2),
        "total_gain": round(total_gain, 2),
        "monthly_gain": round(monthly_gain, 2),
        "drawdown": round(drawdown, 2),
        "win_rate": round(_num(stats.get("win_rate")), 2),
        "profit_factor": round(_num(stats.get("average_rr")), 2),
        "trades_count": int(stats.get("number_of_trades") or 0),
        "days_active": _days_active(trades),
        "last_sync_at": account.get("last_sync_at"),
    }
    if str(account.get("platform")).upper() == "MT4" and str(account.get("login")) == "35115307":
        result["myfxbook"] = {
            "profile_url": MYFXBOOK_DSYS_BETA,
            "label": "DSys Beta verified profile",
        }
    return result


def _accounts_payload() -> dict[str, Any]:
    accounts = [_site_account(account) for account in db.list_accounts()]
    active = len(accounts)
    total_profit = round(sum(_num(account.get("total_profit")) for account in accounts), 2)
    avg_monthly = round(sum(_num(account.get("monthly_gain")) for account in accounts) / active, 2) if active else 0.0
    avg_total = round(sum(_num(account.get("total_gain")) for account in accounts) / active, 2) if active else 0.0
    max_drawdown = round(max([_num(account.get("drawdown")) for account in accounts], default=0.0), 2)
    return {
        "accounts": accounts,
        "summary": {
            "active_systems": active,
            "avg_monthly_gain": avg_monthly,
            "avg_total_gain": avg_total,
            "max_drawdown": max_drawdown,
            "total_profit": total_profit,
        },
    }


def _aggregated_pnl_days() -> list[dict[str, Any]]:
    totals: dict[str, dict[str, Any]] = {}
    for account in db.list_accounts():
        for day in db.daily_pnl(account["account_id"]):
            date = str(day["date"])
            target = totals.setdefault(date, {"date": date, "profit": 0.0, "trades": 0})
            target["profit"] += _num(day.get("profit"))
            target["trades"] += int(day.get("trades") or 0)
    return [
        {"date": date, "profit": round(item["profit"], 2), "trades": item["trades"]}
        for date, item in sorted(totals.items())
    ]


def _make_order(payload: dict[str, Any], payment_method: str = "demo") -> dict[str, Any]:
    items: list[dict[str, Any]] = []
    subtotal = 0.0
    for requested in payload.get("items", []):
        product = product_by_slug(str(requested.get("product_slug") or ""))
        if not product:
            continue
        quantity = max(1, int(requested.get("quantity") or 1))
        line_total = round(_num(product["price"]) * quantity, 2)
        subtotal += line_total
        items.append(
            {
                "product_slug": product["slug"],
                "name": product["name"],
                "quantity": quantity,
                "price": _num(product["price"]),
                "line_total": line_total,
                "download_url": "#demo-download",
            }
        )
    if not items:
        raise HTTPException(status_code=400, detail="No valid products in order.")

    coupon = payload.get("coupon_code")
    discount = round(subtotal * 0.1, 2) if str(coupon or "").upper() == "LAUNCH10" else 0.0
    total = round(subtotal - discount, 2)
    customer = payload.get("customer") or {}
    order_id = f"demo-{uuid.uuid4().hex[:12]}"
    order = {
        "id": order_id,
        "order_number": f"TS-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(DEMO_ORDERS) + 1:04d}",
        "customer_name": customer.get("name") or "Demo Trader",
        "customer_email": customer.get("email") or "demo@toleasystems.com",
        "customer": customer,
        "items": items,
        "subtotal": round(subtotal, 2),
        "discount": discount,
        "coupon": coupon,
        "total": total,
        "status": "paid",
        "payment_method": payment_method,
        "created_at": _now(),
        "demo_safe": True,
    }
    DEMO_ORDERS[order_id] = order
    return order


def _get_order(order_id: str) -> dict[str, Any]:
    order = DEMO_ORDERS.get(order_id)
    if not order:
        product = product_by_slug("aurix-neural-edge-ai") or all_products()[0]
        order = _make_order(
            {
                "items": [{"product_slug": product["slug"], "quantity": 1}],
                "customer": {"name": "Demo Trader", "email": "demo@toleasystems.com"},
            },
            payment_method="demo",
        )
        order["id"] = order_id
        DEMO_ORDERS[order_id] = order
    return order


@router.get("/")
def api_root() -> dict[str, Any]:
    return {"ok": True, "name": "Tolea Systems site API"}


@router.get("/categories")
def categories() -> dict[str, Any]:
    return {"categories": CATEGORIES}


@router.get("/products")
def products(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    platform: str | None = Query(default=None),
    risk: str | None = Query(default=None),
    sort: str = Query(default="featured"),
) -> dict[str, Any]:
    return {"products": _product_list(q=q, category=category, platform=platform, risk=risk, sort=sort)}


@router.get("/products/featured")
def products_featured() -> dict[str, Any]:
    return {"products": [product for product in all_products() if product.get("featured")]}


@router.get("/products/{slug}")
def product_detail(slug: str) -> dict[str, Any]:
    product = product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"product": product, "reviews": REVIEWS.get(slug, [])}


@router.get("/products/{slug}/can-review")
def can_review(slug: str) -> dict[str, Any]:
    if not product_by_slug(slug):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"can_review": False, "has_reviewed": False, "reason": "Reviews require real customer accounts later."}


@router.post("/reviews")
def create_review() -> dict[str, Any]:
    raise HTTPException(status_code=403, detail="Reviews are demo-safe until real customer accounts are connected.")


@router.get("/blog")
def blog() -> dict[str, Any]:
    return {"posts": all_blog_posts()}


@router.get("/blog/{slug}")
def blog_detail(slug: str) -> dict[str, Any]:
    post = blog_by_slug(slug)
    if not post or not post.get("published", True):
        raise HTTPException(status_code=404, detail="Post not found")
    return {"post": post}


@router.get("/accounts")
def site_accounts() -> dict[str, Any]:
    return _accounts_payload()


@router.get("/accounts/{slug}")
def site_account(slug: str) -> dict[str, Any]:
    account = db.get_account_by_slug(slug)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    trades = db.get_trades(account["account_id"])
    return {"account": _site_account(account), "trades": _trades_for_site(trades)}


@router.get("/calendar/pnl")
def calendar_pnl() -> dict[str, Any]:
    return {"days": _aggregated_pnl_days()}


@router.post("/auth/login")
def auth_login(payload: dict[str, Any]) -> dict[str, Any]:
    email = str(payload.get("email") or "demo@toleasystems.com")
    role = "admin" if "admin" in email.casefold() else "customer"
    return {
        "user": {
            "id": "demo-user",
            "name": payload.get("name") or ("Admin" if role == "admin" else "Demo Trader"),
            "email": email,
            "role": role,
            "demo_safe": True,
        }
    }


@router.post("/auth/register")
def auth_register(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "user": {
            "id": "demo-user",
            "name": payload.get("name") or "Demo Trader",
            "email": payload.get("email") or "demo@toleasystems.com",
            "role": "customer",
            "demo_safe": True,
        }
    }


@router.get("/auth/me")
def auth_me() -> dict[str, Any]:
    raise HTTPException(status_code=401, detail="No persistent demo session.")


@router.post("/auth/logout")
def auth_logout() -> dict[str, Any]:
    return {"ok": True}


@router.post("/auth/forgot-password")
def forgot_password() -> dict[str, Any]:
    return {"ok": True, "message": "Demo mode: no email was sent."}


@router.post("/auth/reset-password")
def reset_password() -> dict[str, Any]:
    return {"ok": True, "message": "Demo mode: password reset is not persisted."}


@router.post("/checkout/mock")
def checkout_mock(payload: dict[str, Any]) -> dict[str, Any]:
    return {"order": _make_order(payload, payment_method=payload.get("payment_method") or "mock_demo")}


@router.post("/checkout/stripe")
def checkout_stripe(payload: dict[str, Any]) -> dict[str, Any]:
    order = _make_order(payload, payment_method="stripe_demo")
    origin = str(payload.get("origin_url") or "").rstrip("/") or ""
    return {"url": f"{origin}/#/checkout/return?session_id={order['id']}", "session_id": order["id"], "demo_safe": True}


@router.get("/checkout/stripe/status/{session_id}")
def checkout_stripe_status(session_id: str) -> dict[str, Any]:
    order = _get_order(session_id)
    return {"status": "complete", "payment_status": "paid", "order_id": order["id"], "demo_safe": True}


@router.get("/orders")
def orders() -> dict[str, Any]:
    return {"orders": list(DEMO_ORDERS.values())}


@router.get("/orders/{order_id}")
def order_detail(order_id: str) -> dict[str, Any]:
    return {"order": _get_order(order_id)}


@router.get("/orders/{order_id}/invoice")
def invoice(order_id: str) -> dict[str, Any]:
    order = _get_order(order_id)
    invoice_data = {
        "invoice_number": f"INV-{order['order_number'].split('-')[-1]}",
        "order_number": order["order_number"],
        "issued_at": order["created_at"],
        "status": "paid",
        "issuer": {"email": "support@toleasystems.com", "site": "tolea-systems.onrender.com"},
        "bill_to": {
            "name": order.get("customer_name"),
            "email": order.get("customer_email"),
            "address": order.get("customer", {}).get("address"),
            "city": order.get("customer", {}).get("city"),
            "zip": order.get("customer", {}).get("zip"),
            "country": order.get("customer", {}).get("country"),
        },
        "payment_method": order.get("payment_method"),
        "items": order["items"],
        "subtotal": order["subtotal"],
        "discount": order["discount"],
        "coupon": order.get("coupon"),
        "total": order["total"],
    }
    return {"invoice": invoice_data}


@router.get("/me/downloads")
def downloads() -> dict[str, Any]:
    items: list[dict[str, Any]] = []
    for order in DEMO_ORDERS.values():
        for item in order["items"]:
            items.append(
                {
                    "product_slug": item["product_slug"],
                    "name": item["name"],
                    "order_number": order["order_number"],
                    "purchased_at": order["created_at"],
                    "download_url": "#demo-download",
                }
            )
    return {"downloads": items}


@router.get("/admin/stats")
def admin_stats() -> dict[str, Any]:
    orders = list(DEMO_ORDERS.values())
    return {
        "stats": {
            "revenue": round(sum(_num(order.get("total")) for order in orders), 2),
            "orders": len(orders),
            "products": len(all_products()),
            "customers": len({order.get("customer_email") for order in orders}) if orders else 0,
        },
        "recent_orders": orders[:5],
    }


@router.get("/admin/products")
def admin_products() -> dict[str, Any]:
    return {"products": all_products()}


@router.post("/admin/products")
def admin_create_product(payload: dict[str, Any]) -> dict[str, Any]:
    return {"ok": True, "product": payload, "demo_safe": True}


@router.patch("/admin/products/{slug}")
def admin_update_product(slug: str, payload: dict[str, Any]) -> dict[str, Any]:
    product = product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.update(payload)
    return {"ok": True, "product": product, "demo_safe": True}


@router.delete("/admin/products/{slug}")
def admin_delete_product(slug: str) -> dict[str, Any]:
    return {"ok": True, "deleted": slug, "demo_safe": True}


@router.get("/admin/orders")
def admin_orders() -> dict[str, Any]:
    return {"orders": list(DEMO_ORDERS.values())}


@router.get("/admin/customers")
def admin_customers() -> dict[str, Any]:
    customers: dict[str, dict[str, Any]] = {}
    for order in DEMO_ORDERS.values():
        email = order.get("customer_email") or "demo@toleasystems.com"
        customers[email] = {
            "id": email,
            "name": order.get("customer_name") or "Demo Trader",
            "email": email,
            "created_at": order.get("created_at") or _now(),
        }
    return {"customers": list(customers.values())}


@router.get("/admin/blog")
def admin_blog() -> dict[str, Any]:
    return {"posts": all_blog_posts(include_drafts=True)}


@router.post("/admin/blog")
def admin_create_blog(payload: dict[str, Any]) -> dict[str, Any]:
    return {"ok": True, "post": payload, "demo_safe": True}


@router.patch("/admin/blog/{slug}")
def admin_update_blog(slug: str, payload: dict[str, Any]) -> dict[str, Any]:
    post = blog_by_slug(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.update(payload)
    return {"ok": True, "post": post, "demo_safe": True}


@router.delete("/admin/blog/{slug}")
def admin_delete_blog(slug: str) -> dict[str, Any]:
    return {"ok": True, "deleted": slug, "demo_safe": True}
