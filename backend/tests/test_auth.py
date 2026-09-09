"""Tests for JWT rejection paths in app.auth.get_user_id.

app.auth reads config into module-level globals at import time, so each test
reloads the module with a controlled environment. Leaving SUPABASE_URL unset
forces the HS256 fallback path, which keeps these tests fully offline.
"""

import importlib
import time

import jwt as pyjwt
import pytest
from fastapi import HTTPException


def _reload_auth(monkeypatch, *, jwt_secret=None, dev_mode=False):
    monkeypatch.delenv("SUPABASE_URL", raising=False)       # no JWKS -> HS256 path, no network
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    monkeypatch.delenv("DEV_MODE", raising=False)
    if jwt_secret is not None:
        monkeypatch.setenv("SUPABASE_JWT_SECRET", jwt_secret)
    if dev_mode:
        monkeypatch.setenv("DEV_MODE", "true")
    import app.auth as auth
    return importlib.reload(auth)


def test_missing_authorization_header(monkeypatch):
    auth = _reload_auth(monkeypatch, jwt_secret="test-secret-key-at-least-32-bytes-long!")
    with pytest.raises(HTTPException) as exc:
        auth.get_user_id("")
    assert exc.value.status_code == 401


def test_non_bearer_scheme_rejected(monkeypatch):
    auth = _reload_auth(monkeypatch, jwt_secret="test-secret-key-at-least-32-bytes-long!")
    with pytest.raises(HTTPException) as exc:
        auth.get_user_id("Basic dXNlcjpwYXNz")
    assert exc.value.status_code == 401


def test_garbage_token_rejected(monkeypatch):
    auth = _reload_auth(monkeypatch, jwt_secret="test-secret-key-at-least-32-bytes-long!")
    with pytest.raises(HTTPException) as exc:
        auth.get_user_id("Bearer not.a.real.jwt")
    assert exc.value.status_code == 401


def test_expired_token_rejected(monkeypatch):
    auth = _reload_auth(monkeypatch, jwt_secret="test-secret-key-at-least-32-bytes-long!")
    token = pyjwt.encode(
        {
            "sub": "user-1",
            "aud": "authenticated",
            "iss": "supabase",
            "exp": int(time.time()) - 60,  # expired a minute ago
        },
        "test-secret-key-at-least-32-bytes-long!",
        algorithm="HS256",
    )
    with pytest.raises(HTTPException) as exc:
        auth.get_user_id(f"Bearer {token}")
    assert exc.value.status_code == 401


def test_dev_mode_bypass(monkeypatch):
    # No secret and no URL, but DEV_MODE=true -> returns the fixed dev user id.
    auth = _reload_auth(monkeypatch, dev_mode=True)
    assert auth.get_user_id("") == auth.DEV_USER_ID
