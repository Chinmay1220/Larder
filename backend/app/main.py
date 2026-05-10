import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api import receipts, pantry, account
from app.limiter import limiter

REQUIRED_VARS = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "ANTHROPIC_API_KEY"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    missing = [v for v in REQUIRED_VARS if not os.environ.get(v)]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Check your .env file or hosting dashboard."
        )
    logging.info("All required environment variables present.")
    yield


app = FastAPI(title="Larder API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# FRONTEND_URL accepts a single URL or comma-separated list of URLs
frontend_url = os.environ.get("FRONTEND_URL", "")
for url in [u.strip() for u in frontend_url.split(",") if u.strip()]:
    allowed_origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=True,
)

app.include_router(receipts.router)
app.include_router(pantry.router)
app.include_router(account.router)


@app.get("/health")
def health():
    return {"status": "ok"}
