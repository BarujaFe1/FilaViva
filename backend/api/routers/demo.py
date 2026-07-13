import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Query

from backend.api.schemas import ScenarioConfig, SimulationRun
from backend.api.routers.simulations import _run_simulation, _save_run
from backend.engine.risk_score import compute_risk_score

router = APIRouter(tags=["demo"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

DEMO_CONFIG = ScenarioConfig(
    scenario_id="demo",
    name="Operação Equilibrada (Demo)",
    seed=42,
    days_to_simulate=500,
    opening_time="08:00",
    closing_time="18:00",
    slot_interval_minutes=20,
    num_servers=4,
    avg_service_duration_minutes=20,
    service_duration_std=5,
    arrival_pattern="double_peak",
    no_show_rate=0.10,
    walk_in_rate=0.05,
    overbooking_rate=0.05,
    max_overtime_minutes=30,
    sla_wait_minutes=30,
    abandonment_threshold_minutes=60,
)


def _metrics_to_run(metrics: dict) -> SimulationRun:
    return SimulationRun(
        run_id="demo",
        scenario_id="demo",
        created_at=datetime.now(timezone.utc),
        seed=DEMO_CONFIG.seed,
        days_simulated=DEMO_CONFIG.days_to_simulate,
        total_appointments=metrics["total_appointments"],
        total_attended=metrics["total_attended"],
        avg_wait=round(metrics["avg_wait"], 1),
        median_wait=round(metrics["median_wait"], 1),
        p90_wait=round(metrics["p90_wait"], 1),
        p95_wait=round(metrics["p95_wait"], 1),
        max_wait=round(metrics["max_wait"], 1),
        utilization_rate=round(metrics["utilization_rate"], 4),
        avg_overtime_minutes=round(metrics["avg_overtime_minutes"], 1),
        overtime_probability=round(metrics["overtime_probability"], 4),
        sla_breach_rate=round(metrics["sla_breach_rate"], 4),
        abandonment_rate=round(metrics["abandonment_rate"], 4),
        risk_score=metrics["risk_score"],
    )


def _load_cached_metrics() -> dict | None:
    path = DATA_DIR / "demo_results.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        metrics = json.load(f)
    if "risk_score" not in metrics:
        metrics["sla_wait_minutes"] = DEMO_CONFIG.sla_wait_minutes
        metrics["risk_score"] = compute_risk_score(metrics)
    return metrics


@router.get("/demo/default")
async def get_default_demo(live: bool = Query(False, description="Force live recompute")) -> SimulationRun:
    """
    Default demo run.

    By default serves `backend/data/demo_results.json` when present (fast, reproducible).
    Pass `?live=1` to recompute with the engine.
    """
    metrics: dict | None = None
    if not live:
        metrics = _load_cached_metrics()

    if metrics is None:
        _, metrics = _run_simulation(DEMO_CONFIG)
        metrics["sla_wait_minutes"] = DEMO_CONFIG.sla_wait_minutes
        metrics["risk_score"] = compute_risk_score(metrics)

    _save_run("demo", DEMO_CONFIG, metrics)
    return _metrics_to_run(metrics)
