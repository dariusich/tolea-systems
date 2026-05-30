from __future__ import annotations

from copy import deepcopy
from typing import Any


CATEGORIES: list[dict[str, Any]] = [
    {
        "slug": "expert-advisors",
        "name": "Expert Advisors",
        "description": "Automated MetaTrader systems built for disciplined execution.",
    },
    {
        "slug": "portfolio-systems",
        "name": "Portfolio Systems",
        "description": "Multi-symbol portfolios with public risk and performance reporting.",
    },
    {
        "slug": "indicators",
        "name": "Indicators",
        "description": "Decision-support tools for discretionary and hybrid traders.",
    },
]


PRODUCTS: list[dict[str, Any]] = [
    {
        "slug": "dsys-beta",
        "name": "DSys Beta",
        "category": "portfolio-systems",
        "strategy_type": "Gold portfolio",
        "tagline": "MT4 XAUUSD system with live account tracking and conservative sizing.",
        "description": (
            "DSys Beta is the public MT4 account currently connected to Tolea Systems. "
            "The live results page reads directly from the synchronized trading journal, while this "
            "marketplace page keeps product copy and checkout in demo-safe mode until licensing is wired."
        ),
        "features": [
            "MT4-ready execution profile",
            "Public Myfxbook verification link",
            "Live journal integration",
            "Risk-first position sizing notes",
            "Installation checklist",
            "Lifetime documentation updates",
        ],
        "symbols": ["XAUUSD"],
        "timeframe": "M5-M15",
        "platform": ["MT4"],
        "min_deposit": 500,
        "recommended_leverage": "1:100+",
        "risk_level": "Moderate",
        "monthly_return": 2.95,
        "drawdown": 3.38,
        "win_rate": 64.7,
        "profit_factor": 1.78,
        "rating": 4.9,
        "review_count": 18,
        "price": 349,
        "compare_at_price": 499,
        "featured": True,
        "image": "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1200&q=85",
    },
    {
        "slug": "dsys-alpha",
        "name": "DSys Alpha",
        "category": "expert-advisors",
        "strategy_type": "MT5 execution",
        "tagline": "MT5 account-ready strategy shell prepared for live collector analytics.",
        "description": (
            "DSys Alpha is reserved for the MT5 account integration. When the VPS collector syncs "
            "the logged-in MT5 terminal, the live results page will show the real account under this name."
        ),
        "features": [
            "MT5 terminal connector support",
            "Account-level PnL calendar",
            "Equity and drawdown analytics",
            "Trade table drilldown",
            "VPS collector compatibility",
            "Offline-safe journal storage",
        ],
        "symbols": ["XAUUSD", "EURUSD", "GBPUSD"],
        "timeframe": "M5-H1",
        "platform": ["MT5"],
        "min_deposit": 1000,
        "recommended_leverage": "1:100+",
        "risk_level": "Moderate",
        "monthly_return": 3.4,
        "drawdown": 4.2,
        "win_rate": 61.2,
        "profit_factor": 1.62,
        "rating": 4.8,
        "review_count": 11,
        "price": 399,
        "compare_at_price": 599,
        "featured": True,
        "image": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=85",
    },
    {
        "slug": "tolea-portfolio-monitor",
        "name": "Tolea Portfolio Monitor",
        "category": "indicators",
        "strategy_type": "Analytics",
        "tagline": "A dashboard companion for risk, open exposure, and closed-trade reporting.",
        "description": (
            "A visual analytics layer for traders who want a compact risk console around their "
            "MetaTrader workflow. This product page is static for now; it is included to preserve "
            "the full marketplace surface while the real product catalog is prepared."
        ),
        "features": [
            "Closed-trade journal view",
            "Daily PnL heatmap",
            "Symbol-level performance cards",
            "Export-ready reporting layout",
            "MT4 and MT5 account grouping",
            "Local-first data model",
        ],
        "symbols": ["All"],
        "timeframe": "All",
        "platform": ["MT4", "MT5"],
        "min_deposit": 0,
        "recommended_leverage": "Any",
        "risk_level": "Low",
        "monthly_return": 0,
        "drawdown": 0,
        "win_rate": 0,
        "profit_factor": 0,
        "rating": 4.7,
        "review_count": 7,
        "price": 149,
        "compare_at_price": 249,
        "featured": True,
        "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
    },
]


REVIEWS: dict[str, list[dict[str, Any]]] = {
    "dsys-beta": [
        {
            "id": "review-beta-1",
            "author": "Verified Trader",
            "rating": 5,
            "title": "Clean reporting and risk discipline",
            "body": "The important part is transparency: live reporting, clear trade history, and no screenshot-only performance claims.",
            "verified_purchase": True,
            "created_at": "2026-05-18T12:00:00+00:00",
        }
    ],
    "dsys-alpha": [],
    "tolea-portfolio-monitor": [],
}


BLOG_POSTS: list[dict[str, Any]] = [
    {
        "slug": "why-live-results-matter",
        "title": "Why live results matter more than screenshots",
        "excerpt": "A practical note on why every trading product needs a live account trail, not only static marketing images.",
        "content": (
            "Screenshots are easy to polish and hard to audit. A live results page changes the conversation "
            "because closed trades, equity, drawdown, and daily PnL can be checked over time.\n\n"
            "Tolea Systems keeps the collector separate from the public server: the VPS reads MT4 or MT5, "
            "then pushes closed-trade deltas to the API. That keeps the trading machine light while the "
            "website remains easy to share."
        ),
        "category": "Transparency",
        "author": "Tolea Systems",
        "read_minutes": 4,
        "published_at": "2026-05-21T09:00:00+00:00",
        "published": True,
        "cover": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    },
    {
        "slug": "mt4-mt5-collector-design",
        "title": "The MT4 and MT5 collector design",
        "excerpt": "How a lightweight VPS collector syncs broker data without running the full dashboard beside your terminals.",
        "content": (
            "The collector is intentionally small. MT4 writes a Common Files spool through the bridge EA, "
            "while MT5 is read through the official Python package from a logged-in terminal session.\n\n"
            "If the Render API is offline, the collector queues locally in SQLite and retries. The central "
            "database deduplicates by account id and ticket, so different brokers can reuse ticket numbers safely."
        ),
        "category": "Engineering",
        "author": "Tolea Systems",
        "read_minutes": 5,
        "published_at": "2026-05-24T09:00:00+00:00",
        "published": True,
        "cover": "https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=1200&q=85",
    },
    {
        "slug": "risk-first-marketplace",
        "title": "A risk-first marketplace is smaller on purpose",
        "excerpt": "Why the product catalog should stay curated while the live performance layer does the heavy lifting.",
        "content": (
            "A marketplace for trading systems should not reward quantity. The useful version is curated, "
            "clear about limitations, and connected to live results.\n\n"
            "The current marketplace pages are demo-safe: they let us shape the customer experience before "
            "payments, licensing, and support workflows are connected for real."
        ),
        "category": "Product",
        "author": "Tolea Systems",
        "read_minutes": 3,
        "published_at": "2026-05-27T09:00:00+00:00",
        "published": True,
        "cover": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    },
]


def product_by_slug(slug: str) -> dict[str, Any] | None:
    for product in PRODUCTS:
        if product["slug"] == slug:
            return deepcopy(product)
    return None


def blog_by_slug(slug: str) -> dict[str, Any] | None:
    for post in BLOG_POSTS:
        if post["slug"] == slug:
            return deepcopy(post)
    return None


def all_products() -> list[dict[str, Any]]:
    return deepcopy(PRODUCTS)


def all_blog_posts(include_drafts: bool = False) -> list[dict[str, Any]]:
    posts = BLOG_POSTS if include_drafts else [post for post in BLOG_POSTS if post.get("published", True)]
    return deepcopy(posts)
