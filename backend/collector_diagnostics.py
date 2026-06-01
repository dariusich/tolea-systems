from __future__ import annotations

import os

from .mt5_connector import collect_all_mt5_payloads, discover_mt5_terminals


def _enabled(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() not in {"0", "false", "no", "off"}


def _trade_count(payloads: list[dict]) -> int:
    return sum(len(payload.get("trades") or []) for payload in payloads)


def _print_payloads(label: str, payloads: list[dict]) -> None:
    print(f"[diagnose] {label} payloads: {len(payloads)}")
    print(f"[diagnose] {label} trades: {_trade_count(payloads)}")
    for payload in payloads:
        account = payload.get("account") or {}
        snapshot = payload.get("snapshot") or {}
        print(
            "[diagnose] "
            f"{label} account {account.get('platform')} {account.get('login')} "
            f"server={account.get('server')} "
            f"balance={snapshot.get('balance')} equity={snapshot.get('equity')} "
            f"trades={len(payload.get('trades') or [])}"
        )


def main() -> None:
    enable_mt5 = _enabled("TRADEJOURNAL_ENABLE_MT5", True)

    print("[diagnose] Tolea Systems collector diagnostic")
    print("[diagnose] MT4 live collector: disabled (MT4 results use Myfxbook links only)")
    print(f"[diagnose] MT5 enabled: {enable_mt5}")

    if enable_mt5:
        mt5_paths = discover_mt5_terminals()
        print(f"[diagnose] MT5 terminals found: {len(mt5_paths)}")
        for path in mt5_paths:
            print(f"[diagnose] MT5 terminal: {path or 'default terminal'}")
        try:
            _print_payloads("MT5", collect_all_mt5_payloads())
        except Exception as exc:
            print(f"[diagnose] MT5 error: {exc}")


if __name__ == "__main__":
    main()
