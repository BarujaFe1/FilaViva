import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(tags=["methodology"])

METHODOLOGY_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "methodology.json"


@router.get("/methodology")
async def get_methodology() -> dict:
    if METHODOLOGY_PATH.exists():
        with open(METHODOLOGY_PATH) as f:
            return json.load(f)
    return {
        "version": "0.1.0",
        "simulation_method": "Discrete simulation per operating day with FIFO queue",
        "data_source": "Synthetic",
        "key_limitations": [
            "Synthetic data only",
            "Not validated against real operations",
        ],
    }
