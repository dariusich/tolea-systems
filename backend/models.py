from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class AccountIn(BaseModel):
    account_id: str = Field(..., min_length=3)
    platform: Literal["MT4", "MT5"]
    login: str | int
    name: str | None = None
    display_name: str | None = None
    strategy: str | None = None
    broker: str | None = None
    server: str | None = None
    currency: str | None = None
    tags: list[str] = Field(default_factory=list)
    visible: bool = True


class TradeIn(BaseModel):
    ticket: str | int
    symbol: str
    volume: float = 0
    profit: float = 0
    swap: float = 0
    commission: float = 0
    open_time: str
    close_time: str


class SnapshotIn(BaseModel):
    balance: float = 0
    equity: float = 0
    floating_pl: float = 0
    margin: float = 0
    free_margin: float = 0
    timestamp: str | None = None


class SyncPayload(BaseModel):
    account: AccountIn
    snapshot: SnapshotIn | None = None
    trades: list[TradeIn] = Field(default_factory=list)
    source: str | None = None


class ShareLinkIn(BaseModel):
    token: str | None = None
    account_id: str | None = None
    label: str | None = None
    active: bool = True


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    account_id: str
    slug: str
    platform: str
    login: str
    name: str
    display_name: str
    strategy: str | None = None
    broker: str | None = None
    server: str | None = None
    currency: str | None = None
    visible: bool
    tags: list[str] = Field(default_factory=list)
    last_sync_at: str | None = None
    balance: float | None = None
    equity: float | None = None
    floating_pl: float | None = None
    margin: float | None = None
    free_margin: float | None = None


class ApiMessage(BaseModel):
    ok: bool
    message: str
    details: dict[str, Any] = Field(default_factory=dict)

