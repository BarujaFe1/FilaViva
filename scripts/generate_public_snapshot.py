"""
Generate a frontend-ready public demo snapshot (no live API required).

Writes:
  frontend/public/demo/snapshot.json

Usage (from repo root):
  backend\\.venv\\Scripts\\python.exe scripts/generate_public_snapshot.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.api.schemas import ScenarioConfig
from backend.api.routers.scenarios import PRESETS
from backend.engine.generator import AppointmentGenerator
from backend.engine.simulator import Simulator
from backend.engine.metrics import compute_metrics
from backend.engine.risk_score import compute_risk_score, compute_risk_components


def run_config(config: ScenarioConfig) -> tuple[dict, dict]:
    generator = AppointmentGenerator(config)
    appointments = generator.generate()
    simulator = Simulator(config)
    results = simulator.run(appointments)
    metrics = compute_metrics(results, config)
    metrics["sla_wait_minutes"] = config.sla_wait_minutes
    metrics["risk_score"] = compute_risk_score(metrics)
    return metrics, compute_risk_components(metrics)


def to_run(run_id: str, config: ScenarioConfig, metrics: dict) -> dict:
    return {
        "run_id": run_id,
        "scenario_id": config.scenario_id or run_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seed": config.seed,
        "days_simulated": config.days_to_simulate,
        "total_appointments": metrics["total_appointments"],
        "total_attended": metrics["total_attended"],
        "avg_wait": round(metrics["avg_wait"], 1),
        "median_wait": round(metrics["median_wait"], 1),
        "p90_wait": round(metrics["p90_wait"], 1),
        "p95_wait": round(metrics["p95_wait"], 1),
        "max_wait": round(metrics["max_wait"], 1),
        "utilization_rate": round(metrics["utilization_rate"], 4),
        "avg_overtime_minutes": round(metrics["avg_overtime_minutes"], 1),
        "overtime_probability": round(metrics["overtime_probability"], 4),
        "sla_breach_rate": round(metrics["sla_breach_rate"], 4),
        "abandonment_rate": round(metrics["abandonment_rate"], 4),
        "risk_score": metrics["risk_score"],
    }


def compare(base: dict, alt: dict, baseline_id: str, alternative_id: str) -> dict:
    keys = [
        "avg_wait",
        "median_wait",
        "p90_wait",
        "p95_wait",
        "max_wait",
        "utilization_rate",
        "avg_overtime_minutes",
        "overtime_probability",
        "sla_breach_rate",
        "abandonment_rate",
        "risk_score",
    ]
    deltas: dict[str, float] = {}
    for key in keys:
        base_val = base.get(key, 0)
        alt_val = alt.get(key, 0)
        if base_val != 0:
            deltas[f"{key}_pct"] = round((alt_val - base_val) / abs(base_val) * 100, 1)
        deltas[f"{key}_abs"] = round(alt_val - base_val, 2)

    delta_p95 = alt["p95_wait"] - base["p95_wait"]
    delta_util = alt["utilization_rate"] - base["utilization_rate"]
    delta_risk = alt["risk_score"] - base["risk_score"]
    parts = []
    if delta_p95 > 0:
        parts.append(
            f"O p95 de espera aumentou {delta_p95:.1f} min ({delta_p95 / max(base['p95_wait'], 1) * 100:.0f}%)"
        )
    elif delta_p95 < 0:
        parts.append(
            f"O p95 de espera reduziu {abs(delta_p95):.1f} min ({abs(delta_p95) / max(base['p95_wait'], 1) * 100:.0f}%)"
        )
    else:
        parts.append("O p95 de espera não apresentou alteração significativa")
    if delta_util > 0.05:
        parts.append(f"a utilização subiu {delta_util * 100:.1f} p.p.")
    elif delta_util < -0.05:
        parts.append(f"a utilização caiu {abs(delta_util) * 100:.1f} p.p.")
    if delta_risk > 5:
        parts.append(f"e o risco operacional aumentou {delta_risk:.1f} pontos")
    elif delta_risk < -5:
        parts.append(f"e o risco operacional reduziu {abs(delta_risk):.1f} pontos")
    parts.append("Simulação baseada em dados sintéticos. Não substitui avaliação operacional real.")

    return {
        "baseline_id": baseline_id,
        "alternative_id": alternative_id,
        "metric_deltas": deltas,
        "recommendation_summary": ". ".join(parts),
        "tradeoff_notes": (
            "A redução de espera pode aumentar utilização e vice-versa. "
            "Considere o trade-off entre qualidade do serviço e eficiência operacional."
        ),
        "confidence_notes": (
            "Comparação baseada em simulação com dados sintéticos. "
            "Resultados podem variar em operações reais."
        ),
    }


def main() -> None:
    demo_config = ScenarioConfig(
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

    # Faster public compare pair (still representative)
    baseline = ScenarioConfig(
        name="Baseline (equilibrada)",
        seed=42,
        days_to_simulate=200,
        num_servers=4,
        arrival_pattern="double_peak",
        no_show_rate=0.10,
        overbooking_rate=0.05,
    )
    alternative = ScenarioConfig(
        name="Alternativa (alta demanda)",
        seed=42,
        days_to_simulate=200,
        num_servers=3,
        arrival_pattern="peaked_morning",
        no_show_rate=0.05,
        overbooking_rate=0.20,
        walk_in_rate=0.10,
    )

    print("Running demo (500 days)...")
    demo_metrics, demo_risk = run_config(demo_config)
    demo_run = to_run("demo", demo_config, demo_metrics)
    print(f"  risk={demo_run['risk_score']}")

    print("Running comparison baseline...")
    base_metrics, _ = run_config(baseline)
    print("Running comparison alternative...")
    alt_metrics, _ = run_config(alternative)
    comparison = compare(base_metrics, alt_metrics, "snap-base", "snap-alt")
    print(f"  recommendation={comparison['recommendation_summary'][:80]}...")

    methodology_path = ROOT / "backend" / "data" / "methodology.json"
    methodology = json.loads(methodology_path.read_text(encoding="utf-8"))

    snapshot = {
        "version": "0.1.0",
        "mode": "static-lab-demo",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "notice": (
            "Lab demo com dados sintéticos pré-computados. "
            "Não é produção de call center e não substitui avaliação operacional real."
        ),
        "demo_run": demo_run,
        "risk_components": demo_risk,
        "comparison": comparison,
        "comparison_baseline": to_run("snap-base", baseline, base_metrics),
        "comparison_alternative": to_run("snap-alt", alternative, alt_metrics),
        "presets": [p.model_dump() for p in PRESETS],
        "methodology": methodology,
    }

    out_dir = ROOT / "frontend" / "public" / "demo"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "snapshot.json"
    out_path.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
