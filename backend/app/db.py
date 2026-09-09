import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: "Client | None" = None


def _get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. "
                "Check your .env file or hosting dashboard."
            )
        _client = create_client(url, key)
    return _client


class _LazyClient:
    """Defers Supabase client creation until first use.

    Importing this module no longer requires the env vars to be present, so the
    friendly startup check in main.py's lifespan runs first and reports every
    missing variable at once — instead of a raw KeyError at import time.
    """

    def __getattr__(self, name):
        return getattr(_get_client(), name)


supabase = _LazyClient()
