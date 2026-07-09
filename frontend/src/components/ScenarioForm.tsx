"use client"

import { useEffect, useState } from "react"
import type { ScenarioConfig, Preset } from "@/types"
import { fetchPresets } from "@/lib/api"

interface ScenarioFormProps {
  initial?: ScenarioConfig
  onSubmit: (config: ScenarioConfig) => void
  submitLabel?: string
  disabled?: boolean
}

const DEFAULT_CONFIG: ScenarioConfig = {
  name: "Novo cenário",
  seed: 42,
  days_to_simulate: 500,
  opening_time: "08:00",
  closing_time: "18:00",
  slot_interval_minutes: 20,
  num_servers: 4,
  avg_service_duration_minutes: 20,
  service_duration_std: 5,
  arrival_pattern: "double_peak",
  no_show_rate: 0.1,
  walk_in_rate: 0.05,
  overbooking_rate: 0.05,
  max_overtime_minutes: 30,
  sla_wait_minutes: 30,
  abandonment_threshold_minutes: 60,
}

const ARRIVAL_LABELS: Record<string, string> = {
  uniform: "Uniforme",
  peaked_morning: "Pico pela manhã",
  peaked_afternoon: "Pico pela tarde",
  double_peak: "Duplo pico",
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  )
}

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function ScenarioForm({
  initial,
  onSubmit,
  submitLabel = "Simular",
  disabled,
}: ScenarioFormProps) {
  const [config, setConfig] = useState<ScenarioConfig>({
    ...DEFAULT_CONFIG,
    ...initial,
  })
  const [presets, setPresets] = useState<Preset[]>([])

  useEffect(() => {
    fetchPresets()
      .then(setPresets)
      .catch(() => setPresets([]))
  }, [])

  function update<K extends keyof ScenarioConfig>(key: K, value: ScenarioConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(preset: Preset) {
    setConfig({ ...DEFAULT_CONFIG, ...preset.config, name: preset.name })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(config)
      }}
      className="space-y-6"
    >
      {presets.length > 0 && (
        <div>
          <span className="text-sm font-medium text-slate-700">Presets</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                title={p.description}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome do cenário">
          <input
            className={inputClass}
            value={config.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <Field label="Semente (seed)" hint="Reprodutibilidade">
          <input
            className={inputClass}
            type="number"
            value={config.seed}
            onChange={(e) => update("seed", Number(e.target.value))}
          />
        </Field>

        <Field label="Dias simulados" hint="100–2000">
          <input
            className={inputClass}
            type="number"
            value={config.days_to_simulate}
            onChange={(e) => update("days_to_simulate", Number(e.target.value))}
          />
        </Field>

        <Field label="Atendentes (servidores)" hint="1–20">
          <input
            className={inputClass}
            type="number"
            value={config.num_servers}
            onChange={(e) => update("num_servers", Number(e.target.value))}
          />
        </Field>

        <Field label="Abertura">
          <input
            className={inputClass}
            type="time"
            value={config.opening_time}
            onChange={(e) => update("opening_time", e.target.value)}
          />
        </Field>

        <Field label="Fechamento">
          <input
            className={inputClass}
            type="time"
            value={config.closing_time}
            onChange={(e) => update("closing_time", e.target.value)}
          />
        </Field>

        <Field label="Intervalo do slot (min)" hint="5–60">
          <input
            className={inputClass}
            type="number"
            value={config.slot_interval_minutes}
            onChange={(e) => update("slot_interval_minutes", Number(e.target.value))}
          />
        </Field>

        <Field label="Duração média (min)" hint="5–120">
          <input
            className={inputClass}
            type="number"
            value={config.avg_service_duration_minutes}
            onChange={(e) =>
              update("avg_service_duration_minutes", Number(e.target.value))
            }
          />
        </Field>

        <Field label="Desvio da duração (min)" hint="1–30">
          <input
            className={inputClass}
            type="number"
            value={config.service_duration_std}
            onChange={(e) => update("service_duration_std", Number(e.target.value))}
          />
        </Field>

        <Field label="Padrão de chegada">
          <select
            className={inputClass}
            value={config.arrival_pattern}
            onChange={(e) =>
              update("arrival_pattern", e.target.value as ScenarioConfig["arrival_pattern"])
            }
          >
            {Object.entries(ARRIVAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="No-show" hint="0–0.5">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={config.no_show_rate}
            onChange={(e) => update("no_show_rate", Number(e.target.value))}
          />
        </Field>

        <Field label="Walk-in" hint="0–0.3">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={config.walk_in_rate}
            onChange={(e) => update("walk_in_rate", Number(e.target.value))}
          />
        </Field>

        <Field label="Overbooking" hint="0–0.4">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={config.overbooking_rate}
            onChange={(e) => update("overbooking_rate", Number(e.target.value))}
          />
        </Field>

        <Field label="Limite overtime (min)" hint="0–120">
          <input
            className={inputClass}
            type="number"
            value={config.max_overtime_minutes}
            onChange={(e) => update("max_overtime_minutes", Number(e.target.value))}
          />
        </Field>

        <Field label="SLA espera (min)" hint="5–120">
          <input
            className={inputClass}
            type="number"
            value={config.sla_wait_minutes}
            onChange={(e) => update("sla_wait_minutes", Number(e.target.value))}
          />
        </Field>

        <Field label="Abandono após (min)" hint="10–240">
          <input
            className={inputClass}
            type="number"
            value={config.abandonment_threshold_minutes}
            onChange={(e) =>
              update("abandonment_threshold_minutes", Number(e.target.value))
            }
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
