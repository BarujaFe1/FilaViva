import uuid

from fastapi import APIRouter

from backend.api.schemas import ScenarioConfig, Preset

router = APIRouter(tags=["scenarios"])

PRESETS: list[Preset] = [
    Preset(
        id="balanced",
        name="Operação Equilibrada",
        description="4 atendentes, 20 min de atendimento, 10% no-show, duplo pico",
        config=ScenarioConfig(
            name="Operação Equilibrada",
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
        ),
    ),
    Preset(
        id="high_demand",
        name="Alta Demanda",
        description="3 atendentes, 20% overbooking, 5% no-show, pico pela manhã",
        config=ScenarioConfig(
            name="Alta Demanda",
            seed=42,
            days_to_simulate=500,
            opening_time="08:00",
            closing_time="18:00",
            slot_interval_minutes=20,
            num_servers=3,
            avg_service_duration_minutes=20,
            service_duration_std=5,
            arrival_pattern="peaked_morning",
            no_show_rate=0.05,
            walk_in_rate=0.10,
            overbooking_rate=0.20,
            max_overtime_minutes=30,
            sla_wait_minutes=30,
            abandonment_threshold_minutes=60,
        ),
    ),
    Preset(
        id="reduced_team",
        name="Equipe Reduzida",
        description="2 atendentes, 25 min de atendimento, pico duplo",
        config=ScenarioConfig(
            name="Equipe Reduzida",
            seed=42,
            days_to_simulate=500,
            opening_time="08:00",
            closing_time="18:00",
            slot_interval_minutes=20,
            num_servers=2,
            avg_service_duration_minutes=25,
            service_duration_std=7,
            arrival_pattern="double_peak",
            no_show_rate=0.10,
            walk_in_rate=0.05,
            overbooking_rate=0.10,
            max_overtime_minutes=30,
            sla_wait_minutes=30,
            abandonment_threshold_minutes=60,
        ),
    ),
    Preset(
        id="aggressive_overbooking",
        name="Overbooking Agressivo",
        description="4 atendentes, 30% overbooking, 20% no-show esperado",
        config=ScenarioConfig(
            name="Overbooking Agressivo",
            seed=42,
            days_to_simulate=500,
            opening_time="08:00",
            closing_time="18:00",
            slot_interval_minutes=20,
            num_servers=4,
            avg_service_duration_minutes=20,
            service_duration_std=5,
            arrival_pattern="double_peak",
            no_show_rate=0.20,
            walk_in_rate=0.05,
            overbooking_rate=0.30,
            max_overtime_minutes=30,
            sla_wait_minutes=30,
            abandonment_threshold_minutes=60,
        ),
    ),
    Preset(
        id="more_servers",
        name="Mais Atendentes no Pico",
        description="6 atendentes, 15 min de atendimento, pico pela tarde",
        config=ScenarioConfig(
            name="Mais Atendentes no Pico",
            seed=42,
            days_to_simulate=500,
            opening_time="08:00",
            closing_time="18:00",
            slot_interval_minutes=15,
            num_servers=6,
            avg_service_duration_minutes=15,
            service_duration_std=4,
            arrival_pattern="peaked_afternoon",
            no_show_rate=0.10,
            walk_in_rate=0.05,
            overbooking_rate=0.05,
            max_overtime_minutes=30,
            sla_wait_minutes=30,
            abandonment_threshold_minutes=60,
        ),
    ),
]


@router.post("/scenarios")
async def create_scenario(config: ScenarioConfig) -> ScenarioConfig:
    if not config.scenario_id:
        config.scenario_id = str(uuid.uuid4())[:8]
    return config


@router.get("/scenarios/presets")
async def get_presets() -> list[Preset]:
    return PRESETS
