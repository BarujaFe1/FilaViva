"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { RiskComponent } from "@/types"

export default function RiskBreakdown({
  components,
}: {
  components: RiskComponent[]
}) {
  const data = components.map((c) => ({
    name: c.label,
    Contribuição: Number((c.contribution * 100).toFixed(1)),
    Peso: Math.round(c.weight * 100),
  }))

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Contribuição dos componentes ao risco (%)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" unit="%" fontSize={12} />
          <YAxis type="category" dataKey="name" fontSize={12} width={120} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar dataKey="Contribuição" fill="#dc2626" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-md border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="text-left px-3 py-2 font-medium">Componente</th>
              <th className="text-right px-3 py-2 font-medium">Valor</th>
              <th className="text-right px-3 py-2 font-medium">Peso</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.key} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-700">{c.label}</td>
                <td className="px-3 py-2 text-right text-slate-700">
                  {c.value.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-slate-700">
                  {Math.round(c.weight * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
