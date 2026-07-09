import Link from "next/link"

export default function QueueTimelinePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Timeline da fila</h1>
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-amber-800">Em breve</h2>
        <p className="mt-2 text-sm text-amber-700 leading-relaxed">
          A visualização diária da fila (espera e overtime ao longo dos dias
          simulados) exigirá que o backend retorne a série temporal. Hoje o
          endpoint de simulação retorna apenas agregados. Esta página será
          ativada em uma próxima fase, junto com a exportação da série por dia.
        </p>
        <p className="mt-4">
          <Link href="/simulation-results" className="text-blue-600 underline text-sm">
            Ver resultados agregados
          </Link>
        </p>
      </div>
    </div>
  )
}
