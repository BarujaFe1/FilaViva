"""
Generate demo synthetic dataset and pre-computed simulation results.

Usage:
    python scripts/generate_demo.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.api.schemas import ScenarioConfig
from backend.engine.generator import AppointmentGenerator
from backend.engine.simulator import Simulator
from backend.engine.metrics import compute_metrics
from backend.engine.risk_score import compute_risk_score


def main():
    config = ScenarioConfig(
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

    print("Generating appointments...")
    generator = AppointmentGenerator(config)
    appointments = generator.generate()
    print(f"  Generated {len(appointments)} appointments ({config.days_to_simulate} days)")

    print("Running simulation...")
    simulator = Simulator(config)
    results = simulator.run(appointments)
    print(f"  Simulated {len(results)} appointments")

    print("Computing metrics...")
    metrics = compute_metrics(results, config)
    metrics["sla_wait_minutes"] = config.sla_wait_minutes

    risk_score = compute_risk_score(metrics)
    metrics["risk_score"] = risk_score

    print(f"  Risk score: {risk_score}")
    print(f"  Avg wait: {metrics['avg_wait']:.1f} min")
    print(f"  P95 wait: {metrics['p95_wait']:.1f} min")
    print(f"  Utilization: {metrics['utilization_rate']*100:.1f}%")
    print(f"  SLA breach: {metrics['sla_breach_rate']*100:.1f}%")

    output_dir = Path(__file__).parent.parent / "backend" / "data"
    with open(output_dir / "demo_scenario.json", "w") as f:
        json.dump(config.model_dump(), f, indent=2)

    with open(output_dir / "demo_results.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nResults saved to {output_dir}")


if __name__ == "__main__":
    main()
