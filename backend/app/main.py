import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api import receipts, pantry
from app.limiter import limiter

app = FastAPI(title="Larder API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-User-Id", "Authorization"],
)

app.include_router(receipts.router)
app.include_router(pantry.router)


@app.get("/health")
def health():
    return {"status": "ok"}
