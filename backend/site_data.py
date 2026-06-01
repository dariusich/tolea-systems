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
            "AURIX Neural Edge AI is an MT4 Expert Advisor prepared for XAUUSD trading with a disciplined "
            "grid-recovery structure. The system evaluates broader directional context together with shorter "
            "momentum confirmation before a cycle is allowed to start. Once a position is open, AURIX manages "
            "the basket with fixed-lot recovery levels, adaptive spacing, break-even logic, and group take-profit "
            "handling. The Tolea Systems package focuses on practical implementation: optimized set files, "
            "recommended account settings, and risk profiles designed to keep the strategy more controlled in "
            "real trading conditions. It is built for traders who want a structured gold EA with visible logic, "
            "clear setup instructions, and external result verification instead of an unclear black-box setup."
        ),
        "what_it_does": (
            "AURIX combines a trend filter, a momentum trigger, and recovery-cycle management. The EA waits for "
            "alignment before opening exposure, then adjusts the distance between recovery levels based on market "
            "conditions. The objective is not to win every individual entry, but to manage the complete cycle with "
            "defined risk controls, clean exits, and transparent chart feedback."
        ),
        "technical_requirements": [
            "MetaTrader 4 terminal installed on a stable VPS",
            "XAUUSD symbol enabled with low spread and stable execution",
            "Cent account preferred for finer lot scaling",
            "Account history and Expert Advisor permissions enabled",
            "Correct set file loaded before live trading",
        ],
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
        "resultSource": "myfxbook",
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
        "compare_at_price": 250,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/174228",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/matrader-ai/12049485",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12049485&type=6",
        "logo": "/assets/products/aurix/aurix-neural-edge-logo-200x200-6931.png",
        "image": "/assets/products/aurix/aurix-neural-edge-screen-2217.png",
        "gallery": [
            "/assets/products/aurix/aurix-neural-edge-screen-2023.png",
            "/assets/products/aurix/aurix-neural-edge-screen-2217.png",
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
            "MATrader AI is an MT4 Expert Advisor focused on XAUUSD M1 execution. It uses adaptive trade-cycle "
            "logic, entry filtering, configurable money management, and account-level protection tools to manage "
            "gold positions in a structured way. The Tolea Systems version is delivered with optimized set files "
            "and setup guidance so the EA is not installed with generic settings. The goal is to match the robot "
            "with broker conditions, account size, and risk profile before it is used on a real account. This "
            "makes MATrader AI suitable for traders who want a prepared gold automation package with practical "
            "implementation support and Myfxbook-linked result transparency."
        ),
        "what_it_does": (
            "MATrader AI searches for XAUUSD opportunities on a short timeframe, then manages positions through "
            "configurable cycle logic. It can use fixed or balance-based sizing, time and day filters, news-aware "
            "controls, trailing options, and equity protection. The important part is the configuration: lot size, "
            "risk mode, broker spread, and VPS stability all affect the final result."
        ),
        "technical_requirements": [
            "MetaTrader 4 terminal running continuously",
            "XAUUSD M1 chart with AutoTrading enabled",
            "Cent account conditions recommended for small position sizing",
            "Low-latency VPS for consistent order handling",
            "Tolea set file loaded for the selected risk profile",
        ],
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
        "resultSource": "myfxbook",
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
        "compare_at_price": 250,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/147979",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/matrader/12039419",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12039419&type=6",
        "logo": "/assets/products/matrader-ai/matraderea-logo-200x200-5739.png",
        "image": "/assets/products/matrader-ai/matraderea-screen-3984.png",
        "gallery": [
            "/assets/products/matrader-ai/matraderea-screen-3984.png",
            "/assets/products/matrader-ai/matrader-ai-screen-8182.png",
            "/assets/products/matrader-ai/matrader-ai-screen-7127.png",
            "/assets/products/matrader-ai/matrader-ai-screen-7580.png",
            "/assets/products/matrader-ai/matraderea-screen-6963.png",
            "/assets/products/matrader-ai/matraderea-screen-7285.png",
            "/assets/products/matrader-ai/matraderea-screen-8156.png",
            "/assets/products/matrader-ai/matraderea-screen-8712.png",
        ],
    },
    {
        "slug": "matrader-quickscalper",
        "name": "QuickScalper",
        "category": "expert-advisors",
        "strategy_type": "Scalping EA",
        "tagline": "MT4 scalping Expert Advisor prepared with risk-focused custom set files.",
        "description": (
            "QuickScalper is a dedicated MT4 scalping Expert Advisor built around short trade cycles, strict "
            "execution handling, and controlled exposure. It is not simply a smaller version of MATrader AI; it "
            "is prepared as a separate fast-cycle system where spread, latency, broker feed, and lot precision "
            "matter more. The Tolea Systems package includes optimized set files and account setup notes so the "
            "EA can be configured for a cleaner operating environment. QuickScalper is best treated as a focused "
            "scalping tool that needs stable VPS conditions, proper risk sizing, and regular monitoring."
        ),
        "what_it_does": (
            "QuickScalper looks for short-duration opportunities and manages them through predefined trade "
            "handling rules. The configuration can include fixed or balance-based sizing, trailing modules, "
            "equity protection, Friday close behavior, Monday delayed start logic, and news filters. Because "
            "scalping is sensitive, the recommended setup is part of the product, not an afterthought."
        ),
        "technical_requirements": [
            "MetaTrader 4 terminal on a reliable VPS",
            "Low spread broker conditions and stable XAUUSD feed",
            "Cent account with fine lot granularity preferred",
            "AutoTrading enabled and news/session filters configured",
            "Tolea optimized set file selected for the account size",
        ],
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
        "resultSource": "myfxbook",
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
        "compare_at_price": 250,
        "featured": True,
        "mql5_url": "https://www.mql5.com/en/market/product/158178",
        "myfxbook_url": "https://www.myfxbook.com/portfolio/dsys-beta/12049164",
        "myfxbook_widget_url": "https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6",
        "logo": "/assets/products/quickscalper/matrader-quickscalper-logo-200x200-4159.png",
        "image": "/assets/products/quickscalper/matrader-quickscalper-screen-4323.png",
        "gallery": [
            "/assets/products/quickscalper/matrader-quickscalper-screen-2320.png",
            "/assets/products/quickscalper/matrader-quickscalper-screen-4323.png",
            "/assets/products/quickscalper/matrader-quickscalper-screen-5743.png",
            "/assets/products/quickscalper/matrader-quickscalper-screen-7093.png",
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
            "Tolea Systems keeps the collector separate from the public server. MT5 accounts can push "
            "closed-trade deltas to the API, while MT4 product results are reviewed through public "
            "Myfxbook links. That keeps the trading machine light while the website remains easy to share."
        ),
        "category": "Transparency",
        "author": "Tolea Systems",
        "read_minutes": 4,
        "published_at": "2026-05-21T09:00:00+00:00",
        "published": True,
        "cover": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    },
    {
        "slug": "mt5-collector-myfxbook-design",
        "title": "MT5 live collector and MT4 Myfxbook results",
        "excerpt": "How Tolea separates internal live MT5 analytics from public Myfxbook verification for MT4 systems.",
        "content": (
            "The collector is intentionally small and focused on MT5. It reads a logged-in MT5 terminal "
            "through the official Python package and sends closed-trade deltas to the API.\n\n"
            "MT4 products are no longer synced through the internal collector. Their public performance "
            "context comes from Myfxbook links, which keeps the MT4 side simple and avoids mixing two "
            "different result sources in the same live dashboard."
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
