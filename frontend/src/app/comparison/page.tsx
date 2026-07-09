"use client"

import { useState } from "react"
import type { ScenarioConfig, ScenarioComparison } from "@/types"
import { compareSimulations } from "@/lib/api"
import ScenarioForm from "@/components/ScenarioForm"
import ComparisonView from "@/components/ComparisonView"
import StateBlock from "@/components/StateBlock"

const BASELINE_INITIAL: ScenarioConfig = {
  name: "Baseline (equilibrada)",
  num_servers: 4,
  arrival_pattern: "double_peak",
  no_show_rate: 0.1,
  overbooking_rate: 0.05,
}

const ALTERNATIVE_INITIAL: ScenarioConfig = {
  name: "Alternativa (alta demanda)",
  num_servers: 3,
  arrival_pattern: "peaked_morning",
  no_show_rate: 0.05,
  overbooking_rate: 0.2,
}

export default function ComparisonPage() {
  const [baseline, setBaseline] = useState<ScenarioConfig>(BASELINE_INITIAL)
  const [alternative, setAlternative] = useState<ScenarioConfig>(ALTERNATIVE_INITIAL)
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCompare() {
    setSubmitting(true)
    setError(null)
    setComparison(null)
    try {
      const result = await compareSimulations(baseline, alternative)
      setComparison(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na comparação")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Comparar cenários</h1>
      <p className="text-slate-600 mb-6">
        Configure um cenário base e uma alternativa para comparar as métricas.
      </p>

      {error && <StateBlock variant="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Baseline</h2>
          <ScenarioForm
            initial={baseline}
            onSubmit={(c) => setBaseline(c)}
            submitLabel="Definir baseline"
          />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Alternativa</h2>
          <ScenarioForm
            initial={alternative}
            onSubmit={(c) => setAlternative(c)}
            submitLabel="Definir alternativa"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleCompare}
          disabled={submitting}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Comparando..." : "Comparar agora"}
        </button>
      </div>

      {submitting && <StateBlock variant="loading" message="Comparando cenários..." />}
      {comparison && (
        <div className="mt-6">
          <ComparisonView comparison={comparison} />
        </div>
      )}
    </div>
  )
}
