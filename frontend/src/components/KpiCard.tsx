interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  hint?: string
  tone?: "neutral" | "good" | "warn" | "bad"
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "text-slate-900",
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-red-600",
}

export default function KpiCard({
  label,
  value,
  unit,
  hint,
  tone = "neutral",
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className={`mt-1 text-2xl font-semibold ${TONE_CLASSES[tone]}`}>
        {value}
        {unit ? <span className="text-base font-normal text-slate-400 ml-1">{unit}</span> : null}
      </span>
      {hint ? <span className="mt-1 text-xs text-slate-400">{hint}</span> : null}
    </div>
  )
}
