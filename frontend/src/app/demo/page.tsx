"use client"

import { useEffect, useState } from "react"
import type { SimulationRun } from "@/types"
import { fetchDemo } from "@/lib/api"
import StateBlock from "@/components/StateBlock"
import RunDashboard from "@/components/RunDashboard"

export default function DemoPage() {
  const [run, setRun] = useState<SimulationRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDemo()
      .then(setRun)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Demo</h1>
      <p className="text-slate-600 mb-6">
        Cenário de demonstração calculado pelo motor de simulação.
      </p>

      {loading && <StateBlock variant="loading" />}
      {error && <StateBlock variant="error" message={error} />}
      {!loading && !error && !run && (
        <StateBlock variant="empty" message="Nenhum resultado de demonstração." />
      )}
      {run && <RunDashboard run={run} />}
    </div>
  )
}
