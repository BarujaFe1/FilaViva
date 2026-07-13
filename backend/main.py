import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import scenarios, simulations, demo, methodology

app = FastAPI(
    title="FilaViva API",
    description="Operational queue simulation engine (synthetic data lab)",
    version="0.1.0",
)

_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://filaviva.vercel.app",
    "https://filaviva-alpha.vercel.app",
]
_extra = os.getenv("CORS_ORIGINS", "")
if _extra:
    _cors_origins.extend([o.strip() for o in _extra.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router, prefix="/api")
app.include_router(simulations.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(methodology.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
