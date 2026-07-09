import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from backend.api.schemas import ScenarioConfig, SimulationRun, ScenarioComparison, ComparisonRequest
from backend.engine.generator import AppointmentGenerator
from backend.engine.simulator import Simulator
from backend.engine.metrics import compute_metrics
from backend.engine.risk_score import compute_risk_score, compute_risk_components

router = APIRouter(tags=["simulations"])

RESULTS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def _run_simulation(config: ScenarioConfig) -> tuple[list[dict], dict]:
    generator = AppointmentGenerator(config)
    appointments = generator.generate()

    simulator = Simulator(config)
    results = simulator.run(appointments)

    metrics = compute_metrics(results, config)
    metrics["sla_wait_minutes"] = config.sla_wait_minutes
    metrics["risk_score"] = compute_risk_score(metrics)

    attended = [a for a in results if not a.no_show and not a.abandoned]
    appointments_data = [
        {
            "appointment_id": a.appointment_id,
            "day": a.day,
            "scheduled_time": round(a.scheduled_time, 1),
            "arrival_time": round(a.arrival_time, 1),
            "service_duration": round(a.service_duration, 1),
            "no_show": a.no_show,
            "walk_in": a.walk_in,
            "wait_time": round(a.wait_time, 1) if a.wait_time is not None else None,
            "abandoned": a.abandoned,
            "overtime_flag": a.overtime_flag,
            "sla_breached": a.sla_breached,
        }
        for a in attended
    ]

    return appointments_data, metrics


def _save_run(run_id: str, config: ScenarioConfig, metrics: dict):
    data = {
        "run_id": run_id,
        "config": config.model_dump(),
        "metrics": metrics,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    path = RESULTS_DIR / f"{run_id}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def _load_run(run_id: str) -> dict | None:
    path = RESULTS_DIR / f"{run_id}.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


@router.post("/simulations/run")
async def run_simulation(config: ScenarioConfig) -> SimulationRun:
    run_id = str(uuid.uuid4())[:8]
    _, metrics = _run_simulation(config)
    _save_run(run_id, config, metrics)

    return SimulationRun(
        run_id=run_id,
        scenario_id=config.scenario_id or run_id,
        created_at=datetime.now(timezone.utc),
        seed=config.seed,
        days_simulated=config.days_to_simulate,
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


@router.get("/simulations/{run_id}")
async def get_simulation(run_id: str) -> SimulationRun | None:
    data = _load_run(run_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Run not found")
    m = data["metrics"]
    c = data["config"]
    return SimulationRun(
        run_id=data["run_id"],
        scenario_id=c.get("scenario_id") or data["run_id"],
        created_at=datetime.fromisoformat(data["created_at"]),
        seed=c["seed"],
        days_simulated=c["days_to_simulate"],
        total_appointments=m["total_appointments"],
        total_attended=m["total_attended"],
        avg_wait=m["avg_wait"],
        median_wait=m["median_wait"],
        p90_wait=m["p90_wait"],
        p95_wait=m["p95_wait"],
        max_wait=m["max_wait"],
        utilization_rate=m["utilization_rate"],
        avg_overtime_minutes=m["avg_overtime_minutes"],
        overtime_probability=m["overtime_probability"],
        sla_breach_rate=m["sla_breach_rate"],
        abandonment_rate=m["abandonment_rate"],
        risk_score=m["risk_score"],
    )


def _generate_brief(base_metrics: dict, alt_metrics: dict) -> str:
    delta_p95 = alt_metrics["p95_wait"] - base_metrics["p95_wait"]
    delta_util = alt_metrics["utilization_rate"] - base_metrics["utilization_rate"]
    delta_overtime = alt_metrics["overtime_probability"] - base_metrics["overtime_probability"]
    delta_risk = alt_metrics["risk_score"] - base_metrics["risk_score"]

    parts = []
    if delta_p95 > 0:
        parts.append(f"O p95 de espera aumentou {delta_p95:.1f} min ({delta_p95 / max(base_metrics['p95_wait'], 1) * 100:.0f}%)")
    elif delta_p95 < 0:
        parts.append(f"O p95 de espera reduziu {abs(delta_p95):.1f} min ({abs(delta_p95) / max(base_metrics['p95_wait'], 1) * 100:.0f}%)")
    else:
        parts.append("O p95 de espera não apresentou alteração significativa")

    if delta_util > 0.05:
        parts.append(f"a utilização subiu {delta_util*100:.1f} p.p.")
    elif delta_util < -0.05:
        parts.append(f"a utilização caiu {abs(delta_util)*100:.1f} p.p.")

    if delta_risk > 5:
        parts.append(f"e o risco operacional aumentou {delta_risk:.1f} pontos")
    elif delta_risk < -5:
        parts.append(f"e o risco operacional reduziu {abs(delta_risk):.1f} pontos")

    parts.append("Simulação baseada em dados sintéticos. Não substitui avaliação operacional real.")
    return ". ".join(parts)


@router.post("/simulations/compare")
async def compare_simulations(req: ComparisonRequest) -> ScenarioComparison:
    baseline_run_id = str(uuid.uuid4())[:8]
    alt_run_id = str(uuid.uuid4())[:8]

    _, base_metrics = _run_simulation(req.baseline)
    _save_run(baseline_run_id, req.baseline, base_metrics)

    _, alt_metrics = _run_simulation(req.alternative)
    _save_run(alt_run_id, req.alternative, alt_metrics)

    metric_keys = [
        "avg_wait", "median_wait", "p90_wait", "p95_wait", "max_wait",
        "utilization_rate", "avg_overtime_minutes", "overtime_probability",
        "sla_breach_rate", "abandonment_rate", "risk_score",
    ]
    deltas = {}
    for key in metric_keys:
        base_val = base_metrics.get(key, 0)
        alt_val = alt_metrics.get(key, 0)
        if base_val != 0:
            deltas[f"{key}_pct"] = round((alt_val - base_val) / abs(base_val) * 100, 1)
        deltas[f"{key}_abs"] = round(alt_val - base_val, 2)

    brief = _generate_brief(base_metrics, alt_metrics)

    tradeoff_note = "A redução de espera pode aumentar utilização e vice-versa. Considere o trade-off entre qualidade do serviço e eficiência operacional."
    confidence_note = "Comparação baseada em simulação com dados sintéticos. Resultados podem variar em operações reais."

    return ScenarioComparison(
        baseline_id=baseline_run_id,
        alternative_id=alt_run_id,
        metric_deltas=deltas,
        recommendation_summary=brief,
        tradeoff_notes=tradeoff_note,
        confidence_notes=confidence_note,
    )


@router.get("/risk/components/{run_id}")
async def get_risk_components(run_id: str) -> dict:
    data = _load_run(run_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return compute_risk_components(data["metrics"])
