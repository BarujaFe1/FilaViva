import type { SimulationRun } from "@/types"
import KpiCard from "@/components/KpiCard"
import RiskGauge from "@/components/RiskGauge"
import ResultsCharts from "@/components/ResultsCharts"

function toneForWait(min: number) {
  if (min <= 15) return "good" as const
  if (min <= 40) return "warn" as const
  return "bad" as const
}

function toneForRate(rate: number) {
  if (rate <= 0.05) return "good" as const
  if (rate <= 0.2) return "warn" as const
  return "bad" as const
}

export default function RunDashboard({ run }: { run: SimulationRun }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{run.scenario_id}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {run.days_simulated} dias simulados · seed {run.seed} ·{" "}
              {run.total_appointments.toLocaleString("pt-BR")} agendamentos
            </p>
          </div>
          <RiskGauge score={run.risk_score} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Espera média"
          value={run.avg_wait.toFixed(1)}
          unit="min"
          tone={toneForWait(run.avg_wait)}
        />
        <KpiCard
          label="p95 espera"
          value={run.p95_wait.toFixed(1)}
          unit="min"
          tone={toneForWait(run.p95_wait)}
        />
        <KpiCard
          label="Espera máx"
          value={run.max_wait.toFixed(1)}
          unit="min"
          tone={toneForWait(run.max_wait)}
        />
        <KpiCard
          label="Utilização"
          value={(run.utilization_rate * 100).toFixed(1)}
          unit="%"
          tone="neutral"
        />
        <KpiCard
          label="Prob. overtime"
          value={(run.overtime_probability * 100).toFixed(1)}
          unit="%"
          tone={toneForRate(run.overtime_probability)}
        />
        <KpiCard
          label="SLA breach"
          value={(run.sla_breach_rate * 100).toFixed(1)}
          unit="%"
          tone={toneForRate(run.sla_breach_rate)}
        />
        <KpiCard
          label="Abandono"
          value={(run.abandonment_rate * 100).toFixed(1)}
          unit="%"
          tone={toneForRate(run.abandonment_rate)}
        />
        <KpiCard
          label="Atendidos"
          value={run.total_attended.toLocaleString("pt-BR")}
          unit={`/ ${run.total_appointments.toLocaleString("pt-BR")}`}
          tone="neutral"
        />
      </div>

      <ResultsCharts run={run} />
    </div>
  )
}
