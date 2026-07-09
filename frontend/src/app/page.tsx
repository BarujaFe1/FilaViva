import Link from "next/link"

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">FilaViva</h1>
        <p className="text-slate-600 mt-1">
          Simulador operacional para filas de atendimento — lab demo pública
        </p>
      </div>

      <section className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Simule antes de mudar a operação
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Diferente de um dashboard que apenas mostra o que aconteceu, o FilaViva
          permite testar cenários hipotéticos de capacidade, no-show e política de
          agendamento com dados sintéticos — e ver risco e trade-offs antes de
          qualquer mudança real.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/lab"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Abrir demo one-click
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Ver dashboard Demo
          </Link>
          <Link
            href="/scenario-builder"
            className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Criar cenário
          </Link>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900">1. Simular</h3>
          <p className="text-sm text-slate-600 mt-1">
            500 dias sintéticos com seed fixa e métricas de espera/capacidade.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900">2. Score de risco</h3>
          <p className="text-sm text-slate-600 mt-1">
            Gauge 0–100 e decomposição em 5 componentes ponderados.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900">3. Comparar</h3>
          <p className="text-sm text-slate-600 mt-1">
            Baseline vs alternativa com deltas, recomendação e trade-offs.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Escopo lab:</strong> demo pública com snapshot pré-computado.
          Não é produção de call center, não usa dados reais de pacientes/clientes
          e não substitui avaliação operacional real.
        </p>
      </div>
    </div>
  )
}
