"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { RiskComponent, SimulationRun } from "@/types"
import { fetchRiskComponents, fetchDemo, fetchRun } from "@/lib/api"
import StateBlock from "@/components/StateBlock"
import RiskBreakdown from "@/components/RiskBreakdown"
import RiskGauge from "@/components/RiskGauge"
import Link from "next/link"

function RiskReliabilityContent() {
  const params = useSearchParams()
  const runId = params.get("run_id")

  const [components, setComponents] = useState<RiskComponent[] | null>(null)
  const [run, setRun] = useState<SimulationRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let currentRun: SimulationRun | null = null
        if (runId) {
          currentRun = await fetchRun(runId)
        } else {
          currentRun = await fetchDemo()
        }
        if (cancelled) return
        setRun(currentRun)
        const comps = await fetchRiskComponents(currentRun.run_id)
        if (!cancelled) setComponents(comps)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Falha ao carregar risco")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [runId])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Risco & confiabilidade</h1>
      <p className="text-slate-600 mb-6">
        Decomposição do score de risco operacional. Use{" "}
        <Link href="/simulation-results?run_id=XXX" className="text-blue-600 underline">
          Resultados
        </Link>{" "}
        para abrir um run específico.
      </p>

      {!runId && (
        <p className="text-sm text-slate-400 mb-4">
          Nenhum run_id informado — usando a demonstração.
        </p>
      )}

      {loading && <StateBlock variant="loading" />}
      {error && <StateBlock variant="error" message={error} />}

      {run && components && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center gap-6">
            <RiskGauge score={run.risk_score} size={150} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Score de risco: {run.risk_score.toFixed(1)}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Run {run.run_id} · {run.days_simulated} dias simulados
              </p>
            </div>
          </div>
          <RiskBreakdown components={components} />
        </div>
      )}
    </div>
  )
}

export default function RiskReliabilityPage() {
  return (
    <Suspense fallback={<StateBlock variant="loading" />}>
      <RiskReliabilityContent />
    </Suspense>
  )
}
