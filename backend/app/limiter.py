from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _client_ip(request: Request) -> str:
    """Rate-limit on the real client IP.

    Behind a reverse proxy (Render, Vercel, etc.) the socket peer is the proxy,
    so slowapi's default get_remote_address would bucket every user together.
    Prefer the left-most address in X-Forwarded-For, falling back to the peer.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_client_ip)
