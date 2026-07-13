interface StateBlockProps {
  variant: "loading" | "error" | "empty"
  message?: string
  children?: React.ReactNode
}

export default function StateBlock({ variant, message, children }: StateBlockProps) {
  if (variant === "loading") {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full"
          aria-hidden="true"
        />
        <span className="ml-3 text-slate-500">{message ?? "Carregando..."}</span>
      </div>
    )
  }

  if (variant === "error") {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm font-medium text-red-800">Algo deu errado</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {children}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
      <p className="text-slate-500">{message ?? "Nenhum dado disponível."}</p>
      {children}
    </div>
  )
}
