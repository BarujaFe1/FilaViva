"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/demo", label: "Demo" },
  { href: "/scenario-builder", label: "Criar cenário" },
  { href: "/simulation-results", label: "Resultados" },
  { href: "/comparison", label: "Comparar" },
  { href: "/risk-reliability", label: "Risco" },
  { href: "/executive-brief", label: "Brief" },
  { href: "/methodology", label: "Metodologia" },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-slate-900">
            FilaViva
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
