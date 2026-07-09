import type {
  ScenarioConfig,
  SimulationRun,
  ScenarioComparison,
  Preset,
  RiskComponent,
  Methodology,
} from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"
const FORCE_STATIC = process.env.NEXT_PUBLIC_USE_STATIC_DEMO === "1"

export type DemoSnapshot = {
  version: string
  mode: string
  generated_at: string
  notice: string
  demo_run: SimulationRun
  risk_components: Record<string, number | string>
  comparison: ScenarioComparison
  comparison_baseline: SimulationRun
  comparison_alternative: SimulationRun
  presets: Preset[]
  methodology: Methodology
}

let snapshotPromise: Promise<DemoSnapshot> | null = null

export async function loadSnapshot(): Promise<DemoSnapshot> {
  if (!snapshotPromise) {
    snapshotPromise = fetch("/demo/snapshot.json", { cache: "force-cache" }).then(
      async (res) => {
        if (!res.ok) throw new Error(`Snapshot indisponível (HTTP ${res.status})`)
        return res.json() as Promise<DemoSnapshot>
      }
    )
  }
  return snapshotPromise
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
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

function mapRiskComponents(data: Record<string, number | string>): RiskComponent[] {
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
    .filter(([key]) => key in weights && typeof data[key] === "number")
    .map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value: Number(value),
      weight: weights[key],
      contribution: (Number(value) / 100) * weights[key],
    }))
}

async function tryLive<T>(fn: () => Promise<T>): Promise<T | null> {
  if (FORCE_STATIC) return null
  try {
    return await fn()
  } catch {
    return null
  }
}

export async function fetchDemo(): Promise<SimulationRun> {
  const live = await tryLive(() =>
    request<SimulationRun>(`${API_BASE}/api/demo/default`)
  )
  if (live) return live
  const snap = await loadSnapshot()
  return snap.demo_run
}

export async function runSimulation(config: ScenarioConfig): Promise<SimulationRun> {
  const live = await tryLive(() =>
    request<SimulationRun>(`${API_BASE}/api/simulations/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
  )
  if (live) return live
  throw new Error(
    "API ao vivo indisponível nesta demo pública. Use a Demo Lab (/lab) com cenários pré-computados, ou rode o backend localmente."
  )
}

export async function fetchRun(runId: string): Promise<SimulationRun> {
  if (runId === "demo") {
    return fetchDemo()
  }
  const live = await tryLive(() =>
    request<SimulationRun>(`${API_BASE}/api/simulations/${runId}`)
  )
  if (live) return live
  const snap = await loadSnapshot()
  if (runId === snap.comparison_baseline.run_id) return snap.comparison_baseline
  if (runId === snap.comparison_alternative.run_id) return snap.comparison_alternative
  throw new Error(
    `Run ${runId} não encontrado no snapshot estático. Rode o backend local para runs customizados.`
  )
}

export async function compareSimulations(
  baseline: ScenarioConfig,
  alternative: ScenarioConfig
): Promise<ScenarioComparison> {
  const live = await tryLive(() =>
    request<ScenarioComparison>(`${API_BASE}/api/simulations/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseline, alternative }),
    })
  )
  if (live) return live
  // Public demo: return precomputed comparison (representative pair)
  const snap = await loadSnapshot()
  return snap.comparison
}

export async function fetchPresets(): Promise<Preset[]> {
  const live = await tryLive(() =>
    request<Preset[]>(`${API_BASE}/api/scenarios/presets`)
  )
  if (live) return live
  const snap = await loadSnapshot()
  return snap.presets
}

export async function fetchRiskComponents(runId: string): Promise<RiskComponent[]> {
  if (runId === "demo" || FORCE_STATIC) {
    const snap = await loadSnapshot()
    return mapRiskComponents(snap.risk_components)
  }
  const live = await tryLive(() =>
    request<Record<string, number>>(`${API_BASE}/api/risk/components/${runId}`)
  )
  if (live) return mapRiskComponents(live)
  const snap = await loadSnapshot()
  return mapRiskComponents(snap.risk_components)
}

export async function fetchMethodology(): Promise<Methodology> {
  const live = await tryLive(() =>
    request<Methodology>(`${API_BASE}/api/methodology`)
  )
  if (live) return live
  const snap = await loadSnapshot()
  return snap.methodology
}

export function getApiBase(): string {
  return API_BASE
}

export function isStaticForced(): boolean {
  return FORCE_STATIC
}
