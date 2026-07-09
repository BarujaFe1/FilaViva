def compute_risk_score(metrics: dict) -> float:
    sla = metrics.get("sla_wait_minutes", 30)
    p95 = metrics.get("p95_wait", 0)
    sla_breach = metrics.get("sla_breach_rate", 0)
    overtime_prob = metrics.get("overtime_probability", 0)
    utilization = metrics.get("utilization_rate", 0)
    variability = metrics.get("variability", 0)

    p95_component = (p95 / sla) if sla > 0 else 0
    p95_component = min(p95_component, 2.0)

    utilization_excess = max(0, utilization - 0.85) / 0.15
    utilization_excess = min(utilization_excess, 1.0)

    var_clamped = min(variability, 1.0)

    raw_score = (
        0.25 * p95_component
        + 0.25 * sla_breach
        + 0.20 * overtime_prob
        + 0.15 * utilization_excess
        + 0.15 * var_clamped
    )

    score = raw_score * 100
    score = max(0, min(100, score))

    return round(score, 1)


def compute_risk_components(metrics: dict) -> dict:
    sla = metrics.get("sla_wait_minutes", 30)
    p95 = metrics.get("p95_wait", 0)
    p95_component = (p95 / sla) if sla > 0 else 0
    p95_component = min(p95_component, 2.0)

    utilization = metrics.get("utilization_rate", 0)
    utilization_excess = max(0, utilization - 0.85) / 0.15
    utilization_excess = min(utilization_excess, 1.0)

    variability = metrics.get("variability", 0)
    var_clamped = min(variability, 1.0)

    return {
        "p95_normalized": round(p95_component * 100, 1),
        "sla_breach": round(metrics.get("sla_breach_rate", 0) * 100, 1),
        "overtime_probability": round(metrics.get("overtime_probability", 0) * 100, 1),
        "utilization_excess": round(utilization_excess * 100, 1),
        "variability": round(var_clamped * 100, 1),
        "weight_used": "p95=25%, SLA_breach=25%, overtime=20%, utilization=15%, variability=15%",
    }
