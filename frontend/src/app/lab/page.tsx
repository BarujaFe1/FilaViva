"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { DemoSnapshot } from "@/lib/api"
import { loadSnapshot } from "@/lib/api"
import StateBlock from "@/components/StateBlock"
import RunDashboard from "@/components/RunDashboard"
import RiskBreakdown from "@/components/RiskBreakdown"
import RiskGauge from "@/components/RiskGauge"
import ComparisonView from "@/components/ComparisonView"

function mapRisk(snap: DemoSnapshot) {
  const data = snap.risk_components
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

export default function LabPage() {
  const [snap, setSnap] = useState<DemoSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSnapshot()
      .then(setSnap)
      .catch((e) => setError(e instanceof Error ? e.message : "Falha ao carregar demo"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
          Demo one-click
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Lab: simular → risco → comparar
        </h1>
        <p className="text-slate-600 max-w-3xl">
          Fluxo público pré-computado com dados sintéticos. Em um clique você vê o
          resultado da simulação, o score de risco decomposto e a comparação entre
          dois cenários operacionais.
        </p>
      </div>

      {loading && <StateBlock variant="loading" message="Carregando snapshot da demo..." />}
      {error && <StateBlock variant="error" message={error} />}

      {snap && (
        <>
          <section className="space-y-4" id="simular">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">1. Simulação</h2>
                <p className="text-sm text-slate-500">
                  Cenário equilibrado · {snap.demo_run.days_simulated} dias · seed{" "}
                  {snap.demo_run.seed}
                </p>
              </div>
              <Link href="/demo" className="text-sm text-blue-600 underline">
                Abrir página Demo
              </Link>
            </div>
            <RunDashboard run={snap.demo_run} />
          </section>

          <section className="space-y-4" id="risco">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">2. Score de risco</h2>
                <p className="text-sm text-slate-500">
                  Decomposição ponderada dos componentes operacionais
                </p>
              </div>
              <Link href="/risk-reliability" className="text-sm text-blue-600 underline">
                Abrir Risco
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6">
              <RiskGauge score={snap.demo_run.risk_score} size={150} />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Score de risco: {snap.demo_run.risk_score.toFixed(1)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{snap.notice}</p>
              </div>
            </div>
            <RiskBreakdown components={mapRisk(snap)} />
          </section>

          <section className="space-y-4" id="comparar">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  3. Comparar 2 cenários
                </h2>
                <p className="text-sm text-slate-500">
                  Baseline equilibrada vs alternativa de alta demanda (pré-computado)
                </p>
              </div>
              <Link href="/comparison" className="text-sm text-blue-600 underline">
                Abrir Comparação
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Baseline</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {snap.comparison_baseline.scenario_id}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Risco {snap.comparison_baseline.risk_score.toFixed(1)} · p95{" "}
                  {snap.comparison_baseline.p95_wait.toFixed(1)} min
                </p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Alternativa
                </p>
                <p className="font-semibold text-slate-900 mt-1">
                  {snap.comparison_alternative.scenario_id}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Risco {snap.comparison_alternative.risk_score.toFixed(1)} · p95{" "}
                  {snap.comparison_alternative.p95_wait.toFixed(1)} min
                </p>
              </div>
            </div>
            <ComparisonView comparison={snap.comparison} />
          </section>

          <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-600">
            Snapshot gerado em {new Date(snap.generated_at).toLocaleString("pt-BR")} ·
            modo {snap.mode}. Para simulações customizadas, rode o backend localmente.
          </div>
        </>
      )}
    </div>
  )
}
