import Link from "next/link"

export default function LabBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <p className="text-amber-900">
          <span className="font-semibold">Lab / demo pública</span>
          {" — "}
          dados 100% sintéticos. Não é produção de call center e não substitui
          avaliação operacional real.
        </p>
        <Link
          href="/lab"
          className="shrink-0 font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700"
        >
          Abrir demo one-click →
        </Link>
      </div>
    </div>
  )
}
