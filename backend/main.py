from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import scenarios, simulations, demo, methodology

app = FastAPI(
    title="FilaViva API",
    description="Operational queue simulation engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
