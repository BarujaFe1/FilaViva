interface RiskGaugeProps {
  score: number
  size?: number
}

function toneFor(score: number): { label: string; color: string } {
  if (score < 40) return { label: "Baixo", color: "#059669" }
  if (score <= 70) return { label: "Médio", color: "#d97706" }
  return { label: "Alto", color: "#dc2626" }
}

export default function RiskGauge({ score, size = 180 }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = size / 2 - 14
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  const tone = toneFor(clamped)
  const center = size / 2

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={14}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={tone.color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          className="fill-slate-900"
          style={{ fontSize: 36, fontWeight: 700 }}
        >
          {clamped.toFixed(0)}
        </text>
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          style={{ fontSize: 13, fill: tone.color, fontWeight: 600 }}
        >
          Risco {tone.label}
        </text>
      </svg>
    </div>
  )
}
