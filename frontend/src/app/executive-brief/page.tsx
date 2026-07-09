"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { SimulationRun } from "@/types"
import { fetchDemo, fetchRun } from "@/lib/api"
import StateBlock from "@/components/StateBlock"

function verdict(run: SimulationRun) {
  const risk = run.risk_score
  if (risk < 40) {
    return {
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "Operação saudável",
      text: "O cenário apresenta risco baixo. A capacidade atual absorve a demanda com pouca espera e overtime controlado.",
    }
  }
  if (risk <= 70) {
    return {
      tone: "text-amber-700 bg-amber-50 border-amber-200",
      title: "Atenção necessária",
      text: "O risco é médio. Há pressão em algum indicador (espera, overtime ou utilização). Recomenda-se ajuste de capacidade ou agenda antes de escalar.",
    }
  }
  return {
    tone: "text-red-700 bg-red-50 border-red-200",
    title: "Risco alto",
    text: "O cenário apresenta risco alto. Espera, overtime ou SLA estão comprometidos. Revise atendentes, duração ou overbooking antes de implantar.",
  }
}

function ExecutiveBriefContent() {
  const params = useSearchParams()
  const runId = params.get("run_id")

  const [run, setRun] = useState<SimulationRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const r = runId ? await fetchRun(runId) : await fetchDemo()
        if (!cancelled) setRun(r)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Falha ao carregar")
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Resumo executivo</h1>
      <p className="text-slate-600 mb-6">
        Veredito automático a partir dos resultados da simulação.
      </p>

      {loading && <StateBlock variant="loading" />}
      {error && <StateBlock variant="error" message={error} />}

      {run && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-5 ${verdict(run).tone}`}>
            <h2 className="text-lg font-semibold">{verdict(run).title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{verdict(run).text}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Espera:</span> média{" "}
              {run.avg_wait.toFixed(1)} min, p95 {run.p95_wait.toFixed(1)} min, máx{" "}
              {run.max_wait.toFixed(1)} min.
            </p>
            <p>
              <span className="font-medium">Capacidade:</span> utilização{" "}
              {(run.utilization_rate * 100).toFixed(1)}%, overtime em{" "}
              {(run.overtime_probability * 100).toFixed(1)}% dos dias.
            </p>
            <p>
              <span className="font-medium">Qualidade:</span> SLA breach{" "}
              {(run.sla_breach_rate * 100).toFixed(1)}%, abandono{" "}
              {(run.abandonment_rate * 100).toFixed(1)}%.
            </p>
            <p className="text-slate-400 pt-2 border-t border-slate-100">
              Simulação com dados sintéticos. Não substitui avaliação operacional real.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExecutiveBriefPage() {
  return (
    <Suspense fallback={<StateBlock variant="loading" />}>
      <ExecutiveBriefContent />
    </Suspense>
  )
}
