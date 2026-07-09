import type {
  ScenarioConfig,
  SimulationRun,
  ScenarioComparison,
  Preset,
  RiskComponent,
  Methodology,
} from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (err) {
    throw new Error(
      `Não foi possível conectar ao backend em ${API_BASE}. Verifique se o servidor está rodando.`
    )
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.detail) detail = `${detail}: ${body.detail}`
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

export async function fetchDemo(): Promise<SimulationRun> {
  return request<SimulationRun>(`${API_BASE}/api/demo/default`)
}

export async function runSimulation(config: ScenarioConfig): Promise<SimulationRun> {
  return request<SimulationRun>(`${API_BASE}/api/simulations/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })
}

export async function fetchRun(runId: string): Promise<SimulationRun> {
  return request<SimulationRun>(`${API_BASE}/api/simulations/${runId}`)
}

export async function compareSimulations(
  baseline: ScenarioConfig,
  alternative: ScenarioConfig
): Promise<ScenarioComparison> {
  return request<ScenarioComparison>(`${API_BASE}/api/simulations/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseline, alternative }),
  })
}

export async function fetchPresets(): Promise<Preset[]> {
  return request<Preset[]>(`${API_BASE}/api/scenarios/presets`)
}

export async function fetchRiskComponents(runId: string): Promise<RiskComponent[]> {
  const data = await request<Record<string, number>>(
    `${API_BASE}/api/risk/components/${runId}`
  )
  const labels: Record<string, string> = {
    p95_normalized: "p95 / SLA",
    sla_breach: "SLA breach",
    overtime_probability: "Prob. overtime",
    utilization_excess: "Utilização excessiva",
    variability: "Variabilidade",
  }
  const weights: Record<string, number> = {
    p95_normalized: 0.25,
    sla_breach: 0.25,
    overtime_probability: 0.2,
    utilization_excess: 0.15,
    variability: 0.15,
  }
  return Object.entries(data)
    .filter(([key]) => key in weights)
    .map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value,
      weight: weights[key],
      contribution: (value / 100) * weights[key],
    }))
}

export async function fetchMethodology(): Promise<Methodology> {
  return request<Methodology>(`${API_BASE}/api/methodology`)
}
