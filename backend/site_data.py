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
        "slug": "aurix-neural-edge-ai",
        "name": "AURIX",
        "category": "expert-advisors",
        "strategy_type": "Gold grid EA",
        "tagline": "Gold-focused MT4 Expert Advisor with optimized Tolea Systems set files.",
        "description": (
            "AURIX Neural Edge AI is an MT4 Expert Advisor for XAUUSD. It combines a higher-timeframe "
            "trend bias with short-timeframe momentum confirmation, then manages recovery cycles with "
            "fixed-lot grid logic and ATR-adaptive spacing. The product is designed for traders who want "
            "structured gold automation with clear chart telemetry, not a black-box terminal."
        ),
        "features": [
            "Higher-timeframe trend bias with M5 momentum confirmation",
            "ATR-adaptive grid spacing for changing gold volatility",
            "Fixed-lot recovery grid with group break-even and TP logic",
            "Chart visuals for break-even, target, and next grid levels",
            "PnL heatmap and equity sparkline concepts",
            "Layered protection including equity caution and emergency stop concepts",
        ],
        "receive": [
            "Optimized set file",
            "Custom setup guidance",
            "Practical installation help",
            "Recommended broker and account settings",
            "Risk management settings",
            "Multiple set file variants",
            "Support until implementation",
        ],
        "recommended_setup": [
            "Platform: MetaTrader 4",
            "Symbol: XAUUSD",
            "Timeframe: M1",
            "Broker profile: RoboForex cent account conditions",
            "Execution: low-latency VPS recommended",
        ],
        "risk_warning": (
            "AURIX is grid-based. Recovery cycles can create meaningful floating drawdown, especially "
            "during fast gold sessions or news events. Use risk capital only and monitor the account."
        ),
        "symbols": ["XAUUSD"],
        "timeframe": "M1",
        "platform": ["MT4"],
        "min_deposit": 150,
        "recommended_leverage": "1:500+",
        "risk_level": "Moderate",
        "monthly_return": 2.95,
        "drawdown": 3.38,
        "win_rate": 64.7,
        "profit_factor": 1.78,
        "rating": 4.33,
        "review_count": 11,
        "price": 49,
        "compare_at_price": 98,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/174228",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/matrader-ai/12049485",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12049485&type=6",
        "logo": "/assets/products/aurix/aurix-neural-edge-logo-200x200-6931.png",
        "image": "/assets/products/aurix/aurix-neural-edge-screen-2217-preview.jpg",
        "gallery": [
            "/assets/products/aurix/aurix-neural-edge-screen-2023.png",
            "/assets/products/aurix/aurix-neural-edge-screen-2217-preview.jpg",
            "/assets/products/aurix/aurix-neural-edge-screen-2595.png",
            "/assets/products/aurix/aurix-neural-edge-screen-3946.png",
        ],
    },
    {
        "slug": "matrader-ai",
        "name": "MATrader AI",
        "category": "expert-advisors",
        "strategy_type": "XAUUSD AI EA",
        "tagline": "XAUUSD M1 MT4 Expert Advisor with optimized set files and implementation support.",
        "description": (
            "MATrader AI is an MT4 Expert Advisor focused on XAUUSD M1. It uses adaptive cycle/grid "
            "logic, neural-style entry filtering, flexible lot handling, and account-level protection "
            "tools. The setup is mainly intended for RoboForex cent account conditions where small lot "
            "granularity and execution costs match the strategy profile."
        ),
        "features": [
            "Optimized for XAUUSD M1 standard settings",
            "Adaptive cycle and grid management options",
            "Neural-style entry timing and configurable trade filters",
            "Lot flexibility with fixed or balance-scaled sizing",
            "News, time, and day filters for volatile sessions",
            "Profit protection through break-even, trailing, and equity controls",
        ],
        "receive": [
            "Optimized set file",
            "Custom setup guidance",
            "Practical installation help",
            "Recommended broker and account settings",
            "Risk management settings",
            "Multiple set file variants",
            "Support until implementation",
        ],
        "recommended_setup": [
            "Platform: MetaTrader 4",
            "Symbol: XAUUSD",
            "Timeframe: M1",
            "Broker profile: RoboForex cent account with small lot granularity",
            "Execution: VPS recommended for stable trade handling",
        ],
        "risk_warning": (
            "MATrader AI can use grid and recovery logic. Wrong broker conditions, oversized lots, or "
            "high-impact news can materially change risk and drawdown."
        ),
        "symbols": ["XAUUSD"],
        "timeframe": "M1",
        "platform": ["MT4"],
        "min_deposit": 200,
        "recommended_leverage": "1:2000",
        "risk_level": "Moderate",
        "monthly_return": 2.4,
        "drawdown": 4.8,
        "win_rate": 71.3,
        "profit_factor": 1.62,
        "rating": 4.63,
        "review_count": 146,
        "price": 49,
        "compare_at_price": 98,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/147979",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/matrader/12039419",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12039419&type=6",
        "logo": "/assets/products/matrader-ai/matraderea-logo-200x200-5739.png",
        "image": "/assets/products/matrader-ai/matraderea-logo-200x200-5739.png",
        "gallery": [],
    },
    {
        "slug": "matrader-quickscalper",
        "name": "QuickScalper",
        "category": "expert-advisors",
        "strategy_type": "Scalping EA",
        "tagline": "MT4 scalping Expert Advisor prepared with risk-focused custom set files.",
        "description": (
            "MATrader QuickScalper is a separate MT4 Expert Advisor in the MATrader ecosystem. It is "
            "focused on short trade cycles, fast execution, strict trade handling, and cent-account lot "
            "granularity. It is designed as a focused scalping system rather than a simplified version "
            "of MATrader AI."
        ),
        "features": [
            "Dedicated scalping engine with short trade duration focus",
            "Strict execution discipline and controlled trade frequency",
            "Money management with fixed or balance-based lot handling",
            "Equity stop and deeper-cycle protection controls",
            "Primary HiLo trailing plus optional advanced trailing modules",
            "News filter, Friday close logic, and Monday delayed start logic",
        ],
        "receive": [
            "Optimized set file",
            "Custom setup guidance",
            "Practical installation help",
            "Recommended broker and account settings",
            "Risk management settings",
            "Multiple set file variants",
            "Support until implementation",
        ],
        "recommended_setup": [
            "Platform: MetaTrader 4",
            "Symbol/timeframe: use the product input recommendations",
            "Broker profile: RoboForex cent account with 0.0001 lot capability",
            "Execution: low spread and stable VPS conditions",
        ],
        "risk_warning": (
            "Scalping is sensitive to spread, execution quality, broker feed, and latency. Results can "
            "change quickly when costs or fills differ from the optimized environment."
        ),
        "symbols": ["XAUUSD"],
        "timeframe": "Scalping setup",
        "platform": ["MT4"],
        "min_deposit": 200,
        "recommended_leverage": "1:500+",
        "risk_level": "Moderate",
        "monthly_return": 2.95,
        "drawdown": 3.38,
        "win_rate": 64.7,
        "profit_factor": 1.78,
        "rating": 4.6,
        "review_count": 1,
        "price": 49,
        "compare_at_price": 98,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/158178",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/dsys-beta/12049164",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6",
        "logo": "/assets/products/quickscalper/matrader-quickscalper-logo-200x200-4159.png",
        "image": "/assets/products/quickscalper/matrader-quickscalper-screen-4323-preview.jpg",
        "gallery": [
            "/assets/products/quickscalper/matrader-quickscalper-screen-2320.png",
            "/assets/products/quickscalper/matrader-quickscalper-screen-4323-preview.jpg",
            "/assets/products/quickscalper/matrader-quickscalper-screen-5743.png",
            "/assets/products/quickscalper/matrader-quickscalper-screen-7093-preview.jpg",
        ],
    },
]


REVIEWS: dict[str, list[dict[str, Any]]] = {
    "aurix-neural-edge-ai": [],
    "matrader-ai": [],
    "matrader-quickscalper": [],
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
