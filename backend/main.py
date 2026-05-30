from __future__ import annotations

import os

import uvicorn


def main() -> None:
    host = os.getenv("TRADEJOURNAL_HOST", "127.0.0.1")
    port = int(os.getenv("PORT", os.getenv("TRADEJOURNAL_PORT", "8000")))
    uvicorn.run("backend.api:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
