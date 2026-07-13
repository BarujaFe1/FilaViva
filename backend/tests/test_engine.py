from backend.api.schemas import ScenarioConfig
from backend.engine.generator import AppointmentGenerator
from backend.engine.simulator import Simulator
from backend.engine.metrics import compute_metrics
from backend.engine.risk_score import compute_risk_score, compute_risk_components


def _make_config(**kwargs) -> ScenarioConfig:
    defaults = dict(
        name="test",
        seed=42,
        days_to_simulate=100,
        opening_time="08:00",
        closing_time="18:00",
        slot_interval_minutes=20,
        num_servers=4,
        avg_service_duration_minutes=20,
        service_duration_std=5,
        arrival_pattern="uniform",
        no_show_rate=0.10,
        walk_in_rate=0.05,
        overbooking_rate=0.05,
        max_overtime_minutes=30,
        sla_wait_minutes=30,
        abandonment_threshold_minutes=60,
    )
    defaults.update(kwargs)
    return ScenarioConfig(**defaults)


def test_seed_reproducibility():
    c1 = _make_config(seed=42)
    c2 = _make_config(seed=42)
    g1 = AppointmentGenerator(c1)
    g2 = AppointmentGenerator(c2)
    a1 = g1.generate()
    a2 = g2.generate()
    assert len(a1) == len(a2)
    for app1, app2 in zip(a1, a2):
        assert app1.appointment_id == app2.appointment_id
        assert app1.arrival_time == app2.arrival_time
        assert app1.service_duration == app2.service_duration
        assert app1.no_show == app2.no_show


def test_different_seeds_different():
    c1 = _make_config(seed=42)
    c2 = _make_config(seed=99)
    g1 = AppointmentGenerator(c1)
    g2 = AppointmentGenerator(c2)
    a1 = g1.generate()
    a2 = g2.generate()
    different_arrivals = sum(
        1 for a, b in zip(a1, a2) if a.arrival_time != b.arrival_time
    )
    assert different_arrivals > len(a1) * 0.5


def test_no_show_within_expected_range():
    config = _make_config(seed=42, no_show_rate=0.20, days_to_simulate=1000)
    gen = AppointmentGenerator(config)
    apps = gen.generate()
    no_shows = sum(1 for a in apps if a.no_show)
    rate = no_shows / len(apps)
    assert 0.15 <= rate <= 0.25, f"No-show rate {rate:.3f} outside [0.15, 0.25]"


def test_service_duration_non_negative():
    config = _make_config(seed=42)
    gen = AppointmentGenerator(config)
    apps = gen.generate()
    assert all(a.service_duration > 0 for a in apps)


def test_arrival_time_non_negative():
    config = _make_config(seed=42)
    gen = AppointmentGenerator(config)
    apps = gen.generate()
    assert all(a.arrival_time >= 0 for a in apps)


def test_wait_time_never_negative():
    config = _make_config(seed=42)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    attended = [a for a in results if not a.no_show and not a.abandoned]
    assert all(a.wait_time is not None and a.wait_time >= 0 for a in attended)


def test_capacity_respected():
    config = _make_config(seed=42, num_servers=2)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    attended = [a for a in results if not a.no_show and not a.abandoned]
    for a in attended:
        assert a.server_id is not None
        assert 0 <= a.server_id < config.num_servers


def test_more_servers_reduces_wait():
    cfg_low = _make_config(seed=42, num_servers=2, days_to_simulate=200, abandonment_threshold_minutes=240)
    cfg_high = _make_config(seed=42, num_servers=6, days_to_simulate=200, abandonment_threshold_minutes=240)

    def simulate(cfg):
        gen = AppointmentGenerator(cfg)
        sim = Simulator(cfg)
        apps = gen.generate()
        results = sim.run(apps)
        return compute_metrics(results, cfg)

    metrics_low = simulate(cfg_low)
    metrics_high = simulate(cfg_high)
    assert metrics_high["avg_wait"] < metrics_low["avg_wait"]


def test_overbooking_increases_risk():
    cfg_base = _make_config(seed=42, overbooking_rate=0.0, days_to_simulate=200)
    cfg_aggro = _make_config(seed=42, overbooking_rate=0.40, days_to_simulate=200)

    def simulate(cfg):
        gen = AppointmentGenerator(cfg)
        sim = Simulator(cfg)
        apps = gen.generate()
        results = sim.run(apps)
        metrics = compute_metrics(results, cfg)
        metrics["sla_wait_minutes"] = cfg.sla_wait_minutes
        metrics["risk_score"] = compute_risk_score(metrics)
        return metrics

    m1 = simulate(cfg_base)
    m2 = simulate(cfg_aggro)
    assert m2["risk_score"] > m1["risk_score"]


def test_p90_p95_correct():
    config = _make_config(seed=42, days_to_simulate=100)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    metrics = compute_metrics(results, config)
    attended = [a for a in results if not a.no_show and not a.abandoned]
    wait_times = sorted([a.wait_time for a in attended])
    n = len(wait_times)
    expected_p90 = wait_times[int(n * 0.9)]
    expected_p95 = wait_times[int(n * 0.95)]
    assert abs(metrics["p90_wait"] - expected_p90) < 0.01
    assert abs(metrics["p95_wait"] - expected_p95) < 0.01


def test_utilization_between_0_and_1():
    config = _make_config(seed=42)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    metrics = compute_metrics(results, config)
    assert 0 <= metrics["utilization_rate"] <= 1


def test_risk_score_between_0_and_100():
    config = _make_config(seed=42, days_to_simulate=200)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    metrics = compute_metrics(results, config)
    metrics["sla_wait_minutes"] = config.sla_wait_minutes
    score = compute_risk_score(metrics)
    assert 0 <= score <= 100


def test_no_abandonment_when_wait_low():
    config = _make_config(
        seed=42,
        num_servers=10,
        avg_service_duration_minutes=10,
        service_duration_std=2,
        no_show_rate=0,
        walk_in_rate=0,
        overbooking_rate=0,
        abandonment_threshold_minutes=240,
        days_to_simulate=100,
    )
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    apps = gen.generate()
    results = sim.run(apps)
    metrics = compute_metrics(results, config)
    assert metrics["abandonment_rate"] == 0


def test_max_overtime_caps_new_starts():
    """With zero overtime budget, services cannot start after closing."""
    config = _make_config(
        seed=42,
        num_servers=1,
        days_to_simulate=100,
        max_overtime_minutes=0,
        abandonment_threshold_minutes=240,
        overbooking_rate=0.3,
        no_show_rate=0,
    )
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    results = sim.run(gen.generate())
    closing = 18 * 60
    attended = [a for a in results if not a.no_show and not a.abandoned]
    assert all(
        a.service_start is not None and a.service_start <= closing for a in attended
    )


def test_variability_scaled_to_sla():
    """Wait std is normalized by SLA so low-wait demos are not always maxed at 100."""
    config = _make_config(seed=42, days_to_simulate=200, num_servers=6, sla_wait_minutes=30)
    gen = AppointmentGenerator(config)
    sim = Simulator(config)
    metrics = compute_metrics(sim.run(gen.generate()), config)
    metrics["sla_wait_minutes"] = config.sla_wait_minutes
    components = compute_risk_components(metrics)
    assert components["variability"] < 50.0
    assert 0 <= metrics["variability"] <= 1.0 or metrics["variability"] < 2.0
