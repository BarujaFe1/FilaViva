"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { SimulationRun } from "@/types"
import { fetchRun } from "@/lib/api"
import StateBlock from "@/components/StateBlock"
import RunDashboard from "@/components/RunDashboard"
import Link from "next/link"

function SimulationResultsContent() {
  const params = useSearchParams()
  const runId = params.get("run_id")

  const [run, setRun] = useState<SimulationRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) return
    setLoading(true)
    setError(null)
    fetchRun(runId)
      .then(setRun)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [runId])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Resultados</h1>
      <p className="text-slate-600 mb-6">
        Métricas da simulação executada.
      </p>

      {!runId && (
        <StateBlock variant="empty">
          <Link
            href="/scenario-builder"
            className="inline-flex mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Criar um cenário
          </Link>
        </StateBlock>
      )}

      {runId && loading && <StateBlock variant="loading" />}
      {runId && error && <StateBlock variant="error" message={error} />}
      {run && <RunDashboard run={run} />}
    </div>
  )
}

export default function SimulationResultsPage() {
  return (
    <Suspense fallback={<StateBlock variant="loading" />}>
      <SimulationResultsContent />
    </Suspense>
  )
}
