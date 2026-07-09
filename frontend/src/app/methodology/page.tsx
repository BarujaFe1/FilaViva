"use client"

import { useEffect, useState } from "react"
import type { Methodology } from "@/types"
import { fetchMethodology } from "@/lib/api"
import StateBlock from "@/components/StateBlock"

function renderValue(value: unknown, key: string): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>
  if (typeof value === "object") {
    return (
      <pre className="text-xs bg-slate-50 rounded p-2 overflow-x-auto text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  return String(value)
}

export default function MethodologyPage() {
  const [data, setData] = useState<Methodology | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMethodology()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Metodologia</h1>
      <p className="text-slate-600 mb-6">
        Documentação da abordagem de simulação e do score de risco.
      </p>

      {loading && <StateBlock variant="loading" />}
      {error && <StateBlock variant="error" message={error} />}

      {data && (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <h2 className="text-sm font-semibold text-slate-800 mb-2">{key}</h2>
              <div className="text-slate-700">{renderValue(value, key)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
