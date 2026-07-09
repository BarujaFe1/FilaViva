"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { SimulationRun } from "@/types"

export default function ResultsCharts({ run }: { run: SimulationRun }) {
  const waitData = [
    { name: "Média", minutos: run.avg_wait },
    { name: "Mediana", minutos: run.median_wait },
    { name: "p90", minutos: run.p90_wait },
    { name: "p95", minutos: run.p95_wait },
    { name: "Máx", minutos: run.max_wait },
  ]

  const capacityData = [
    { name: "Utilização", valor: Math.round(run.utilization_rate * 100) },
    {
      name: "Overtime",
      valor: Math.round(run.overtime_probability * 100),
    },
    {
      name: "SLA breach",
      valor: Math.round(run.sla_breach_rate * 100),
    },
    {
      name: "Abandono",
      valor: Math.round(run.abandonment_rate * 100),
    },
  ]

  const attended = run.total_attended
  const noShow = Math.max(0, run.total_appointments - run.total_attended)
  const pieData = [
    { name: "Atendidos", value: attended },
    { name: "Outros (no-show/etc.)", value: noShow },
  ]
  const PIE_COLORS = ["#2563eb", "#cbd5e1"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Espera por percentil (min)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={waitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="minutos" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Indicadores (%)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={capacityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="valor" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Composição dos atendimentos
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
