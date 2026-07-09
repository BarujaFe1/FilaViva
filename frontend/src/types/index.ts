export type ArrivalPattern =
  | "uniform"
  | "peaked_morning"
  | "peaked_afternoon"
  | "double_peak"

export interface ScenarioConfig {
  scenario_id?: string
  name: string
  seed?: number
  days_to_simulate?: number
  opening_time?: string
  closing_time?: string
  slot_interval_minutes?: number
  num_servers?: number
  avg_service_duration_minutes?: number
  service_duration_std?: number
  arrival_pattern?: ArrivalPattern
  no_show_rate?: number
  walk_in_rate?: number
  overbooking_rate?: number
  max_overtime_minutes?: number
  sla_wait_minutes?: number
  abandonment_threshold_minutes?: number
}

export interface SimulationRun {
  run_id: string
  scenario_id: string
  created_at: string
  seed: number
  days_simulated: number
  total_appointments: number
  total_attended: number
  avg_wait: number
  median_wait: number
  p90_wait: number
  p95_wait: number
  max_wait: number
  utilization_rate: number
  avg_overtime_minutes: number
  overtime_probability: number
  sla_breach_rate: number
  abandonment_rate: number
  risk_score: number
}

export interface ScenarioComparison {
  baseline_id: string
  alternative_id: string
  metric_deltas: Record<string, number>
  recommendation_summary: string
  tradeoff_notes: string
  confidence_notes: string
}

export interface Preset {
  id: string
  name: string
  description: string
  config: ScenarioConfig
}

export interface RiskComponent {
  key: string
  label: string
  value: number
  weight: number
  contribution: number
}

export interface Methodology {
  [key: string]: unknown
}
