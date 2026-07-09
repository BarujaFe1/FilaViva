from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class ScenarioConfig(BaseModel):
    scenario_id: Optional[str] = None
    name: str
    seed: int = Field(default=42, ge=0)
    days_to_simulate: int = Field(default=500, ge=100, le=2000)
    opening_time: str = Field(default="08:00", pattern=r"^\d{2}:\d{2}$")
    closing_time: str = Field(default="18:00", pattern=r"^\d{2}:\d{2}$")
    slot_interval_minutes: int = Field(default=20, ge=5, le=60)
    num_servers: int = Field(default=4, ge=1, le=20)
    avg_service_duration_minutes: float = Field(default=20, ge=5, le=120)
    service_duration_std: float = Field(default=5, ge=1, le=30)
    arrival_pattern: Literal["uniform", "peaked_morning", "peaked_afternoon", "double_peak"] = "double_peak"
    no_show_rate: float = Field(default=0.10, ge=0.0, le=0.50)
    walk_in_rate: float = Field(default=0.05, ge=0.0, le=0.30)
    overbooking_rate: float = Field(default=0.05, ge=0.0, le=0.40)
    max_overtime_minutes: int = Field(default=30, ge=0, le=120)
    sla_wait_minutes: int = Field(default=30, ge=5, le=120)
    abandonment_threshold_minutes: int = Field(default=60, ge=10, le=240)


class SimulationRun(BaseModel):
    run_id: str
    scenario_id: str
    created_at: datetime
    seed: int
    days_simulated: int
    total_appointments: int
    total_attended: int
    avg_wait: float
    median_wait: float
    p90_wait: float
    p95_wait: float
    max_wait: float
    utilization_rate: float
    avg_overtime_minutes: float
    overtime_probability: float
    sla_breach_rate: float
    abandonment_rate: float
    risk_score: float


class ComparisonRequest(BaseModel):
    baseline: ScenarioConfig
    alternative: ScenarioConfig


class ScenarioComparison(BaseModel):
    baseline_id: str
    alternative_id: str
    metric_deltas: dict[str, float]
    recommendation_summary: str
    tradeoff_notes: str
    confidence_notes: str


class Preset(BaseModel):
    id: str
    name: str
    description: str
    config: ScenarioConfig
