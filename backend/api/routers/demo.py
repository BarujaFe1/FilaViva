from datetime import datetime, timezone

from fastapi import APIRouter

from backend.api.schemas import ScenarioConfig, SimulationRun
from backend.api.routers.simulations import _run_simulation, _save_run
from backend.engine.risk_score import compute_risk_score

router = APIRouter(tags=["demo"])

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


@router.get("/demo/default")
async def get_default_demo() -> SimulationRun:
    _, metrics = _run_simulation(DEMO_CONFIG)
    metrics["sla_wait_minutes"] = DEMO_CONFIG.sla_wait_minutes
    metrics["risk_score"] = compute_risk_score(metrics)
    # Persist so /risk/components/demo and related pages can resolve the run.
    _save_run("demo", DEMO_CONFIG, metrics)

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
