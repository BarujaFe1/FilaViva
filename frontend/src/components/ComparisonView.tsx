import type { ScenarioComparison } from "@/types"

const METRIC_LABELS: Record<string, string> = {
  avg_wait: "Espera média",
  median_wait: "Espera mediana",
  p90_wait: "p90 espera",
  p95_wait: "p95 espera",
  max_wait: "Espera máx",
  utilization_rate: "Utilização",
  avg_overtime_minutes: "Overtime médio",
  overtime_probability: "Prob. overtime",
  sla_breach_rate: "SLA breach",
  abandonment_rate: "Abandono",
  risk_score: "Risco",
}

function formatMetric(key: string, value: number): string {
  if (
    key.includes("rate") ||
    key.includes("utilization") ||
    key.includes("probability")
  ) {
    // Backend stores rates in 0–1; abs deltas are on the same scale.
    return `${(value * 100).toFixed(1)} p.p.`
  }
  return value.toFixed(1)
}

export default function ComparisonView({ comparison }: { comparison: ScenarioComparison }) {
  const deltas = comparison.metric_deltas
  const keys = Object.keys(METRIC_LABELS)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Recomendação
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          {comparison.recommendation_summary}
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500">
          <p>
            <span className="font-medium text-slate-600">Trade-off:</span>{" "}
            {comparison.tradeoff_notes}
          </p>
          <p>
            <span className="font-medium text-slate-600">Confiança:</span>{" "}
            {comparison.confidence_notes}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="text-left px-4 py-3 font-medium">Métrica</th>
              <th className="text-right px-4 py-3 font-medium">Δ Absoluto</th>
              <th className="text-right px-4 py-3 font-medium">Δ %</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => {
              const abs = deltas[`${key}_abs`]
              const pct = deltas[`${key}_pct`]
              if (abs === undefined && pct === undefined) return null
              const positiveIsBad =
                key.includes("wait") ||
                key.includes("overtime") ||
                key.includes("breach") ||
                key.includes("abandon") ||
                key === "risk_score"
              const improved =
                abs !== undefined && abs !== 0
                  ? positiveIsBad
                    ? abs < 0
                    : abs > 0
                  : null
              const tone =
                improved === null
                  ? "text-slate-500"
                  : improved
                    ? "text-emerald-600"
                    : "text-red-600"
              return (
                <tr key={key} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{METRIC_LABELS[key]}</td>
                  <td className={`px-4 py-3 text-right font-medium ${tone}`}>
                    {abs !== undefined ? formatMetric(key, abs) : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${tone}`}>
                    {pct !== undefined ? `${pct > 0 ? "+" : ""}${pct}%` : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
