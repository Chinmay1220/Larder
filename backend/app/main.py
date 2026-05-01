import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import receipts, pantry

app = FastAPI(title="Larder API")

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production frontend URL from env var (set in Render dashboard)
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router)
app.include_router(pantry.router)


@app.get("/health")
def health():
    return {"status": "ok"}
