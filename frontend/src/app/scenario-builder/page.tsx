"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ScenarioConfig, SimulationRun } from "@/types"
import { runSimulation } from "@/lib/api"
import ScenarioForm from "@/components/ScenarioForm"
import StateBlock from "@/components/StateBlock"

export default function ScenarioBuilderPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastRun, setLastRun] = useState<SimulationRun | null>(null)

  async function handleSubmit(config: ScenarioConfig) {
    setSubmitting(true)
    setError(null)
    try {
      const run = await runSimulation(config)
      setLastRun(run)
      router.push(`/simulation-results?run_id=${run.run_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao simular")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar cenário</h1>
      <p className="text-slate-600 mb-6">
        Configure os parâmetros operacionais e rode a simulação.
      </p>

      {error && <StateBlock variant="error" message={error} />}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <ScenarioForm
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Simulando..." : "Rodar simulação"}
          disabled={submitting}
        />
      </div>

      {lastRun && (
        <p className="mt-4 text-sm text-slate-500">
          Último run: {lastRun.run_id}
        </p>
      )}
    </div>
  )
}
