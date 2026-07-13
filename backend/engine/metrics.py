import numpy as np

from backend.api.schemas import ScenarioConfig
from backend.engine.generator import Appointment


def _time_to_minutes(time_str: str) -> int:
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def compute_metrics(
    appointments: list[Appointment], config: ScenarioConfig
) -> dict:
    attended = [a for a in appointments if not a.no_show and not a.abandoned]
    abandoned = [a for a in appointments if a.abandoned]

    if not attended:
        return _empty_metrics()

    opening = _time_to_minutes(config.opening_time)
    closing = _time_to_minutes(config.closing_time)

    wait_times = np.array([a.wait_time for a in attended])
    service_durations = np.array([a.service_duration for a in attended])

    total_op_minutes = closing - opening
    total_capacity = total_op_minutes * config.num_servers * config.days_to_simulate
    total_service_minutes = float(np.sum(service_durations))

    overtime_per_day: dict[int, float] = {}
    for a in attended:
        if a.service_end is not None and a.service_end > closing:
            extra = a.service_end - closing
            if a.day not in overtime_per_day or extra > overtime_per_day[a.day]:
                overtime_per_day[a.day] = extra

    days_with_overtime = len(overtime_per_day)
    total_overtime = sum(overtime_per_day.values())
    num_attended = len(attended)
    num_abandoned = len(abandoned)

    p90 = float(np.percentile(wait_times, 90))
    p95 = float(np.percentile(wait_times, 95))

    return {
        "total_appointments": len(appointments),
        "total_attended": num_attended,
        "avg_wait": float(np.mean(wait_times)),
        "median_wait": float(np.median(wait_times)),
        "p90_wait": p90,
        "p95_wait": p95,
        "max_wait": float(np.max(wait_times)),
        "wait_std": float(np.std(wait_times)),
        "utilization_rate": total_service_minutes / total_capacity if total_capacity > 0 else 0,
        "avg_overtime_minutes": total_overtime / config.days_to_simulate,
        "overtime_probability": days_with_overtime / config.days_to_simulate,
        "sla_breach_rate": len([a for a in attended if a.sla_breached]) / num_attended if num_attended > 0 else 0,
        "abandonment_rate": num_abandoned / (num_attended + num_abandoned) if (num_attended + num_abandoned) > 0 else 0,
        # Dispersion relative to SLA (stable when p90/mean ≈ 0). Clamped in risk_score.
        "variability": float(np.std(wait_times)) / max(float(config.sla_wait_minutes), 1.0),
    }


def _empty_metrics() -> dict:
    return {
        "total_appointments": 0,
        "total_attended": 0,
        "avg_wait": 0.0,
        "median_wait": 0.0,
        "p90_wait": 0.0,
        "p95_wait": 0.0,
        "max_wait": 0.0,
        "wait_std": 0.0,
        "utilization_rate": 0.0,
        "avg_overtime_minutes": 0.0,
        "overtime_probability": 0.0,
        "sla_breach_rate": 0.0,
        "abandonment_rate": 0.0,
        "variability": 0.0,
    }
