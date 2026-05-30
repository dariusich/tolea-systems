from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.db import create_share_link, init_db  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a TradeJournal Pro read-only share link.")
    parser.add_argument("--token", default=None, help="Optional custom token. Omit to generate a secure token.")
    parser.add_argument("--account-id", default=None, help="Optional account_id. Omit to share all visible accounts.")
    parser.add_argument("--label", default="Read-only dashboard", help="Internal label.")
    parser.add_argument("--inactive", action="store_true", help="Create the link as inactive.")
    args = parser.parse_args()

    init_db()
    link = create_share_link(token=args.token, account_id=args.account_id, label=args.label, active=not args.inactive)
    print(f"Token: {link['token']}")
    print(f"Account: {link['account_id'] or 'all visible accounts'}")
    print("Path: /#/share/" + link["token"])


if __name__ == "__main__":
    main()

